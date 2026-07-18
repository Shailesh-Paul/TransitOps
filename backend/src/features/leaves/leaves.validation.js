import Joi from "joi";
import { idSchema, dateSchema } from "../../validators/common.schema.js";

export const createLeaveSchema = {
  body: Joi.object({
    employee_id: idSchema.required(),
    type: Joi.string().valid("sick", "annual", "unpaid", "maternity", "other").required(),
    start_date: dateSchema.required(),
    end_date: dateSchema.min(Joi.ref("start_date")).required().messages({
      "date.min": "End Date cannot be before Start Date",
    }),
    reason: Joi.string().optional(),
  }),
};

export const updateLeaveStatusSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid("pending", "approved", "rejected").required(),
  }),
};
