/**
 * Organization Validators
 * ========================
 */

import Joi from 'joi';

const australianStates = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
const australianTimezones = [
  'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane',
  'Australia/Perth', 'Australia/Adelaide', 'Australia/Hobart',
  'Australia/Darwin', 'Australia/Canberra',
];

export const listOrganizationsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional(),
    status: Joi.string().valid('ACTIVE', 'SUSPENDED', 'DEACTIVATED').optional(),
    subscriptionPlan: Joi.string().valid('FREE_TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM').optional(),
    sortBy: Joi.string().valid('createdAt', 'name', 'email', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getOrganizationSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const createOrganizationSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(200).required(),
    slug: Joi.string().trim().lowercase().min(3).max(50).pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    email: Joi.string().email().required().lowercase().trim(),
    abn: Joi.string().trim().pattern(/^\d{11}$/).optional().allow(''),
    ndisRegistrationNo: Joi.string().trim().optional().allow(''),
    phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow(''),
    website: Joi.string().trim().uri().optional().allow(''),
    logoUrl: Joi.string().trim().uri().optional().allow(''),
    addressLine1: Joi.string().trim().max(200).optional().allow(''),
    addressLine2: Joi.string().trim().max(200).optional().allow(''),
    suburb: Joi.string().trim().max(100).optional().allow(''),
    state: Joi.string().trim().valid(...australianStates).optional().allow(''),
    postcode: Joi.string().trim().pattern(/^\d{4}$/).optional().allow(''),
    country: Joi.string().trim().default('AU'),
    timezone: Joi.string().trim().valid(...australianTimezones).default('Australia/Sydney'),
  }),
};

export const updateOrganizationSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    slug: Joi.string().trim().lowercase().min(3).max(50).pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    abn: Joi.string().trim().pattern(/^\d{11}$/).optional().allow('', null),
    ndisRegistrationNo: Joi.string().trim().optional().allow('', null),
    phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow('', null),
    website: Joi.string().trim().uri().optional().allow('', null),
    logoUrl: Joi.string().trim().uri().optional().allow('', null),
    addressLine1: Joi.string().trim().max(200).optional().allow('', null),
    addressLine2: Joi.string().trim().max(200).optional().allow('', null),
    suburb: Joi.string().trim().max(100).optional().allow('', null),
    state: Joi.string().trim().valid(...australianStates).optional().allow('', null),
    postcode: Joi.string().trim().pattern(/^\d{4}$/).optional().allow('', null),
    country: Joi.string().trim().optional(),
    timezone: Joi.string().trim().valid(...australianTimezones).optional(),
  }).min(1),
};

export const suspendOrganizationSchema = {
  params: Joi.object({ id: Joi.string().required() }),
  body: Joi.object({ reason: Joi.string().trim().max(500).optional() }),
};

export const activateOrganizationSchema = {
  params: Joi.object({ id: Joi.string().required() }),
};

export const deleteOrganizationSchema = {
  params: Joi.object({ id: Joi.string().required() }),
};

export default {
  listOrganizationsSchema,
  getOrganizationSchema,
  createOrganizationSchema,
  updateOrganizationSchema,
  suspendOrganizationSchema,
  activateOrganizationSchema,
  deleteOrganizationSchema,
};