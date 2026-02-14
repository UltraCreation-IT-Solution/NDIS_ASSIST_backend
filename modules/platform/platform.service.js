/**
 * Platform Service
 * =================
 * 
 * WHAT: Business logic for Platform module
 * WHY:  Separates "what to do" from "how to store"
 * 
 * This file contains:
 * - Login logic (verify password, create session)
 * - Logout logic (delete session)
 * - Session validation (check if token is valid)
 * - Password hashing utilities
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as platformRepo from './platform.repository.js';
import { UnauthorizedError, NotFoundError } from '../../shared/errors/AppError.js';
import { SESSION, SECURITY } from '../../config/constants.js';

// ============================================================================
// CONFIGURATION (from constants)
// ============================================================================

const SALT_ROUNDS = SECURITY.BCRYPT_ROUNDS;
const SESSION_EXPIRY_DAYS = SESSION.PLATFORM_EXPIRY_DAYS;

// ============================================================================
// PASSWORD UTILITIES
// ============================================================================

/**
 * Hash a plain text password
 * 
 * WHAT: Convert "MyPassword123" → "$2b$10$X7z..."
 * WHY:  Never store plain passwords - if database leaks, passwords are safe
 * 
 * FIRST PRINCIPLE - How bcrypt works:
 * 1. Generate random "salt" (e.g., "X7zK9...")
 * 2. Combine password + salt
 * 3. Hash 2^10 times (slow on purpose)
 * 4. Result includes salt so we can verify later
 * 
 * @param {string} plainPassword - Password user typed
 * @returns {Promise<string>} - Hashed password to store in database
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare plain password with stored hash
 * 
 * WHAT: Check if "MyPassword123" matches "$2b$10$X7z..."
 * WHY:  We can't "decrypt" hash, so we hash input and compare
 * 
 * @param {string} plainPassword - Password user typed
 * @param {string} hashedPassword - Hash from database
 * @returns {Promise<boolean>} - true if match, false if not
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// ============================================================================
// TOKEN UTILITIES
// ============================================================================

/**
 * Generate a secure random token
 * 
 * WHAT: Create random string like "a3f8c2e1b9d4..."
 * WHY:  Used for session tokens - must be unpredictable
 * 
 * FIRST PRINCIPLE - Why crypto.randomBytes?
 * - Math.random() is NOT secure (predictable pattern)
 * - crypto.randomBytes() uses OS-level randomness
 * - 32 bytes = 256 bits of randomness = impossible to guess
 * 
 * @returns {string} - 64 character hex string
 */
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate session expiry date
 * 
 * @returns {Date} - Date when session should expire
 */
export function getSessionExpiry() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + SESSION_EXPIRY_DAYS);
  return expiry;
}

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

/**
 * Login - Authenticate platform admin
 * 
 * WHAT: Verify email/password and create session
 * 
 * FLOW:
 * 1. Find admin by email
 * 2. Verify admin exists and is active
 * 3. Compare password
 * 4. Generate session token
 * 5. Save session to database
 * 6. Update last login info
 * 7. Return token and admin info
 * 
 * @param {string} email - Admin email
 * @param {string} password - Plain text password
 * @param {string} ipAddress - Client IP (for tracking)
 * @param {string} userAgent - Browser info (for tracking)
 * @returns {Promise<object>} - { token, expiresAt, admin }
 * @throws {Error} - If credentials invalid or account inactive
 */
export async function login(email, password, ipAddress, userAgent) {
  // Step 1: Find admin by email
  const admin = await platformRepo.findAdminByEmail(email);
  
  // Step 2: Check if admin exists
  if (!admin) {
    // SECURITY: Don't reveal if email exists or not
    throw new UnauthorizedError('Invalid email or password');
  }
  
  // Step 3: Check if account is active
  if (!admin.isActive) {
    throw new UnauthorizedError('Account is deactivated. Please contact support.');
  }
  
  // Step 4: Verify password
  const isPasswordValid = await comparePassword(password, admin.passwordHash);
  
  if (!isPasswordValid) {
    // SECURITY: Same message as "email not found"
    throw new UnauthorizedError('Invalid email or password');
  }
  
  // Step 5: Generate session token
  const token = generateToken();
  const expiresAt = getSessionExpiry();
  
  // Step 6: Save session to database
  await platformRepo.createSession({
    adminId: admin.id,
    token,
    ipAddress,
    userAgent,
    expiresAt,
  });
  
  // Step 7: Update last login info
  await platformRepo.updateLastLogin(admin.id, ipAddress);
  
  // Step 8: Return success response
  // IMPORTANT: Never return passwordHash!
  return {
    token,
    expiresAt,
    admin: {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
    },
  };
}

/**
 * Logout - Invalidate session
 * 
 * WHAT: Delete session from database
 * WHY:  Token becomes invalid immediately
 * 
 * @param {string} token - Session token to invalidate
 * @returns {Promise<object>} - { success: true }
 */
