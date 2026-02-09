/**
 * User Validators
 * ================
 * 
 * Joi validation schemas for User Management endpoints
 */

import Joi from 'joi';

// Valid roles (excluding ORG_OWNER - can't be invited/assigned)
const assignableRoles = ['ADMIN', 'MANAGER', 'SCHEDULER', 'FINANCE', 'COORDINATOR', 'SUPPORT_WORKER', 'AUDITOR'];

// Password pattern
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ============================================================================
// SCHEMAS
// ============================================================================

export const listUsersSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional(),
    role: Joi.string().valid('ORG_OWNER', ...assignableRoles).optional(),
    status: Joi.string().valid('ACTIVE', 'INVITED', 'DISABLED', 'LOCKED').optional(),
    sortBy: Joi.string().valid('createdAt', 'firstName', 'lastName', 'email', 'role', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getUserSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const inviteUserSchema = {
  body: Joi.object({
    email: Joi.string().email().required().lowercase().trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    role: Joi.string().valid(...assignableRoles).required()
      .messages({
        'any.only': `Role must be one of: ${assignableRoles.join(', ')}`,
        'any.required': 'Role is required',
      }),
    firstName: Joi.string().trim().min(1).max(100).required()
      .messages({ 'any.required': 'First name is required' }),
    lastName: Joi.string().trim().min(1).max(100).required()
      .messages({ 'any.required': 'Last name is required' }),
    phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow('')
      .messages({ 'string.pattern.base': 'Please provide a valid Australian phone number' }),
  }),
};

export const acceptInviteSchema = {
  body: Joi.object({
    token: Joi.string().required()
      .messages({ 'any.required': 'Invitation token is required' }),
    password: Joi.string().required().pattern(passwordPattern)
      .messages({
        'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character (@$!%*?&)',
        'any.required': 'Password is required',
      }),
  }),
};

export const updateUserSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(100).optional(),
    lastName: Joi.string().trim().min(1).max(100).optional(),
    phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow('', null),
    role: Joi.string().valid(...assignableRoles).optional()
      .messages({ 'any.only': `Role must be one of: ${assignableRoles.join(', ')}` }),
    customRoleId: Joi.string().optional().allow(null),
  }).min(1).messages({
    'object.min': 'At least one field is required to update',
  }),
};

export const userIdParamSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const listInvitationsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED').optional(),
  }),
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  listUsersSchema,
  getUserSchema,
  inviteUserSchema,
  acceptInviteSchema,
  updateUserSchema,
  userIdParamSchema,
  listInvitationsSchema,
};