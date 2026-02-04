/**
 * Platform Controller
 * ====================
 * 
 * WHAT: Handles HTTP requests and sends responses
 * WHY:  Separates HTTP logic from business logic
 * 
 * Controller's job:
 * 1. Extract data from request (already validated by middleware)
 * 2. Call service functions
 * 3. Send response using response utilities
 * 
 * NOTE: Errors propagate to global error handler - no try/catch needed!
 */

import * as platformService from './platform.service.js';
import { success } from '../../shared/utils/response.util.js';

// ============================================================================
// HELPER: Get client IP address
// ============================================================================

/**
 * Extract client IP from request
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

// ============================================================================
// AUTHENTICATION CONTROLLERS
// ============================================================================

/**
 * POST /api/v1/platform/auth/login
 * 
 * Login platform admin
 * 
 * Body (validated by middleware):
 *   { email, password }
 * 
 * Response:
 *   { success: true, message, data: { token, expiresAt, admin } }
 */
export async function login(req, res) {
  // Input already validated by validate middleware
  const { email, password } = req.body;
  
  // Get client info for tracking
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // Call service (errors propagate to error handler)
  const result = await platformService.login(email, password, ipAddress, userAgent);
  
  // Send success response
  return success(res, result, 'Login successful');
}

/**
 * POST /api/v1/platform/auth/logout
 * 
 * Logout current session
 * 
 * Headers: Authorization: Bearer <token>
 */
export async function logout(req, res) {
  // Token attached by auth middleware
  const token = req.token;
  
  await platformService.logout(token);
  
  return success(res, null, 'Logged out successfully');
}

/**
 * GET /api/v1/platform/auth/me
 * 
 * Get current admin profile
 * 
 * Headers: Authorization: Bearer <token>
 */
export async function getProfile(req, res) {
  // Admin attached by auth middleware
  const adminId = req.admin.id;
  
  const admin = await platformService.getProfile(adminId);
  
  return success(res, admin, 'Profile retrieved successfully');
}

/**
 * POST /api/v1/platform/auth/logout-all
 * 
 * Logout from all devices
 * 
 * Headers: Authorization: Bearer <token>
 */
export async function logoutAllDevices(req, res) {
  const adminId = req.admin.id;
  
  const result = await platformService.logoutAllDevices(adminId);
  
  return success(res, { sessionsRemoved: result.count }, 'Logged out from all devices');
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /api/v1/platform/health
 * 
 * Health check - no auth required
 */
export async function healthCheck(req, res) {
  return success(res, {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, 'Platform API is running');
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  login,
  logout,
  getProfile,
  logoutAllDevices,
  healthCheck,
};