// src/modules/client/client.controller.js

import * as service from './client.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

// ============================================================================
// CORE CLIENT
// ============================================================================

export async function list(req, res) {
  const result = await service.listClients(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Clients retrieved');
}

export async function getById(req, res) {
  const client = await service.getClientById(req.organizationId, req.params.clientId);
  return success(res, client, 'Client retrieved');
}

export async function create(req, res) {
  const client = await service.createClient(req.organizationId, req.body);
  return created(res, client, 'Client created');
}

export async function update(req, res) {
  const client = await service.updateClient(req.organizationId, req.params.clientId, req.body);
  return success(res, client, 'Client updated');
}

export async function remove(req, res) {
  await service.deleteClient(req.organizationId, req.params.clientId);
  return success(res, null, 'Client discharged');
}

// ============================================================================
// FUNDING SOURCES
// ============================================================================

export async function listFunding(req, res) {
  const result = await service.listFundingSources(req.organizationId, req.params.clientId, req.query);
  return paginated(res, result.data, result.pagination, 'Funding sources retrieved');
}

export async function createFunding(req, res) {
  const source = await service.createFundingSource(req.organizationId, req.params.clientId, req.body);
  return created(res, source, 'Funding source added');
}

export async function updateFunding(req, res) {
  const source = await service.updateFundingSource(req.organizationId, req.params.clientId, req.params.id, req.body);
  return success(res, source, 'Funding source updated');
}

export async function removeFunding(req, res) {
  await service.deleteFundingSource(req.organizationId, req.params.clientId, req.params.id);
  return success(res, null, 'Funding source removed');
}

// ============================================================================
// BUDGET LINES
// ============================================================================

export async function listBudgetLines(req, res) {
  const result = await service.listBudgetLines(req.organizationId, req.params.clientId, req.query);
  return paginated(res, result.data, result.pagination, 'Budget lines retrieved');
}

export async function createBudgetLine(req, res) {
  const line = await service.createBudgetLine(req.organizationId, req.params.clientId, req.body);
  return created(res, line, 'Budget line added');
}

export async function updateBudgetLine(req, res) {
  const line = await service.updateBudgetLine(req.organizationId, req.params.clientId, req.params.id, req.body);
  return success(res, line, 'Budget line updated');
}

export async function removeBudgetLine(req, res) {
  await service.deleteBudgetLine(req.organizationId, req.params.clientId, req.params.id);
  return success(res, null, 'Budget line removed');
}

// ============================================================================
// GOALS
// ============================================================================

export async function listGoals(req, res) {
  const result = await service.listGoals(req.organizationId, req.params.clientId, req.query);
  return paginated(res, result.data, result.pagination, 'Goals retrieved');
}

export async function createGoal(req, res) {
  const goal = await service.createGoal(req.organizationId, req.params.clientId, req.body);
  return created(res, goal, 'Goal created');
}

export async function updateGoal(req, res) {
  const goal = await service.updateGoal(req.organizationId, req.params.clientId, req.params.id, req.body);
  return success(res, goal, 'Goal updated');
}

export async function removeGoal(req, res) {
  await service.deleteGoal(req.organizationId, req.params.clientId, req.params.id);
  return success(res, null, 'Goal removed');
}

// Goal Milestones

export async function addMilestone(req, res) {
  const milestone = await service.addMilestone(req.organizationId, req.params.clientId, req.params.goalId, req.body);
  return created(res, milestone, 'Milestone added');
}

export async function updateMilestone(req, res) {
  const milestone = await service.updateMilestone(req.organizationId, req.params.clientId, req.params.goalId, req.params.id, req.body);
  return success(res, milestone, 'Milestone updated');
}

export async function removeMilestone(req, res) {
  await service.deleteMilestone(req.organizationId, req.params.clientId, req.params.goalId, req.params.id);
  return success(res, null, 'Milestone removed');
}

// ============================================================================
// CARE PLANS
// ============================================================================

export async function listCarePlans(req, res) {
  const result = await service.listCarePlans(req.organizationId, req.params.clientId, req.query);
  return paginated(res, result.data, result.pagination, 'Care plans retrieved');
}

export async function createCarePlan(req, res) {
  const plan = await service.createCarePlan(req.organizationId, req.params.clientId, req.body, req.userId);
  return created(res, plan, 'Care plan created');
}

export async function updateCarePlan(req, res) {
  const plan = await service.updateCarePlan(req.organizationId, req.params.clientId, req.params.id, req.body);
  return success(res, plan, 'Care plan updated');
}

export async function removeCarePlan(req, res) {
  await service.deleteCarePlan(req.organizationId, req.params.clientId, req.params.id);
  return success(res, null, 'Care plan cancelled');
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function listDocuments(req, res) {
  const result = await service.listDocuments(req.organizationId, req.params.clientId, req.query);
  return paginated(res, result.data, result.pagination, 'Documents retrieved');
}

export async function createDocument(req, res) {
  const doc = await service.createDocument(req.organizationId, req.params.clientId, req.body, req.userId);
  return created(res, doc, 'Document added');
}

export async function updateDocument(req, res) {
  const doc = await service.updateDocument(req.organizationId, req.params.clientId, req.params.id, req.body);
  return success(res, doc, 'Document updated');
}

export async function removeDocument(req, res) {
  await service.deleteDocument(req.organizationId, req.params.clientId, req.params.id);
  return success(res, null, 'Document archived');
}

// ============================================================================
// NOTES
// ============================================================================

export async function listNotes(req, res) {
  const result = await service.listNotes(req.organizationId, req.params.clientId, req.query);
  return paginated(res, result.data, result.pagination, 'Notes retrieved');
}

export async function createNote(req, res) {
  const note = await service.createNote(req.organizationId, req.params.clientId, req.body, req.userId);
  return created(res, note, 'Note added');
}

export async function updateNote(req, res) {
  const note = await service.updateNote(req.organizationId, req.params.clientId, req.params.id, req.body);
  return success(res, note, 'Note updated');
}

export async function removeNote(req, res) {
  await service.deleteNote(req.organizationId, req.params.clientId, req.params.id);
  return success(res, null, 'Note removed');
}

// ============================================================================
// FAMILY MEMBERS
// ============================================================================

export async function listFamily(req, res) {
  const result = await service.listFamilyMembers(req.organizationId, req.params.clientId, req.query);
  return paginated(res, result.data, result.pagination, 'Family members retrieved');
}

export async function createFamily(req, res) {
  const member = await service.createFamilyMember(req.organizationId, req.params.clientId, req.body);
  return created(res, member, 'Family member added');
}

export async function updateFamily(req, res) {
  const member = await service.updateFamilyMember(req.organizationId, req.params.clientId, req.params.id, req.body);
  return success(res, member, 'Family member updated');
}

export async function removeFamily(req, res) {
  await service.deleteFamilyMember(req.organizationId, req.params.clientId, req.params.id);
  return success(res, null, 'Family member removed');
}

// ============================================================================
// ASSESSMENTS
// ============================================================================

export async function listAssessments(req, res) {
  const result = await service.listAssessments(req.organizationId, req.params.clientId, req.query);
  return paginated(res, result.data, result.pagination, 'Assessments retrieved');
}

export async function createAssessment(req, res) {
  const assessment = await service.createAssessment(req.organizationId, req.params.clientId, req.body);
  return created(res, assessment, 'Assessment created');
}

export async function updateAssessment(req, res) {
  const assessment = await service.updateAssessment(req.organizationId, req.params.clientId, req.params.id, req.body);
  return success(res, assessment, 'Assessment updated');
}

// ============================================================================
// SERVICE AGREEMENTS
// ============================================================================

export async function listAgreements(req, res) {
  const result = await service.listServiceAgreements(req.organizationId, req.params.clientId, req.query);
  return paginated(res, result.data, result.pagination, 'Service agreements retrieved');
}

export async function createAgreement(req, res) {
  const agreement = await service.createServiceAgreement(req.organizationId, req.params.clientId, req.body);
  return created(res, agreement, 'Service agreement created');
}

export async function updateAgreement(req, res) {
  const agreement = await service.updateServiceAgreement(req.organizationId, req.params.clientId, req.params.id, req.body);
  return success(res, agreement, 'Service agreement updated');
}

export default {
  list,
  getById,
  create,
  update,
  remove,
  listFunding,
  createFunding,
  updateFunding,
  removeFunding,
  listBudgetLines,
  createBudgetLine,
  updateBudgetLine,
  removeBudgetLine,
  listGoals,
  createGoal,
  updateGoal,
  removeGoal,
  addMilestone,
  updateMilestone,
  removeMilestone,
  listCarePlans,
  createCarePlan,
  updateCarePlan,
  removeCarePlan,
  listDocuments,
  createDocument,
  updateDocument,
  removeDocument,
  listNotes,
  createNote,
  updateNote,
  removeNote,
  listFamily,
  createFamily,
  updateFamily,
  removeFamily,
  listAssessments,
  createAssessment,
  updateAssessment,
  listAgreements,
  createAgreement,
  updateAgreement,
};