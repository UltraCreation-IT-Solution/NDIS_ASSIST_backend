// src/modules/client/client.routes.js

import { Router } from 'express';
import * as controller from './client.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
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
} from './client.validator.js';

const router = Router();

// ============================================================================
// CORE CLIENT CRUD
// ============================================================================

router.get(
  '/',
  authenticate,
  requirePermission('client:read'),
  validate(listClientsSchema),
  controller.list
);

router.post(
  '/',
  authenticate,
  requirePermission('client:write'),
  validate(createClientSchema),
  controller.create
);

router.get(
  '/:clientId',
  authenticate,
  requirePermission('client:read'),
  validate(getClientSchema),
  controller.getById
);

router.patch(
  '/:clientId',
  authenticate,
  requirePermission('client:write'),
  validate(updateClientSchema),
  controller.update
);

router.delete(
  '/:clientId',
  authenticate,
  requirePermission('client:write'),
  validate(deleteClientSchema),
  controller.remove
);

// ============================================================================
// FUNDING SOURCES — /clients/:clientId/funding
// ============================================================================

router.get(
  '/:clientId/funding',
  authenticate,
  requirePermission('client:read'),
  validate(listFundingSchema),
  controller.listFunding
);

router.post(
  '/:clientId/funding',
  authenticate,
  requirePermission('client:write'),
  validate(createFundingSchema),
  controller.createFunding
);

router.patch(
  '/:clientId/funding/:id',
  authenticate,
  requirePermission('client:write'),
  validate(updateFundingSchema),
  controller.updateFunding
);

router.delete(
  '/:clientId/funding/:id',
  authenticate,
  requirePermission('client:write'),
  validate(deleteFundingSchema),
  controller.removeFunding
);

// ============================================================================
// BUDGET LINES — /clients/:clientId/budget-lines
// ============================================================================

router.get(
  '/:clientId/budget-lines',
  authenticate,
  requirePermission('client:read'),
  validate(listBudgetLinesSchema),
  controller.listBudgetLines
);

router.post(
  '/:clientId/budget-lines',
  authenticate,
  requirePermission('client:write'),
  validate(createBudgetLineSchema),
  controller.createBudgetLine
);

router.patch(
  '/:clientId/budget-lines/:id',
  authenticate,
  requirePermission('client:write'),
  validate(updateBudgetLineSchema),
  controller.updateBudgetLine
);

router.delete(
  '/:clientId/budget-lines/:id',
  authenticate,
  requirePermission('client:write'),
  validate(deleteBudgetLineSchema),
  controller.removeBudgetLine
);

// ============================================================================
// GOALS — /clients/:clientId/goals
// ============================================================================

router.get(
  '/:clientId/goals',
  authenticate,
  requirePermission('client:read'),
  validate(listGoalsSchema),
  controller.listGoals
);

router.post(
  '/:clientId/goals',
  authenticate,
  requirePermission('client:write'),
  validate(createGoalSchema),
  controller.createGoal
);

router.patch(
  '/:clientId/goals/:id',
  authenticate,
  requirePermission('client:write'),
  validate(updateGoalSchema),
  controller.updateGoal
);

router.delete(
  '/:clientId/goals/:id',
  authenticate,
  requirePermission('client:write'),
  validate(deleteGoalSchema),
  controller.removeGoal
);

// Goal Milestones — /clients/:clientId/goals/:goalId/milestones

router.post(
  '/:clientId/goals/:goalId/milestones',
  authenticate,
  requirePermission('client:write'),
  validate(addMilestoneSchema),
  controller.addMilestone
);

router.patch(
  '/:clientId/goals/:goalId/milestones/:id',
  authenticate,
  requirePermission('client:write'),
  validate(updateMilestoneSchema),
  controller.updateMilestone
);

router.delete(
  '/:clientId/goals/:goalId/milestones/:id',
  authenticate,
  requirePermission('client:write'),
  validate(deleteMilestoneSchema),
  controller.removeMilestone
);

// ============================================================================
// CARE PLANS — /clients/:clientId/care-plans
// ============================================================================

