/**
 * Platform Repository
 * ====================
 * 
 * WHAT: This file contains ALL database queries for Platform module
 * WHY:  Separation of concerns - only this file knows about Prisma/Database
 * 
 * RULE: No business logic here. Just database operations.
 *       - Find data
 *       - Create data  
 *       - Update data
 *       - Delete data
 */

import prisma from '../../config/database.js';

// ============================================================================
// PLATFORM ADMIN QUERIES
// ============================================================================

/**
 * Find admin by email
 * 
 * USED FOR: Login - we need to find admin and check password
 * 
 * @param {string} email - Admin email address
 * @returns {Promise<object|null>} - Admin object or null if not found
 */
export async function findAdminByEmail(email) {
  return prisma.platformAdmin.findUnique({
    where: { 
      email: email.toLowerCase()  // Always lowercase for consistency
    },
  });
}

/**
 * Find admin by ID
 * 
 * USED FOR: Get profile, verify admin exists
 * 
 * @param {string} id - Admin ID
 * @returns {Promise<object|null>} - Admin object (without password) or null
 */
export async function findAdminById(id) {
  return prisma.platformAdmin.findUnique({
    where: { id },
    select: {
      // SELECT only what we need (never return passwordHash)
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Update admin's last login info
 * 
 * USED FOR: After successful login, track when/where they logged in
 * 
 * @param {string} id - Admin ID
 * @param {string} ipAddress - IP address of login request
 * @returns {Promise<object>} - Updated admin
 */
export async function updateLastLogin(id, ipAddress) {
  return prisma.platformAdmin.update({
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
 * Create a new session
 * 
 * USED FOR: After login, store session token in database
 * 
 * WHY STORE IN DATABASE?
 * - We can invalidate sessions (logout)
 * - We can see all active sessions
 * - We can expire sessions
 * 
 * @param {object} data - Session data
 * @param {string} data.adminId - Platform admin ID
 * @param {string} data.token - Random session token
 * @param {string} data.ipAddress - Client IP address
 * @param {string} data.userAgent - Client browser/app info
 * @param {Date} data.expiresAt - When session expires
 * @returns {Promise<object>} - Created session
 */
export async function createSession({ adminId, token, ipAddress, userAgent, expiresAt }) {
  return prisma.platformSession.create({
    data: {
      platformAdminId: adminId,
      token,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });
}

/**
 * Find session by token
 * 
 * USED FOR: Validate token on every protected request
 * 
 * @param {string} token - Session token from header
 * @returns {Promise<object|null>} - Session with admin info or null
 */
export async function findSessionByToken(token) {
  return prisma.platformSession.findUnique({
    where: { token },
    include: {
      // JOIN with admin table to get admin details
      admin: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      },
    },
  });
}

/**
 * Delete session (logout)
 * 
 * USED FOR: Logout - remove the session token
 * 
 * @param {string} token - Session token to delete
 * @returns {Promise<object>} - Deleted session
 */
export async function deleteSession(token) {
  return prisma.platformSession.delete({
    where: { token },
  });
}

/**
 * Delete all sessions for an admin
 * 
 * USED FOR: 
 * - Force logout from all devices
 * - After password change
 * - When admin is deactivated
 * 
 * @param {string} adminId - Admin ID
 * @returns {Promise<object>} - Delete count
 */
export async function deleteAllAdminSessions(adminId) {
  return prisma.platformSession.deleteMany({
    where: { platformAdminId: adminId },
  });
}

/**
 * Delete expired sessions (cleanup)
 * 
 * USED FOR: Periodic cleanup of old sessions
 * 
 * @returns {Promise<object>} - Delete count
 */
export async function deleteExpiredSessions() {
  return prisma.platformSession.deleteMany({
    where: {
      expiresAt: { 
        lt: new Date()  // lt = less than (expired)
      },
    },
  });
}