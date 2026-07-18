import ApiResponse from "../../core/ApiResponse.js";
import * as routesService from "./routes.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllRoutes = asyncHandler(async (req, res, next) => {
  const { page, limit, sort, order, search, ...filters } = req.query;

    const result = await routesService.getAllRoutes({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort || "name",
      order: order || "ASC",
      search: search || "",
      filters,
    });

    ApiResponse.sendPaginated(res, result);
});

export const getRouteById = asyncHandler(async (req, res, next) => {
  const route = await routesService.getRouteById(req.params.id);
    ApiResponse.send(res, route);
});

export const createRoute = asyncHandler(async (req, res, next) => {
  const newRouteId = await routesService.createRoute(req.body, req.user.id);
    ApiResponse.send(res, { id: newRouteId }, "Route created successfully", 201);
});

export const updateRoute = asyncHandler(async (req, res, next) => {
  await routesService.updateRoute(req.params.id, req.body, req.user.id);
    ApiResponse.send(res, null, "Route updated successfully");
});

export const softDeleteRoute = asyncHandler(async (req, res, next) => {
  await routesService.softDeleteRoute(req.params.id, req.user.id);
    ApiResponse.send(res, null, null, 204);
});
