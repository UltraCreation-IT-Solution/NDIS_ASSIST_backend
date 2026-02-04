/**
 * Auth Validators
 * ================
 * 
 * Joi validation schemas for Auth endpoints
 */

import Joi from 'joi';

// Strong password pattern
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const passwordMessages = {
  'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character (@$!%*?&)',
};

// ============================================================================
// SCHEMAS
// ============================================================================

export const registerSchema = {
  body: Joi.object({
    organizationName: Joi.string().trim().min(2).max(200).required()
      .messages({
        'string.min': 'Organization name must be at least 2 characters',
        'any.required': 'Organization name is required',
      }),
    email: Joi.string().email().required().lowercase().trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string().required().pattern(passwordPattern)
      .messages({
        ...passwordMessages,
        'any.required': 'Password is required',
      }),
    firstName: Joi.string().trim().min(1).max(100).required()
      .messages({ 'any.required': 'First name is required' }),
    lastName: Joi.string().trim().min(1).max(100).required()
      .messages({ 'any.required': 'Last name is required' }),
    phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow('')
      .messages({ 'string.pattern.base': 'Please provide a valid Australian phone number' }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().lowercase().trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string().required()
      .messages({ 'any.required': 'Password is required' }),
  }),
};

export const refreshSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required()
      .messages({ 'any.required': 'Refresh token is required' }),
  }),
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required().lowercase().trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().required()
      .messages({ 'any.required': 'Reset token is required' }),
    newPassword: Joi.string().required().pattern(passwordPattern)
      .messages({
        ...passwordMessages,
        'any.required': 'New password is required',
      }),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required()
      .messages({ 'any.required': 'Current password is required' }),
    newPassword: Joi.string().required().pattern(passwordPattern)
      .messages({
        ...passwordMessages,
        'any.required': 'New password is required',
      }),
  }),
};

export const updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(100).optional(),
    lastName: Joi.string().trim().min(1).max(100).optional(),
    phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow('', null),
    avatarUrl: Joi.string().trim().uri().optional().allow('', null),
  }).min(1).messages({
    'object.min': 'At least one field is required to update',
  }),
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
};