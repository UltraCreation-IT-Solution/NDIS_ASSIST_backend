/**
 * Auth Service
 * =============
 * 
 * Business logic for Organization User authentication
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as authRepo from './auth.repository.js';
import * as tokenService from './token.service.js';
import { 
  UnauthorizedError, 
  NotFoundError, 
  ConflictError,
  BadRequestError,
} from '../../shared/errors/AppError.js';
import { SECURITY, SESSION, ORGANIZATION } from '../../config/constants.js';

// ============================================================================
// HELPERS
// ============================================================================

async function hashPassword(password) {
  return bcrypt.hash(password, SECURITY.BCRYPT_ROUNDS);
}

async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, ORGANIZATION.MAX_SLUG_LENGTH);
}

async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  
  while (await authRepo.findOrganizationBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// ============================================================================
// REGISTRATION
// ============================================================================

export async function register(data, ipAddress, userAgent) {
  const { 
    organizationName, 
    email, 
    password, 
    firstName, 
    lastName, 
    phone,
  } = data;
  
  // Check if email already exists
  const existingUser = await authRepo.findUserByEmail(email);
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }
  
  // Generate unique slug
  const baseSlug = generateSlug(organizationName);
  const slug = await ensureUniqueSlug(baseSlug);
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Calculate trial end date
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + ORGANIZATION.TRIAL_DAYS);
  
  // Prepare data
  const orgData = {
    name: organizationName,
    slug,
    email: email.toLowerCase(),
  };
  
  const userData = {
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    phone,
    role: 'ORG_OWNER',
    status: 'ACTIVE',
  };
  
  const subscriptionData = {
    plan: 'FREE_TRIAL',
    status: 'TRIALING',
    trialEndsAt,
    maxStaff: ORGANIZATION.PLAN_LIMITS.FREE_TRIAL.maxStaff,
    maxClients: ORGANIZATION.PLAN_LIMITS.FREE_TRIAL.maxClients,
  };
  
  // Create organization with owner
  const organization = await authRepo.createOrganizationWithOwner(
    orgData, 
    userData, 
    subscriptionData
  );
  
  const user = organization.users[0];
  
  // Create session and tokens
  const sessionToken = tokenService.generateSessionToken();
  const expiresAt = tokenService.getSessionExpiry();
  
  await authRepo.createSession({
    userId: user.id,
    token: sessionToken,
    ipAddress,
    userAgent,
    expiresAt,
  });
  
  const accessToken = tokenService.generateAccessToken(user, organization);
  const refreshToken = tokenService.generateRefreshToken(user.id, sessionToken);
  
  return {
    accessToken,
    refreshToken,
    expiresAt,
    user: sanitizeUser(user),
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      subscription: organization.subscription,
    },
  };
}

// ============================================================================
// LOGIN
// ============================================================================

export async function login(email, password, ipAddress, userAgent) {
  const user = await authRepo.findUserByEmail(email);
  
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Account is not active. Please contact support.');
  }
  
  if (user.organization.status !== 'ACTIVE') {
    throw new UnauthorizedError('Organization is suspended. Please contact support.');
  }
  
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  // Create session
  const sessionToken = tokenService.generateSessionToken();
  const expiresAt = tokenService.getSessionExpiry();
  
  await authRepo.createSession({
    userId: user.id,
    token: sessionToken,
    ipAddress,
    userAgent,
    expiresAt,
  });
  
  await authRepo.updateLastLogin(user.id, ipAddress);
  
  const accessToken = tokenService.generateAccessToken(user, user.organization);
  const refreshToken = tokenService.generateRefreshToken(user.id, sessionToken);
  
  return {
    accessToken,
    refreshToken,
    expiresAt,
    user: sanitizeUser(user),
  };
}

// ============================================================================
// TOKEN REFRESH
// ============================================================================

export async function refresh(refreshToken, ipAddress, userAgent) {
  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
  
  const session = await authRepo.findSessionByToken(decoded.sessionToken);
  
  if (!session) {
    throw new UnauthorizedError('Session not found');
  }
  
  if (new Date() > session.expiresAt) {
    await authRepo.deleteSession(decoded.sessionToken);
    throw new UnauthorizedError('Session expired');
  }
  
  const user = session.user;
  
  if (user.status !== 'ACTIVE') {
    await authRepo.deleteSession(decoded.sessionToken);
    throw new UnauthorizedError('Account is not active');
  }
  
  if (user.organization.status !== 'ACTIVE') {
    await authRepo.deleteSession(decoded.sessionToken);
    throw new UnauthorizedError('Organization is suspended');
  }
  
  // Delete old session
  await authRepo.deleteSession(decoded.sessionToken);
  
  // Create new session (token rotation)
  const newSessionToken = tokenService.generateSessionToken();
  const expiresAt = tokenService.getSessionExpiry();
  
  await authRepo.createSession({
    userId: user.id,
    token: newSessionToken,
    ipAddress,
    userAgent,
    expiresAt,
  });
  
  const newAccessToken = tokenService.generateAccessToken(user, user.organization);
  const newRefreshToken = tokenService.generateRefreshToken(user.id, newSessionToken);
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresAt,
  };
}

// ============================================================================
// LOGOUT
// ============================================================================

export async function logout(sessionToken) {
  try {
    await authRepo.deleteSession(sessionToken);
  } catch (error) {
    // Session might already be deleted
  }
  
  return { success: true };
}

export async function logoutAll(userId) {
  const result = await authRepo.deleteAllUserSessions(userId);
  return { 
    success: true, 
    sessionsRemoved: result.count,
  };
}

// ============================================================================
// PROFILE
// ============================================================================

export async function getProfile(userId) {
  const user = await authRepo.findUserById(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  return sanitizeUser(user);
}

export async function updateProfile(userId, data) {
  const user = await authRepo.findUserById(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  const updated = await authRepo.updateUser(userId, data);
  
  return sanitizeUser(updated);
}

// ============================================================================
// PASSWORD MANAGEMENT
// ============================================================================

export async function forgotPassword(email) {
  const user = await authRepo.findUserByEmail(email);
  
  if (!user) {
    return { success: true };
  }
  
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION.RESET_TOKEN_EXPIRY_HOURS);
  
  await authRepo.createPasswordReset({
    userId: user.id,
    token,
    expiresAt,
  });
  
  // TODO: Send email with reset link
  console.log(`Password reset token for ${email}: ${token}`);
  
  return { success: true };
}

export async function resetPassword(token, newPassword) {
  const reset = await authRepo.findPasswordResetByToken(token);
  
  if (!reset) {
    throw new BadRequestError('Invalid or expired reset token');
  }
  
  const passwordHash = await hashPassword(newPassword);
  
  await authRepo.updateUser(reset.userId, { passwordHash });
  await authRepo.deletePasswordReset(reset.id);
  await authRepo.deleteAllUserSessions(reset.userId);
  
  return { success: true };
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await authRepo.findUserById(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  const isValid = await comparePassword(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new BadRequestError('Current password is incorrect');
  }
  
  const passwordHash = await hashPassword(newPassword);
  
  await authRepo.updateUser(userId, { passwordHash });
  
  return { success: true };
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export async function getSessions(userId) {
  return authRepo.getUserSessions(userId);
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  getSessions,
};