// src/modules/staff/staff.validator.js

import Joi from 'joi';
import { REGEX, PAGINATION } from '../../config/constants.js';

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

// CUID format: starts with 'c', 25 characters, lowercase alphanumeric
const cuidPattern = /^c[a-z0-9]{24}$/;

const staffIdParam = Joi.object({
  staffId: Joi.string().pattern(cuidPattern).required().messages({
    'string.pattern.base': 'Invalid staff ID format'
  })
});

const resourceIdParams = (resourceName) => Joi.object({
  staffId: Joi.string().pattern(cuidPattern).required().messages({
    'string.pattern.base': 'Invalid staff ID format'
  }),
  [resourceName]: Joi.string().pattern(cuidPattern).required().messages({
    'string.pattern.base': `Invalid ${resourceName} format`
  })
});

const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// ============================================================================
// ENUMS (matching Prisma schema)
// ============================================================================

const EMPLOYMENT_TYPE = ['FULL_TIME', 'PART_TIME', 'CASUAL', 'CONTRACT', 'VOLUNTEER'];
const EMPLOYMENT_STATUS = ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED', 'RESIGNED'];
const DAY_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const LEAVE_TYPE = ['ANNUAL', 'SICK', 'PERSONAL', 'UNPAID', 'PARENTAL', 'WORKERS_COMP', 'COMPASSIONATE'];
const APPROVAL_STATUS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const PROFICIENCY_LEVEL = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const DOCUMENT_STATUS = ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'PENDING_REVIEW', 'ARCHIVED'];

// ============================================================================
// CORE STAFF SCHEMAS
// ============================================================================

export const listStaffSchema = {
  query: paginationQuery.keys({
    search: Joi.string().trim().max(100).allow('', null).optional(),
    status: Joi.string().valid(...EMPLOYMENT_STATUS).allow('', null).optional(),
    employmentType: Joi.string().valid(...EMPLOYMENT_TYPE).allow('', null).optional(),
    department: Joi.string().trim().max(100).allow('', null).optional(),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'firstName', 'lastName', 'employeeId', 'startDate')
  })
};

export const getStaffSchema = {
  params: staffIdParam
};

