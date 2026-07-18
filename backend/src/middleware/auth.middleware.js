import { verifyAccessToken } from "../utils/jwt.util.js";
import { AuthenticationError } from "../core/errors.js";
import { authLogger } from "../utils/logger.js";
import { findUserById } from "../features/auth/auth.repository.js";
import { getUserPermissions } from "../features/rbac/rbac.repository.js";

export const requireAuth = async (req, res, next) => {
  try {
    let token;
    
    // Read Bearer Token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AuthenticationError("Authentication required. Please provide a valid Bearer token."));
    }

    // Verify JWT using the new reusable JWT service
    const decoded = verifyAccessToken(token);

    // Verify if user still exists in database
    const currentUser = await findUserById(decoded.id);
    if (!currentUser) {
      return next(new AuthenticationError("The user belonging to this token no longer exists."));
    }

    // Fetch user permissions using the new enterprise RBAC architecture (aggregates permissions across all active user roles)
    const permissions = await getUserPermissions(currentUser.id);
    
    // Attach authenticated user to request
    req.user = {
      ...currentUser,
      permissions,
    };

    next();
  } catch (error) {
    // The global error handler in error.middleware.js natively catches
    // JsonWebTokenError, TokenExpiredError, and NotBeforeError to return 401.
    authLogger.warn(`JWT Error: ${error.message}`, { 
      errorName: error.name,
      requestId: req.id,
      ip: req.ip
    });
    next(error);
  }
};
