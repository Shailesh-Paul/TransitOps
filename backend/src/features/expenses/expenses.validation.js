import Joi from "joi";
import { idSchema, dateSchema } from "../../validators/common.schema.js";

export const logExpenseSchema = {
  body: Joi.object({
    vehicle_id: idSchema.optional().allow(null, ""),
    driver_id: idSchema.optional().allow(null, ""),
    trip_id: idSchema.optional().allow(null, ""),
    category: Joi.string().valid("Maintenance", "Toll", "Parking", "Insurance", "Miscellaneous").required(),
    description: Joi.string().required(),
    amount: Joi.number().precision(2).positive().required(),
    date: dateSchema.optional(),
    status: Joi.string().valid("Pending", "Cleared", "Rejected").optional(),
  }),
};

export const updateExpenseStatusSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    status: Joi.string().valid("Pending", "Cleared", "Rejected").required(),
  }),
};

export const updateExpenseSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    description: Joi.string().optional(),
  }),
};
