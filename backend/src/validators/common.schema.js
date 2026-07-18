import Joi from "joi";

// UUID (typically for things like external references or tokens, but MySQL uses integer IDs heavily)
export const uuidSchema = Joi.string().uuid().messages({
  "string.guid": "Must be a valid UUID",
});

// Database IDs (Assuming standard Auto-Increment Integers in MySQL)
export const idSchema = Joi.number().integer().positive().messages({
  "number.base": "ID must be a number",
  "number.integer": "ID must be an integer",
  "number.positive": "ID must be a positive integer",
});

// Email
export const emailSchema = Joi.string().email({ tlds: { allow: false } }).max(255).messages({
  "string.email": "Please provide a valid email address",
  "string.max": "Email must not exceed 255 characters",
});

// Password (Minimum 8 characters, at least one letter and one number)
export const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&^_-]{8,}$"))
  .messages({
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must not exceed 128 characters",
    "string.pattern.base": "Password must contain at least one letter and one number",
  });

// Phone Number (Basic E.164-like validation or standard format)
export const phoneSchema = Joi.string()
  .pattern(/^\+?[1-9]\d{1,14}$/)
  .messages({
    "string.pattern.base": "Phone number must be a valid format (e.g., +1234567890)",
  });

// Vehicle Registration Number (Alphanumeric, spaces, dashes)
export const vehicleRegistrationSchema = Joi.string()
  .pattern(/^[A-Z0-9 -]{4,15}$/)
  .messages({
    "string.pattern.base": "Vehicle registration must be 4-15 characters, containing only uppercase letters, numbers, spaces, or dashes",
  });

// License Number
export const licenseNumberSchema = Joi.string()
  .alphanum()
  .min(5)
  .max(20)
  .messages({
    "string.alphanum": "License number must contain only letters and numbers",
    "string.min": "License number must be at least 5 characters",
    "string.max": "License number must not exceed 20 characters",
  });

// Dates (ISO 8601 or YYYY-MM-DD)
export const dateSchema = Joi.date().iso().messages({
  "date.base": "Must be a valid date",
  "date.format": "Date must be in standard ISO format",
});

// Positive Numbers (e.g., Capacity, Quantity)
export const positiveNumberSchema = Joi.number().positive().messages({
  "number.positive": "Must be a positive number",
});

// Decimal Numbers (e.g., Currency, Cost, Amount)
export const decimalNumberSchema = Joi.number().precision(2).positive().messages({
  "number.base": "Must be a valid decimal number",
  "number.positive": "Must be a positive value",
});

// Generic Search String
export const searchSchema = Joi.string().min(1).max(100).trim().optional();

// Pagination Schema Object (can be spread into query schemas)
export const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
};

// Sorting Schema Object (can be spread into query schemas)
export const sortingSchema = {
  sortBy: Joi.string().max(50).optional(),
  order: Joi.string().valid("asc", "desc").default("asc"),
};

// File Upload Metadata (e.g. for processing req.file or generic file payloads)
export const fileUploadSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string()
    .valid("image/jpeg", "image/png", "image/gif", "application/pdf")
    .required()
    .messages({
      "any.only": "File must be JPEG, PNG, GIF, or PDF",
    }),
  size: Joi.number()
    .max(5 * 1024 * 1024)
    .required()
    .messages({
      "number.max": "File size must not exceed 5MB",
    }),
}).unknown(true); // Allow other multer fields like path, destination, etc.
