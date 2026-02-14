// src/modules/staff/staff.routes.js

import { Router } from 'express';
import * as controller from './staff.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
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
} from './staff.validator.js';

const router = Router();

// ============================================================================
// ORGANIZATION-WIDE LEAVE ROUTES (before :staffId routes)
// ============================================================================

// GET /staff/leave - List all leave requests across organization
router.get(
  '/leave',
  authenticate,
  requirePermission('staff:read'),
  validate(listLeaveSchema),
  controller.listAllLeave
);

// ============================================================================
// CORE STAFF ROUTES
// ============================================================================

// GET /staff - List all staff members
router.get(
  '/',
  authenticate,
  requirePermission('staff:read'),
  validate(listStaffSchema),
  controller.listStaff
);

// POST /staff - Create staff member
router.post(
  '/',
  authenticate,
  requirePermission('staff:write'),
  validate(createStaffSchema),
  controller.createStaff
);

// GET /staff/:staffId - Get staff member by ID
router.get(
  '/:staffId',
  authenticate,
  requirePermission('staff:read'),
  validate(getStaffSchema),
  controller.getStaff
);

// PATCH /staff/:staffId - Update staff member
router.patch(
  '/:staffId',
  authenticate,
  requirePermission('staff:write'),
  validate(updateStaffSchema),
  controller.updateStaff
);

// DELETE /staff/:staffId - Soft delete (terminate) staff member
router.delete(
  '/:staffId',
  authenticate,
  requirePermission('staff:write'),
  validate(deleteStaffSchema),
  controller.deleteStaff
);

// ============================================================================
// SKILLS ROUTES
// ============================================================================

// GET /staff/:staffId/skills - List staff skills
router.get(
  '/:staffId/skills',
  authenticate,
  requirePermission('staff:read'),
  validate(listSkillsSchema),
  controller.listSkills
);

// POST /staff/:staffId/skills - Add skill
router.post(
  '/:staffId/skills',
  authenticate,
  requirePermission('staff:write'),
  validate(createSkillSchema),
  controller.createSkill
);

// PATCH /staff/:staffId/skills/:skillId - Update skill
router.patch(
  '/:staffId/skills/:skillId',
  authenticate,
  requirePermission('staff:write'),
  validate(updateSkillSchema),
  controller.updateSkill
);

// DELETE /staff/:staffId/skills/:skillId - Remove skill
router.delete(
  '/:staffId/skills/:skillId',
  authenticate,
  requirePermission('staff:write'),
  validate(deleteSkillSchema),
  controller.deleteSkill
);

// ============================================================================
// DOCUMENTS ROUTES
// ============================================================================

// GET /staff/:staffId/documents - List staff documents
router.get(
  '/:staffId/documents',
  authenticate,
  requirePermission('staff:read'),
  validate(listDocumentsSchema),
  controller.listDocuments
);

// POST /staff/:staffId/documents - Add document
router.post(
  '/:staffId/documents',
  authenticate,
  requirePermission('staff:write'),
  validate(createDocumentSchema),
  controller.createDocument
);

// PATCH /staff/:staffId/documents/:documentId - Update document
router.patch(
  '/:staffId/documents/:documentId',
  authenticate,
  requirePermission('staff:write'),
  validate(updateDocumentSchema),
  controller.updateDocument
);

// DELETE /staff/:staffId/documents/:documentId - Remove document
router.delete(
  '/:staffId/documents/:documentId',
  authenticate,
  requirePermission('staff:write'),
  validate(deleteDocumentSchema),
  controller.deleteDocument
);

// ============================================================================
// AVAILABILITY ROUTES
// ============================================================================

// GET /staff/:staffId/availability - Get staff availability
router.get(
  '/:staffId/availability',
  authenticate,
  requirePermission('staff:read'),
  validate(getAvailabilitySchema),
  controller.getAvailability
);

// PUT /staff/:staffId/availability - Set/replace full availability
router.put(
  '/:staffId/availability',
  authenticate,
  requirePermission('staff:write'),
  validate(setAvailabilitySchema),
  controller.setAvailability
);

// ============================================================================
// LEAVE ROUTES
// ============================================================================

// GET /staff/:staffId/leave - List leave requests
router.get(
  '/:staffId/leave',
  authenticate,
  requirePermission('staff:read'),
  validate(listLeaveSchema),
  controller.listLeave
);

// POST /staff/:staffId/leave - Create leave request
router.post(
  '/:staffId/leave',
  authenticate,
  requirePermission('staff:write'),
  validate(createLeaveSchema),
  controller.createLeave
);

// PATCH /staff/:staffId/leave/:leaveId - Update leave request (also for approve/reject)
router.patch(
  '/:staffId/leave/:leaveId',
  authenticate,
  requirePermission('staff:write'),
  validate(updateLeaveSchema),
  controller.updateLeave
);

// ============================================================================
// PERFORMANCE REVIEW ROUTES
// ============================================================================

// GET /staff/:staffId/performance-reviews - List reviews
router.get(
  '/:staffId/performance-reviews',
  authenticate,
  requirePermission('staff:read'),
  validate(listReviewsSchema),
  controller.listReviews
);

// POST /staff/:staffId/performance-reviews - Create review
router.post(
  '/:staffId/performance-reviews',
  authenticate,
  requirePermission('staff:write'),
  validate(createReviewSchema),
  controller.createReview
);

// PATCH /staff/:staffId/performance-reviews/:reviewId - Update review
router.patch(
  '/:staffId/performance-reviews/:reviewId',
  authenticate,
  requirePermission('staff:write'),
  validate(updateReviewSchema),
  controller.updateReview
);

// ============================================================================
// TRAINING ROUTES
// ============================================================================

// GET /staff/:staffId/training - List training records
router.get(
  '/:staffId/training',
  authenticate,
  requirePermission('staff:read'),
  validate(listTrainingSchema),
  controller.listTraining
);

// POST /staff/:staffId/training - Add training record
router.post(
  '/:staffId/training',
  authenticate,
  requirePermission('staff:write'),
  validate(createTrainingSchema),
  controller.createTraining
);

// PATCH /staff/:staffId/training/:trainingId - Update training record
router.patch(
  '/:staffId/training/:trainingId',
  authenticate,
  requirePermission('staff:write'),
  validate(updateTrainingSchema),
  controller.updateTraining
);

// DELETE /staff/:staffId/training/:trainingId - Remove training record
router.delete(
  '/:staffId/training/:trainingId',
  authenticate,
  requirePermission('staff:write'),
  validate(deleteTrainingSchema),
  controller.deleteTraining
);

export default router;