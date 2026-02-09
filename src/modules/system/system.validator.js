// src/modules/system/system.validator.js

import Joi from 'joi';

const AUDIT_ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT'];
const ENTITY_TYPES = ['USER', 'STAFF', 'CLIENT', 'SHIFT', 'INVOICE', 'PAYMENT', 'INCIDENT', 'DOCUMENT', 'TEAM', 'FORM', 'SETTING'];
const ACTIVITY_TYPES = ['LOGIN', 'LOGOUT', 'PAGE_VIEW', 'ACTION', 'API_CALL'];

// Settings
export const getSettingSchema = {
  params: Joi.object({ key: Joi.string().trim().min(1).max(100).required() }),
};

export const updateSettingSchema = {
  body: Joi.object({
    key: Joi.string().trim().min(1).max(100).required(),
    value: Joi.string().trim().max(5000).required(),
  }),
};

export const updateBulkSettingsSchema = {
  body: Joi.object({
    settings: Joi.object().pattern(
      Joi.string().max(100),
      Joi.alternatives().try(Joi.string().max(5000), Joi.number(), Joi.boolean())
    ).required(),
  }),
};

export const resetSettingSchema = {
  params: Joi.object({ key: Joi.string().trim().min(1).max(100).required() }),
};

// Audit Logs
export const listAuditLogsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    action: Joi.string().valid(...AUDIT_ACTIONS).optional(),
    entityType: Joi.string().valid(...ENTITY_TYPES).optional(),
    entityId: Joi.string().optional(),
    userId: Joi.string().optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

// Activity Logs
export const listActivityLogsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    userId: Joi.string().optional(),
    activityType: Joi.string().valid(...ACTIVITY_TYPES).optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional(),
  }),
};

export default {
  getSettingSchema, updateSettingSchema, updateBulkSettingsSchema, resetSettingSchema,
  listAuditLogsSchema, listActivityLogsSchema,
};
