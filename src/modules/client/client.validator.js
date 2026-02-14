// src/modules/client/client.validator.js

import Joi from 'joi';

const AU_PHONE = /^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/;
const AU_POSTCODE = /^\d{4}$/;
const NDIS_NUMBER = /^\d{9}$/;
const AU_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

const CLIENT_STATUSES = ['ACTIVE', 'INACTIVE', 'ON_HOLD', 'DISCHARGED', 'WAITLISTED', 'DECEASED'];
const FUNDING_TYPES = [
  'NDIS_AGENCY_MANAGED', 'NDIS_PLAN_MANAGED', 'NDIS_SELF_MANAGED',
  'AGED_CARE_HCP', 'AGED_CARE_CHSP', 'PRIVATE', 'INSURANCE', 'DVA',
];
const BUDGET_CATEGORIES = ['CORE_SUPPORTS', 'CAPACITY_BUILDING', 'CAPITAL_SUPPORTS'];
const GOAL_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'ON_HOLD', 'CANCELLED'];
const CARE_PLAN_STATUSES = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'EXPIRED', 'CANCELLED'];
const DOCUMENT_STATUSES = ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'PENDING_REVIEW', 'ARCHIVED'];
const ASSESSMENT_TYPES = ['INITIAL', 'PERIODIC', 'DISCHARGE', 'FUNCTIONAL', 'RISK', 'BEHAVIORAL'];
const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const AGED_CARE_LEVELS = ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4'];

// --- Shared Param Schemas ---

const clientIdParam = Joi.object({
  clientId: Joi.string().required(),
});

const clientIdAndIdParam = Joi.object({
  clientId: Joi.string().required(),
  id: Joi.string().required(),
});

const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ============================================================================
// CORE CLIENT
// ============================================================================

export const listClientsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).optional(),
    status: Joi.string().valid(...CLIENT_STATUSES).optional(),
    state: Joi.string().valid(...AU_STATES).optional(),
    hasAgedCare: Joi.boolean().optional(),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'firstName', 'lastName', 'status', 'ndisNumber').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getClientSchema = {
  params: clientIdParam,
};