export const createStaffSchema = {
  body: Joi.object({
    // Option 1: Link existing user
    userId: Joi.string().pattern(cuidPattern).allow('', null).optional().messages({
      'string.pattern.base': 'Invalid user ID format'
    }),
    
    // Option 2: Create new user (required if no userId)
    email: Joi.string().email().max(255).when('userId', {
      is: Joi.exist(),
      then: Joi.forbidden(),
      otherwise: Joi.required()
    }),
    firstName: Joi.string().trim().min(1).max(100).when('userId', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    lastName: Joi.string().trim().min(1).max(100).when('userId', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    phone: Joi.string().pattern(REGEX.AU_PHONE).allow('', null).optional().messages({
      'string.pattern.base': 'Invalid Australian phone number'
    }),
    
    // Staff-specific fields
    position: Joi.string().trim().max(100).allow('', null).optional(),
    department: Joi.string().trim().max(100).allow('', null).optional(),
    employmentType: Joi.string().valid(...EMPLOYMENT_TYPE).required(),
    employmentStatus: Joi.string().valid(...EMPLOYMENT_STATUS).default('ACTIVE'),
    hourlyRate: Joi.number().precision(2).min(0).allow(null).optional(),
    
    // Dates
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).allow(null).optional(),
    
    // Compliance
    hasNdisWorkerScreening: Joi.boolean().default(false),
    ndisScreeningNumber: Joi.string().trim().max(50).allow('', null).optional(),
    ndisScreeningExpiry: Joi.date().iso().allow(null).optional(),
    
    hasPoliceCheck: Joi.boolean().default(false),
    policeCheckDate: Joi.date().iso().allow(null).optional(),
    policeCheckExpiry: Joi.date().iso().allow(null).optional(),
    
    hasWorkingWithChildren: Joi.boolean().default(false),
    wwcCheckNumber: Joi.string().trim().max(50).allow('', null).optional(),
    wwcCheckExpiry: Joi.date().iso().allow(null).optional(),
    
    hasFirstAid: Joi.boolean().default(false),
    firstAidExpiry: Joi.date().iso().allow(null).optional(),
    
    // Emergency contact
    emergencyContactName: Joi.string().trim().max(100).allow('', null).optional(),
    emergencyContactPhone: Joi.string().pattern(REGEX.AU_PHONE).allow('', null).optional().messages({
      'string.pattern.base': 'Invalid Australian phone number'
    }),
    emergencyContactRelation: Joi.string().trim().max(50).allow('', null).optional(),
    
    // Notes
    notes: Joi.string().trim().max(2000).allow('', null).optional()
  })
};

export const updateStaffSchema = {
  params: staffIdParam,
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(100).allow('', null).optional(),
    lastName: Joi.string().trim().min(1).max(100).allow('', null).optional(),
    phone: Joi.string().pattern(REGEX.AU_PHONE).allow('', null).optional().messages({
      'string.pattern.base': 'Invalid Australian phone number'
    }),
    
    position: Joi.string().trim().max(100).allow('', null).optional(),
    department: Joi.string().trim().max(100).allow('', null).optional(),
    employmentType: Joi.string().valid(...EMPLOYMENT_TYPE).optional(),
    employmentStatus: Joi.string().valid(...EMPLOYMENT_STATUS).optional(),
    hourlyRate: Joi.number().precision(2).min(0).allow(null).optional(),
    
    startDate: Joi.date().iso().allow(null).optional(),
    endDate: Joi.date().iso().allow(null).optional(),
    
    // Compliance
    hasNdisWorkerScreening: Joi.boolean().optional(),
    ndisScreeningNumber: Joi.string().trim().max(50).allow('', null).optional(),
    ndisScreeningExpiry: Joi.date().iso().allow(null).optional(),
    
    hasPoliceCheck: Joi.boolean().optional(),
    policeCheckDate: Joi.date().iso().allow(null).optional(),
    policeCheckExpiry: Joi.date().iso().allow(null).optional(),
    
    hasWorkingWithChildren: Joi.boolean().optional(),
    wwcCheckNumber: Joi.string().trim().max(50).allow('', null).optional(),
    wwcCheckExpiry: Joi.date().iso().allow(null).optional(),
    
    hasFirstAid: Joi.boolean().optional(),
    firstAidExpiry: Joi.date().iso().allow(null).optional(),
    
    // Emergency contact
    emergencyContactName: Joi.string().trim().max(100).allow('', null).optional(),
    emergencyContactPhone: Joi.string().pattern(REGEX.AU_PHONE).allow('', null).optional().messages({
      'string.pattern.base': 'Invalid Australian phone number'
    }),
    emergencyContactRelation: Joi.string().trim().max(50).allow('', null).optional(),
    
    notes: Joi.string().trim().max(2000).allow('', null).optional()
  }).min(1)
};

export const deleteStaffSchema = {
  params: staffIdParam
};

// ============================================================================
// SKILLS SCHEMAS
// ============================================================================

export const listSkillsSchema = {
  params: staffIdParam,
  query: paginationQuery.keys({
    certified: Joi.boolean().optional(),
    proficiencyLevel: Joi.string().valid(...PROFICIENCY_LEVEL).allow('', null).optional()
  })
};

export const createSkillSchema = {
  params: staffIdParam,
  body: Joi.object({
    skillName: Joi.string().trim().min(1).max(100).required(),
    proficiencyLevel: Joi.string().valid(...PROFICIENCY_LEVEL).default('BEGINNER'),
    certified: Joi.boolean().default(false),
    certifiedDate: Joi.date().iso().allow(null).optional(),
    expiryDate: Joi.date().iso().allow(null).optional()
  })
};

export const updateSkillSchema = {
  params: resourceIdParams('skillId'),
  body: Joi.object({
    skillName: Joi.string().trim().min(1).max(100).allow('', null).optional(),
    proficiencyLevel: Joi.string().valid(...PROFICIENCY_LEVEL).allow('', null).optional(),
    certified: Joi.boolean().optional(),
    certifiedDate: Joi.date().iso().allow(null).optional(),
    expiryDate: Joi.date().iso().allow(null).optional()
  }).min(1)
};

