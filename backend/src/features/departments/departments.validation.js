import Joi from "joi";

export const createDepartmentSchema = {
  body: Joi.object({
    name: Joi.string().required().messages({ "any.required": "Department name is required" }),
    description: Joi.string().optional(),
    is_active: Joi.boolean().default(true),
  }),
};

export const updateDepartmentSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    is_active: Joi.boolean().optional(),
  }),
};
