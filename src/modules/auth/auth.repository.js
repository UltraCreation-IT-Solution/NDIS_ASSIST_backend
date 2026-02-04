/**
 * Auth Repository
 * ================
 * 
 * Database queries for Auth module (Organization Users)
 */

import prisma from '../../config/database.js';

// ============================================================================
// USER QUERIES
// ============================================================================

/**
 * Find user by email (across all orgs or within specific org)
 */
export async function findUserByEmail(email, organizationId = null) {
  const where = { 
    email: email.toLowerCase(),
    ...(organizationId && { organizationId }),
  };
  
  return prisma.user.findFirst({
    where,
    include: {
      organization: {
        include: {
          subscription: true,
        },
      },
      customRole: true,
    },
  });
}

/**
 * Find user by ID
 */
export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      organization: {
        include: {
          subscription: true,
        },
      },
      customRole: true,
      staffProfile: true,
    },
  });
}

/**
 * Create user
 */
export async function createUser(data) {
  return prisma.user.create({
    data,
    include: {
      organization: true,
    },
  });
}

/**
 * Update user
 */
export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    include: {
      organization: true,
      customRole: true,
    },
  });
}

/**
 * Update last login
 */
export async function updateLastLogin(id, ipAddress) {
  return prisma.user.update({
    where: { id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
    },
  });
}

// ============================================================================
// SESSION QUERIES
// ============================================================================

/**
 * Create session
 */
export async function createSession({ userId, token, ipAddress, userAgent, deviceType, expiresAt }) {
  return prisma.session.create({
    data: {
      userId,
      token,
      ipAddress,
      userAgent,
      deviceType,
      expiresAt,
    },
  });
}

/**
 * Find session by token
 */
export async function findSessionByToken(token) {
  return prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          organization: true,
          customRole: true,
        },
      },
    },
  });
}

/**
 * Delete session (logout)
 */
export async function deleteSession(token) {
  return prisma.session.delete({
    where: { token },
  });
}

/**
 * Delete all sessions for user
 */
export async function deleteAllUserSessions(userId) {
  return prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Get user sessions
 */
export async function getUserSessions(userId) {
  return prisma.session.findMany({
    where: { 
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      deviceType: true,
      createdAt: true,
      expiresAt: true,
    },
  });
}

// ============================================================================
// PASSWORD RESET QUERIES
// ============================================================================

/**
 * Create password reset token
 */
export async function createPasswordReset({ userId, token, expiresAt }) {
  // Delete any existing reset tokens for this user
  await prisma.passwordReset.deleteMany({
    where: { userId },
  });
  
  return prisma.passwordReset.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
}

/**
 * Find password reset by token
 */
export async function findPasswordResetByToken(token) {
  return prisma.passwordReset.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });
}

/**
 * Delete password reset
 */
export async function deletePasswordReset(id) {
  return prisma.passwordReset.delete({
    where: { id },
  });
}

/**
 * Delete all password resets for user
 */
export async function deleteUserPasswordResets(userId) {
  return prisma.passwordReset.deleteMany({
    where: { userId },
  });
}

// ============================================================================
// ORGANIZATION QUERIES (For self-registration)
// ============================================================================

/**
 * Check if organization slug exists
 */
export async function findOrganizationBySlug(slug) {
  return prisma.organization.findUnique({
    where: { slug },
  });
}

/**
 * Create organization with owner and subscription (self-registration)
 */
export async function createOrganizationWithOwner(orgData, userData, subscriptionData) {
  return prisma.organization.create({
    data: {
      ...orgData,
      subscription: {
        create: subscriptionData,
      },
      users: {
        create: userData,
      },
    },
    include: {
      subscription: true,
      users: true,
    },
  });
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  updateLastLogin,
  createSession,
  findSessionByToken,
  deleteSession,
  deleteAllUserSessions,
  getUserSessions,
  createPasswordReset,
  findPasswordResetByToken,
  deletePasswordReset,
  deleteUserPasswordResets,
  findOrganizationBySlug,
  createOrganizationWithOwner,
};