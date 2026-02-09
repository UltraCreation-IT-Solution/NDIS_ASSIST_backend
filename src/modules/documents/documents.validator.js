// src/modules/documents/documents.validator.js

import Joi from 'joi';

const DOCUMENT_STATUSES = ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'PENDING_REVIEW', 'ARCHIVED'];

const idParam = Joi.object({ id: Joi.string().required() });

// Categories
export const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(500).optional().allow('', null),
    color: Joi.string().trim().max(20).optional().allow('', null),
  }),
};

export const updateCategorySchema = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).optional().allow('', null),
    color: Joi.string().trim().max(20).optional().allow('', null),
  }).min(1),
};

export const deleteCategorySchema = { params: idParam };

// Documents
export const listDocumentsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional(),
    categoryId: Joi.string().optional(),
    status: Joi.string().valid(...DOCUMENT_STATUSES).optional(),
    uploadedById: Joi.string().optional(),
    sortBy: Joi.string().valid('createdAt', 'title', 'expiryDate').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getDocumentSchema = { params: idParam };

export const createDocumentSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().max(1000).optional().allow('', null),
    categoryId: Joi.string().optional().allow(null),
    fileName: Joi.string().trim().max(255).required(),
    fileUrl: Joi.string().trim().uri().optional().allow('', null),
    fileType: Joi.string().trim().max(50).optional().allow('', null),
    fileSize: Joi.number().integer().min(0).optional().allow(null),
    expiryDate: Joi.date().iso().optional().allow(null),
    requiresSignature: Joi.boolean().default(false),
    visibleToRoles: Joi.array().items(Joi.string()).optional(),
  }),
};

export const updateDocumentSchema = {
  params: idParam,
  body: Joi.object({
    title: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().trim().max(1000).optional().allow('', null),
    categoryId: Joi.string().optional().allow(null),
    fileUrl: Joi.string().trim().uri().optional().allow('', null),
    expiryDate: Joi.date().iso().optional().allow(null),
    requiresSignature: Joi.boolean().optional(),
    visibleToRoles: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid(...DOCUMENT_STATUSES).optional(),
  }).min(1),
};

export const archiveDocumentSchema = { params: idParam };

// Signatures
export const signDocumentSchema = {
  params: idParam,
  body: Joi.object({
    signatureUrl: Joi.string().trim().uri().optional().allow('', null),
    ipAddress: Joi.string().trim().max(50).optional().allow('', null),
  }),
};

export default {
  createCategorySchema, updateCategorySchema, deleteCategorySchema,
  listDocumentsSchema, getDocumentSchema, createDocumentSchema, updateDocumentSchema, archiveDocumentSchema,
  signDocumentSchema,
};
