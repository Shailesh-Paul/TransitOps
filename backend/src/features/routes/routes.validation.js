import Joi from "joi";
import { decimalNumberSchema, positiveNumberSchema } from "../../validators/common.schema.js";

export const createRouteSchema = {
  body: Joi.object({
    name: Joi.string().required().messages({ "any.required": "Route name is required" }),
    start_location: Joi.string().required().messages({ "any.required": "Start location is required" }),
    end_location: Joi.string().required().messages({ "any.required": "End location is required" }),
    distance_km: decimalNumberSchema.required(),
    estimated_time_mins: positiveNumberSchema.required(),
    is_active: Joi.boolean().default(true),
  }),
};

export const updateRouteSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    name: Joi.string().optional(),
    start_location: Joi.string().optional(),
    end_location: Joi.string().optional(),
    distance_km: decimalNumberSchema.optional(),
    estimated_time_mins: positiveNumberSchema.optional(),
    is_active: Joi.boolean().optional(),
  }),
};
