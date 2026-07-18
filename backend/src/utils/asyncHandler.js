/**
 * Wraps async Express controllers to catch unhandled promise rejections
 * and automatically forward them to the global error handler middleware.
 * Eliminates the need for repetitive try/catch blocks.
 *
 * @param {Function} fn - The async controller function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