export const deleteSkillSchema = {
  params: resourceIdParams('skillId')
};

// ============================================================================
// DOCUMENTS SCHEMAS
// ============================================================================

export const listDocumentsSchema = {
  params: staffIdParam,
  query: paginationQuery.keys({
    status: Joi.string().valid(...DOCUMENT_STATUS).allow('', null).optional(),
    documentType: Joi.string().trim().max(50).allow('', null).optional()
  })
};

export const createDocumentSchema = {
  params: staffIdParam,
  body: Joi.object({
    documentName: Joi.string().trim().min(1).max(200).required(),
    documentType: Joi.string().trim().min(1).max(50).required(),
    documentNumber: Joi.string().trim().max(100).allow('', null).optional(),
    issueDate: Joi.date().iso().allow(null).optional(),
    expiryDate: Joi.date().iso().allow(null).optional(),
    issuingAuthority: Joi.string().trim().max(200).allow('', null).optional(),
    fileUrl: Joi.string().uri().max(500).allow('', null).optional(),
    notes: Joi.string().trim().max(1000).allow('', null).optional()
  })
};

export const updateDocumentSchema = {
  params: resourceIdParams('documentId'),
  body: Joi.object({
    documentName: Joi.string().trim().min(1).max(200).allow('', null).optional(),
    documentType: Joi.string().trim().min(1).max(50).allow('', null).optional(),
    documentNumber: Joi.string().trim().max(100).allow('', null).optional(),
    issueDate: Joi.date().iso().allow(null).optional(),
    expiryDate: Joi.date().iso().allow(null).optional(),
    issuingAuthority: Joi.string().trim().max(200).allow('', null).optional(),
    fileUrl: Joi.string().uri().max(500).allow('', null).optional(),
    status: Joi.string().valid(...DOCUMENT_STATUS).allow('', null).optional(),
    notes: Joi.string().trim().max(1000).allow('', null).optional()
  }).min(1)
};

export const deleteDocumentSchema = {
  params: resourceIdParams('documentId')
};

// ============================================================================
// AVAILABILITY SCHEMAS
// ============================================================================

export const getAvailabilitySchema = {
  params: staffIdParam
};

const availabilitySlot = Joi.object({
  dayOfWeek: Joi.string().valid(...DAY_OF_WEEK).required(),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'Time must be in HH:mm format (24-hour)'
  }),
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'Time must be in HH:mm format (24-hour)'
  }),
  isAvailable: Joi.boolean().default(true)
});

export const setAvailabilitySchema = {
  params: staffIdParam,
  body: Joi.object({
    availability: Joi.array().items(availabilitySlot).min(1).max(7).required()
  })
};

// ============================================================================
// LEAVE SCHEMAS
// ============================================================================

export const listLeaveSchema = {
  params: staffIdParam,
  query: paginationQuery.keys({
    status: Joi.string().valid(...APPROVAL_STATUS).allow('', null).optional(),
    leaveType: Joi.string().valid(...LEAVE_TYPE).allow('', null).optional(),
    startDate: Joi.date().iso().allow(null).optional(),
    endDate: Joi.date().iso().allow(null).optional()
  })
};

export const createLeaveSchema = {
  params: staffIdParam,
  body: Joi.object({
    leaveType: Joi.string().valid(...LEAVE_TYPE).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    reason: Joi.string().trim().max(1000).allow('', null).optional()
  })
};

export const updateLeaveSchema = {
  params: resourceIdParams('leaveId'),
  body: Joi.object({
    leaveType: Joi.string().valid(...LEAVE_TYPE).allow('', null).optional(),
    startDate: Joi.date().iso().allow(null).optional(),
    endDate: Joi.date().iso().allow(null).optional(),
    reason: Joi.string().trim().max(1000).allow('', null).optional(),
    status: Joi.string().valid(...APPROVAL_STATUS).allow('', null).optional(),
    reviewNote: Joi.string().trim().max(1000).allow('', null).optional()
  }).min(1)
};

