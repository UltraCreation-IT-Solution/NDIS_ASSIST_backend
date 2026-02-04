/**
 * Platform Validators
 * ====================
 * 
 * WHAT: Joi validation schemas for platform endpoints
 * WHY:  Validate input before it reaches controller
 * 
 * USAGE in routes:
 *   import { validate } from '../../middleware/validate.middleware.js';
 *   import { loginSchema } from './platform.validator.js';
 *   
 *   router.post('/auth/login', validate(loginSchema), controller);
 */

import Joi from 'joi';

// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const passwordMessages = {
  'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character (@$!%*?&)',
};

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

/**
 * Login Schema
 * POST /api/v1/platform/auth/login
 * 
 * Body: { email, password }
 */
export const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()  // Convert to lowercase
      .trim()       // Remove whitespace
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
      }),
  }),
};

/**
 * Change Password Schema
 * POST /api/v1/platform/auth/change-password
 * 
 * Body: { currentPassword, newPassword }
 */
export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'Current password is required',
        'any.required': 'Current password is required',
      }),
    
    newPassword: Joi.string()
      .required()
      .pattern(passwordPattern)
      .messages({
        ...passwordMessages,
        'string.empty': 'New password is required',
        'any.required': 'New password is required',
      }),
    
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('newPassword'))
      .messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Confirm password is required',
        'any.required': 'Confirm password is required',
      }),
  }),
};

// ============================================================================
// ADMIN MANAGEMENT SCHEMAS (For future use)
// ============================================================================

/**
 * Create Admin Schema
 * POST /api/v1/platform/admins
 */
export const createAdminSchema = {
  body: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    
    password: Joi.string()
      .required()
      .pattern(passwordPattern)
      .messages({
        ...passwordMessages,
        'any.required': 'Password is required',
      }),
    
    firstName: Joi.string()
      .required()
      .trim()
      .min(1)
      .max(100)
      .messages({
        'string.min': 'First name is required',
        'string.max': 'First name cannot exceed 100 characters',
        'any.required': 'First name is required',
      }),
    
    lastName: Joi.string()
      .required()
      .trim()
      .min(1)
      .max(100)
      .messages({
        'string.min': 'Last name is required',
        'string.max': 'Last name cannot exceed 100 characters',
        'any.required': 'Last name is required',
      }),
    
    phone: Joi.string()
      .optional()
      .allow('')
      .pattern(/^(\+?61|0)4\d{8}$/)
      .messages({
        'string.pattern.base': 'Please provide a valid Australian mobile number',
      }),
    
    role: Joi.string()
      .valid('SUPER_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_VIEWER')
      .default('PLATFORM_VIEWER')
      .messages({
        'any.only': 'Role must be SUPER_ADMIN, PLATFORM_SUPPORT, or PLATFORM_VIEWER',
      }),
  }),
};

/**
 * Update Admin Schema
 * PATCH /api/v1/platform/admins/:id
 */
export const updateAdminSchema = {
  params: Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Invalid admin ID format',
        'any.required': 'Admin ID is required',
      }),
  }),
  
  body: Joi.object({
    firstName: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional(),
    
    lastName: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional(),
    
    phone: Joi.string()
      .allow('')
      .pattern(/^(\+?61|0)4\d{8}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid Australian mobile number',
      }),
    
    role: Joi.string()
      .valid('SUPER_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_VIEWER')
      .optional(),
    
    isActive: Joi.boolean()
      .optional(),
  }).min(1).messages({
    'object.min': 'At least one field is required to update',
  }),
};

/**
 * Get Admin by ID Schema
 * GET /api/v1/platform/admins/:id
 */
export const getAdminSchema = {
  params: Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Invalid admin ID format',
        'any.required': 'Admin ID is required',
      }),
  }),
};

// ============================================================================
// PAGINATION SCHEMA (Reusable)
// ============================================================================

/**
 * List with Pagination Schema
 * GET /api/v1/platform/admins?page=1&limit=20
 */
export const paginationSchema = {
  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.min': 'Page must be at least 1',
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
      }),
    
    search: Joi.string()
      .trim()
      .max(100)
      .optional(),
    
    sortBy: Joi.string()
      .valid('createdAt', 'email', 'firstName', 'lastName')
      .default('createdAt'),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc'),
  }),
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  loginSchema,
  changePasswordSchema,
  createAdminSchema,
  updateAdminSchema,
  getAdminSchema,
  paginationSchema,
};