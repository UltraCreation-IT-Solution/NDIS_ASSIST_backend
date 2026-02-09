// src/modules/forms/forms.service.js

import * as repo from './forms.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';

// ============================================================================
// FORM TEMPLATES
// ============================================================================

export async function listTemplates(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findAllTemplates(organizationId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function getTemplateById(organizationId, id) {
  const template = await repo.findTemplateById(id, organizationId);
  if (!template) throw new NotFoundError('Form template not found');
  return template;
}

export async function createTemplate(organizationId, data, userId) {
  const existing = await repo.findTemplateByName(organizationId, data.name);
  if (existing) throw new ConflictError('A form template with this name already exists');

  const { fields, ...templateData } = data;

  const template = await repo.createTemplate({
    organizationId,
    createdById: userId,
    ...templateData,
  });

  // Create fields if provided
  if (fields && fields.length > 0) {
    const fieldItems = fields.map((field, idx) => ({
      templateId: template.id,
      ...field,
      displayOrder: field.displayOrder ?? idx + 1,
    }));
    await repo.createManyFields(fieldItems);
  }

  return repo.findTemplateById(template.id, organizationId);
}

export async function updateTemplate(organizationId, id, data) {
  const template = await repo.findTemplateById(id, organizationId);
  if (!template) throw new NotFoundError('Form template not found');

  if (data.name && data.name !== template.name) {
    const existing = await repo.findTemplateByName(organizationId, data.name);
    if (existing) throw new ConflictError('A form template with this name already exists');
  }

  const { fields, ...templateData } = data;

  // If fields are provided, replace all fields
  if (fields) {
    await repo.deleteFieldsByTemplate(id);
    if (fields.length > 0) {
      const fieldItems = fields.map((field, idx) => ({
        templateId: id,
        ...field,
        displayOrder: field.displayOrder ?? idx + 1,
      }));
      await repo.createManyFields(fieldItems);
    }
  }

  return repo.updateTemplate(id, templateData);
}

export async function archiveTemplate(organizationId, id) {
  const template = await repo.findTemplateById(id, organizationId);
  if (!template) throw new NotFoundError('Form template not found');
  return repo.updateTemplate(id, { isActive: false });
}

// ============================================================================
// FORM SUBMISSIONS
// ============================================================================

export async function listSubmissions(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findAllSubmissions(organizationId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function getSubmissionById(organizationId, id) {
  const submission = await repo.findSubmissionById(id);
  if (!submission) throw new NotFoundError('Form submission not found');
  return submission;
}

export async function createSubmission(organizationId, data, userId) {
  const template = await repo.findTemplateById(data.templateId, organizationId);
  if (!template) throw new NotFoundError('Form template not found');
  if (!template.isActive) throw new BadRequestError('Cannot submit to an archived form template');

  // Validate required fields
  const requiredFields = template.fields.filter((f) => f.isRequired);
  const submittedData = data.data || {};

  for (const field of requiredFields) {
    if (!submittedData[field.fieldName] && submittedData[field.fieldName] !== 0 && submittedData[field.fieldName] !== false) {
      throw new BadRequestError(`Required field "${field.label || field.fieldName}" is missing`);
    }
  }

  return repo.createSubmission({
    templateId: data.templateId,
    submittedById: userId,
    data: submittedData,
    clientId: data.clientId || null,
    staffId: data.staffId || null,
    status: data.status || 'SUBMITTED',
  });
}

export async function updateSubmission(organizationId, id, data) {
  const submission = await repo.findSubmissionById(id);
  if (!submission) throw new NotFoundError('Form submission not found');

  if (submission.status === 'ARCHIVED') {
    throw new BadRequestError('Cannot update an archived submission');
  }

  return repo.updateSubmission(id, data);
}

export default {
  listTemplates, getTemplateById, createTemplate, updateTemplate, archiveTemplate,
  listSubmissions, getSubmissionById, createSubmission, updateSubmission,
};
