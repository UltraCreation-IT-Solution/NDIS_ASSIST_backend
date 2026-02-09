// src/modules/pay-group/payGroup.validator.js

import Joi from 'joi';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const listSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string().valid('createdAt', 'name', 'baseHourlyRate').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getByIdSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const createSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(500).optional().allow('', null),
    baseHourlyRate: Joi.number().precision(2).min(0).required(),
    saturdayMultiplier: Joi.number().precision(2).min(1).max(10).default(1.5),
    sundayMultiplier: Joi.number().precision(2).min(1).max(10).default(2.0),
    holidayMultiplier: Joi.number().precision(2).min(1).max(10).default(2.5),
    eveningLoadingPct: Joi.number().precision(2).min(0).max(100).default(0),
    nightLoadingPct: Joi.number().precision(2).min(0).max(100).default(0),
    earlyMorningLoadingPct: Joi.number().precision(2).min(0).max(100).default(0),
    overtimeMultiplier: Joi.number().precision(2).min(1).max(10).default(1.5),
    compoundLoadings: Joi.boolean().default(false),
    dayStartTime: Joi.string().pattern(timeRegex).default('06:00'),
    eveningStartTime: Joi.string().pattern(timeRegex).default('20:00'),
    nightStartTime: Joi.string().pattern(timeRegex).default('00:00'),
  }),
};

export const updateSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).optional().allow('', null),
    baseHourlyRate: Joi.number().precision(2).min(0).optional(),
    saturdayMultiplier: Joi.number().precision(2).min(1).max(10).optional(),
    sundayMultiplier: Joi.number().precision(2).min(1).max(10).optional(),
    holidayMultiplier: Joi.number().precision(2).min(1).max(10).optional(),
    eveningLoadingPct: Joi.number().precision(2).min(0).max(100).optional(),
    nightLoadingPct: Joi.number().precision(2).min(0).max(100).optional(),
    earlyMorningLoadingPct: Joi.number().precision(2).min(0).max(100).optional(),
    overtimeMultiplier: Joi.number().precision(2).min(1).max(10).optional(),
    compoundLoadings: Joi.boolean().optional(),
    dayStartTime: Joi.string().pattern(timeRegex).optional(),
    eveningStartTime: Joi.string().pattern(timeRegex).optional(),
    nightStartTime: Joi.string().pattern(timeRegex).optional(),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

export const deleteSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const getStaffSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export default {
  listSchema,
  getByIdSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  getStaffSchema,
};