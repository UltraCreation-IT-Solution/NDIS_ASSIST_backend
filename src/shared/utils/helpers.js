/**
 * Helper Utilities
 * =================
 * 
 * WHAT: Common utility functions used across the app
 * WHY:  Don't repeat code, maintain in one place
 */

import crypto from 'crypto';

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Generate secure random token
 * 
 * WHAT: Creates unpredictable random string
 * WHY:  Used for session tokens, reset tokens, etc.
 * 
 * @param {number} bytes - Number of random bytes (default: 32)
 * @returns {string} - Hex string (64 characters for 32 bytes)
 */
export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate short random ID
 * 
 * WHAT: Creates short random ID for display purposes
 * WHY:  User-friendly identifiers (e.g., INV-A3F8C2)
 * 
 * @param {number} length - Length of ID (default: 6)
 * @returns {string} - Uppercase alphanumeric string
 */
export function generateShortId(length = 6) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}

/**
 * Slugify string
 * 
 * WHAT: Convert string to URL-friendly slug
 * WHY:  For URLs, usernames, organization slugs
 * 
 * @param {string} text - Text to slugify
 * @returns {string} - URL-friendly slug
 * 
 * Example: "Hello World!" → "hello-world"
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
}

/**
 * Capitalize first letter
 * 
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 * 
 * Example: "hello" → "Hello"
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 * 
 * @param {string} text - Text to title case
 * @returns {string} - Title cased text
 * 
 * Example: "hello world" → "Hello World"
 */
export function titleCase(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Add days to date
 * 
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} - New date
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add hours to date
 * 
 * @param {Date} date - Starting date
 * @param {number} hours - Number of hours to add
 * @returns {Date} - New date
 */
export function addHours(date, hours) {
  const result = new Date(date);
  result.setTime(result.getTime() + hours * 60 * 60 * 1000);
  return result;
}

/**
 * Add minutes to date
 * 
 * @param {Date} date - Starting date
 * @param {number} minutes - Number of minutes to add
 * @returns {Date} - New date
 */
export function addMinutes(date, minutes) {
  const result = new Date(date);
  result.setTime(result.getTime() + minutes * 60 * 1000);
  return result;
}

/**
 * Check if date is expired
 * 
 * @param {Date} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
export function isExpired(date) {
  return new Date() > new Date(date);
}

// ============================================================================
// REQUEST UTILITIES
// ============================================================================

/**
 * Get client IP from request
 * 
 * WHAT: Extract real client IP address
 * WHY:  For logging, rate limiting, security
 * 
 * Handles:
 * - Direct connections
 * - Reverse proxies (nginx, cloudflare)
 * - Load balancers
 * 
 * @param {object} req - Express request
 * @returns {string} - Client IP address
 */
export function getClientIp(req) {
  // x-forwarded-for can have multiple IPs: "client, proxy1, proxy2"
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Try other common headers
  return (
    req.headers['x-real-ip'] ||
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Get user agent from request
 * 
 * @param {object} req - Express request
 * @returns {string} - User agent string
 */
export function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Pick specific fields from object
 * 
 * WHAT: Create new object with only specified fields
 * WHY:  Select only fields to return in API response
 * 
 * @param {object} obj - Source object
 * @param {string[]} fields - Fields to pick
 * @returns {object} - New object with only picked fields
 * 
 * Example: pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) → { a: 1, c: 3 }
 */
export function pick(obj, fields) {
  return fields.reduce((result, field) => {
    if (obj.hasOwnProperty(field)) {
      result[field] = obj[field];
    }
    return result;
  }, {});
}

/**
 * Omit specific fields from object
 * 
 * WHAT: Create new object without specified fields
 * WHY:  Remove sensitive fields like passwordHash
 * 
 * @param {object} obj - Source object
 * @param {string[]} fields - Fields to omit
 * @returns {object} - New object without omitted fields
 * 
 * Example: omit({ a: 1, b: 2, c: 3 }, ['b']) → { a: 1, c: 3 }
 */
export function omit(obj, fields) {
  const result = { ...obj };
  fields.forEach(field => delete result[field]);
  return result;
}

/**
 * Check if value is empty
 * 
 * @param {any} value - Value to check
 * @returns {boolean} - True if empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  generateToken,
  generateShortId,
  slugify,
  capitalize,
  titleCase,
  addDays,
  addHours,
  addMinutes,
  isExpired,
  getClientIp,
  getUserAgent,
  pick,
  omit,
  isEmpty,
};