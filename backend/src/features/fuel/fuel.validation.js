import Joi from "joi";
import { idSchema, dateSchema } from "../../validators/common.schema.js";

export const logFuelSchema = {
  body: Joi.object({
    vehicle_id: idSchema.required(),
    liters: Joi.number().precision(2).greater(0).required(),
    cost: Joi.number().precision(2).min(0).required(),
    odometer_reading: Joi.number().precision(2).min(0).required(),
    station: Joi.string().max(150).optional().allow(null, ""),
    date: dateSchema.optional(),
  }),
};

export const updateFuelLogSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    station: Joi.string().max(150).optional().allow(null, ""),
  }),
};
