// src/modules/incident/incident.validator.js

import Joi from 'joi';

const INCIDENT_TYPES = ['INJURY', 'NEAR_MISS', 'PROPERTY_DAMAGE', 'MEDICATION_ERROR', 'BEHAVIORAL', 'ABUSE_NEGLECT', 'FALL', 'MISSING_PERSON', 'OTHER'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const INCIDENT_STATUSES = ['OPEN', 'UNDER_INVESTIGATION', 'ACTION_REQUIRED', 'RESOLVED', 'CLOSED'];
const COMPLAINT_TYPES = ['SERVICE_QUALITY', 'STAFF_CONDUCT', 'BILLING', 'COMMUNICATION', 'SAFETY', 'PRIVACY', 'DISCRIMINATION', 'OTHER'];
const COMPLAINT_STATUSES = ['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'];

const idParam = Joi.object({ id: Joi.string().required() });

// Incidents
export const listIncidentsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional(),
    status: Joi.string().valid(...INCIDENT_STATUSES).optional(),
    severity: Joi.string().valid(...SEVERITIES).optional(),
    incidentType: Joi.string().valid(...INCIDENT_TYPES).optional(),
    clientId: Joi.string().optional(),
    staffId: Joi.string().optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional(),
    sortBy: Joi.string().valid('dateReported', 'dateOccurred', 'severity', 'status', 'createdAt').default('dateReported'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getIncidentSchema = { params: idParam };

export const createIncidentSchema = {
  body: Joi.object({
    incidentType: Joi.string().valid(...INCIDENT_TYPES).required(),
    severity: Joi.string().valid(...SEVERITIES).required(),
    dateOccurred: Joi.date().iso().required(),
    location: Joi.string().trim().max(500).optional().allow('', null),
    clientId: Joi.string().optional().allow(null),
    staffId: Joi.string().optional().allow(null),
    description: Joi.string().trim().min(10).max(5000).required(),
    immediateActionsTaken: Joi.string().trim().max(3000).optional().allow('', null),
    witnessNames: Joi.string().trim().max(500).optional().allow('', null),
    injuryDetails: Joi.string().trim().max(2000).optional().allow('', null),
    medicalAttentionRequired: Joi.boolean().default(false),
    policeNotified: Joi.boolean().default(false),
    ndisReportableIncident: Joi.boolean().default(false),
    attachmentUrls: Joi.array().items(Joi.string().uri()).optional(),
  }),
};

export const updateIncidentSchema = {
  params: idParam,
  body: Joi.object({
    severity: Joi.string().valid(...SEVERITIES).optional(),
    status: Joi.string().valid(...INCIDENT_STATUSES).optional(),
    dateOccurred: Joi.date().iso().optional(),
    location: Joi.string().trim().max(500).optional().allow('', null),
    description: Joi.string().trim().min(10).max(5000).optional(),
    immediateActionsTaken: Joi.string().trim().max(3000).optional().allow('', null),
    rootCauseAnalysis: Joi.string().trim().max(3000).optional().allow('', null),
    correctiveActions: Joi.string().trim().max(3000).optional().allow('', null),
    preventativeMeasures: Joi.string().trim().max(3000).optional().allow('', null),
    resolvedAt: Joi.date().iso().optional().allow(null),
    attachmentUrls: Joi.array().items(Joi.string().uri()).optional(),
  }).min(1),
};

// Follow-ups
export const createFollowUpSchema = {
  params: idParam,
  body: Joi.object({
    followUpDate: Joi.date().iso().optional(),
    action: Joi.string().trim().min(5).max(2000).required(),
    outcome: Joi.string().trim().max(2000).optional().allow('', null),
    isCompleted: Joi.boolean().default(false),
  }),
};

export const updateFollowUpSchema = {
  params: Joi.object({
    id: Joi.string().required(),
    followUpId: Joi.string().required(),
  }),
  body: Joi.object({
    action: Joi.string().trim().min(5).max(2000).optional(),
    outcome: Joi.string().trim().max(2000).optional().allow('', null),
    isCompleted: Joi.boolean().optional(),
    followUpDate: Joi.date().iso().optional(),
  }).min(1),
};

// Complaints
export const listComplaintsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional(),
    status: Joi.string().valid(...COMPLAINT_STATUSES).optional(),
    complaintType: Joi.string().valid(...COMPLAINT_TYPES).optional(),
    clientId: Joi.string().optional(),
    sortBy: Joi.string().valid('createdAt', 'status', 'complaintType').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getComplaintSchema = { params: idParam };

export const createComplaintSchema = {
  body: Joi.object({
    complaintType: Joi.string().valid(...COMPLAINT_TYPES).required(),
    subject: Joi.string().trim().min(5).max(200).required(),
    description: Joi.string().trim().min(10).max(5000).required(),
    clientId: Joi.string().optional().allow(null),
    complainantName: Joi.string().trim().max(200).optional().allow('', null),
    complainantContact: Joi.string().trim().max(200).optional().allow('', null),
    desiredOutcome: Joi.string().trim().max(2000).optional().allow('', null),
  }),
};

export const updateComplaintSchema = {
  params: idParam,
  body: Joi.object({
    status: Joi.string().valid(...COMPLAINT_STATUSES).optional(),
    complaintType: Joi.string().valid(...COMPLAINT_TYPES).optional(),
    subject: Joi.string().trim().min(5).max(200).optional(),
    description: Joi.string().trim().min(10).max(5000).optional(),
    investigation: Joi.string().trim().max(5000).optional().allow('', null),
    resolution: Joi.string().trim().max(3000).optional().allow('', null),
    resolvedAt: Joi.date().iso().optional().allow(null),
    assignedTo: Joi.string().optional().allow(null),
  }).min(1),
};

export default {
  listIncidentsSchema, getIncidentSchema, createIncidentSchema, updateIncidentSchema,
  createFollowUpSchema, updateFollowUpSchema,
  listComplaintsSchema, getComplaintSchema, createComplaintSchema, updateComplaintSchema,
};
