// src/modules/client/client.repository.js

import prisma from '../../config/database.js';

// ============================================================================
// CORE CLIENT CRUD
// ============================================================================

export async function findAll(organizationId, options = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    state,
    hasAgedCare,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const where = {
    organizationId,
    ...(status && { status }),
    ...(state && { state }),
    ...(typeof hasAgedCare === 'boolean' && { hasAgedCare }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { preferredName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { ndisNumber: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        _count: {
          select: {
            fundingSources: true,
            goals: true,
            shifts: true,
            documents: true,
            incidents: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id, organizationId) {
  return prisma.client.findFirst({
    where: { id, organizationId },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, status: true },
      },
      _count: {
        select: {
          fundingSources: true,
          goals: true,
          carePlans: true,
          documents: true,
          familyMembers: true,
          notes: true,
          shifts: true,
          incidents: true,
          assessments: true,
          serviceAgreements: true,
          budgetLines: true,
        },
      },
    },
  });
}

export async function findByNdisNumber(organizationId, ndisNumber) {
  return prisma.client.findFirst({
    where: { organizationId, ndisNumber },
  });
}

export async function findByEmail(organizationId, email) {
  return prisma.client.findFirst({
    where: { organizationId, email },
  });
}

export async function create(data) {
  return prisma.client.create({
    data,
    include: {
      _count: {
        select: {
          fundingSources: true,
          goals: true,
          documents: true,
        },
      },
    },
  });
}

export async function update(id, data) {
  return prisma.client.update({
    where: { id },
    data,
    include: {
      _count: {
        select: {
          fundingSources: true,
          goals: true,
          documents: true,
        },
      },
    },
  });
}

export async function countByOrg(organizationId) {
  return prisma.client.count({
    where: { organizationId, status: { not: 'DISCHARGED' } },
  });
}

// ============================================================================
// FUNDING SOURCES
// ============================================================================

export async function findFundingSources(clientId, options = {}) {
  const { page = 1, limit = 20, fundingType } = options;

  const where = {
    clientId,
    ...(fundingType && { fundingType }),
  };

  const [data, total] = await Promise.all([
    prisma.clientFundingSource.findMany({
      where,
      include: { _count: { select: { budgetLines: true } } },
      orderBy: { startDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clientFundingSource.count({ where }),
  ]);

  return { data, total };
}

export async function findFundingSourceById(id, clientId) {
  return prisma.clientFundingSource.findFirst({
    where: { id, clientId },
    include: { budgetLines: true },
  });
}

export async function createFundingSource(data) {
  return prisma.clientFundingSource.create({ data });
}

export async function updateFundingSource(id, data) {
  return prisma.clientFundingSource.update({ where: { id }, data });
}

export async function deleteFundingSource(id) {
  return prisma.clientFundingSource.delete({ where: { id } });
}

// ============================================================================
// BUDGET LINES
// ============================================================================

export async function findBudgetLines(clientId, options = {}) {
  const { page = 1, limit = 20, fundingSourceId, category } = options;

  const where = {
    clientId,
    ...(fundingSourceId && { fundingSourceId }),
    ...(category && { category }),
  };

  const [data, total] = await Promise.all([
    prisma.clientBudgetLine.findMany({
      where,
      include: {
        fundingSource: { select: { id: true, fundingType: true, planNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clientBudgetLine.count({ where }),
  ]);

  return { data, total };
}

export async function findBudgetLineById(id, clientId) {
  return prisma.clientBudgetLine.findFirst({
    where: { id, clientId },
    include: {
      fundingSource: { select: { id: true, fundingType: true, planNumber: true } },
    },
  });
}

export async function createBudgetLine(data) {
  return prisma.clientBudgetLine.create({
    data,
    include: {
      fundingSource: { select: { id: true, fundingType: true, planNumber: true } },
    },
  });
}

export async function updateBudgetLine(id, data) {
  return prisma.clientBudgetLine.update({
    where: { id },
    data,
    include: {
      fundingSource: { select: { id: true, fundingType: true, planNumber: true } },
    },
  });
}

export async function deleteBudgetLine(id) {
  return prisma.clientBudgetLine.delete({ where: { id } });
}

// ============================================================================
// GOALS
// ============================================================================

export async function findGoals(clientId, options = {}) {
  const { page = 1, limit = 20, status } = options;

  const where = {
    clientId,
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.clientGoal.findMany({
      where,
      include: {
        milestones: { orderBy: { createdAt: 'asc' } },
        _count: { select: { milestones: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clientGoal.count({ where }),
  ]);

  return { data, total };
}

export async function findGoalById(id, clientId) {
  return prisma.clientGoal.findFirst({
    where: { id, clientId },
    include: {
      milestones: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function createGoal(data) {
  return prisma.clientGoal.create({
    data,
    include: { milestones: true },
  });
}

export async function updateGoal(id, data) {
  return prisma.clientGoal.update({
    where: { id },
    data,
    include: {
      milestones: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function deleteGoal(id) {
  return prisma.clientGoal.delete({ where: { id } });
}

// Goal Milestones
export async function createMilestone(data) {
  return prisma.clientGoalMilestone.create({ data });
}

export async function updateMilestone(id, data) {
  return prisma.clientGoalMilestone.update({ where: { id }, data });
}

export async function deleteMilestone(id) {
  return prisma.clientGoalMilestone.delete({ where: { id } });
}

export async function findMilestoneById(id) {
  return prisma.clientGoalMilestone.findUnique({ where: { id } });
}

// ============================================================================
// CARE PLANS
// ============================================================================

export async function findCarePlans(clientId, options = {}) {
  const { page = 1, limit = 20, status } = options;

  const where = {
    clientId,
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.clientCarePlan.findMany({
      where,
      orderBy: { startDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clientCarePlan.count({ where }),
  ]);

  return { data, total };
}

export async function findCarePlanById(id, clientId) {
  return prisma.clientCarePlan.findFirst({
    where: { id, clientId },
  });
}

export async function createCarePlan(data) {
  return prisma.clientCarePlan.create({ data });
}

export async function updateCarePlan(id, data) {
  return prisma.clientCarePlan.update({ where: { id }, data });
}

export async function deleteCarePlan(id) {
  return prisma.clientCarePlan.delete({ where: { id } });
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function findDocuments(clientId, options = {}) {
  const { page = 1, limit = 20, status, documentType } = options;

  const where = {
    clientId,
    ...(status && { status }),
    ...(documentType && { documentType }),
  };

  const [data, total] = await Promise.all([
    prisma.clientDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clientDocument.count({ where }),
  ]);

  return { data, total };
}

export async function findDocumentById(id, clientId) {
  return prisma.clientDocument.findFirst({
    where: { id, clientId },
  });
}

export async function createDocument(data) {
  return prisma.clientDocument.create({ data });
}

export async function updateDocument(id, data) {
  return prisma.clientDocument.update({ where: { id }, data });
}

export async function deleteDocument(id) {
  return prisma.clientDocument.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  });
}

// ============================================================================
// NOTES
// ============================================================================

export async function findNotes(clientId, options = {}) {
  const { page = 1, limit = 20, noteType, isFlagged } = options;

  const where = {
    clientId,
    ...(noteType && { noteType }),
    ...(typeof isFlagged === 'boolean' && { isFlagged }),
  };

  const [data, total] = await Promise.all([
    prisma.clientNote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clientNote.count({ where }),
  ]);

  return { data, total };
}

export async function findNoteById(id, clientId) {
  return prisma.clientNote.findFirst({
    where: { id, clientId },
  });
}

export async function createNote(data) {
  return prisma.clientNote.create({ data });
}

export async function updateNote(id, data) {
  return prisma.clientNote.update({ where: { id }, data });
}

export async function deleteNote(id) {
  return prisma.clientNote.delete({ where: { id } });
}

// ============================================================================
// FAMILY MEMBERS / CONTACTS
// ============================================================================

export async function findFamilyMembers(clientId, options = {}) {
  const { page = 1, limit = 20 } = options;

  const where = { clientId };

  const [data, total] = await Promise.all([
    prisma.clientFamilyMember.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clientFamilyMember.count({ where }),
  ]);

  return { data, total };
}

export async function findFamilyMemberById(id, clientId) {
  return prisma.clientFamilyMember.findFirst({
    where: { id, clientId },
  });
}

export async function createFamilyMember(data) {
  return prisma.clientFamilyMember.create({ data });
}

export async function updateFamilyMember(id, data) {
  return prisma.clientFamilyMember.update({ where: { id }, data });
}

export async function deleteFamilyMember(id) {
  return prisma.clientFamilyMember.delete({ where: { id } });
}

// ============================================================================
// ASSESSMENTS
// ============================================================================

export async function findAssessments(clientId, options = {}) {
  const { page = 1, limit = 20, assessmentType } = options;

  const where = {
    clientId,
    ...(assessmentType && { assessmentType }),
  };

  const [data, total] = await Promise.all([
    prisma.clientAssessment.findMany({
      where,
      orderBy: { assessmentDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clientAssessment.count({ where }),
  ]);

  return { data, total };
}

export async function findAssessmentById(id, clientId) {
  return prisma.clientAssessment.findFirst({
    where: { id, clientId },
  });
}

export async function createAssessment(data) {
  return prisma.clientAssessment.create({ data });
}

export async function updateAssessment(id, data) {
  return prisma.clientAssessment.update({ where: { id }, data });
}

// ============================================================================
// SERVICE AGREEMENTS
// ============================================================================

export async function findServiceAgreements(clientId, options = {}) {
  const { page = 1, limit = 20 } = options;

  const where = { clientId };

  const [data, total] = await Promise.all([
    prisma.clientServiceAgreement.findMany({
      where,
      orderBy: { startDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clientServiceAgreement.count({ where }),
  ]);

  return { data, total };
}

export async function findServiceAgreementById(id, clientId) {
  return prisma.clientServiceAgreement.findFirst({
    where: { id, clientId },
  });
}

export async function createServiceAgreement(data) {
  return prisma.clientServiceAgreement.create({ data });
}

export async function updateServiceAgreement(id, data) {
  return prisma.clientServiceAgreement.update({ where: { id }, data });
}

export default {
  // Core
  findAll,
  findById,
  findByNdisNumber,
  findByEmail,
  create,
  update,
  countByOrg,
  // Funding
  findFundingSources,
  findFundingSourceById,
  createFundingSource,
  updateFundingSource,
  deleteFundingSource,
  // Budget Lines
  findBudgetLines,
  findBudgetLineById,
  createBudgetLine,
  updateBudgetLine,
  deleteBudgetLine,
  // Goals
  findGoals,
  findGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  findMilestoneById,
  // Care Plans
  findCarePlans,
  findCarePlanById,
  createCarePlan,
  updateCarePlan,
  deleteCarePlan,
  // Documents
  findDocuments,
  findDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  // Notes
  findNotes,
  findNoteById,
  createNote,
  updateNote,
  deleteNote,
  // Family
  findFamilyMembers,
  findFamilyMemberById,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  // Assessments
  findAssessments,
  findAssessmentById,
  createAssessment,
  updateAssessment,
  // Service Agreements
  findServiceAgreements,
  findServiceAgreementById,
  createServiceAgreement,
  updateServiceAgreement,
};