export const createClientSchema = {
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(100).required(),
    lastName: Joi.string().trim().min(1).max(100).required(),
    preferredName: Joi.string().trim().max(100).optional().allow('', null),
    dateOfBirth: Joi.date().iso().required(),
    gender: Joi.string().trim().max(50).optional().allow('', null),
    phone: Joi.string().pattern(AU_PHONE).optional().allow('', null)
      .messages({ 'string.pattern.base': 'Phone must be a valid Australian phone number' }),
    email: Joi.string().email().optional().allow('', null),
    address: Joi.string().trim().max(255).optional().allow('', null),
    addressLine1: Joi.string().trim().max(255).optional().allow('', null),
    addressLine2: Joi.string().trim().max(255).optional().allow('', null),
    suburb: Joi.string().trim().max(100).optional().allow('', null),
    state: Joi.string().uppercase().valid(...AU_STATES).optional().allow('', null),
    postcode: Joi.string().pattern(AU_POSTCODE).optional().allow('', null)
      .messages({ 'string.pattern.base': 'Postcode must be 4 digits' }),
    // NDIS fields
    ndisNumber: Joi.string().pattern(NDIS_NUMBER).optional().allow('', null)
      .messages({ 'string.pattern.base': 'NDIS number must be 9 digits' }),
    ndisPlanStartDate: Joi.date().iso().optional().allow(null),
    ndisPlanEndDate: Joi.date().iso().optional().allow(null),
    ndisPlanManager: Joi.string().trim().max(200).optional().allow('', null),
    ndisPlanManagerEmail: Joi.string().email().optional().allow('', null),
    ndisPlanManagerPhone: Joi.string().pattern(AU_PHONE).optional().allow('', null),
    // Aged Care fields
    hasAgedCare: Joi.boolean().default(false),
    agedCarePackageLevel: Joi.string().valid(...AGED_CARE_LEVELS).optional().allow(null),
    agedCareReferenceNo: Joi.string().trim().max(50).optional().allow('', null),
    // Other
    userId: Joi.string().optional().allow(null),
    status: Joi.string().valid(...CLIENT_STATUSES).default('ACTIVE'),
    onboardedAt: Joi.date().iso().optional().allow(null),
  })
    .rename('first_name', 'firstName', { ignoreUndefined: true })
    .rename('last_name', 'lastName', { ignoreUndefined: true })
    .rename('preferred_name', 'preferredName', { ignoreUndefined: true })
    .rename('date_of_birth', 'dateOfBirth', { ignoreUndefined: true })
    .rename('address_line_1', 'addressLine1', { ignoreUndefined: true })
    .rename('address_line_2', 'addressLine2', { ignoreUndefined: true })
    .rename('ndis_number', 'ndisNumber', { ignoreUndefined: true })
    .rename('ndis_plan_start_date', 'ndisPlanStartDate', { ignoreUndefined: true })
    .rename('ndis_plan_end_date', 'ndisPlanEndDate', { ignoreUndefined: true })
    .rename('ndis_plan_manager', 'ndisPlanManager', { ignoreUndefined: true })
    .rename('ndis_plan_manager_email', 'ndisPlanManagerEmail', { ignoreUndefined: true })
    .rename('ndis_plan_manager_phone', 'ndisPlanManagerPhone', { ignoreUndefined: true })
    .rename('has_aged_care', 'hasAgedCare', { ignoreUndefined: true })
    .rename('aged_care_package_level', 'agedCarePackageLevel', { ignoreUndefined: true })
    .rename('aged_care_reference_no', 'agedCareReferenceNo', { ignoreUndefined: true })
    .rename('onboarded_at', 'onboardedAt', { ignoreUndefined: true }),
};

export const updateClientSchema = {
  params: clientIdParam,
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(100).optional(),
    lastName: Joi.string().trim().min(1).max(100).optional(),
    preferredName: Joi.string().trim().max(100).optional().allow('', null),
    dateOfBirth: Joi.date().iso().optional(),
    gender: Joi.string().trim().max(50).optional().allow('', null),
    phone: Joi.string().pattern(AU_PHONE).optional().allow('', null),
    email: Joi.string().email().optional().allow('', null),
    address: Joi.string().trim().max(255).optional().allow('', null),
    addressLine1: Joi.string().trim().max(255).optional().allow('', null),
    addressLine2: Joi.string().trim().max(255).optional().allow('', null),
    suburb: Joi.string().trim().max(100).optional().allow('', null),
    state: Joi.string().uppercase().valid(...AU_STATES).optional().allow('', null),
    postcode: Joi.string().pattern(AU_POSTCODE).optional().allow('', null),
    ndisNumber: Joi.string().pattern(NDIS_NUMBER).optional().allow('', null),
    ndisPlanStartDate: Joi.date().iso().optional().allow(null),
    ndisPlanEndDate: Joi.date().iso().optional().allow(null),
    ndisPlanManager: Joi.string().trim().max(200).optional().allow('', null),
    ndisPlanManagerEmail: Joi.string().email().optional().allow('', null),
    ndisPlanManagerPhone: Joi.string().pattern(AU_PHONE).optional().allow('', null),
    hasAgedCare: Joi.boolean().optional(),
    agedCarePackageLevel: Joi.string().valid(...AGED_CARE_LEVELS).optional().allow(null),
    agedCareReferenceNo: Joi.string().trim().max(50).optional().allow('', null),
    status: Joi.string().valid(...CLIENT_STATUSES).optional(),
    onboardedAt: Joi.date().iso().optional().allow(null),
    dischargedAt: Joi.date().iso().optional().allow(null),
  })
    .rename('first_name', 'firstName', { ignoreUndefined: true })
    .rename('last_name', 'lastName', { ignoreUndefined: true })
    .rename('preferred_name', 'preferredName', { ignoreUndefined: true })
    .rename('date_of_birth', 'dateOfBirth', { ignoreUndefined: true })
    .rename('address_line_1', 'addressLine1', { ignoreUndefined: true })
    .rename('address_line_2', 'addressLine2', { ignoreUndefined: true })
    .rename('ndis_number', 'ndisNumber', { ignoreUndefined: true })
    .rename('ndis_plan_start_date', 'ndisPlanStartDate', { ignoreUndefined: true })
    .rename('ndis_plan_end_date', 'ndisPlanEndDate', { ignoreUndefined: true })
    .rename('ndis_plan_manager', 'ndisPlanManager', { ignoreUndefined: true })
    .rename('ndis_plan_manager_email', 'ndisPlanManagerEmail', { ignoreUndefined: true })
    .rename('ndis_plan_manager_phone', 'ndisPlanManagerPhone', { ignoreUndefined: true })
    .rename('has_aged_care', 'hasAgedCare', { ignoreUndefined: true })
    .rename('aged_care_package_level', 'agedCarePackageLevel', { ignoreUndefined: true })
    .rename('aged_care_reference_no', 'agedCareReferenceNo', { ignoreUndefined: true })
    .rename('onboarded_at', 'onboardedAt', { ignoreUndefined: true })
    .rename('discharged_at', 'dischargedAt', { ignoreUndefined: true })
    .min(1),
};

