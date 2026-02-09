// src/modules/team/team.validator.js

import Joi from 'joi';
import { PAGINATION } from '../../config/constants.js';

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const teamIdParam = Joi.object({
  teamId: Joi.string().uuid().required()
});

const teamMemberParams = Joi.object({
  teamId: Joi.string().uuid().required(),
  staffId: Joi.string().uuid().required()
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
    search: Joi.string().trim().max(100).optional(),
    sortBy: Joi.string().valid('createdAt', 'name').default('createdAt')
  })
};

export const getTeamSchema = {
  params: teamIdParam
};

export const createTeamSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().max(500).optional().allow(''),
    leaderId: Joi.string().uuid().optional() // Staff ID of team leader
  })
};

export const updateTeamSchema = {
  params: teamIdParam,
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).optional(),
    description: Joi.string().trim().max(500).optional().allow(''),
    leaderId: Joi.string().uuid().optional().allow(null)
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
    search: Joi.string().trim().max(100).optional()
  })
};

export const addMemberSchema = {
  params: teamIdParam,
  body: Joi.object({
    staffId: Joi.string().uuid().required()
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