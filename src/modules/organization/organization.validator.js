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
    slug: Joi.string().trim().lowercase().min(3).max(50).pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).allow('', null).optional(),
    email: Joi.string().email().required().lowercase().trim(),
    abn: Joi.string().pattern(/^\d{11}$/).allow('', null).optional(),
    ndisRegistrationNo: Joi.string().allow('', null).optional(),
    phone: Joi.string().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).allow('', null).optional(),
    website: Joi.string().uri().allow('', null).optional(),
    logoUrl: Joi.string().uri().allow('', null).optional(),
    addressLine1: Joi.string().max(200).allow('', null).optional(),
    addressLine2: Joi.string().max(200).allow('', null).optional(),
    suburb: Joi.string().max(100).allow('', null).optional(),
    state: Joi.string().valid(...australianStates).allow('', null).optional(),
    postcode: Joi.string().pattern(/^\d{4}$/).allow('', null).optional(),
    country: Joi.string().default('AU'),
    timezone: Joi.string().valid(...australianTimezones).default('Australia/Sydney'),
  }).required(),
};

export const updateOrganizationSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    slug: Joi.string().trim().lowercase().min(3).max(50).pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).allow('', null).optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    abn: Joi.string().pattern(/^\d{11}$/).allow('', null).optional(),
    ndisRegistrationNo: Joi.string().allow('', null).optional(),
    phone: Joi.string().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).allow('', null).optional(),
    website: Joi.string().uri().allow('', null).optional(),
    logoUrl: Joi.string().uri().allow('', null).optional(),
    addressLine1: Joi.string().max(200).allow('', null).optional(),
    addressLine2: Joi.string().max(200).allow('', null).optional(),
    suburb: Joi.string().max(100).allow('', null).optional(),
    state: Joi.string().valid(...australianStates).allow('', null).optional(),
    postcode: Joi.string().pattern(/^\d{4}$/).allow('', null).optional(),
    country: Joi.string().allow('', null).optional(),
    timezone: Joi.string().valid(...australianTimezones).allow('', null).optional(),
  }).min(1),
};

export const suspendOrganizationSchema = {
  params: Joi.object({ id: Joi.string().required() }),
  body: Joi.object({ reason: Joi.string().trim().max(500).allow('', null).optional() }),
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