export async function logout(token) {
  try {
    await platformRepo.deleteSession(token);
    return { success: true };
  } catch (error) {
    // Session might already be deleted or expired
    // Still return success - user wanted to logout
    return { success: true };
  }
}

/**
 * Validate Session - Check if token is valid
 * 
 * WHAT: Verify token exists and not expired
 * WHY:  Called on every protected request
 * 
 * FLOW:
 * 1. Find session by token
 * 2. Check if session exists
 * 3. Check if session expired
 * 4. Check if admin is still active
 * 5. Return admin info
 * 
 * @param {string} token - Session token from request header
 * @returns {Promise<object>} - Admin object if valid
 * @throws {Error} - If token invalid or expired
 */
export async function validateSession(token) {
  // Step 1: Find session
  const session = await platformRepo.findSessionByToken(token);
  
  // Step 2: Check if exists
  if (!session) {
    throw new UnauthorizedError('Invalid session');
  }
  
  // Step 3: Check if expired
  if (new Date() > session.expiresAt) {
    // Clean up expired session
    await platformRepo.deleteSession(token);
    throw new UnauthorizedError('Session expired');
  }
  
  // Step 4: Check if admin still active
  if (!session.admin.isActive) {
    // Clean up session for deactivated admin
    await platformRepo.deleteSession(token);
    throw new UnauthorizedError('Account is deactivated');
  }
  
  // Step 5: Return admin info
  return session.admin;
}

/**
 * Get Current Admin Profile
 * 
 * @param {string} adminId - Admin ID from session
 * @returns {Promise<object>} - Admin profile
 * @throws {Error} - If admin not found
 */
export async function getProfile(adminId) {
  const admin = await platformRepo.findAdminById(adminId);
  
  if (!admin) {
    throw new NotFoundError('Admin not found');
  }
  
  return admin;
}

/**
 * Logout from all devices
 * 
 * WHAT: Delete all sessions for an admin
 * WHY:  Security - if account compromised, logout everywhere
 * 
 * @param {string} adminId - Admin ID
 * @returns {Promise<object>} - { success: true, count: number }
 */
export async function logoutAllDevices(adminId) {
  const result = await platformRepo.deleteAllAdminSessions(adminId);
  return { 
    success: true, 
    count: result.count // Number of sessions deleted
  };
}

/**
 * Get Platform Audit Logs
 * 
 * @param {Object} options - Query options
 * @returns {Promise<object>} - { data, pagination }
 */
export async function getAuditLogs(options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await platformRepo.findAuditLogs(options);
  
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
}

// ============================================================================
// PLATFORM SETTINGS
// ============================================================================

/**
 * Get all platform settings
 * 
 * @param {object} options - Query options
 * @returns {Promise<object[]>} - Array of settings
 */
export async function getAllSettings(options = {}) {
  return platformRepo.findAllSettings(options);
}

/**
 * Get a single setting by key
 * 
 * @param {string} key - Setting key
 * @returns {Promise<object>} - Setting object
 * @throws {NotFoundError} - If setting not found
 */
export async function getSetting(key) {
  const setting = await platformRepo.findSettingByKey(key);
  if (!setting) {
    throw new NotFoundError(`Setting '${key}' not found`);
  }
  return setting;
}

/**
 * Update a single setting
 * 
 * @param {string} key - Setting key
 * @param {string} value - Setting value
 * @param {object} options - Additional options
 * @returns {Promise<object>} - Updated setting
 */
export async function updateSetting(key, value, options = {}) {
  return platformRepo.upsertSetting(key, value, options);
}

/**
 * Update multiple settings at once
 * 
 * @param {Array} settings - Array of { key, value, category?, description? }
 * @param {string} adminId - Admin ID making the update
 * @returns {Promise<object>} - { success: true, count: number }
 */
export async function updateBulkSettings(settings, adminId = null) {
  const count = await platformRepo.bulkUpsertSettings(settings, adminId);
  return { success: true, count };
}

/**
 * Delete a setting
 * 
 * @param {string} key - Setting key
 * @returns {Promise<object>} - { success: true }
 */
export async function deleteSetting(key) {
  // Check if setting exists
  const setting = await platformRepo.findSettingByKey(key);
  if (!setting) {
    throw new NotFoundError(`Setting '${key}' not found`);
  }
  
  await platformRepo.deleteSetting(key);
  return { success: true };
}

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

export default {
  // Password utilities
  hashPassword,
  comparePassword,
  // Token utilities
  generateToken,
  getSessionExpiry,
  // Auth services
  login,
  logout,
  validateSession,
  getProfile,
  logoutAllDevices,
  getAuditLogs,
  // Settings
  getAllSettings,
  getSetting,
  updateSetting,
  updateBulkSettings,
  deleteSetting,
};