export const deleteClientSchema = {
  params: clientIdParam,
};

// ============================================================================
// FUNDING SOURCES
// ============================================================================

export const listFundingSchema = {
  params: clientIdParam,
  query: paginationQuery.keys({
    fundingType: Joi.string().valid(...FUNDING_TYPES).optional(),
  }),
};

export const createFundingSchema = {
  params: clientIdParam,
  body: Joi.object({
    fundingType: Joi.string().valid(...FUNDING_TYPES).required(),
    planNumber: Joi.string().trim().max(50).optional().allow('', null),
    totalBudget: Joi.number().precision(2).min(0).required(),
    spentAmount: Joi.number().precision(2).min(0).default(0),
    remainingAmount: Joi.number().precision(2).min(0).optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
  }),
};

export const updateFundingSchema = {
  params: clientIdAndIdParam,
  body: Joi.object({
    fundingType: Joi.string().valid(...FUNDING_TYPES).optional(),
    planNumber: Joi.string().trim().max(50).optional().allow('', null),
    totalBudget: Joi.number().precision(2).min(0).optional(),
    spentAmount: Joi.number().precision(2).min(0).optional(),
    remainingAmount: Joi.number().precision(2).min(0).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
  }).min(1),
};

export const deleteFundingSchema = {
  params: clientIdAndIdParam,
};

// ============================================================================
// BUDGET LINES
// ============================================================================

export const listBudgetLinesSchema = {
  params: clientIdParam,
  query: paginationQuery.keys({
    fundingSourceId: Joi.string().optional(),
    category: Joi.string().valid(...BUDGET_CATEGORIES).optional(),
  }),
};

export const createBudgetLineSchema = {
  params: clientIdParam,
  body: Joi.object({
    fundingSourceId: Joi.string().required(),
    category: Joi.string().valid(...BUDGET_CATEGORIES).required(),
    supportItemNo: Joi.string().trim().max(50).optional().allow('', null),
    description: Joi.string().trim().max(500).optional().allow('', null),
    allocatedAmount: Joi.number().precision(2).min(0).required(),
    usedAmount: Joi.number().precision(2).min(0).default(0),
    remainingAmount: Joi.number().precision(2).min(0).optional(),
  }),
};

