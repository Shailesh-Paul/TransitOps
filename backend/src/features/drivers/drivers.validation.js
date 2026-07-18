import Joi from "joi";
import {
  idSchema,
  licenseNumberSchema,
  dateSchema,
  phoneSchema
} from "../../validators/common.schema.js";

export const createDriverSchema = {
  body: Joi.object({
    employee_id: idSchema.required(),
    license_number: licenseNumberSchema.required(),
    license_expiry: dateSchema.required(),
    safety_score: Joi.number().precision(2).min(0).max(100).default(100.00),
    emergency_contact: phoneSchema.optional().allow(null, ""),
    status: Joi.string().valid("Available", "Reserved", "On Trip", "Off Duty", "Suspended", "Retired").default("Available")
  }),
};

export const updateDriverSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    license_number: licenseNumberSchema.optional(),
    license_expiry: dateSchema.optional(),
    safety_score: Joi.number().precision(2).min(0).max(100).optional(),
    emergency_contact: phoneSchema.optional().allow(null, ""),
    status: Joi.string().valid("Available", "Reserved", "On Trip", "Off Duty", "Suspended", "Retired").optional(),
  }),
};

export const updateDriverStatusSchema = {
  params: Joi.object({
    id: idSchema.required(),
  }),
  body: Joi.object({
    status: Joi.string().valid("Available", "Reserved", "On Trip", "Off Duty", "Suspended", "Retired").required()
  }),
};
