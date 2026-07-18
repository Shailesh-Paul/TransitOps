import Joi from "joi";
import { idSchema, phoneSchema, dateSchema } from "../../validators/common.schema.js";

export const createEmployeeSchema = {
  body: Joi.object({
    user_id: idSchema.required(),
    department_id: idSchema.required(),
    first_name: Joi.string().required().messages({ "any.required": "First name is required" }),
    last_name: Joi.string().required().messages({ "any.required": "Last name is required" }),
    phone: phoneSchema.optional(),
    hire_date: dateSchema.optional(),
    status: Joi.string().valid("active", "terminated", "on_leave").default("active"),
  }),
};

export const updateEmployeeSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    department_id: idSchema.optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    phone: phoneSchema.optional(),
    hire_date: dateSchema.optional(),
    status: Joi.string().valid("active", "terminated", "on_leave").optional(),
  }),
};