export const updateBudgetLineSchema = {
  params: clientIdAndIdParam,
  body: Joi.object({
    category: Joi.string().valid(...BUDGET_CATEGORIES).optional(),
    supportItemNo: Joi.string().trim().max(50).optional().allow('', null),
    description: Joi.string().trim().max(500).optional().allow('', null),
    allocatedAmount: Joi.number().precision(2).min(0).optional(),
    usedAmount: Joi.number().precision(2).min(0).optional(),
    remainingAmount: Joi.number().precision(2).min(0).optional(),
  }).min(1),
};

export const deleteBudgetLineSchema = {
  params: clientIdAndIdParam,
};

// ============================================================================
// GOALS
// ============================================================================

export const listGoalsSchema = {
  params: clientIdParam,
  query: paginationQuery.keys({
    status: Joi.string().valid(...GOAL_STATUSES).optional(),
  }),
};

export const createGoalSchema = {
  params: clientIdParam,
  body: Joi.object({
    goalTitle: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().max(2000).optional().allow('', null),
    ndisDomain: Joi.string().trim().max(100).optional().allow('', null),
    status: Joi.string().valid(...GOAL_STATUSES).default('NOT_STARTED'),
    progressPercentage: Joi.number().integer().min(0).max(100).default(0),
    targetDate: Joi.date().iso().optional().allow(null),
  }),
};

export const updateGoalSchema = {
  params: clientIdAndIdParam,
  body: Joi.object({
    goalTitle: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().trim().max(2000).optional().allow('', null),
    ndisDomain: Joi.string().trim().max(100).optional().allow('', null),
    status: Joi.string().valid(...GOAL_STATUSES).optional(),
    progressPercentage: Joi.number().integer().min(0).max(100).optional(),
    targetDate: Joi.date().iso().optional().allow(null),
    achievedDate: Joi.date().iso().optional().allow(null),
  }).min(1),
};

export const deleteGoalSchema = {
  params: clientIdAndIdParam,
};

// Goal Milestones

export const addMilestoneSchema = {
  params: Joi.object({
    clientId: Joi.string().required(),
    goalId: Joi.string().required(),
  }),
  body: Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().max(1000).optional().allow('', null),
    evidence: Joi.string().trim().max(2000).optional().allow('', null),
  }),
};

export const updateMilestoneSchema = {
  params: Joi.object({
    clientId: Joi.string().required(),
    goalId: Joi.string().required(),
    id: Joi.string().required(),
  }),
  body: Joi.object({
    title: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().trim().max(1000).optional().allow('', null),
    isCompleted: Joi.boolean().optional(),
    evidence: Joi.string().trim().max(2000).optional().allow('', null),
  }).min(1),
};

export const deleteMilestoneSchema = {
  params: Joi.object({
    clientId: Joi.string().required(),
    goalId: Joi.string().required(),
    id: Joi.string().required(),
  }),
};

// ============================================================================
// CARE PLANS
// ============================================================================

export const listCarePlansSchema = {
  params: clientIdParam,
  query: paginationQuery.keys({
    status: Joi.string().valid(...CARE_PLAN_STATUSES).optional(),
  }),
};

export const createCarePlanSchema = {
  params: clientIdParam,
  body: Joi.object({
    planType: Joi.string().trim().min(2).max(100).required(),
    title: Joi.string().trim().min(2).max(200).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().optional().allow(null),
    status: Joi.string().valid(...CARE_PLAN_STATUSES).default('DRAFT'),
    content: Joi.object().optional().allow(null),
  }),
};

export const updateCarePlanSchema = {
  params: clientIdAndIdParam,
  body: Joi.object({
    planType: Joi.string().trim().min(2).max(100).optional(),
    title: Joi.string().trim().min(2).max(200).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional().allow(null),
    status: Joi.string().valid(...CARE_PLAN_STATUSES).optional(),
    content: Joi.object().optional().allow(null),
  }).min(1),
};

export const deleteCarePlanSchema = {
  params: clientIdAndIdParam,
};

// ============================================================================
// DOCUMENTS
// ============================================================================

export const listDocumentsSchema = {
  params: clientIdParam,
  query: paginationQuery.keys({
    status: Joi.string().valid(...DOCUMENT_STATUSES).optional(),
    documentType: Joi.string().trim().max(100).optional(),
  }),
};

