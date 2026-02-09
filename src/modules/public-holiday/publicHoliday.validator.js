// src/modules/public-holiday/publicHoliday.validator.js

import Joi from 'joi';

const AU_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

export const listSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    year: Joi.number().integer().min(2020).max(2050).optional(),
    state: Joi.string().valid(...AU_STATES).optional(),
    isNational: Joi.boolean().optional(),
    search: Joi.string().trim().max(100).optional(),
    sortBy: Joi.string().valid('holidayDate', 'holidayName', 'createdAt').default('holidayDate'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

export const getByIdSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const createSchema = {
  body: Joi.object({
    holidayName: Joi.string().trim().min(2).max(100).required(),
    holidayDate: Joi.date().iso().required(),
    state: Joi.string().valid(...AU_STATES).optional().allow(null),
    isNational: Joi.boolean().default(false),
    isRecurring: Joi.boolean().default(false),
  }),
};

export const updateSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    holidayName: Joi.string().trim().min(2).max(100).optional(),
    holidayDate: Joi.date().iso().optional(),
    state: Joi.string().valid(...AU_STATES).optional().allow(null),
    isNational: Joi.boolean().optional(),
    isRecurring: Joi.boolean().optional(),
  }).min(1),
};

export const deleteSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const seedSchema = {
  body: Joi.object({
    year: Joi.number().integer().min(2020).max(2050).required(),
  }),
};

export default {
  listSchema,
  getByIdSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  seedSchema,
};