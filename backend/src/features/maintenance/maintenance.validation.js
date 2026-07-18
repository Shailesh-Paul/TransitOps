import Joi from "joi";
import { idSchema, dateSchema } from "../../validators/common.schema.js";

export const requestMaintenanceSchema = {
  body: Joi.object({
    vehicle_id: idSchema.required(),
    type: Joi.string().valid("routine", "repair", "emergency", "inspection").required(),
    description: Joi.string().required(),
    cost: Joi.number().precision(2).min(0).optional(),
    start_date: dateSchema.optional(),
    end_date: dateSchema.optional(),
    performed_by: Joi.string().max(150).optional().allow(null, ""),
  }),
};

export const updateRecordSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    type: Joi.string().valid("routine", "repair", "emergency", "inspection").optional(),
    priority: Joi.string().valid("Low", "Medium", "High", "Critical").optional(),
    description: Joi.string().optional(),
    performed_by: Joi.string().max(150).optional().allow(null, ""),
  }),
};

export const completeMaintenanceSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    cost: Joi.number().precision(2).min(0).optional(),
    parts: Joi.alternatives().try(Joi.object(), Joi.array()).optional().allow(null),
    performed_by: Joi.string().max(150).optional().allow(null, ""),
  })
};
