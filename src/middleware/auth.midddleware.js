/**
 * Auth Middleware (Organization Users)
 * =====================================
 * 
 * JWT-based authentication for Organization Users
 */

import * as tokenService from '../modules/auth/token.service.js';
import * as authRepo from '../modules/auth/auth.repository.js';
import { UnauthorizedError, ForbiddenError } from '../shared/errors/AppError.js';

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    throw new UnauthorizedError('Authorization header is required');
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedError('Invalid authorization format. Use: Bearer <token>');
  }
  
  const token = parts[1];
  
  if (!token) {
    throw new UnauthorizedError('Token is required');
  }
  
  let decoded;
  try {
    decoded = tokenService.verifyAccessToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Token verification failed');
  }
  
  const user = await authRepo.findUserById(decoded.sub);
  
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  
  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Account is not active');
  }
  
  if (user.organization.status !== 'ACTIVE') {
    throw new UnauthorizedError('Organization is suspended');
  }
  
  req.user = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    permissions: decoded.permissions,
  };
  req.organizationId = user.organizationId;
  req.organization = user.organization;
  
  next();
}

// ============================================================================
// AUTHORIZATION
// ============================================================================

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }
    
    const { permissions } = req.user;
    
    if (permissions.includes('*')) {
      return next();
    }
    
    if (permissions.includes(permission)) {
      return next();
    }
    
    const [resource] = permission.split(':');
    if (permissions.includes(`${resource}:*`)) {
      return next();
    }
    
    throw new ForbiddenError(`Permission required: ${permission}`);
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }
    
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Role required: ${roles.join(' or ')}`);
    }
    
    next();
  };
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  
  if (!['ORG_OWNER', 'ADMIN'].includes(req.user.role)) {
    throw new ForbiddenError('Admin access required');
  }
  
  next();
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  authenticate,
  requirePermission,
  requireRole,
  requireAdmin,
};