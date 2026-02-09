// src/modules/forms/forms.validator.js

import Joi from 'joi';

const FORM_CATEGORIES = ['INTAKE', 'ASSESSMENT', 'INCIDENT', 'PROGRESS_NOTE', 'CONSENT', 'FEEDBACK', 'COMPLIANCE', 'HR', 'CUSTOM'];
const FIELD_TYPES = ['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DATETIME', 'SELECT', 'MULTI_SELECT', 'CHECKBOX', 'RADIO', 'FILE', 'SIGNATURE', 'SECTION_HEADER'];
const SUBMISSION_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'];

const idParam = Joi.object({ id: Joi.string().required() });

const fieldSchema = Joi.object({
  fieldName: Joi.string().trim().min(1).max(100).required(),
  label: Joi.string().trim().min(1).max(200).required(),
  fieldType: Joi.string().valid(...FIELD_TYPES).required(),
  isRequired: Joi.boolean().default(false),
  placeholder: Joi.string().trim().max(200).optional().allow('', null),
  helpText: Joi.string().trim().max(500).optional().allow('', null),
  defaultValue: Joi.string().trim().max(500).optional().allow('', null),
  options: Joi.array().items(Joi.string().trim().max(200)).optional(),
  validation: Joi.object().optional().allow(null),
  displayOrder: Joi.number().integer().min(0).optional(),
});

// Templates
export const listTemplatesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional(),
    category: Joi.string().valid(...FORM_CATEGORIES).optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string().valid('createdAt', 'name', 'category').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getTemplateSchema = { params: idParam };

export const createTemplateSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().max(1000).optional().allow('', null),
    category: Joi.string().valid(...FORM_CATEGORIES).required(),
    isActive: Joi.boolean().default(true),
    fields: Joi.array().items(fieldSchema).optional(),
  }),
};

export const updateTemplateSchema = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().trim().max(1000).optional().allow('', null),
    category: Joi.string().valid(...FORM_CATEGORIES).optional(),
    isActive: Joi.boolean().optional(),
    fields: Joi.array().items(fieldSchema).optional(),
  }).min(1),
};

export const archiveTemplateSchema = { params: idParam };

// Submissions
export const listSubmissionsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    templateId: Joi.string().optional(),
    status: Joi.string().valid(...SUBMISSION_STATUSES).optional(),
    clientId: Joi.string().optional(),
    staffId: Joi.string().optional(),
    sortBy: Joi.string().valid('createdAt', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getSubmissionSchema = { params: idParam };

export const createSubmissionSchema = {
  body: Joi.object({
    templateId: Joi.string().required(),
    data: Joi.object().required(),
    clientId: Joi.string().optional().allow(null),
    staffId: Joi.string().optional().allow(null),
    status: Joi.string().valid('DRAFT', 'SUBMITTED').default('SUBMITTED'),
  }),
};

export const updateSubmissionSchema = {
  params: idParam,
  body: Joi.object({
    data: Joi.object().optional(),
    status: Joi.string().valid(...SUBMISSION_STATUSES).optional(),
  }).min(1),
};

export default {
  listTemplatesSchema, getTemplateSchema, createTemplateSchema, updateTemplateSchema, archiveTemplateSchema,
  listSubmissionsSchema, getSubmissionSchema, createSubmissionSchema, updateSubmissionSchema,
};
