// src/modules/communication/communication.validator.js

import Joi from 'joi';

const ANNOUNCEMENT_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const NOTIFICATION_TYPES = ['SHIFT_ASSIGNED', 'SHIFT_CANCELLED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'DOCUMENT_EXPIRING', 'INCIDENT_REPORTED', 'PAYMENT_RECEIVED', 'ANNOUNCEMENT', 'SYSTEM', 'GENERAL'];

const idParam = Joi.object({ id: Joi.string().required() });

// Messages
export const listMessagesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    folder: Joi.string().valid('inbox', 'sent').default('inbox'),
    isRead: Joi.boolean().optional(),
    search: Joi.string().trim().max(100).optional(),
    sortBy: Joi.string().valid('createdAt', 'subject').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getMessageSchema = { params: idParam };

export const sendMessageSchema = {
  body: Joi.object({
    recipientId: Joi.string().required(),
    subject: Joi.string().trim().min(1).max(200).required(),
    body: Joi.string().trim().min(1).max(10000).required(),
    parentMessageId: Joi.string().optional().allow(null),
  }),
};

export const deleteMessageSchema = { params: idParam };

// Announcements
export const listAnnouncementsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    isActive: Joi.boolean().optional(),
    priority: Joi.string().valid(...ANNOUNCEMENT_PRIORITIES).optional(),
    search: Joi.string().trim().max(100).optional(),
    sortBy: Joi.string().valid('createdAt', 'priority', 'title').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getAnnouncementSchema = { params: idParam };

export const createAnnouncementSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(3).max(200).required(),
    content: Joi.string().trim().min(10).max(10000).required(),
    priority: Joi.string().valid(...ANNOUNCEMENT_PRIORITIES).default('NORMAL'),
    targetRoles: Joi.array().items(Joi.string()).optional(),
    publishAt: Joi.date().iso().optional().allow(null),
    expiresAt: Joi.date().iso().optional().allow(null),
    isActive: Joi.boolean().default(true),
  }),
};

export const updateAnnouncementSchema = {
  params: idParam,
  body: Joi.object({
    title: Joi.string().trim().min(3).max(200).optional(),
    content: Joi.string().trim().min(10).max(10000).optional(),
    priority: Joi.string().valid(...ANNOUNCEMENT_PRIORITIES).optional(),
    targetRoles: Joi.array().items(Joi.string()).optional(),
    publishAt: Joi.date().iso().optional().allow(null),
    expiresAt: Joi.date().iso().optional().allow(null),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

// Notifications
export const listNotificationsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    isRead: Joi.boolean().optional(),
    type: Joi.string().valid(...NOTIFICATION_TYPES).optional(),
  }),
};

export const markAsReadSchema = { params: idParam };

export default {
  listMessagesSchema, getMessageSchema, sendMessageSchema, deleteMessageSchema,
  listAnnouncementsSchema, getAnnouncementSchema, createAnnouncementSchema, updateAnnouncementSchema,
  listNotificationsSchema, markAsReadSchema,
};
