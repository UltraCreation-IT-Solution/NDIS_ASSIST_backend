// src/modules/scheduling/scheduling.validator.js

import Joi from 'joi';

const SHIFT_STATUSES = ['DRAFT', 'PUBLISHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'PENDING_APPROVAL', 'INVOICED'];
const RATE_TYPES = ['WEEKDAY_DAY', 'WEEKDAY_EVENING', 'WEEKDAY_NIGHT', 'SATURDAY', 'SUNDAY', 'PUBLIC_HOLIDAY', 'SLEEPOVER'];
const CLOCK_ACTIONS = ['CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END'];
const CLIENT_MOODS = ['VERY_HAPPY', 'HAPPY', 'NEUTRAL', 'UNHAPPY', 'VERY_UNHAPPY', 'ANXIOUS', 'AGITATED', 'NOT_ASSESSED'];
const SWAP_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const RECURRENCE_TYPES = ['DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY'];
const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

// Shifts
export const listShiftsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional(),
    status: Joi.string().valid(...SHIFT_STATUSES).optional(),
    staffId: Joi.string().optional(),
    clientId: Joi.string().optional(),
    serviceTypeId: Joi.string().optional(),
    rateType: Joi.string().valid(...RATE_TYPES).optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional(),
    sortBy: Joi.string().valid('scheduledStart', 'scheduledEnd', 'createdAt', 'status').default('scheduledStart'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

export const getShiftSchema = {
  params: Joi.object({ shiftId: Joi.string().required() }),
};

export const createShiftSchema = {
  body: Joi.object({
    clientId: Joi.string().required(),
    staffId: Joi.string().optional().allow(null),
    serviceTypeId: Joi.string().required(),
    scheduledStart: Joi.date().iso().required(),
    scheduledEnd: Joi.date().iso().required(),
    breakMinutes: Joi.number().integer().min(0).max(480).default(0),
    travelKm: Joi.number().precision(2).min(0).optional().allow(null),
    notes: Joi.string().trim().max(2000).optional().allow('', null),
    status: Joi.string().valid('DRAFT', 'PUBLISHED').default('DRAFT'),
    isGroupShift: Joi.boolean().default(false),
  }),
};

export const updateShiftSchema = {
  params: Joi.object({ shiftId: Joi.string().required() }),
  body: Joi.object({
    clientId: Joi.string().optional(),
    staffId: Joi.string().optional().allow(null),
    serviceTypeId: Joi.string().optional(),
    scheduledStart: Joi.date().iso().optional(),
    scheduledEnd: Joi.date().iso().optional(),
    actualStart: Joi.date().iso().optional().allow(null),
    actualEnd: Joi.date().iso().optional().allow(null),
    breakMinutes: Joi.number().integer().min(0).max(480).optional(),
    travelKm: Joi.number().precision(2).min(0).optional().allow(null),
    notes: Joi.string().trim().max(2000).optional().allow('', null),
    status: Joi.string().valid(...SHIFT_STATUSES).optional(),
  }).min(1),
};

export const cancelShiftSchema = {
  params: Joi.object({ shiftId: Joi.string().required() }),
  body: Joi.object({
    reason: Joi.string().trim().max(500).optional().allow('', null),
  }),
};

// Progress Notes
export const listProgressNotesSchema = {
  params: Joi.object({ shiftId: Joi.string().required() }),
};

export const createProgressNoteSchema = {
  params: Joi.object({ shiftId: Joi.string().required() }),
  body: Joi.object({
    activitiesPerformed: Joi.string().trim().min(1).max(5000).required(),
    clientMood: Joi.string().valid(...CLIENT_MOODS).optional().allow(null),
    clientResponse: Joi.string().trim().max(2000).optional().allow('', null),
    goalsAddressed: Joi.string().trim().max(2000).optional().allow('', null),
    followUpRequired: Joi.boolean().default(false),
    followUpDetails: Joi.string().trim().max(2000).optional().allow('', null),
    attachments: Joi.object().optional().allow(null),
  }),
};

export const updateProgressNoteSchema = {
  params: Joi.object({
    shiftId: Joi.string().required(),
    noteId: Joi.string().required(),
  }),
  body: Joi.object({
    activitiesPerformed: Joi.string().trim().min(1).max(5000).optional(),
    clientMood: Joi.string().valid(...CLIENT_MOODS).optional().allow(null),
    clientResponse: Joi.string().trim().max(2000).optional().allow('', null),
    goalsAddressed: Joi.string().trim().max(2000).optional().allow('', null),
    followUpRequired: Joi.boolean().optional(),
    followUpDetails: Joi.string().trim().max(2000).optional().allow('', null),
    attachments: Joi.object().optional().allow(null),
  }).min(1),
};

// Clock Events
export const listClockEventsSchema = {
  params: Joi.object({ shiftId: Joi.string().required() }),
};

export const createClockEventSchema = {
  params: Joi.object({ shiftId: Joi.string().required() }),
  body: Joi.object({
    action: Joi.string().valid(...CLOCK_ACTIONS).required(),
    staffId: Joi.string().optional(),
    timestamp: Joi.date().iso().optional(),
    latitude: Joi.number().precision(7).min(-90).max(90).optional().allow(null),
    longitude: Joi.number().precision(7).min(-180).max(180).optional().allow(null),
    accuracy: Joi.number().precision(2).min(0).optional().allow(null),
    address: Joi.string().trim().max(500).optional().allow('', null),
    isWithinGeofence: Joi.boolean().optional().allow(null),
    photoUrl: Joi.string().trim().uri().optional().allow('', null),
    deviceInfo: Joi.string().trim().max(255).optional().allow('', null),
  }),
};

// Shift Swaps
export const listSwapsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid(...SWAP_STATUSES).optional(),
  }),
};

