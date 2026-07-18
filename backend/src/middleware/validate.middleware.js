
/**
 * Enterprise centralized validation middleware.
 * Exclusively executes Joi schemas mapped to request objects.
 *
 * @param {Object} schema - Joi schema mapping (e.g., { body: Joi.object() })
 * @returns Express Middleware Function
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // It's a Joi schema structure (e.g., { body: Joi.object(), params: Joi.object() })
      const validSources = ["body", "query", "params", "cookies"];
      
      for (const source of validSources) {
        if (schema[source]) {
          req[source] = await schema[source].validateAsync(req[source], {
            abortEarly: false,
            stripUnknown: true, // Strictly strip any fields not defined in Joi schema
          });
        }
      }

      next();
    } catch (error) {
      // Pass raw Joi errors (and any other unexpected errors) to the global error handler
      next(error);
    }
  };
};
