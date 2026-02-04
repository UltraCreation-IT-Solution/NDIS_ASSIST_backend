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
 */

import { Router } from 'express';

// Controllers
import * as platformController from './platform.controller.js';

// Auth middleware (from global middleware folder)
import { authenticate } from '../../middleware/platformAuth.middleware.js';

// Validation middleware
import { validate } from '../../middleware/validate.middleware.js';
import { loginSchema } from './platform.validator.js';

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

// ============================================================================
// EXPORT
// ============================================================================

export default router;