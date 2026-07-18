import Joi from "joi";
import { idSchema, dateSchema } from "../../validators/common.schema.js";

export const createAttendanceSchema = {
  body: Joi.object({
    employee_id: idSchema.required(),
    date: dateSchema.required(),
    clock_in: Joi.string().optional(),
    clock_out: Joi.string().optional(),
    status: Joi.string().valid("present", "absent", "late", "half_day").optional(),
  }),
};

export const updateAttendanceSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    clock_in: Joi.string().optional(),
    clock_out: Joi.string().optional(),
    status: Joi.string().valid("present", "absent", "late", "half_day").optional(),
  }),
};
