// src/modules/staff/staff.controller.js

import * as service from './staff.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

// ============================================================================
// CORE STAFF CONTROLLERS
// ============================================================================

export async function listStaff(req, res) {
  const result = await service.listStaff(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Staff members retrieved');
}

export async function getStaff(req, res) {
  const staff = await service.getStaffById(req.organizationId, req.params.staffId);
  return success(res, staff, 'Staff member retrieved');
}

export async function createStaff(req, res) {
  const staff = await service.createStaff(req.organizationId, req.body);
  return created(res, staff, 'Staff member created');
}

export async function updateStaff(req, res) {
  const staff = await service.updateStaff(req.organizationId, req.params.staffId, req.body);
  return success(res, staff, 'Staff member updated');
}

export async function deleteStaff(req, res) {
  const staff = await service.deleteStaff(req.organizationId, req.params.staffId);
  return success(res, staff, 'Staff member terminated');
}

// ============================================================================
// SKILLS CONTROLLERS
// ============================================================================

export async function listSkills(req, res) {
  const result = await service.listSkills(req.organizationId, req.params.staffId, req.query);
  return paginated(res, result.data, result.pagination, 'Skills retrieved');
}

export async function createSkill(req, res) {
  const skill = await service.createSkill(req.organizationId, req.params.staffId, req.body);
  return created(res, skill, 'Skill added');
}

export async function updateSkill(req, res) {
  const skill = await service.updateSkill(
    req.organizationId, 
    req.params.staffId, 
    req.params.skillId, 
    req.body
  );
  return success(res, skill, 'Skill updated');
}

export async function deleteSkill(req, res) {
  await service.deleteSkill(req.organizationId, req.params.staffId, req.params.skillId);
  return success(res, null, 'Skill removed');
}

// ============================================================================
// DOCUMENTS CONTROLLERS
// ============================================================================

export async function listDocuments(req, res) {
  const result = await service.listDocuments(req.organizationId, req.params.staffId, req.query);
  return paginated(res, result.data, result.pagination, 'Documents retrieved');
}

export async function createDocument(req, res) {
  const document = await service.createDocument(req.organizationId, req.params.staffId, req.body);
  return created(res, document, 'Document added');
}

export async function updateDocument(req, res) {
  const document = await service.updateDocument(
    req.organizationId, 
    req.params.staffId, 
    req.params.documentId, 
    req.body
  );
  return success(res, document, 'Document updated');
}

export async function deleteDocument(req, res) {
  await service.deleteDocument(req.organizationId, req.params.staffId, req.params.documentId);
  return success(res, null, 'Document removed');
}

// ============================================================================
// AVAILABILITY CONTROLLERS
// ============================================================================

export async function getAvailability(req, res) {
  const availability = await service.getAvailability(req.organizationId, req.params.staffId);
  return success(res, availability, 'Availability retrieved');
}

export async function setAvailability(req, res) {
  const availability = await service.setAvailability(req.organizationId, req.params.staffId, req.body);
  return success(res, availability, 'Availability updated');
}

// ============================================================================
// LEAVE CONTROLLERS
// ============================================================================

export async function listLeave(req, res) {
  const result = await service.listLeave(req.organizationId, req.params.staffId, req.query);
  return paginated(res, result.data, result.pagination, 'Leave requests retrieved');
}

export async function createLeave(req, res) {
  const leave = await service.createLeave(req.organizationId, req.params.staffId, req.body);
  return created(res, leave, 'Leave request created');
}

export async function updateLeave(req, res) {
  const leave = await service.updateLeave(
    req.organizationId, 
    req.params.staffId, 
    req.params.leaveId, 
    req.body,
    req.userId // For tracking who approved/rejected
  );
  return success(res, leave, 'Leave request updated');
}

// ============================================================================
// PERFORMANCE REVIEW CONTROLLERS
// ============================================================================

export async function listReviews(req, res) {
  const result = await service.listReviews(req.organizationId, req.params.staffId, req.query);
  return paginated(res, result.data, result.pagination, 'Performance reviews retrieved');
}

export async function createReview(req, res) {
  const review = await service.createReview(
    req.organizationId, 
    req.params.staffId, 
    req.body,
    req.userId // The reviewer
  );
  return created(res, review, 'Performance review created');
}

export async function updateReview(req, res) {
  const review = await service.updateReview(
    req.organizationId, 
    req.params.staffId, 
    req.params.reviewId, 
    req.body
  );
  return success(res, review, 'Performance review updated');
}

// ============================================================================
// TRAINING CONTROLLERS
// ============================================================================

export async function listTraining(req, res) {
  const result = await service.listTraining(req.organizationId, req.params.staffId, req.query);
  return paginated(res, result.data, result.pagination, 'Training records retrieved');
}

export async function createTraining(req, res) {
  const training = await service.createTraining(req.organizationId, req.params.staffId, req.body);
  return created(res, training, 'Training record added');
}

export async function updateTraining(req, res) {
  const training = await service.updateTraining(
    req.organizationId, 
    req.params.staffId, 
    req.params.trainingId, 
    req.body
  );
  return success(res, training, 'Training record updated');
}

export async function deleteTraining(req, res) {
  await service.deleteTraining(req.organizationId, req.params.staffId, req.params.trainingId);
  return success(res, null, 'Training record removed');
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Core Staff
  listStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  
  // Skills
  listSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  
  // Documents
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  
  // Availability
  getAvailability,
  setAvailability,
  
  // Leave
  listLeave,
  createLeave,
  updateLeave,
  
  // Performance Reviews
  listReviews,
  createReview,
  updateReview,
  
  // Training
  listTraining,
  createTraining,
  updateTraining,
  deleteTraining
};