export const createSwapSchema = {
  body: Joi.object({
    shiftId: Joi.string().required(),
    originalStaffId: Joi.string().required(),
    newStaffId: Joi.string().required(),
    reason: Joi.string().trim().max(500).optional().allow('', null),
  }),
};

export const reviewSwapSchema = {
  params: Joi.object({ swapId: Joi.string().required() }),
  body: Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED').required(),
  }),
};

// Recurring Patterns
export const listRecurringSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    isActive: Joi.boolean().optional(),
    clientId: Joi.string().optional(),
    staffId: Joi.string().optional(),
  }),
};

export const createRecurringSchema = {
  body: Joi.object({
    clientId: Joi.string().required(),
    staffId: Joi.string().optional().allow(null),
    recurrenceType: Joi.string().valid(...RECURRENCE_TYPES).required(),
    daysOfWeek: Joi.array().items(Joi.string().valid(...DAYS_OF_WEEK)).min(1).required(),
    startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    effectiveFrom: Joi.date().iso().required(),
    effectiveTo: Joi.date().iso().optional().allow(null),
  }),
};

export const updateRecurringSchema = {
  params: Joi.object({ id: Joi.string().required() }),
  body: Joi.object({
    staffId: Joi.string().optional().allow(null),
    recurrenceType: Joi.string().valid(...RECURRENCE_TYPES).optional(),
    daysOfWeek: Joi.array().items(Joi.string().valid(...DAYS_OF_WEEK)).min(1).optional(),
    startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    effectiveFrom: Joi.date().iso().optional(),
    effectiveTo: Joi.date().iso().optional().allow(null),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

// Service Types
export const listServiceTypesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    search: Joi.string().trim().max(100).optional(),
    isActive: Joi.boolean().optional(),
  }),
};

export const createServiceTypeSchema = {
  body: Joi.object({
    serviceCode: Joi.string().trim().min(1).max(50).required(),
    serviceName: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().max(1000).optional().allow('', null),
    supportItemNo: Joi.string().trim().max(50).optional().allow('', null),
    fundingSource: Joi.string().trim().max(100).optional().allow('', null),
    defaultRate: Joi.number().precision(2).min(0).required(),
  }),
};

export const updateServiceTypeSchema = {
  params: Joi.object({ id: Joi.string().required() }),
  body: Joi.object({
    serviceCode: Joi.string().trim().min(1).max(50).optional(),
    serviceName: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().trim().max(1000).optional().allow('', null),
    supportItemNo: Joi.string().trim().max(50).optional().allow('', null),
    fundingSource: Joi.string().trim().max(100).optional().allow('', null),
    defaultRate: Joi.number().precision(2).min(0).optional(),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

export default {
  listShiftsSchema, getShiftSchema, createShiftSchema, updateShiftSchema, cancelShiftSchema,
  listProgressNotesSchema, createProgressNoteSchema, updateProgressNoteSchema,
  listClockEventsSchema, createClockEventSchema,
  listSwapsSchema, createSwapSchema, reviewSwapSchema,
  listRecurringSchema, createRecurringSchema, updateRecurringSchema,
  listServiceTypesSchema, createServiceTypeSchema, updateServiceTypeSchema,
};