router.get(
  '/:clientId/care-plans',
  authenticate,
  requirePermission('client:read'),
  validate(listCarePlansSchema),
  controller.listCarePlans
);

router.post(
  '/:clientId/care-plans',
  authenticate,
  requirePermission('client:write'),
  validate(createCarePlanSchema),
  controller.createCarePlan
);

router.patch(
  '/:clientId/care-plans/:id',
  authenticate,
  requirePermission('client:write'),
  validate(updateCarePlanSchema),
  controller.updateCarePlan
);

router.delete(
  '/:clientId/care-plans/:id',
  authenticate,
  requirePermission('client:write'),
  validate(deleteCarePlanSchema),
  controller.removeCarePlan
);

// ============================================================================
// DOCUMENTS — /clients/:clientId/documents
// ============================================================================

router.get(
  '/:clientId/documents',
  authenticate,
  requirePermission('client:read'),
  validate(listDocumentsSchema),
  controller.listDocuments
);

router.post(
  '/:clientId/documents',
  authenticate,
  requirePermission('client:write'),
  validate(createDocumentSchema),
  controller.createDocument
);

router.patch(
  '/:clientId/documents/:id',
  authenticate,
  requirePermission('client:write'),
  validate(updateDocumentSchema),
  controller.updateDocument
);

router.delete(
  '/:clientId/documents/:id',
  authenticate,
  requirePermission('client:write'),
  validate(deleteDocumentSchema),
  controller.removeDocument
);

// ============================================================================
// NOTES — /clients/:clientId/notes
// ============================================================================

router.get(
  '/:clientId/notes',
  authenticate,
  requirePermission('client:read'),
  validate(listNotesSchema),
  controller.listNotes
);

router.post(
  '/:clientId/notes',
  authenticate,
  requirePermission('client:write'),
  validate(createNoteSchema),
  controller.createNote
);

router.patch(
  '/:clientId/notes/:id',
  authenticate,
  requirePermission('client:write'),
  validate(updateNoteSchema),
  controller.updateNote
);

router.delete(
  '/:clientId/notes/:id',
  authenticate,
  requirePermission('client:write'),
  validate(deleteNoteSchema),
  controller.removeNote
);

// ============================================================================
// FAMILY MEMBERS — /clients/:clientId/family
// ============================================================================

router.get(
  '/:clientId/family',
  authenticate,
  requirePermission('client:read'),
  validate(listFamilySchema),
  controller.listFamily
);

router.post(
  '/:clientId/family',
  authenticate,
  requirePermission('client:write'),
  validate(createFamilySchema),
  controller.createFamily
);

router.patch(
  '/:clientId/family/:id',
  authenticate,
  requirePermission('client:write'),
  validate(updateFamilySchema),
  controller.updateFamily
);

router.delete(
  '/:clientId/family/:id',
  authenticate,
  requirePermission('client:write'),
  validate(deleteFamilySchema),
  controller.removeFamily
);

// ============================================================================
// ASSESSMENTS — /clients/:clientId/assessments
// ============================================================================

router.get(
  '/:clientId/assessments',
  authenticate,
  requirePermission('client:read'),
  validate(listAssessmentsSchema),
  controller.listAssessments
);

router.post(
  '/:clientId/assessments',
  authenticate,
  requirePermission('client:write'),
  validate(createAssessmentSchema),
  controller.createAssessment
);

router.patch(
  '/:clientId/assessments/:id',
  authenticate,
  requirePermission('client:write'),
  validate(updateAssessmentSchema),
  controller.updateAssessment
);

// ============================================================================
// SERVICE AGREEMENTS — /clients/:clientId/service-agreements
// ============================================================================

router.get(
  '/:clientId/service-agreements',
  authenticate,
  requirePermission('client:read'),
  validate(listAgreementsSchema),
  controller.listAgreements
);

router.post(
  '/:clientId/service-agreements',
  authenticate,
  requirePermission('client:write'),
  validate(createAgreementSchema),
  controller.createAgreement
);

router.patch(
  '/:clientId/service-agreements/:id',
  authenticate,
  requirePermission('client:write'),
  validate(updateAgreementSchema),
  controller.updateAgreement
);

export default router;