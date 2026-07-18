import { getDB } from "../config/db.js";
import { NotFoundError, ConflictError, BusinessRuleError } from "./errors.js";
import AuditLogger from "./AuditLogger.js";
import VehicleStatusEngine from "./VehicleStatusEngine.js";
import DriverStatusEngine from "./DriverStatusEngine.js";
import TripValidationEngine from "./TripValidationEngine.js";
import ExpenseEngine from "./ExpenseEngine.js";

class DispatchEngine {
  
  static async createDraft(tripData, userId) {
    const pool = getDB();
    const payload = {
      route_id: tripData.route_id,
      vehicle_id: tripData.vehicle_id || null,
      driver_id: tripData.driver_id || null,
      start_time: tripData.start_time || null,
      end_time: tripData.end_time || null,
      cargo_weight: tripData.cargo_weight || null,
      notes: tripData.notes || null,
      status: 'Draft',
      created_by: userId
    };

    const [result] = await pool.query('INSERT INTO trips SET ?', [payload]);
    
    await AuditLogger.log({
      action: "CREATE_DRAFT",
      entity_type: "trip",
      entity_id: result.insertId,
      user_id: userId,
      new_value: payload
    });

    return result.insertId;
  }

  static async assignDriver(tripId, driverId, userId) {
    const pool = getDB();
    
    // Validate driver
    const [driverRows] = await pool.query('SELECT status, license_expiry FROM drivers WHERE id = ? AND deleted_at IS NULL', [driverId]);
    if (driverRows.length === 0) throw new NotFoundError("Driver not found or deleted");
    
    TripValidationEngine.validateDriver(driverRows[0]);

    const [tripRows] = await pool.query('SELECT * FROM trips WHERE id = ?', [tripId]);
    if (tripRows.length === 0) throw new NotFoundError("Trip not found");
    const trip = tripRows[0];

    let newStatus = trip.status;
    if (trip.status === 'Draft' && trip.vehicle_id) {
      newStatus = 'Assigned';
    }

    await pool.query('UPDATE trips SET driver_id = ?, status = ?, updated_by = ?, updated_at = NOW() WHERE id = ?', [driverId, newStatus, userId, tripId]);
    
    await AuditLogger.log({
      action: "ASSIGN_DRIVER",
      entity_type: "trip",
      entity_id: tripId,
      user_id: userId,
      new_value: { driver_id: driverId, status: newStatus }
    });
  }

  static async assignVehicle(tripId, vehicleId, userId) {
    const pool = getDB();
    
    // Validate vehicle
    const [vehicleRows] = await pool.query('SELECT status FROM vehicles WHERE id = ? AND deleted_at IS NULL', [vehicleId]);
    if (vehicleRows.length === 0) throw new NotFoundError("Vehicle not found or deleted");
    
    TripValidationEngine.validateVehicle(vehicleRows[0]);

    const [tripRows] = await pool.query('SELECT * FROM trips WHERE id = ?', [tripId]);
    if (tripRows.length === 0) throw new NotFoundError("Trip not found");
    const trip = tripRows[0];

    let newStatus = trip.status;
    if (trip.status === 'Draft' && trip.driver_id) {
      newStatus = 'Assigned';
    }

    await pool.query('UPDATE trips SET vehicle_id = ?, status = ?, updated_by = ?, updated_at = NOW() WHERE id = ?', [vehicleId, newStatus, userId, tripId]);
    
    await AuditLogger.log({
      action: "ASSIGN_VEHICLE",
      entity_type: "trip",
      entity_id: tripId,
      user_id: userId,
      new_value: { vehicle_id: vehicleId, status: newStatus }
    });
  }

