import Joi from "joi";
import { idSchema, dateSchema } from "../../validators/common.schema.js";

export const createTripSchema = {
  body: Joi.object({
    route_id: idSchema.required(),
    vehicle_id: idSchema.optional().allow(null, ""),
    driver_id: idSchema.optional().allow(null, ""),
    start_time: dateSchema.optional(),
    end_time: dateSchema.optional(),
    cargo_weight: Joi.number().precision(2).optional().allow(null, ""),
    notes: Joi.string().optional().allow(null, ""),
  }),
};

export const updateTripSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    route_id: idSchema.optional(),
    start_time: dateSchema.optional(),
    end_time: dateSchema.optional(),
    cargo_weight: Joi.number().precision(2).optional().allow(null, ""),
    notes: Joi.string().optional().allow(null, ""),
  }),
};

export const assignDriverSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    driver_id: idSchema.required()
  })
};

export const assignVehicleSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    vehicle_id: idSchema.required()
  })
};
