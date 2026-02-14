// src/modules/forms/forms.repository.js

import prisma from '../../config/database.js';

// ============================================================================
// FORM TEMPLATES
// ============================================================================

export async function findAllTemplates(organizationId, options = {}) {
  const { page = 1, limit = 20, search, category, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(typeof isActive === 'boolean' && { isActive }),
    ...(category && { category }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.formTemplate.findMany({
      where,
      include: {
        _count: { select: { fields: true, submissions: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.formTemplate.count({ where }),
  ]);

  return { data, total };
}

export async function findTemplateById(id, organizationId) {
  return prisma.formTemplate.findFirst({
    where: { id, organizationId },
    include: {
      fields: { orderBy: { displayOrder: 'asc' } },
      createdByUser: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { submissions: true } },
    },
  });
}

export async function findTemplateByName(organizationId, name) {
  return prisma.formTemplate.findFirst({
    where: { organizationId, name: { equals: name, mode: 'insensitive' } },
  });
}

export async function createTemplate(data) {
  return prisma.formTemplate.create({
    data,
    include: { fields: true },
  });
}

export async function updateTemplate(id, data) {
  return prisma.formTemplate.update({
    where: { id },
    data,
    include: { fields: { orderBy: { displayOrder: 'asc' } } },
  });
}

// ============================================================================
// FORM FIELDS
// ============================================================================

export async function createField(data) {
  return prisma.formField.create({ data });
}

export async function createManyFields(items) {
  return prisma.formField.createMany({ data: items });
}

export async function updateField(id, data) {
  return prisma.formField.update({ where: { id }, data });
}

export async function deleteField(id) {
  return prisma.formField.delete({ where: { id } });
}

export async function deleteFieldsByTemplate(templateId) {
  return prisma.formField.deleteMany({ where: { templateId } });
}

export async function findFieldById(id) {
  return prisma.formField.findUnique({ where: { id } });
}

// ============================================================================
// FORM SUBMISSIONS
// ============================================================================

export async function findAllSubmissions(organizationId, options = {}) {
  const { page = 1, limit = 20, templateId, status, clientId, staffId, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    template: { organizationId },
    ...(templateId && { templateId }),
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(staffId && { staffId }),
  };

  const [data, total] = await Promise.all([
    prisma.formSubmission.findMany({
      where,
      include: {
        template: { select: { id: true, name: true, category: true } },
        submittedByUser: { select: { id: true, firstName: true, lastName: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.formSubmission.count({ where }),
  ]);

  return { data, total };
}

export async function findSubmissionById(id) {
  return prisma.formSubmission.findUnique({
    where: { id },
    include: {
      template: { select: { id: true, name: true, category: true } },
      submittedByUser: { select: { id: true, firstName: true, lastName: true } },
      client: { select: { id: true, firstName: true, lastName: true } },
      staff: { select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } } },
    },
  });
}

export async function createSubmission(data) {
  return prisma.formSubmission.create({ data });
}

export async function updateSubmission(id, data) {
  return prisma.formSubmission.update({ where: { id }, data });
}

export default {
  findAllTemplates, findTemplateById, findTemplateByName, createTemplate, updateTemplate,
  createField, createManyFields, updateField, deleteField, deleteFieldsByTemplate, findFieldById,
  findAllSubmissions, findSubmissionById, createSubmission, updateSubmission,
};
