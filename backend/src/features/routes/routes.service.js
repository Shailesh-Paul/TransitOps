import { NotFoundError, BusinessRuleError } from "../../core/errors.js";
import routesRepository from "./routes.repository.js";

export const getAllRoutes = async (options) => {
  return await routesRepository.findAll({
    ...options,
    searchFields: ["name", "start_location", "end_location"],
  });
};

export const getRouteById = async (id) => {
  const route = await routesRepository.findById(id);
  if (!route) throw new NotFoundError("Route not found");
  return route;
};

export const createRoute = async (routeData, createdBy) => {
  const existing = await routesRepository.findByName(routeData.name);
  if (existing) {
    throw new BusinessRuleError("A route with this name already exists");
  }

  const payload = {
    ...routeData,
    is_active: routeData.is_active !== undefined ? routeData.is_active : true,
    created_by: createdBy,
  };

  const newRouteId = await routesRepository.create(payload);
  return newRouteId;
};

export const updateRoute = async (id, updateData, updatedBy) => {
  const route = await routesRepository.findById(id);
  if (!route) throw new NotFoundError("Route not found");

  if (updateData.name && updateData.name !== route.name) {
    const existing = await routesRepository.findByName(updateData.name);
    if (existing) {
      throw new BusinessRuleError("A route with this name already exists");
    }
  }

  const payload = {
    ...updateData,
    updated_by: updatedBy,
  };

  await routesRepository.update(id, payload);
};

export const softDeleteRoute = async (id, deletedBy) => {
  const route = await routesRepository.findById(id);
  if (!route) throw new NotFoundError("Route not found");

  await routesRepository.update(id, { deleted_by: deletedBy });
  await routesRepository.softDelete(id);
};
