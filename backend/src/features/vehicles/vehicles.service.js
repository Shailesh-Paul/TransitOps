import { NotFoundError, BusinessRuleError } from "../../core/errors.js";
import vehicleRepository from "./vehicles.repository.js";
import AuditLogger from "../../core/AuditLogger.js";
import VehicleStatusEngine from "../../core/VehicleStatusEngine.js";
import FuelAnalyticsEngine from "../../core/FuelAnalyticsEngine.js";
import { getDB } from "../../config/db.js";

export const getAllVehicles = async (options) => {
  return await vehicleRepository.findAll({
    ...options,
    searchFields: ["registration_number", "make", "model"],
  });
};

export const getVehicleById = async (id) => {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw new NotFoundError("Vehicle not found");
  return vehicle;
};

export const createVehicle = async (vehicleData, createdBy) => {
  const existing = await vehicleRepository.findByRegistration(vehicleData.registration_number);
  if (existing) {
    throw new BusinessRuleError("A vehicle with this registration number already exists");
  }

  const payload = {
    ...vehicleData,
    status: vehicleData.status || "active",
    created_by: createdBy,
  };

  const newVehicleId = await vehicleRepository.create(payload);
  
  await AuditLogger.log({
    action: "CREATE",
    entity_type: "vehicle",
    entity_id: newVehicleId,
    user_id: createdBy,
    new_value: payload
  });

  return newVehicleId;
};

export const updateVehicle = async (id, updateData, updatedBy) => {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw new NotFoundError("Vehicle not found");

  if (updateData.registration_number && updateData.registration_number !== vehicle.registration_number) {
    const existing = await vehicleRepository.findByRegistration(updateData.registration_number);
    if (existing) {
      throw new BusinessRuleError("A vehicle with this registration number already exists");
    }
  }

  const payload = { ...updateData, updated_by: updatedBy };
  await vehicleRepository.update(id, payload);

  await AuditLogger.log({
    action: "UPDATE",
    entity_type: "vehicle",
    entity_id: id,
    user_id: updatedBy,
    old_value: vehicle,
    new_value: payload
  });
};

export const softDeleteVehicle = async (id, deletedBy) => {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw new NotFoundError("Vehicle not found");

  await vehicleRepository.update(id, { deleted_by: deletedBy });
  await vehicleRepository.softDelete(id);

  await AuditLogger.log({
    action: "ARCHIVE",
    entity_type: "vehicle",
    entity_id: id,
    user_id: deletedBy
  });
};

export const restoreVehicle = async (id, restoredBy) => {
  const vehicle = await vehicleRepository.findById(id, true);
  if (!vehicle) throw new NotFoundError("Vehicle not found");
  if (!vehicle.deleted_at) throw new BusinessRuleError("Vehicle is not archived");

  // Restore by setting deleted_at to NULL directly via raw SQL or an update payload
  // Assuming repository update() might not touch deleted_at if it's protected, 
  // we can use a direct pool query or add a restore method to base repo.
  // We'll execute it directly on the pool for simplicity:
  const sql = `UPDATE vehicles SET deleted_at = NULL, updated_by = ? WHERE id = ?`;
  await vehicleRepository.pool.query(sql, [restoredBy, id]);

  await AuditLogger.log({
    action: "RESTORE",
    entity_type: "vehicle",
    entity_id: id,
    user_id: restoredBy
  });
};

export const retireVehicle = async (id, retiredBy) => {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw new NotFoundError("Vehicle not found");
  if (vehicle.status === 'Retired') throw new BusinessRuleError("Vehicle is already retired");

  await VehicleStatusEngine.transitionTo(id, 'Retired', retiredBy);
};

export const updateStatus = async (id, newStatus, updatedBy) => {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw new NotFoundError("Vehicle not found");
  if (vehicle.status === newStatus) return; // No op

  await VehicleStatusEngine.transitionTo(id, newStatus, updatedBy);
};

export const getAvailable = async () => {
  return await vehicleRepository.findAvailable();
};

export const getTimeline = async (id) => {
  const vehicle = await vehicleRepository.findById(id, true);
  if (!vehicle) throw new NotFoundError("Vehicle not found");
  
  return await vehicleRepository.getTimeline(id);
};

export const getMaintenanceStats = async (id) => {
  const vehicle = await vehicleRepository.findById(id, true);
  if (!vehicle) throw new NotFoundError("Vehicle not found");
  
  return await vehicleRepository.getMaintenanceStats(id);
};

export const getFuelProfile = async (id) => {
  const vehicle = await vehicleRepository.findById(id, true);
  if (!vehicle) throw new NotFoundError("Vehicle not found");

  const engineStats = await FuelAnalyticsEngine.getMonthlyAnalytics({ vehicle_id: id });
  
  const pool = getDB();
  const sql = `
    SELECT 
      MAX(efficiency) as bestEfficiency,
      MIN(efficiency) as worstEfficiency,
      MAX(date) as lastRefuelDate,
      (
        SELECT station FROM fuel_logs 
        WHERE vehicle_id = ? AND deleted_at IS NULL 
        GROUP BY station ORDER BY COUNT(*) DESC LIMIT 1
      ) as mostUsedStation
    FROM fuel_logs 
    WHERE vehicle_id = ? AND deleted_at IS NULL
  `;
  const [rows] = await pool.query(sql, [id, id]);
  const rawStats = rows[0] || {};

  // Fetch some trips/maintenance quick summary for Related Information if needed,
  // but we already have getMaintenanceStats and getTimeline. 
  // Let's just return what we have here.
  const maintenanceStats = await vehicleRepository.getMaintenanceStats(id);
  
  const tripSql = `SELECT COUNT(id) as totalTrips, SUM(distance) as totalDistance FROM trips WHERE vehicle_id = ? AND deleted_at IS NULL`;
  const [tripRows] = await pool.query(tripSql, [id]);

  return {
    vehicle,
    fuelProfile: {
      avgEfficiency: engineStats.avgEfficiency,
      avgCostPerKm: engineStats.avgCostPerKm,
      totalConsumed: engineStats.totalConsumed,
      totalCost: engineStats.totalCost,
      bestEfficiency: rawStats.bestEfficiency || null,
      worstEfficiency: rawStats.worstEfficiency || null,
      lastRefuelDate: rawStats.lastRefuelDate || null,
      mostUsedStation: rawStats.mostUsedStation || 'N/A'
    },
    relatedInfo: {
      maintenanceStats,
      tripSummary: tripRows[0] || { totalTrips: 0, totalDistance: 0 }
    }
  };
};