export const createDocumentSchema = {
  params: clientIdParam,
  body: Joi.object({
    documentType: Joi.string().trim().min(2).max(100).required(),
    title: Joi.string().trim().min(2).max(200).required(),
    fileName: Joi.string().trim().min(1).max(255).required(),
    fileUrl: Joi.string().trim().uri().required(),
    fileSize: Joi.number().integer().min(0).optional().allow(null),
    categoryId: Joi.string().optional().allow(null),
    expiryDate: Joi.date().iso().optional().allow(null),
    status: Joi.string().valid(...DOCUMENT_STATUSES).default('ACTIVE'),
  }),
};

export const updateDocumentSchema = {
  params: clientIdAndIdParam,
  body: Joi.object({
    documentType: Joi.string().trim().min(2).max(100).optional(),
    title: Joi.string().trim().min(2).max(200).optional(),
    fileName: Joi.string().trim().min(1).max(255).optional(),
    fileUrl: Joi.string().trim().uri().optional(),
    fileSize: Joi.number().integer().min(0).optional().allow(null),
    categoryId: Joi.string().optional().allow(null),
    expiryDate: Joi.date().iso().optional().allow(null),
    status: Joi.string().valid(...DOCUMENT_STATUSES).optional(),
  }).min(1),
};

export const deleteDocumentSchema = {
  params: clientIdAndIdParam,
};

// ============================================================================
// NOTES
// ============================================================================

export const listNotesSchema = {
  params: clientIdParam,
  query: paginationQuery.keys({
    noteType: Joi.string().trim().max(50).optional(),
    isFlagged: Joi.boolean().optional(),
  }),
};

export const createNoteSchema = {
  params: clientIdParam,
  body: Joi.object({
    noteType: Joi.string().trim().min(2).max(50).required(),
    title: Joi.string().trim().max(200).optional().allow('', null),
    note: Joi.string().trim().min(1).max(10000).required(),
    isFlagged: Joi.boolean().default(false),
  }),
};

export const updateNoteSchema = {
  params: clientIdAndIdParam,
  body: Joi.object({
    noteType: Joi.string().trim().min(2).max(50).optional(),
    title: Joi.string().trim().max(200).optional().allow('', null),
    note: Joi.string().trim().min(1).max(10000).optional(),
    isFlagged: Joi.boolean().optional(),
  }).min(1),
};

export const deleteNoteSchema = {
  params: clientIdAndIdParam,
};

// ============================================================================
// FAMILY MEMBERS
// ============================================================================

export const listFamilySchema = {
  params: clientIdParam,
  query: paginationQuery,
};

export const createFamilySchema = {
  params: clientIdParam,
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(100).required(),
    lastName: Joi.string().trim().min(1).max(100).required(),
    relationship: Joi.string().trim().min(2).max(50).required(),
    phone: Joi.string().pattern(AU_PHONE).optional().allow('', null)
      .messages({ 'string.pattern.base': 'Phone must be a valid Australian phone number' }),
    email: Joi.string().email().optional().allow('', null),
    isEmergencyContact: Joi.boolean().default(false),
    isPrimaryContact: Joi.boolean().default(false),
    userId: Joi.string().optional().allow(null),
  }),
};

export const updateFamilySchema = {
  params: clientIdAndIdParam,
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(100).optional(),
    lastName: Joi.string().trim().min(1).max(100).optional(),
    relationship: Joi.string().trim().min(2).max(50).optional(),
    phone: Joi.string().pattern(AU_PHONE).optional().allow('', null),
    email: Joi.string().email().optional().allow('', null),
    isEmergencyContact: Joi.boolean().optional(),
    isPrimaryContact: Joi.boolean().optional(),
  }).min(1),
};

export const deleteFamilySchema = {
  params: clientIdAndIdParam,
};

