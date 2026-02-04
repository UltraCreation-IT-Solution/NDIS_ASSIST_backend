/**
 * Auth Controller
 * ================
 * 
 * HTTP handlers for Organization User authentication
 */

import * as authService from './auth.service.js';
import { success, created } from '../../shared/utils/response.util.js';

// ============================================================================
// HELPERS
// ============================================================================

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/auth/register
 */
export async function register(req, res) {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  const result = await authService.register(req.body, ipAddress, userAgent);
  
  return created(res, result, 'Registration successful');
}

/**
 * POST /api/v1/auth/login
 */
export async function login(req, res) {
  const { email, password } = req.body;
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  const result = await authService.login(email, password, ipAddress, userAgent);
  
  return success(res, result, 'Login successful');
}

/**
 * POST /api/v1/auth/refresh
 */
export async function refresh(req, res) {
  const { refreshToken } = req.body;
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  const result = await authService.refresh(refreshToken, ipAddress, userAgent);
  
  return success(res, result, 'Token refreshed');
}

/**
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPassword(req, res) {
  const { email } = req.body;
  
  await authService.forgotPassword(email);
  
  return success(res, null, 'If the email exists, a reset link has been sent');
}

/**
 * POST /api/v1/auth/reset-password
 */
export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  
  await authService.resetPassword(token, newPassword);
  
  return success(res, null, 'Password reset successful');
}

// ============================================================================
// PROTECTED ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/auth/logout
 */
export async function logout(req, res) {
  const sessionToken = req.sessionToken;
  
  await authService.logout(sessionToken);
  
  return success(res, null, 'Logged out successfully');
}

/**
 * POST /api/v1/auth/logout-all
 */
export async function logoutAll(req, res) {
  const userId = req.user.id;
  
  const result = await authService.logoutAll(userId);
  
  return success(res, result, 'Logged out from all devices');
}

/**
 * GET /api/v1/auth/me
 */
export async function getProfile(req, res) {
  const userId = req.user.id;
  
  const profile = await authService.getProfile(userId);
  
  return success(res, profile, 'Profile retrieved');
}

/**
 * PATCH /api/v1/auth/me
 */
export async function updateProfile(req, res) {
  const userId = req.user.id;
  
  const profile = await authService.updateProfile(userId, req.body);
  
  return success(res, profile, 'Profile updated');
}

/**
 * POST /api/v1/auth/change-password
 */
export async function changePassword(req, res) {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  
  await authService.changePassword(userId, currentPassword, newPassword);
  
  return success(res, null, 'Password changed successfully');
}

/**
 * GET /api/v1/auth/sessions
 */
export async function getSessions(req, res) {
  const userId = req.user.id;
  
  const sessions = await authService.getSessions(userId);
  
  return success(res, sessions, 'Sessions retrieved');
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  getSessions,
};