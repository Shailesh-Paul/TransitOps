import { NotFoundError, BusinessRuleError } from "../../core/errors.js";
import driversRepository from "./drivers.repository.js";
import DriverStatusEngine from "../../core/DriverStatusEngine.js";
import AuditLogger from "../../core/AuditLogger.js";

export const getAllDrivers = async (options) => {
  return await driversRepository.findAllWithDetails({
    page: options.page,
    limit: options.limit,
    status: options.filters?.status,
    search: options.search,
    includeDeleted: options.includeDeleted,
    validity: options.validity,
  });
};

export const getDriverById = async (id) => {
  const driver = await driversRepository.findDetailedById(id);
  if (!driver) throw new NotFoundError("Driver not found");
  return driver;
};

export const getAvailableDrivers = async () => {
  return await driversRepository.findAvailable();
};

export const getDriverTimeline = async (id) => {
  const driver = await driversRepository.findDetailedById(id);
  if (!driver) throw new NotFoundError("Driver not found");
  return await driversRepository.getTimeline(id);
};

export const createDriver = async (driverData, createdBy) => {
  const existingDriverLink = await driversRepository.findByEmployeeId(driverData.employee_id);
  if (existingDriverLink) {
    throw new BusinessRuleError("This employee already has a driver profile");
  }

  const existingLicense = await driversRepository.findByLicenseNumber(driverData.license_number);
  if (existingLicense) {
    throw new BusinessRuleError("A driver with this license number already exists");
  }

  const payload = {
    ...driverData,
    status: driverData.status || "Available",
    created_by: createdBy,
  };

  const newDriverId = await driversRepository.create(payload);
  
  await AuditLogger.log({
    action: "CREATE",
    entity_type: "driver",
    entity_id: newDriverId,
    user_id: createdBy,
    new_value: payload
  });

  return newDriverId;
};

export const updateDriver = async (id, updateData, updatedBy) => {
  const driver = await driversRepository.findById(id);
  if (!driver) throw new NotFoundError("Driver not found");

  if (updateData.license_number && updateData.license_number !== driver.license_number) {
    const existingLicense = await driversRepository.findByLicenseNumber(updateData.license_number);
    if (existingLicense) {
      throw new BusinessRuleError("A driver with this license number already exists");
    }
  }

  if (updateData.status && updateData.status !== driver.status) {
    await DriverStatusEngine.transitionTo(id, updateData.status, updatedBy);
    delete updateData.status;
  }

  const payload = { ...updateData, updated_by: updatedBy };
  if (Object.keys(updateData).length > 0) {
    await driversRepository.update(id, payload);
  }

  await AuditLogger.log({
    action: "UPDATE",
    entity_type: "driver",
    entity_id: id,
    user_id: updatedBy,
    old_value: driver,
    new_value: payload
  });
};

export const updateDriverStatus = async (id, newStatus, updatedBy) => {
  const driver = await driversRepository.findById(id);
  if (!driver) throw new NotFoundError("Driver not found");
  
  await DriverStatusEngine.transitionTo(id, newStatus, updatedBy);
};

export const archiveDriver = async (id, deletedBy) => {
  const driver = await driversRepository.findById(id);
  if (!driver) throw new NotFoundError("Driver not found");

  await driversRepository.update(id, { deleted_by: deletedBy });
  await driversRepository.softDelete(id);

  await AuditLogger.log({
    action: "ARCHIVE",
    entity_type: "driver",
    entity_id: id,
    user_id: deletedBy
  });
};

export const restoreDriver = async (id, restoredBy) => {
  // Use pool query directly to bypass deleted_at IS NULL filter in BaseRepository
  const sql = `UPDATE drivers SET deleted_at = NULL, updated_by = ? WHERE id = ?`;
  await driversRepository.pool.query(sql, [restoredBy, id]);

  await AuditLogger.log({
    action: "RESTORE",
    entity_type: "driver",
    entity_id: id,
    user_id: restoredBy
  });
};
