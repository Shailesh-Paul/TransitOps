import Joi from "joi";
import { emailSchema, passwordSchema, idSchema } from "../../validators/common.schema.js";

export const createUserSchema = {
  body: Joi.object({
    email: emailSchema.required(),
    password: passwordSchema.required(),
    role_id: idSchema.required(),
    status: Joi.string().valid("active", "inactive", "suspended").optional(),
  }),
};

export const updateUserSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    role_id: idSchema.optional(),
    status: Joi.string().valid("active", "inactive", "suspended").optional(),
  }),
};

export const updateProfileSchema = {
  body: Joi.object({
    first_name: Joi.string().required().messages({ "any.required": "First name is required" }),
    last_name: Joi.string().required().messages({ "any.required": "Last name is required" }),
    phone: Joi.string().optional(),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages({ "any.required": "Current password is required" }),
    newPassword: passwordSchema.required(),
  }),
};