// ============================================================================
// ASSESSMENTS
// ============================================================================

export const listAssessmentsSchema = {
  params: clientIdParam,
  query: paginationQuery.keys({
    assessmentType: Joi.string().valid(...ASSESSMENT_TYPES).optional(),
  }),
};

export const createAssessmentSchema = {
  params: clientIdParam,
  body: Joi.object({
    assessmentType: Joi.string().valid(...ASSESSMENT_TYPES).required(),
    assessmentDate: Joi.date().iso().required(),
    assessorName: Joi.string().trim().max(200).optional().allow('', null),
    findings: Joi.string().trim().max(5000).optional().allow('', null),
    recommendations: Joi.string().trim().max(5000).optional().allow('', null),
    riskLevel: Joi.string().valid(...SEVERITY_LEVELS).optional().allow(null),
    attachmentUrl: Joi.string().trim().uri().optional().allow('', null),
  }),
};

export const updateAssessmentSchema = {
  params: clientIdAndIdParam,
  body: Joi.object({
    assessmentType: Joi.string().valid(...ASSESSMENT_TYPES).optional(),
    assessmentDate: Joi.date().iso().optional(),
    assessorName: Joi.string().trim().max(200).optional().allow('', null),
    findings: Joi.string().trim().max(5000).optional().allow('', null),
    recommendations: Joi.string().trim().max(5000).optional().allow('', null),
    riskLevel: Joi.string().valid(...SEVERITY_LEVELS).optional().allow(null),
    attachmentUrl: Joi.string().trim().uri().optional().allow('', null),
  }).min(1),
};

// ============================================================================
// SERVICE AGREEMENTS
// ============================================================================

export const listAgreementsSchema = {
  params: clientIdParam,
  query: paginationQuery,
};

export const createAgreementSchema = {
  params: clientIdParam,
  body: Joi.object({
    agreementNumber: Joi.string().trim().min(1).max(50).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().optional().allow(null),
    serviceDetails: Joi.object().optional().allow(null),
    signedByClient: Joi.boolean().default(false),
    signedAt: Joi.date().iso().optional().allow(null),
    signatureUrl: Joi.string().trim().uri().optional().allow('', null),
    fileUrl: Joi.string().trim().uri().optional().allow('', null),
  }),
};

export const updateAgreementSchema = {
  params: clientIdAndIdParam,
  body: Joi.object({
    agreementNumber: Joi.string().trim().min(1).max(50).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional().allow(null),
    serviceDetails: Joi.object().optional().allow(null),
    signedByClient: Joi.boolean().optional(),
    signedAt: Joi.date().iso().optional().allow(null),
    signatureUrl: Joi.string().trim().uri().optional().allow('', null),
    fileUrl: Joi.string().trim().uri().optional().allow('', null),
  }).min(1),
};

export default {
  listClientsSchema,
  getClientSchema,
  createClientSchema,
  updateClientSchema,
  deleteClientSchema,
  listFundingSchema,
  createFundingSchema,
  updateFundingSchema,
  deleteFundingSchema,
  listBudgetLinesSchema,
  createBudgetLineSchema,
  updateBudgetLineSchema,
  deleteBudgetLineSchema,
  listGoalsSchema,
  createGoalSchema,
  updateGoalSchema,
  deleteGoalSchema,
  addMilestoneSchema,
  updateMilestoneSchema,
  deleteMilestoneSchema,
  listCarePlansSchema,
  createCarePlanSchema,
  updateCarePlanSchema,
  deleteCarePlanSchema,
  listDocumentsSchema,
  createDocumentSchema,
  updateDocumentSchema,
  deleteDocumentSchema,
  listNotesSchema,
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
  listFamilySchema,
  createFamilySchema,
  updateFamilySchema,
  deleteFamilySchema,
  listAssessmentsSchema,
  createAssessmentSchema,
  updateAssessmentSchema,
  listAgreementsSchema,
  createAgreementSchema,
  updateAgreementSchema,
};
