// src/modules/client/client.service.js

import * as repo from './client.repository.js';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../../shared/errors/AppError.js';

// ============================================================================
// CORE CLIENT
// ============================================================================

export async function listClients(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const parsedOptions = {
    ...options,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  };
  const { data, total } = await repo.findAll(organizationId, parsedOptions);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function getClientById(organizationId, clientId) {
  const client = await repo.findById(clientId, organizationId);
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  return client;
}

export async function createClient(organizationId, data) {
  // Check NDIS number uniqueness within org
  if (data.ndisNumber) {
    const existing = await repo.findByNdisNumber(organizationId, data.ndisNumber);
    if (existing) {
      throw new ConflictError('A client with this NDIS number already exists in your organization');
    }
  }

  // Check email uniqueness within org (if provided)
  if (data.email) {
    const existingEmail = await repo.findByEmail(organizationId, data.email);
    if (existingEmail) {
      throw new ConflictError('A client with this email already exists in your organization');
    }
  }

  // Validate NDIS plan dates
  if (data.ndisPlanStartDate && data.ndisPlanEndDate) {
    if (new Date(data.ndisPlanEndDate) <= new Date(data.ndisPlanStartDate)) {
      throw new BadRequestError('NDIS plan end date must be after start date');
    }
  }

  // Validate aged care fields
  if (data.hasAgedCare && !data.agedCarePackageLevel) {
    throw new BadRequestError('Aged care package level is required when hasAgedCare is true');
  }

  return repo.create({
    organizationId,
    ...data,
    dateOfBirth: new Date(data.dateOfBirth),
    ...(data.ndisPlanStartDate && { ndisPlanStartDate: new Date(data.ndisPlanStartDate) }),
    ...(data.ndisPlanEndDate && { ndisPlanEndDate: new Date(data.ndisPlanEndDate) }),
    ...(data.onboardedAt && { onboardedAt: new Date(data.onboardedAt) }),
  });
}

export async function updateClient(organizationId, clientId, data) {
  const client = await repo.findById(clientId, organizationId);
  if (!client) {
    throw new NotFoundError('Client not found');
  }

  // Check NDIS number uniqueness if being changed
  if (data.ndisNumber && data.ndisNumber !== client.ndisNumber) {
    const existing = await repo.findByNdisNumber(organizationId, data.ndisNumber);
    if (existing && existing.id !== clientId) {
      throw new ConflictError('A client with this NDIS number already exists');
    }
  }

  // Check email uniqueness if being changed
  if (data.email && data.email !== client.email) {
    const existingEmail = await repo.findByEmail(organizationId, data.email);
    if (existingEmail && existingEmail.id !== clientId) {
      throw new ConflictError('A client with this email already exists');
    }
  }

  // Validate date fields
  const updateData = { ...data };
  if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
  if (data.ndisPlanStartDate) updateData.ndisPlanStartDate = new Date(data.ndisPlanStartDate);
  if (data.ndisPlanEndDate) updateData.ndisPlanEndDate = new Date(data.ndisPlanEndDate);
  if (data.onboardedAt) updateData.onboardedAt = new Date(data.onboardedAt);
  if (data.dischargedAt) updateData.dischargedAt = new Date(data.dischargedAt);

  return repo.update(clientId, updateData);
}

export async function deleteClient(organizationId, clientId) {
  const client = await repo.findById(clientId, organizationId);
  if (!client) {
    throw new NotFoundError('Client not found');
  }

  if (client.status === 'DISCHARGED') {
    throw new BadRequestError('Client is already discharged');
  }

  return repo.update(clientId, {
    status: 'DISCHARGED',
    dischargedAt: new Date(),
  });
}

// ============================================================================
// FUNDING SOURCES
// ============================================================================

export async function listFundingSources(organizationId, clientId, options = {}) {
  const { page = 1, limit = 20 } = options;
  await ensureClientExists(organizationId, clientId);

  const { data, total } = await repo.findFundingSources(clientId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createFundingSource(organizationId, clientId, data) {
  await ensureClientExists(organizationId, clientId);

  if (new Date(data.endDate) <= new Date(data.startDate)) {
    throw new BadRequestError('Funding end date must be after start date');
  }

  const remainingAmount = data.remainingAmount ?? data.totalBudget;

  return repo.createFundingSource({
    clientId,
    ...data,
    remainingAmount,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
  });
}

export async function updateFundingSource(organizationId, clientId, id, data) {
  await ensureClientExists(organizationId, clientId);

  const source = await repo.findFundingSourceById(id, clientId);
  if (!source) {
    throw new NotFoundError('Funding source not found');
  }

  const updateData = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);

  return repo.updateFundingSource(id, updateData);
}

export async function deleteFundingSource(organizationId, clientId, id) {
  await ensureClientExists(organizationId, clientId);

  const source = await repo.findFundingSourceById(id, clientId);
  if (!source) {
    throw new NotFoundError('Funding source not found');
  }

  return repo.deleteFundingSource(id);
}

// ============================================================================
// BUDGET LINES
// ============================================================================

export async function listBudgetLines(organizationId, clientId, options = {}) {
  const { page = 1, limit = 20 } = options;
  await ensureClientExists(organizationId, clientId);

  const { data, total } = await repo.findBudgetLines(clientId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createBudgetLine(organizationId, clientId, data) {
  await ensureClientExists(organizationId, clientId);

  // Verify funding source belongs to this client
  const source = await repo.findFundingSourceById(data.fundingSourceId, clientId);
  if (!source) {
    throw new NotFoundError('Funding source not found for this client');
  }

  const remainingAmount = data.remainingAmount ?? data.allocatedAmount;

  return repo.createBudgetLine({
    clientId,
    ...data,
    remainingAmount,
  });
}

export async function updateBudgetLine(organizationId, clientId, id, data) {
  await ensureClientExists(organizationId, clientId);

  const line = await repo.findBudgetLineById(id, clientId);
  if (!line) {
    throw new NotFoundError('Budget line not found');
  }

  return repo.updateBudgetLine(id, data);
}

export async function deleteBudgetLine(organizationId, clientId, id) {
  await ensureClientExists(organizationId, clientId);

  const line = await repo.findBudgetLineById(id, clientId);
  if (!line) {
    throw new NotFoundError('Budget line not found');
  }

  return repo.deleteBudgetLine(id);
}

// ============================================================================
// GOALS
// ============================================================================

export async function listGoals(organizationId, clientId, options = {}) {
  const { page = 1, limit = 20 } = options;
  await ensureClientExists(organizationId, clientId);

  const { data, total } = await repo.findGoals(clientId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createGoal(organizationId, clientId, data) {
  await ensureClientExists(organizationId, clientId);

  return repo.createGoal({
    clientId,
    ...data,
    ...(data.targetDate && { targetDate: new Date(data.targetDate) }),
  });
}

export async function updateGoal(organizationId, clientId, id, data) {
  await ensureClientExists(organizationId, clientId);

  const goal = await repo.findGoalById(id, clientId);
  if (!goal) {
    throw new NotFoundError('Goal not found');
  }

  const updateData = { ...data };
  if (data.targetDate) updateData.targetDate = new Date(data.targetDate);
  if (data.achievedDate) updateData.achievedDate = new Date(data.achievedDate);

  // Auto-set achievedDate when status changes to ACHIEVED
  if (data.status === 'ACHIEVED' && !data.achievedDate && !goal.achievedDate) {
    updateData.achievedDate = new Date();
    updateData.progressPercentage = 100;
  }

  return repo.updateGoal(id, updateData);
}

export async function deleteGoal(organizationId, clientId, id) {
  await ensureClientExists(organizationId, clientId);

  const goal = await repo.findGoalById(id, clientId);
  if (!goal) {
    throw new NotFoundError('Goal not found');
  }

  return repo.deleteGoal(id);
}

// Goal Milestones

export async function addMilestone(organizationId, clientId, goalId, data) {
  await ensureClientExists(organizationId, clientId);

  const goal = await repo.findGoalById(goalId, clientId);
  if (!goal) {
    throw new NotFoundError('Goal not found');
  }

  return repo.createMilestone({
    goalId,
    ...data,
  });
}

export async function updateMilestone(organizationId, clientId, goalId, milestoneId, data) {
  await ensureClientExists(organizationId, clientId);

  const goal = await repo.findGoalById(goalId, clientId);
  if (!goal) {
    throw new NotFoundError('Goal not found');
  }

  const milestone = await repo.findMilestoneById(milestoneId);
  if (!milestone || milestone.goalId !== goalId) {
    throw new NotFoundError('Milestone not found');
  }

  const updateData = { ...data };
  if (data.isCompleted && !milestone.completedAt) {
    updateData.completedAt = new Date();
  }

  return repo.updateMilestone(milestoneId, updateData);
}

export async function deleteMilestone(organizationId, clientId, goalId, milestoneId) {
  await ensureClientExists(organizationId, clientId);

  const goal = await repo.findGoalById(goalId, clientId);
  if (!goal) {
    throw new NotFoundError('Goal not found');
  }

  const milestone = await repo.findMilestoneById(milestoneId);
  if (!milestone || milestone.goalId !== goalId) {
    throw new NotFoundError('Milestone not found');
  }

  return repo.deleteMilestone(milestoneId);
}

// ============================================================================
// CARE PLANS
// ============================================================================

export async function listCarePlans(organizationId, clientId, options = {}) {
  const { page = 1, limit = 20 } = options;
  await ensureClientExists(organizationId, clientId);

  const { data, total } = await repo.findCarePlans(clientId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createCarePlan(organizationId, clientId, data, userId) {
  await ensureClientExists(organizationId, clientId);

  return repo.createCarePlan({
    clientId,
    ...data,
    createdBy: userId,
    startDate: new Date(data.startDate),
    ...(data.endDate && { endDate: new Date(data.endDate) }),
  });
}

export async function updateCarePlan(organizationId, clientId, id, data) {
  await ensureClientExists(organizationId, clientId);

  const plan = await repo.findCarePlanById(id, clientId);
  if (!plan) {
    throw new NotFoundError('Care plan not found');
  }

  const updateData = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);

  return repo.updateCarePlan(id, updateData);
}

export async function deleteCarePlan(organizationId, clientId, id) {
  await ensureClientExists(organizationId, clientId);

  const plan = await repo.findCarePlanById(id, clientId);
  if (!plan) {
    throw new NotFoundError('Care plan not found');
  }

  return repo.updateCarePlan(id, { status: 'CANCELLED' });
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function listDocuments(organizationId, clientId, options = {}) {
  const { page = 1, limit = 20 } = options;
  await ensureClientExists(organizationId, clientId);

  const { data, total } = await repo.findDocuments(clientId, options);

  // Calculate expiry status for each document
  const enrichedData = data.map(enrichDocumentStatus);

  return {
    data: enrichedData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createDocument(organizationId, clientId, data, uploadedBy) {
  await ensureClientExists(organizationId, clientId);

  return repo.createDocument({
    clientId,
    ...data,
    uploadedBy,
    ...(data.expiryDate && { expiryDate: new Date(data.expiryDate) }),
  });
}

export async function updateDocument(organizationId, clientId, id, data) {
  await ensureClientExists(organizationId, clientId);

  const doc = await repo.findDocumentById(id, clientId);
  if (!doc) {
    throw new NotFoundError('Document not found');
  }

  const updateData = { ...data };
  if (data.expiryDate) updateData.expiryDate = new Date(data.expiryDate);

  return repo.updateDocument(id, updateData);
}

export async function deleteDocument(organizationId, clientId, id) {
  await ensureClientExists(organizationId, clientId);

  const doc = await repo.findDocumentById(id, clientId);
  if (!doc) {
    throw new NotFoundError('Document not found');
  }

  return repo.deleteDocument(id);
}

// ============================================================================
// NOTES
// ============================================================================

export async function listNotes(organizationId, clientId, options = {}) {
  const { page = 1, limit = 20 } = options;
  await ensureClientExists(organizationId, clientId);

  const { data, total } = await repo.findNotes(clientId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createNote(organizationId, clientId, data, authorId) {
  await ensureClientExists(organizationId, clientId);

  return repo.createNote({
    clientId,
    ...data,
    authorId,
  });
}

export async function updateNote(organizationId, clientId, id, data) {
  await ensureClientExists(organizationId, clientId);

  const note = await repo.findNoteById(id, clientId);
  if (!note) {
    throw new NotFoundError('Note not found');
  }

  return repo.updateNote(id, data);
}

export async function deleteNote(organizationId, clientId, id) {
  await ensureClientExists(organizationId, clientId);

  const note = await repo.findNoteById(id, clientId);
  if (!note) {
    throw new NotFoundError('Note not found');
  }

  return repo.deleteNote(id);
}

// ============================================================================
// FAMILY MEMBERS
// ============================================================================

export async function listFamilyMembers(organizationId, clientId, options = {}) {
  const { page = 1, limit = 20 } = options;
  await ensureClientExists(organizationId, clientId);

  const { data, total } = await repo.findFamilyMembers(clientId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createFamilyMember(organizationId, clientId, data) {
  await ensureClientExists(organizationId, clientId);

  return repo.createFamilyMember({
    clientId,
    ...data,
  });
}

export async function updateFamilyMember(organizationId, clientId, id, data) {
  await ensureClientExists(organizationId, clientId);

  const member = await repo.findFamilyMemberById(id, clientId);
  if (!member) {
    throw new NotFoundError('Family member not found');
  }

  return repo.updateFamilyMember(id, data);
}

export async function deleteFamilyMember(organizationId, clientId, id) {
  await ensureClientExists(organizationId, clientId);

  const member = await repo.findFamilyMemberById(id, clientId);
  if (!member) {
    throw new NotFoundError('Family member not found');
  }

  return repo.deleteFamilyMember(id);
}

// ============================================================================
// ASSESSMENTS
// ============================================================================

export async function listAssessments(organizationId, clientId, options = {}) {
  const { page = 1, limit = 20 } = options;
  await ensureClientExists(organizationId, clientId);

  const { data, total } = await repo.findAssessments(clientId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createAssessment(organizationId, clientId, data) {
  await ensureClientExists(organizationId, clientId);

  return repo.createAssessment({
    clientId,
    ...data,
    assessmentDate: new Date(data.assessmentDate),
  });
}

export async function updateAssessment(organizationId, clientId, id, data) {
  await ensureClientExists(organizationId, clientId);

  const assessment = await repo.findAssessmentById(id, clientId);
  if (!assessment) {
    throw new NotFoundError('Assessment not found');
  }

  const updateData = { ...data };
  if (data.assessmentDate) updateData.assessmentDate = new Date(data.assessmentDate);

  return repo.updateAssessment(id, updateData);
}

// ============================================================================
// SERVICE AGREEMENTS
// ============================================================================

export async function listServiceAgreements(organizationId, clientId, options = {}) {
  const { page = 1, limit = 20 } = options;
  await ensureClientExists(organizationId, clientId);

  const { data, total } = await repo.findServiceAgreements(clientId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createServiceAgreement(organizationId, clientId, data) {
  await ensureClientExists(organizationId, clientId);

  return repo.createServiceAgreement({
    clientId,
    ...data,
    startDate: new Date(data.startDate),
    ...(data.endDate && { endDate: new Date(data.endDate) }),
    ...(data.signedAt && { signedAt: new Date(data.signedAt) }),
  });
}

export async function updateServiceAgreement(organizationId, clientId, id, data) {
  await ensureClientExists(organizationId, clientId);

  const agreement = await repo.findServiceAgreementById(id, clientId);
  if (!agreement) {
    throw new NotFoundError('Service agreement not found');
  }

  const updateData = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  if (data.signedAt) updateData.signedAt = new Date(data.signedAt);

  return repo.updateServiceAgreement(id, updateData);
}

// ============================================================================
// HELPERS
// ============================================================================

async function ensureClientExists(organizationId, clientId) {
  const client = await repo.findById(clientId, organizationId);
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  return client;
}

function enrichDocumentStatus(doc) {
  if (!doc.expiryDate) return { ...doc, computedStatus: 'ACTIVE' };

  const now = new Date();
  const expiry = new Date(doc.expiryDate);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  let computedStatus = 'ACTIVE';
  if (expiry < now) {
    computedStatus = 'EXPIRED';
  } else if (expiry <= thirtyDaysFromNow) {
    computedStatus = 'EXPIRING_SOON';
  }

  return { ...doc, computedStatus };
}

export default {
  // Core
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  // Funding
  listFundingSources,
  createFundingSource,
  updateFundingSource,
  deleteFundingSource,
  // Budget Lines
  listBudgetLines,
  createBudgetLine,
  updateBudgetLine,
  deleteBudgetLine,
  // Goals
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  // Care Plans
  listCarePlans,
  createCarePlan,
  updateCarePlan,
  deleteCarePlan,
  // Documents
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  // Notes
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  // Family
  listFamilyMembers,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  // Assessments
  listAssessments,
  createAssessment,
  updateAssessment,
  // Service Agreements
  listServiceAgreements,
  createServiceAgreement,
  updateServiceAgreement,
};