  static async dispatchTrip(tripId, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [tripRows] = await connection.query('SELECT * FROM trips WHERE id = ? FOR UPDATE', [tripId]);
      if (tripRows.length === 0) throw new NotFoundError("Trip not found");
      const trip = tripRows[0];

      // Delegate all business rules to the specialized engine
      await TripValidationEngine.validateForDispatch(trip, connection);

      // 1. Update Trip to Dispatched
      await connection.query('UPDATE trips SET status = "Dispatched", updated_by = ?, updated_at = NOW() WHERE id = ?', [userId, tripId]);

      // 2. Transition Vehicle & Driver to Reserved
      await VehicleStatusEngine.transitionTo(trip.vehicle_id, 'Reserved', userId, connection);
      await DriverStatusEngine.transitionTo(trip.driver_id, 'Reserved', userId, connection);

      await connection.commit();

      // Log action outside transaction logic for safety, since AuditLogger handles its own pool query
      await AuditLogger.log({
        action: "DISPATCH",
        entity_type: "trip",
        entity_id: tripId,
        user_id: userId,
        new_value: { status: "Dispatched" }
      });

    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async startTrip(tripId, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [tripRows] = await connection.query('SELECT * FROM trips WHERE id = ? FOR UPDATE', [tripId]);
      if (tripRows.length === 0) throw new NotFoundError("Trip not found");
      const trip = tripRows[0];

      if (trip.status !== 'Dispatched') {
        throw new BusinessRuleError(`Only Dispatched trips can be started. Current status: ${trip.status}`);
      }

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // 1. Update Trip
      await connection.query(
        'UPDATE trips SET status = "In Progress", start_time = IFNULL(start_time, ?), updated_by = ?, updated_at = NOW() WHERE id = ?', 
        [now, userId, tripId]
      );

      // 2. Transition Vehicle & Driver to On Trip
      await VehicleStatusEngine.transitionTo(trip.vehicle_id, 'On Trip', userId, connection);
      await DriverStatusEngine.transitionTo(trip.driver_id, 'On Trip', userId, connection);

      // Capture Start Odometer
      const [vehicleRows] = await connection.query('SELECT current_odometer FROM vehicles WHERE id = ?', [trip.vehicle_id]);
      const startOdometer = vehicleRows[0]?.current_odometer || 0;

      await connection.commit();

      await AuditLogger.log({
        action: "START",
        entity_type: "trip",
        entity_id: tripId,
        user_id: userId,
        new_value: { status: "In Progress", start_odometer: startOdometer }
      });

    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async completeTrip(tripId, payload, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [tripRows] = await connection.query('SELECT * FROM trips WHERE id = ? FOR UPDATE', [tripId]);
      if (tripRows.length === 0) throw new NotFoundError("Trip not found");
      const trip = tripRows[0];

      if (trip.status !== 'In Progress') {
        throw new BusinessRuleError(`Only In Progress trips can be completed. Current status: ${trip.status}`);
      }

      if (!trip.start_time) {
        throw new BusinessRuleError("Trip cannot be completed because Journey Start Time is missing.");
      }

      // Pre-check Vehicle and Driver Status
      const [vehicleRowsCurrent] = await connection.query('SELECT status FROM vehicles WHERE id = ?', [trip.vehicle_id]);
      if (vehicleRowsCurrent[0]?.status !== 'On Trip') {
        throw new BusinessRuleError(`Vehicle is not On Trip. Current status: ${vehicleRowsCurrent[0]?.status}`);
      }

      const [driverRowsCurrent] = await connection.query('SELECT status FROM drivers WHERE id = ?', [trip.driver_id]);
      if (driverRowsCurrent[0]?.status !== 'On Trip') {
        throw new BusinessRuleError(`Driver is not On Trip. Current status: ${driverRowsCurrent[0]?.status}`);
      }

      // Extract payload
      const { final_odometer, fuel_consumed, remarks, end_time, deviation_reason } = payload || {};
      const completedTime = end_time || new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Distance Validation Engine
      let startOdometer = 0;
      let actualDistance = 0;
      let deviationPercentage = 0;
      let isCritical = false;

      // Validate Odometer & Calculate Distances
      if (final_odometer !== undefined && final_odometer !== null) {
        const [vehicleRows] = await connection.query('SELECT current_odometer FROM vehicles WHERE id = ?', [trip.vehicle_id]);
        startOdometer = vehicleRows[0]?.current_odometer || 0;
        
        if (Number(final_odometer) <= Number(startOdometer)) {
          throw new BusinessRuleError(`Final odometer (${final_odometer}) must be greater than current odometer (${startOdometer}).`);
        }
        
        actualDistance = Number(final_odometer) - Number(startOdometer);

        // Fetch Planned Distance
        const [routeRows] = await connection.query('SELECT distance_km FROM routes WHERE id = ?', [trip.route_id]);
        const plannedDistance = Number(routeRows[0]?.distance_km || 0);

        if (plannedDistance > 0) {
          deviationPercentage = ((actualDistance - plannedDistance) / plannedDistance) * 100;
          
          if (deviationPercentage > 50) {
            if (!deviation_reason || deviation_reason.trim() === '') {
              throw new BusinessRuleError("Manager justification is required for distance deviations > 50%.");
            }
          }
          
          if (deviationPercentage > 300) {
            isCritical = true;
            await AuditLogger.log({
              action: "CRITICAL_DEVIATION",
              entity_type: "trip",
              entity_id: tripId,
              user_id: userId,
              new_value: {
                planned_distance: plannedDistance,
                actual_distance: actualDistance,
                deviation_percentage: deviationPercentage,
                manager_id: userId
              }
            });
          }
        }

        await connection.query('UPDATE vehicles SET current_odometer = ? WHERE id = ?', [final_odometer, trip.vehicle_id]);
      }

      // Insert Fuel Log & Validate
      let fuelEfficiency = null;
      if (!fuel_consumed || Number(fuel_consumed) <= 0) {
        throw new BusinessRuleError("Fuel Consumed is required and must be greater than zero.");
      }

      if (actualDistance > 0 && Number(fuel_consumed) > 0) {
        fuelEfficiency = Number((actualDistance / Number(fuel_consumed)).toFixed(2));
      }

      const [fuelLogResult] = await connection.query(
        'INSERT INTO fuel_logs (vehicle_id, liters, cost, station, date) VALUES (?, ?, ?, ?, ?)',
        [trip.vehicle_id, Number(fuel_consumed), 0.00, 'Trip Completion Auto-log', completedTime]
      );

      // Generate Expense for Auto-logged Fuel
      await ExpenseEngine.createExpense({
        source_module: 'Fuel',
        source_record_id: fuelLogResult.insertId,
        source_reference: `TRIP-FUEL-${tripId}`,
        vehicle_id: trip.vehicle_id,
        trip_id: tripId,
        driver_id: trip.driver_id,
        category: 'Fuel',
        cost_center_id: 'TRIP_OPS',
        description: `Auto-logged fuel for Trip ${tripId}: ${fuel_consumed}L`,
        amount: 0.00,
        date: completedTime.split(' ')[0],
        status: 'Approved' // Zero cost is pre-approved
      }, userId, { connection });

      // Generate Trip Expenses if any (e.g. Toll, Parking)
      const tollCost = Number(payload.toll_cost || 0);
      const parkingCost = Number(payload.parking_cost || 0);
      const otherCost = Number(payload.other_cost || 0);
      
      const totalTripCost = tollCost + parkingCost + otherCost;
      if (totalTripCost > 0) {
        await ExpenseEngine.createExpense({
          source_module: 'Trips',
          source_record_id: tripId,
          source_reference: `TRIP-EXP-${tripId}`,
          vehicle_id: trip.vehicle_id,
          trip_id: tripId,
          driver_id: trip.driver_id,
          category: tollCost > 0 ? 'Toll' : 'Miscellaneous',
          cost_center_id: 'TRIP_OPS',
          description: `Trip expenses: Toll ₹${tollCost}, Parking ₹${parkingCost}, Other ₹${otherCost}`,
          amount: totalTripCost,
          date: completedTime.split(' ')[0],
          status: 'Pending Approval'
        }, userId, { connection });
      }

      // Format remarks
      let updatedNotes = trip.notes || "";
      if (remarks) {
        updatedNotes += `\n[Completion Remarks]: ${remarks}`;
      }

      // 1. Update Trip
      await connection.query(
        'UPDATE trips SET status = "Completed", end_time = ?, notes = ?, deviation_reason = ?, actual_distance = ?, fuel_efficiency = ?, updated_by = ?, updated_at = NOW() WHERE id = ?', 
        [completedTime, updatedNotes.trim(), deviation_reason || null, actualDistance, fuelEfficiency, userId, tripId]
      );

      // 2. Transition Vehicle & Driver to Available
      await VehicleStatusEngine.transitionTo(trip.vehicle_id, 'Available', userId, connection);
      await DriverStatusEngine.transitionTo(trip.driver_id, 'Available', userId, connection);

      await connection.commit();

      await AuditLogger.log({
        action: "COMPLETE",
        entity_type: "trip",
        entity_id: tripId,
        user_id: userId,
        new_value: { 
          status: "Completed", 
          final_odometer, 
          fuel_consumed,
          actual_distance: actualDistance,
          fuel_efficiency: fuelEfficiency
        }
      });

    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async cancelTrip(tripId, payload, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [tripRows] = await connection.query('SELECT * FROM trips WHERE id = ? FOR UPDATE', [tripId]);
      if (tripRows.length === 0) throw new NotFoundError("Trip not found");
      const trip = tripRows[0];

      if (trip.status === 'Completed' || trip.status === 'Cancelled' || trip.status === 'Terminated') {
        throw new BusinessRuleError(`Trip is already ${trip.status}`);
      }

      if (trip.status === 'In Progress') {
        throw new BusinessRuleError("In Progress trips cannot be cancelled normally. Please use Emergency Termination instead.");
      }

      const { category, reason } = payload || {};
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // 1. Update Trip
      await connection.query(
        'UPDATE trips SET status = "Cancelled", cancellation_category = ?, cancellation_reason = ?, cancelled_at = ?, cancelled_by = ?, updated_by = ?, updated_at = NOW() WHERE id = ?', 
        [category || 'Other', reason || null, now, userId, userId, tripId]
      );

      // 2. If it was Dispatched, free the resources
      if (trip.driver_id) {
        await DriverStatusEngine.transitionTo(trip.driver_id, 'Available', userId, connection);
      }
      if (trip.vehicle_id) {
        await VehicleStatusEngine.transitionTo(trip.vehicle_id, 'Available', userId, connection);
      }

      await connection.commit();

      await AuditLogger.log({
        action: "CANCEL",
        entity_type: "trip",
        entity_id: tripId,
        user_id: userId,
        new_value: { status: "Cancelled", cancellation_category: category, cancellation_reason: reason }
      });

    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async terminateTrip(tripId, payload, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [tripRows] = await connection.query('SELECT * FROM trips WHERE id = ? FOR UPDATE', [tripId]);
      if (tripRows.length === 0) throw new NotFoundError("Trip not found");
      const trip = tripRows[0];

      if (trip.status !== 'In Progress') {
        throw new BusinessRuleError(`Only In Progress trips can be emergency terminated. Current status: ${trip.status}`);
      }

      const { category, reason } = payload || {};
      if (!reason || reason.trim() === '') {
        throw new BusinessRuleError("A detailed justification reason is required for Emergency Termination.");
      }

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // 1. Update Trip
      await connection.query(
        'UPDATE trips SET status = "Terminated", cancellation_category = ?, cancellation_reason = ?, emergency_termination = TRUE, terminated_at = ?, terminated_by = ?, updated_by = ?, updated_at = NOW() WHERE id = ?', 
        [category || 'Emergency', reason, now, userId, userId, tripId]
      );

      // 2. Free the resources back to Available
      if (trip.driver_id) {
        await DriverStatusEngine.transitionTo(trip.driver_id, 'Available', userId, connection);
      }
      if (trip.vehicle_id) {
        await VehicleStatusEngine.transitionTo(trip.vehicle_id, 'Available', userId, connection);
      }

      await connection.commit();

      await AuditLogger.log({
        action: "EMERGENCY_TERMINATE",
        entity_type: "trip",
        entity_id: tripId,
        user_id: userId,
        new_value: { status: "Terminated", cancellation_category: category, cancellation_reason: reason }
      });

    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

export default DispatchEngine;
