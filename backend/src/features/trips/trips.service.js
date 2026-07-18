import { NotFoundError } from "../../core/errors.js";
import tripsRepository from "./trips.repository.js";
import DispatchEngine from "../../core/DispatchEngine.js";

export const getAllTrips = async (options) => {
  return await tripsRepository.findAllWithDetails({
    page: options.page,
    limit: options.limit,
    status: options.filters?.status,
  });
};

export const getTripById = async (id) => {
  const trip = await tripsRepository.findDetailedById(id);
  if (!trip) throw new NotFoundError("Trip not found");
  return trip;
};

// Dispatch Engine Proxies

export const createTrip = async (tripData, createdBy) => {
  return await DispatchEngine.createDraft(tripData, createdBy);
};

export const assignDriver = async (tripId, driverId, updatedBy) => {
  await DispatchEngine.assignDriver(tripId, driverId, updatedBy);
};

export const assignVehicle = async (tripId, vehicleId, updatedBy) => {
  await DispatchEngine.assignVehicle(tripId, vehicleId, updatedBy);
};

export const dispatchTrip = async (tripId, updatedBy) => {
  await DispatchEngine.dispatchTrip(tripId, updatedBy);
};

export const startTrip = async (tripId, updatedBy) => {
  await DispatchEngine.startTrip(tripId, updatedBy);
};

export const completeTrip = async (tripId, payload, updatedBy) => {
  await DispatchEngine.completeTrip(tripId, payload, updatedBy);
};

export const cancelTrip = async (tripId, payload, updatedBy) => {
  await DispatchEngine.cancelTrip(tripId, payload, updatedBy);
};

export const terminateTrip = async (tripId, payload, updatedBy) => {
  await DispatchEngine.terminateTrip(tripId, payload, updatedBy);
};

// Update general metadata (notes, route, times if Draft)
export const updateTrip = async (id, updateData, updatedBy) => {
  const trip = await tripsRepository.findById(id);
  if (!trip) throw new NotFoundError("Trip not found");

  const payload = { ...updateData, updated_by: updatedBy };
  
  // Don't allow manual status updates through this method anymore
  if (payload.status) delete payload.status;
  if (payload.driver_id) delete payload.driver_id;
  if (payload.vehicle_id) delete payload.vehicle_id;

  await tripsRepository.update(id, payload);
};
