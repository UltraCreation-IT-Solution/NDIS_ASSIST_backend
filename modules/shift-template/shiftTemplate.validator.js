/**
 * Shift Template Validator
 * ========================
 * Joi schemas for shift template validation
 */

import Joi from 'joi';

// Time format regex (HH:MM)
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * List templates schema
 */
export const listSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional(),
    serviceTypeId: Joi.string().trim().optional(),
    isDefault: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string().valid('name', 'createdAt', 'usageCount', 'durationMinutes').default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

/**
 * Get by ID schema
 */
export const getByIdSchema = {
  params: Joi.object({
    id: Joi.string().trim().required(),
  }),
};

/**
 * Create template schema
 */
export const createSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required()
      .messages({
        'string.min': 'Template name must be at least 2 characters',
        'string.max': 'Template name must be at most 100 characters',
        'any.required': 'Template name is required',
      }),
    description: Joi.string().trim().max(500).optional().allow(''),
    serviceTypeId: Joi.string().trim().optional().allow(null),
    startTime: Joi.string().pattern(timeRegex).required()
      .messages({
        'string.pattern.base': 'Start time must be in HH:MM format',
        'any.required': 'Start time is required',
      }),
    endTime: Joi.string().pattern(timeRegex).required()
      .messages({
        'string.pattern.base': 'End time must be in HH:MM format',
        'any.required': 'End time is required',
      }),
    tasks: Joi.array().items(Joi.string().trim().max(200)).max(20).optional()
      .messages({
        'array.max': 'Maximum 20 tasks allowed',
      }),
    isDefault: Joi.boolean().optional().default(false),
  }),
};

/**
 * Update template schema
 */
export const updateSchema = {
  params: Joi.object({
    id: Joi.string().trim().required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).optional().allow('', null),
    serviceTypeId: Joi.string().trim().optional().allow(null),
    startTime: Joi.string().pattern(timeRegex).optional(),
    endTime: Joi.string().pattern(timeRegex).optional(),
    tasks: Joi.array().items(Joi.string().trim().max(200)).max(20).optional(),
    isDefault: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
};

/**
 * Delete template schema
 */
export const deleteSchema = {
  params: Joi.object({
    id: Joi.string().trim().required(),
  }),
  query: Joi.object({
    hard: Joi.string().valid('true', 'false').optional(),
  }),
};

/**
 * Toggle default schema
 */
export const toggleDefaultSchema = {
  params: Joi.object({
    id: Joi.string().trim().required(),
  }),
};

/**
 * Record usage schema
 */
export const useSchema = {
  params: Joi.object({
    id: Joi.string().trim().required(),
  }),
};

export default {
  listSchema,
  getByIdSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  toggleDefaultSchema,
  useSchema,
};
