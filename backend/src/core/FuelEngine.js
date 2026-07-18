import { getDB } from "../config/db.js";
import { NotFoundError, BusinessRuleError } from "./errors.js";
import AuditLogger from "./AuditLogger.js";
import FuelValidationEngine from "./FuelValidationEngine.js";
import ExpenseEngine from "./ExpenseEngine.js";

class FuelEngine {
  
  static async logFuel(payload, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 0. Delegate validation to FuelValidationEngine
      const validation = await FuelValidationEngine.validate(payload);
      
      if (!validation.valid && validation.errors.length > 0) {
        throw new BusinessRuleError("Validation failed: " + validation.errors.join("; "));
      }

      // If warnings exist, the business layer (UI) has already confirmed them if we reached here.
      // But we will log them to AuditLogger later.

      // 1. Lock the vehicle row to prevent concurrent mileage updates
      const [vehicleRows] = await connection.query('SELECT mileage FROM vehicles WHERE id = ? AND deleted_at IS NULL FOR UPDATE', [payload.vehicle_id]);
      if (vehicleRows.length === 0) throw new NotFoundError("Vehicle not found or deleted");
      
      const currentMileage = parseFloat(vehicleRows[0].mileage || 0);
      const newOdometer = parseFloat(payload.odometer_reading);

      // 1d. Trip Association
      let tripId = payload.trip_id || null;
      if (!tripId) {
        const [activeTrips] = await connection.query(
          `SELECT id FROM trips WHERE vehicle_id = ? AND status = 'In Progress' AND deleted_at IS NULL`,
          [payload.vehicle_id]
        );
        if (activeTrips.length === 1) {
          tripId = activeTrips[0].id;
        }
      }

      // 2. Calculate Efficiency if possible
      let efficiency = null;
      if (newOdometer > currentMileage) {
        const distanceTraveled = newOdometer - currentMileage;
        // efficiency = km per liter (or miles per gallon)
        efficiency = distanceTraveled / parseFloat(payload.liters);
      }

      // 3. Create the Fuel Log
      const logData = {
        vehicle_id: payload.vehicle_id,
        trip_id: tripId,
        liters: payload.liters,
        cost: payload.cost,
        station: payload.station || null,
        date: payload.date || new Date().toISOString().slice(0, 19).replace('T', ' '),
        odometer_reading: newOdometer,
        efficiency: efficiency,
        created_by: userId
      };

      const [result] = await connection.query('INSERT INTO fuel_logs SET ?', [logData]);
      const logId = result.insertId;

      // 3.5 Generate Fuel Expense in the Enterprise Expense Engine
      await ExpenseEngine.createExpense({
        source_module: 'Fuel',
        source_record_id: logId,
        source_reference: `FUEL-${new Date().getFullYear()}-${String(logId).padStart(6, '0')}`,
        vehicle_id: payload.vehicle_id,
        trip_id: tripId,
        category: 'Fuel',
        cost_center_id: 'FLEET_OPS',
        vendor: payload.station || null,
        description: `Fuel logged: ${payload.liters}L at ${payload.odometer_reading}km`,
        amount: payload.cost,
        date: payload.date || new Date().toISOString().slice(0, 10),
        status: 'Pending Approval' // Can be configured later based on thresholds
      }, userId, { connection });

      // 4. Update the Vehicle Mileage
      await connection.query('UPDATE vehicles SET mileage = ?, updated_by = ? WHERE id = ?', [newOdometer, userId, payload.vehicle_id]);

      await connection.commit();

      await AuditLogger.log({
        action: "LOG_FUEL",
        entity_type: "fuel_log",
        entity_id: logId,
        user_id: userId,
        new_value: logData
      });

      if (validation.warnings.length > 0) {
        await AuditLogger.log({
          action: "VALIDATION_WARNINGS_BYPASSED",
          entity_type: "fuel_log",
          entity_id: logId,
          user_id: userId,
          new_value: { warnings: validation.warnings }
        });
      }

      return { id: logId, efficiency, mileage_updated_to: newOdometer, validation };

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

}

export default FuelEngine;
