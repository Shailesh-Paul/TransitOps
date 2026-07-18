import Joi from "joi";
import {
  vehicleRegistrationSchema,
  dateSchema,
  positiveNumberSchema,
  decimalNumberSchema,
} from "../../validators/common.schema.js";

export const createVehicleSchema = {
  body: Joi.object({
    registration_number: vehicleRegistrationSchema.required(),
    make: Joi.string().required().messages({ "any.required": "Vehicle Name/Make is required" }),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    capacity: positiveNumberSchema.required(),
    status: Joi.string().valid("Available", "Reserved", "On Trip", "In Shop", "Retired").default("Available"),
    current_location: Joi.string().optional().allow("", null),
    insurance_expiry: dateSchema.required(),
    registration_expiry: dateSchema.required(),
    puc_expiry: dateSchema.required(),
    current_odometer: decimalNumberSchema.optional(),
  }),
};

export const updateVehicleSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    registration_number: vehicleRegistrationSchema.optional(),
    make: Joi.string().optional(),
    model: Joi.string().optional(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
    capacity: positiveNumberSchema.optional(),
    status: Joi.string().valid("Available", "Reserved", "On Trip", "In Shop", "Retired").optional(),
    current_location: Joi.string().optional().allow("", null),
    insurance_expiry: dateSchema.optional(),
    registration_expiry: dateSchema.optional(),
    puc_expiry: dateSchema.optional(),
  }),
};

export const updateVehicleStatusSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid("Available", "Reserved", "On Trip", "In Shop", "Retired").required()
  }),
};
