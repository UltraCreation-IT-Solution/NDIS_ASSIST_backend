/**
 * Platform Auth Middleware
 * =========================
 * 
 * WHAT: Authentication middleware for Platform Admin
 * WHY:  Verify session token before accessing protected routes
 * 
 * LOCATION: src/middleware/ (global middleware folder)
 * 
 * USAGE:
 *   import { authenticate } from '../../middleware/platformAuth.middleware.js';
 *   router.get('/protected', authenticate, controller);
 */

import * as platformService from '../modules/platform/platform.service.js';
import { UnauthorizedError, ForbiddenError } from '../shared/errors/AppError.js';

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Authenticate Platform Admin
 * 
 * Verifies Authorization header contains valid session token
 * 
 * Header format: Authorization: Bearer <token>
 * 
 * On success:
 *   - Attaches admin to req.admin
 *   - Attaches token to req.token
 *   - Calls next()
 * 
 * On failure:
 *   - Throws UnauthorizedError (caught by global error handler)
 */
export async function authenticate(req, res, next) {
  // Step 1: Get Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    throw new UnauthorizedError('Authorization header is required');
  }
  
  // Step 2: Check format "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedError('Invalid authorization format. Use: Bearer <token>');
  }
  
  const token = parts[1];
  
  if (!token) {
    throw new UnauthorizedError('Token is required');
  }
  
  // Step 3: Validate session token (throws UnauthorizedError if invalid)
  const admin = await platformService.validateSession(token);
  
  // Step 4: Attach to request for controllers
  req.admin = admin;
  req.token = token;
  
  // Step 5: Continue to next middleware/controller
  next();
}

// ============================================================================
// ROLE-BASED AUTHORIZATION
// ============================================================================

/**
 * Require Specific Roles
 * 
 * Use AFTER authenticate middleware
 * 
 * @param {...string} allowedRoles - Roles that can access this route
 * 
 * USAGE:
 *   router.get('/admin-only', authenticate, requireRoles('SUPER_ADMIN'), controller);
 *   router.get('/support', authenticate, requireRoles('SUPER_ADMIN', 'PLATFORM_SUPPORT'), controller);
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) {
      throw new UnauthorizedError('Not authenticated');
    }
    
    if (!allowedRoles.includes(req.admin.role)) {
      throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
    }
    
    next();
  };
}

/**
 * Require Super Admin
 * 
 * Shortcut for requireRoles('SUPER_ADMIN')
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.admin) {
    throw new UnauthorizedError('Not authenticated');
  }
  
  if (req.admin.role !== 'SUPER_ADMIN') {
    throw new ForbiddenError('Access denied. Super Admin only.');
  }
  
  next();
}

// ============================================================================
// PLATFORM ROLE PERMISSIONS (For future permission-based auth)
// ============================================================================

export const PLATFORM_ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'platform:*',
    'admins:*',
    'organizations:*',
    'settings:*',
    'features:*',
    'dashboard:*',
  ],
  PLATFORM_SUPPORT: [
    'organizations:read',
    'organizations:support',
    'dashboard:read',
    'settings:read',
  ],
  PLATFORM_VIEWER: [
    'organizations:read',
    'dashboard:read',
  ],
};

/**
 * Require Specific Permission
 * 
 * @param {string} permission - Required permission (e.g., 'organizations:read')
 * 
 * USAGE:
 *   router.get('/orgs', authenticate, requirePermission('organizations:read'), controller);
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.admin) {
      throw new UnauthorizedError('Not authenticated');
    }
    
    const adminPermissions = PLATFORM_ROLE_PERMISSIONS[req.admin.role] || [];
    
    // Check for wildcard or exact permission match
    const hasPermission = adminPermissions.some((p) => {
      if (p === 'platform:*') return true;  // Super admin wildcard
      if (p.endsWith(':*')) {
        const prefix = p.replace(':*', '');
        return permission.startsWith(prefix);
      }
      return p === permission;
    });
    
    if (!hasPermission) {
      throw new ForbiddenError(`Access denied. Required permission: ${permission}`);
    }
    
    next();
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  authenticate,
  requireRoles,
  requireSuperAdmin,
  requirePermission,
  PLATFORM_ROLE_PERMISSIONS,
};