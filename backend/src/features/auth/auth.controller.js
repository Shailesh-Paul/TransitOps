import ApiResponse from "../../core/ApiResponse.js";
import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
    
    const { accessToken, refreshToken, user } = await authService.login(email, password);

    res.cookie("jwt", refreshToken, COOKIE_OPTIONS);

    ApiResponse.send(res, { accessToken, user });
});

export const refresh = asyncHandler(async (req, res, next) => {
  const oldRefreshToken = req.cookies.jwt;
    
    const { accessToken, refreshToken } = await authService.refresh(oldRefreshToken);

    res.cookie("jwt", refreshToken, COOKIE_OPTIONS);

    ApiResponse.send(res, { accessToken });
});

export const logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.jwt;
    
    // If the route is protected by requireAuth, req.user is available
    if (req.user && refreshToken) {
      await authService.logout(req.user.id, refreshToken);
    }
    
    res.cookie("jwt", "loggedout", {
      ...COOKIE_OPTIONS,
      maxAge: 10 * 1000,
    });

    ApiResponse.send(res, null, "Operation successful");
});

export const requestPasswordReset = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
    const rawToken = await authService.generatePasswordResetToken(email);

    if (rawToken) {
      // In production, send this token via Email Service (e.g. SendGrid)
      // Example: await emailService.sendPasswordReset(email, rawToken);
      console.log(`[Email Mock] Reset token for ${email}: ${rawToken}`);
    }

    ApiResponse.send(res, null, "If an account with that email exists, a reset link has been sent.");
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);

    ApiResponse.send(res, null, "Password has been reset successfully.");
});

export const getMe = (req, res, next) => {
  try {
    // req.user is populated by requireAuth middleware and contains profile, role, and permissions
    ApiResponse.send(res, { user: req.user });
  } catch (error) {
    next(error);
  }
};
