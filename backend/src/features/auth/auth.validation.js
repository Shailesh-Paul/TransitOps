import Joi from "joi";
import { emailSchema, passwordSchema } from "../../validators/common.schema.js";

export const loginSchema = {
  body: Joi.object({
    email: emailSchema.required(),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  }),
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: emailSchema.required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Token is required",
      "string.empty": "Token cannot be empty",
    }),
    newPassword: passwordSchema.required(),
  }),
};

export const refreshSchema = {
  cookies: Joi.object({
    jwt: Joi.string().required().messages({
      "any.required": "Refresh token is missing",
      "string.empty": "Refresh token cannot be empty",
    }),
  }).unknown(true), // allow other cookies
};

export const logoutSchema = {
  cookies: Joi.object({
    jwt: Joi.string().optional(),
  }).unknown(true),
};

