/**
 * Token Service
 * ==============
 * 
 * JWT token generation and verification for Organization Users
 * 
 * TOKENS:
 * - Access Token: Short-lived (15m), contains user/org/permissions
 * - Refresh Token: Long-lived (7d), used to get new access token
 * - Session Token: Random string stored in DB to track sessions
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../../config/index.js';

// ============================================================================
// PERMISSION MAPPINGS
// ============================================================================

export const ROLE_PERMISSIONS = {
  ORG_OWNER: ['*'], // All permissions
  
  ADMIN: [
    'dashboard:read',
    'staff:*',
    'client:*',
    'scheduling:*',
    'billing:*',
    'incidents:*',
    'reports:*',
    'settings:*',
    'users:*',
  ],
  
  MANAGER: [
    'dashboard:read',
    'staff:read',
    'staff:write',
    'client:*',
    'scheduling:*',
    'incidents:*',
    'reports:read',
  ],
  
  SCHEDULER: [
    'dashboard:read',
    'staff:read',
    'client:read',
    'scheduling:*',
  ],
  
  FINANCE: [
    'dashboard:read',
    'billing:*',
    'reports:read',
    'client:read',
  ],
  
  COORDINATOR: [
    'dashboard:read',
    'staff:read',
    'client:*',
    'scheduling:read',
    'incidents:read',
    'incidents:write',
  ],
  
  SUPPORT_WORKER: [
    'dashboard:read',
    'client:read',
    'scheduling:read',
    'shift:clock',
    'incidents:write',
  ],
  
  AUDITOR: [
    'dashboard:read',
    'staff:read',
    'client:read',
    'scheduling:read',
    'billing:read',
    'incidents:read',
    'reports:read',
  ],
};

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate Access Token (JWT)
 */
export function generateAccessToken(user, organization) {
  const permissions = getPermissions(user.role, user.customRole);
  
  const payload = {
    sub: user.id,
    email: user.email,
    organizationId: organization.id,
    organizationSlug: organization.slug,
    role: user.role,
    permissions,
    type: 'access',
  };
  
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessTokenExpiry,
    issuer: config.jwt.issuer,
  });
}

/**
 * Generate Refresh Token (JWT)
 */
export function generateRefreshToken(userId, sessionToken) {
  const payload = {
    sub: userId,
    sessionToken,
    type: 'refresh',
  };
  
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshTokenExpiry || '7d',
    issuer: config.jwt.issuer,
  });
}

/**
 * Generate random session token (stored in DB)
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ============================================================================
// TOKEN VERIFICATION
// ============================================================================

/**
 * Verify Access Token
 */
export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, config.jwt.secret, {
    issuer: config.jwt.issuer,
  });
  
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  
  return decoded;
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, config.jwt.secret, {
    issuer: config.jwt.issuer,
  });
  
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  
  return decoded;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get permissions for user
 */
export function getPermissions(role, customRole) {
  if (customRole?.permissions && Array.isArray(customRole.permissions)) {
    return customRole.permissions;
  }
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Calculate session expiry date
 */
export function getSessionExpiry(days = 7) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  generateAccessToken,
  generateRefreshToken,
  generateSessionToken,
  verifyAccessToken,
  verifyRefreshToken,
  getPermissions,
  getSessionExpiry,
  ROLE_PERMISSIONS,
};