// ============================================================================
// PERFORMANCE REVIEW SCHEMAS
// ============================================================================

export const listReviewsSchema = {
  params: staffIdParam,
  query: paginationQuery.keys({
    status: Joi.string().valid(...APPROVAL_STATUS).allow('', null).optional(),
    startDate: Joi.date().iso().allow(null).optional(),
    endDate: Joi.date().iso().allow(null).optional()
  })
};

export const createReviewSchema = {
  params: staffIdParam,
  body: Joi.object({
    reviewDate: Joi.date().iso().required(),
    overallRating: Joi.number().integer().min(1).max(5).required(),
    strengths: Joi.string().trim().max(2000).allow('', null).optional(),
    improvements: Joi.string().trim().max(2000).allow('', null).optional(),
    goals: Joi.string().trim().max(2000).allow('', null).optional(),
    comments: Joi.string().trim().max(2000).allow('', null).optional()
  })
};

export const updateReviewSchema = {
  params: resourceIdParams('reviewId'),
  body: Joi.object({
    reviewDate: Joi.date().iso().allow(null).optional(),
    overallRating: Joi.number().integer().min(1).max(5).allow(null).optional(),
    strengths: Joi.string().trim().max(2000).allow('', null).optional(),
    improvements: Joi.string().trim().max(2000).allow('', null).optional(),
    goals: Joi.string().trim().max(2000).allow('', null).optional(),
    comments: Joi.string().trim().max(2000).allow('', null).optional(),
    status: Joi.string().valid(...APPROVAL_STATUS).allow('', null).optional()
  }).min(1)
};

// ============================================================================
// TRAINING SCHEMAS
// ============================================================================

export const listTrainingSchema = {
  params: staffIdParam,
  query: paginationQuery.keys({
    expired: Joi.boolean().optional(),
    provider: Joi.string().trim().max(200).allow('', null).optional()
  })
};

export const createTrainingSchema = {
  params: staffIdParam,
  body: Joi.object({
    trainingName: Joi.string().trim().min(1).max(200).required(),
    provider: Joi.string().trim().max(200).allow('', null).optional(),
    completionDate: Joi.date().iso().required(),
    expiryDate: Joi.date().iso().allow(null).optional(),
    certificateUrl: Joi.string().uri().max(500).allow('', null).optional(),
    notes: Joi.string().trim().max(1000).allow('', null).optional()
  })
};

export const updateTrainingSchema = {
  params: resourceIdParams('trainingId'),
  body: Joi.object({
    trainingName: Joi.string().trim().min(1).max(200).allow('', null).optional(),
    provider: Joi.string().trim().max(200).allow('', null).optional(),
    completionDate: Joi.date().iso().allow(null).optional(),
    expiryDate: Joi.date().iso().allow(null).optional(),
    certificateUrl: Joi.string().uri().max(500).allow('', null).optional(),
    notes: Joi.string().trim().max(1000).allow('', null).optional()
  }).min(1)
};

export const deleteTrainingSchema = {
  params: resourceIdParams('trainingId')
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Core Staff
  listStaffSchema,
  getStaffSchema,
  createStaffSchema,
  updateStaffSchema,
  deleteStaffSchema,
  
  // Skills
  listSkillsSchema,
  createSkillSchema,
  updateSkillSchema,
  deleteSkillSchema,
  
  // Documents
  listDocumentsSchema,
  createDocumentSchema,
  updateDocumentSchema,
  deleteDocumentSchema,
  
  // Availability
  getAvailabilitySchema,
  setAvailabilitySchema,
  
  // Leave
  listLeaveSchema,
  createLeaveSchema,
  updateLeaveSchema,
  
  // Performance Reviews
  listReviewsSchema,
  createReviewSchema,
  updateReviewSchema,
  
  // Training
  listTrainingSchema,
  createTrainingSchema,
  updateTrainingSchema,
  deleteTrainingSchema
};