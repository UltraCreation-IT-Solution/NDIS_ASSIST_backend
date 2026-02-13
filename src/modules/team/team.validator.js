// src/modules/team/team.validator.js

import Joi from 'joi';
import { PAGINATION } from '../../config/constants.js';

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

// CUID format: starts with 'c', 25 characters, lowercase alphanumeric
const cuidPattern = /^c[a-z0-9]{24}$/;

const teamIdParam = Joi.object({
  teamId: Joi.string().pattern(cuidPattern).required().messages({
    'string.pattern.base': 'Invalid team ID format'
  })
});

const teamMemberParams = Joi.object({
  teamId: Joi.string().pattern(cuidPattern).required().messages({
    'string.pattern.base': 'Invalid team ID format'
  }),
  staffId: Joi.string().pattern(cuidPattern).required().messages({
    'string.pattern.base': 'Invalid staff ID format'
  })
});

const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// ============================================================================
// TEAM SCHEMAS
// ============================================================================

export const listTeamsSchema = {
  query: paginationQuery.keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).allow('', null).optional(),
    sortBy: Joi.string().valid('createdAt', 'name').default('createdAt')
  })
};

export const getTeamSchema = {
  params: teamIdParam
};

export const createTeamSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().max(500).allow('', null).optional(),
    leaderId: Joi.string().pattern(cuidPattern).allow('', null).optional().messages({
      'string.pattern.base': 'Invalid leader ID format'
    })
  })
};

export const updateTeamSchema = {
  params: teamIdParam,
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).optional(),
    description: Joi.string().trim().max(500).allow('', null).optional(),
    leaderId: Joi.string().pattern(cuidPattern).allow('', null).optional().messages({
      'string.pattern.base': 'Invalid leader ID format'
    })
  }).min(1)
};

export const deleteTeamSchema = {
  params: teamIdParam
};

// ============================================================================
// TEAM MEMBER SCHEMAS
// ============================================================================

export const listMembersSchema = {
  params: teamIdParam,
  query: paginationQuery.keys({
    search: Joi.string().trim().max(100).allow('', null).optional()
  })
};

export const addMemberSchema = {
  params: teamIdParam,
  body: Joi.object({
    staffId: Joi.string().pattern(cuidPattern).required().messages({
      'string.pattern.base': 'Invalid staff ID format'
    })
  })
};

export const removeMemberSchema = {
  params: teamMemberParams
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  listTeamsSchema,
  getTeamSchema,
  createTeamSchema,
  updateTeamSchema,
  deleteTeamSchema,
  listMembersSchema,
  addMemberSchema,
  removeMemberSchema
};