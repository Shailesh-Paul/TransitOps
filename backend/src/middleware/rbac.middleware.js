import { AuthorizationError, InternalServerError } from "../core/errors.js";

/**
 * Enterprise RBAC Authorization Middleware.
 * Strictly verifies if the authenticated user has a specific permission.
 * MUST be used AFTER the requireAuth middleware.
 * 
 * @param {string} permissionName - The permission required (e.g. 'Vehicle.Create')
 */
export const authorize = (permissionName) => {
  return (req, res, next) => {
    // Failsafe: Ensure auth middleware ran first
    if (!req.user || !req.user.permissions) {
      return next(new InternalServerError("User permissions not found. Ensure auth middleware runs first."));
    }

    if (!req.user.permissions.includes(permissionName)) {
      return next(new AuthorizationError("You do not have permission to perform this action."));
    }

    next();
  };
};

/**
 * Legacy alias for backward compatibility with unmigrated route files.
 * @deprecated Use authorize(Permissions.*) instead.
 */
export const requirePermission = authorize;
