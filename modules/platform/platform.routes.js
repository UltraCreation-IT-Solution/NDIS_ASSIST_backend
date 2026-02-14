/**
 * Platform Routes
 * ================
 * 
 * WHAT: Defines all URL endpoints for Platform module
 * WHY:  Single place to see all available routes
 * 
 * Base path: /api/v1/platform
 * 
 * PUBLIC ROUTES (no auth required):
 *   GET  /health         - Health check
 *   POST /auth/login     - Login
 * 
 * PROTECTED ROUTES (auth required):
 *   POST /auth/logout      - Logout current session
 *   POST /auth/logout-all  - Logout all sessions
 *   GET  /auth/me          - Get current admin profile
 *   
 * SETTINGS ROUTES (super admin only):
 *   GET    /settings         - List all settings
 *   GET    /settings/:key    - Get single setting
 *   PUT    /settings/:key    - Update single setting  
 *   PUT    /settings/bulk    - Update multiple settings
 *   DELETE /settings/:key    - Delete setting
 */

import { Router } from 'express';

// Controllers
import * as platformController from './platform.controller.js';

// Auth middleware (from global middleware folder)
import { authenticate, requireSuperAdmin } from '../../middleware/platformAuth.middleware.js';

// Validation middleware
import { validate } from '../../middleware/validate.middleware.js';
import { 
  loginSchema, 
  updateSettingSchema, 
  updateBulkSettingsSchema,
  settingKeySchema 
} from './platform.validator.js';

// Create router
const router = Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * GET /health
 * Health check - no auth required
 */
router.get('/health', platformController.healthCheck);

/**
 * POST /auth/login
 * Login platform admin
 * 
 * Body: { email, password }
 */
router.post('/auth/login', validate(loginSchema), platformController.login);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * GET /auth/me
 * Get current admin profile
 */
router.get('/auth/me', authenticate, platformController.getProfile);

/**
 * POST /auth/logout
 * Logout current session
 */
router.post('/auth/logout', authenticate, platformController.logout);

/**
 * POST /auth/logout-all
 * Logout from all devices
 */
router.post('/auth/logout-all', authenticate, platformController.logoutAllDevices);

/**
 * GET /audit-logs
 * Get platform audit logs
 */
router.get('/audit-logs', authenticate, platformController.getAuditLogs);

// ============================================================================
// PLATFORM SETTINGS (Super Admin only)
// ============================================================================

/**
 * GET /settings
 * List all platform settings
 */
router.get('/settings', authenticate, requireSuperAdmin, platformController.listSettings);

/**
 * PUT /settings/bulk
 * Update multiple settings at once
 * Note: Must be before /settings/:key to avoid route conflict
 */
router.put('/settings/bulk', authenticate, requireSuperAdmin, validate(updateBulkSettingsSchema), platformController.updateBulkSettings);

/**
 * GET /settings/:key
 * Get single setting by key
 */
router.get('/settings/:key', authenticate, requireSuperAdmin, validate(settingKeySchema), platformController.getSetting);

/**
 * PUT /settings/:key
 * Update single setting
 */
router.put('/settings/:key', authenticate, requireSuperAdmin, validate(updateSettingSchema), platformController.updateSetting);

/**
 * DELETE /settings/:key
 * Delete a setting
 */
router.delete('/settings/:key', authenticate, requireSuperAdmin, validate(settingKeySchema), platformController.deleteSetting);

// ============================================================================
// EXPORT
// ============================================================================

export default router;