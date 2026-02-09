// src/modules/staff/staff.validator.js

import Joi from 'joi';
import { REGEX, PAGINATION } from '../../config/constants.js';

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const staffIdParam = Joi.object({
  staffId: Joi.string().uuid().required()
});

const resourceIdParams = (resourceName) => Joi.object({
  staffId: Joi.string().uuid().required(),
  [resourceName]: Joi.string().uuid().required()
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
    search: Joi.string().trim().max(100).optional(),
    status: Joi.string().valid(...EMPLOYMENT_STATUS).optional(),
    employmentType: Joi.string().valid(...EMPLOYMENT_TYPE).optional(),
    department: Joi.string().trim().max(100).optional(),
    sortBy: Joi.string().valid('createdAt', 'firstName', 'lastName', 'employeeId', 'startDate').default('createdAt')
  })
};

export const getStaffSchema = {
  params: staffIdParam
};

export const createStaffSchema = {
  body: Joi.object({
    // Option 1: Link existing user
    userId: Joi.string().uuid().optional(),
    
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
    phone: Joi.string().pattern(REGEX.AU_PHONE).optional().messages({
      'string.pattern.base': 'Invalid Australian phone number'
    }),
    
    // Staff-specific fields
    position: Joi.string().trim().max(100).optional(),
    department: Joi.string().trim().max(100).optional(),
    employmentType: Joi.string().valid(...EMPLOYMENT_TYPE).required(),
    employmentStatus: Joi.string().valid(...EMPLOYMENT_STATUS).default('ACTIVE'),
    hourlyRate: Joi.number().precision(2).min(0).optional(),
    
    // Dates
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
    
    // Compliance
    hasNdisWorkerScreening: Joi.boolean().default(false),
    ndisScreeningNumber: Joi.string().trim().max(50).when('hasNdisWorkerScreening', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    ndisScreeningExpiry: Joi.date().iso().when('hasNdisWorkerScreening', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    
    hasPoliceCheck: Joi.boolean().default(false),
    policeCheckDate: Joi.date().iso().when('hasPoliceCheck', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    policeCheckExpiry: Joi.date().iso().when('hasPoliceCheck', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    
    hasWorkingWithChildren: Joi.boolean().default(false),
    wwcCheckNumber: Joi.string().trim().max(50).when('hasWorkingWithChildren', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    wwcCheckExpiry: Joi.date().iso().when('hasWorkingWithChildren', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    
    hasFirstAid: Joi.boolean().default(false),
    firstAidExpiry: Joi.date().iso().when('hasFirstAid', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    
    // Emergency contact
    emergencyContactName: Joi.string().trim().max(100).optional(),
    emergencyContactPhone: Joi.string().pattern(REGEX.AU_PHONE).optional().messages({
      'string.pattern.base': 'Invalid Australian phone number'
    }),
    emergencyContactRelation: Joi.string().trim().max(50).optional(),
    
    // Notes
    notes: Joi.string().trim().max(2000).optional()
  })
};

export const updateStaffSchema = {
  params: staffIdParam,
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(100).optional(),
    lastName: Joi.string().trim().min(1).max(100).optional(),
    phone: Joi.string().pattern(REGEX.AU_PHONE).optional().allow('').messages({
      'string.pattern.base': 'Invalid Australian phone number'
    }),
    
    position: Joi.string().trim().max(100).optional().allow(''),
    department: Joi.string().trim().max(100).optional().allow(''),
    employmentType: Joi.string().valid(...EMPLOYMENT_TYPE).optional(),
    employmentStatus: Joi.string().valid(...EMPLOYMENT_STATUS).optional(),
    hourlyRate: Joi.number().precision(2).min(0).optional(),
    
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional().allow(null),
    
    // Compliance
    hasNdisWorkerScreening: Joi.boolean().optional(),
    ndisScreeningNumber: Joi.string().trim().max(50).optional().allow(''),
    ndisScreeningExpiry: Joi.date().iso().optional().allow(null),
    
    hasPoliceCheck: Joi.boolean().optional(),
    policeCheckDate: Joi.date().iso().optional().allow(null),
    policeCheckExpiry: Joi.date().iso().optional().allow(null),
    
    hasWorkingWithChildren: Joi.boolean().optional(),
    wwcCheckNumber: Joi.string().trim().max(50).optional().allow(''),
    wwcCheckExpiry: Joi.date().iso().optional().allow(null),
    
    hasFirstAid: Joi.boolean().optional(),
    firstAidExpiry: Joi.date().iso().optional().allow(null),
    
    // Emergency contact
    emergencyContactName: Joi.string().trim().max(100).optional().allow(''),
    emergencyContactPhone: Joi.string().pattern(REGEX.AU_PHONE).optional().allow('').messages({
      'string.pattern.base': 'Invalid Australian phone number'
    }),
    emergencyContactRelation: Joi.string().trim().max(50).optional().allow(''),
    
    notes: Joi.string().trim().max(2000).optional().allow('')
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
    proficiencyLevel: Joi.string().valid(...PROFICIENCY_LEVEL).optional()
  })
};

export const createSkillSchema = {
  params: staffIdParam,
  body: Joi.object({
    skillName: Joi.string().trim().min(1).max(100).required(),
    proficiencyLevel: Joi.string().valid(...PROFICIENCY_LEVEL).default('BEGINNER'),
    certified: Joi.boolean().default(false),
    certifiedDate: Joi.date().iso().when('certified', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    expiryDate: Joi.date().iso().greater(Joi.ref('certifiedDate')).optional()
  })
};

export const updateSkillSchema = {
  params: resourceIdParams('skillId'),
  body: Joi.object({
    skillName: Joi.string().trim().min(1).max(100).optional(),
    proficiencyLevel: Joi.string().valid(...PROFICIENCY_LEVEL).optional(),
    certified: Joi.boolean().optional(),
    certifiedDate: Joi.date().iso().optional().allow(null),
    expiryDate: Joi.date().iso().optional().allow(null)
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
    status: Joi.string().valid(...DOCUMENT_STATUS).optional(),
    documentType: Joi.string().trim().max(50).optional()
  })
};

export const createDocumentSchema = {
  params: staffIdParam,
  body: Joi.object({
    documentName: Joi.string().trim().min(1).max(200).required(),
    documentType: Joi.string().trim().min(1).max(50).required(), // e.g., "License", "Certificate", "ID"
    documentNumber: Joi.string().trim().max(100).optional(),
    issueDate: Joi.date().iso().optional(),
    expiryDate: Joi.date().iso().optional(),
    issuingAuthority: Joi.string().trim().max(200).optional(),
    fileUrl: Joi.string().uri().max(500).optional(), // metadata only for now
    notes: Joi.string().trim().max(1000).optional()
  })
};

export const updateDocumentSchema = {
  params: resourceIdParams('documentId'),
  body: Joi.object({
    documentName: Joi.string().trim().min(1).max(200).optional(),
    documentType: Joi.string().trim().min(1).max(50).optional(),
    documentNumber: Joi.string().trim().max(100).optional().allow(''),
    issueDate: Joi.date().iso().optional().allow(null),
    expiryDate: Joi.date().iso().optional().allow(null),
    issuingAuthority: Joi.string().trim().max(200).optional().allow(''),
    fileUrl: Joi.string().uri().max(500).optional().allow(''),
    status: Joi.string().valid(...DOCUMENT_STATUS).optional(),
    notes: Joi.string().trim().max(1000).optional().allow('')
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
    status: Joi.string().valid(...APPROVAL_STATUS).optional(),
    leaveType: Joi.string().valid(...LEAVE_TYPE).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })
};

export const createLeaveSchema = {
  params: staffIdParam,
  body: Joi.object({
    leaveType: Joi.string().valid(...LEAVE_TYPE).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    reason: Joi.string().trim().max(1000).optional()
  })
};

export const updateLeaveSchema = {
  params: resourceIdParams('leaveId'),
  body: Joi.object({
    // Staff can update their own pending requests
    leaveType: Joi.string().valid(...LEAVE_TYPE).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    reason: Joi.string().trim().max(1000).optional().allow(''),
    
    // Manager/Admin approval fields
    status: Joi.string().valid(...APPROVAL_STATUS).optional(),
    reviewNote: Joi.string().trim().max(1000).optional().allow('')
  }).min(1)
};

// ============================================================================
// PERFORMANCE REVIEW SCHEMAS
// ============================================================================

export const listReviewsSchema = {
  params: staffIdParam,
  query: paginationQuery.keys({
    status: Joi.string().valid(...APPROVAL_STATUS).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })
};

export const createReviewSchema = {
  params: staffIdParam,
  body: Joi.object({
    reviewDate: Joi.date().iso().required(),
    overallRating: Joi.number().integer().min(1).max(5).required(),
    strengths: Joi.string().trim().max(2000).optional(),
    improvements: Joi.string().trim().max(2000).optional(),
    goals: Joi.string().trim().max(2000).optional(),
    comments: Joi.string().trim().max(2000).optional()
  })
};

export const updateReviewSchema = {
  params: resourceIdParams('reviewId'),
  body: Joi.object({
    reviewDate: Joi.date().iso().optional(),
    overallRating: Joi.number().integer().min(1).max(5).optional(),
    strengths: Joi.string().trim().max(2000).optional().allow(''),
    improvements: Joi.string().trim().max(2000).optional().allow(''),
    goals: Joi.string().trim().max(2000).optional().allow(''),
    comments: Joi.string().trim().max(2000).optional().allow(''),
    status: Joi.string().valid(...APPROVAL_STATUS).optional()
  }).min(1)
};

// ============================================================================
// TRAINING SCHEMAS
// ============================================================================

export const listTrainingSchema = {
  params: staffIdParam,
  query: paginationQuery.keys({
    expired: Joi.boolean().optional(),
    provider: Joi.string().trim().max(200).optional()
  })
};

export const createTrainingSchema = {
  params: staffIdParam,
  body: Joi.object({
    trainingName: Joi.string().trim().min(1).max(200).required(),
    provider: Joi.string().trim().max(200).optional(),
    completionDate: Joi.date().iso().required(),
    expiryDate: Joi.date().iso().greater(Joi.ref('completionDate')).optional(),
    certificateUrl: Joi.string().uri().max(500).optional(),
    notes: Joi.string().trim().max(1000).optional()
  })
};

export const updateTrainingSchema = {
  params: resourceIdParams('trainingId'),
  body: Joi.object({
    trainingName: Joi.string().trim().min(1).max(200).optional(),
    provider: Joi.string().trim().max(200).optional().allow(''),
    completionDate: Joi.date().iso().optional(),
    expiryDate: Joi.date().iso().optional().allow(null),
    certificateUrl: Joi.string().uri().max(500).optional().allow(''),
    notes: Joi.string().trim().max(1000).optional().allow('')
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