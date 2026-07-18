import Joi from "joi";

// We strictly export ONLY the Joi Schema definition map.
// The actual middleware logic happens in validate.middleware.js.
export const roleSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      "string.min": "Role name must be at least 2 characters",
      "any.required": "Role name is required",
    }),
    description: Joi.string().max(255).optional(),
    is_active: Joi.boolean().optional(),
  }),
};
