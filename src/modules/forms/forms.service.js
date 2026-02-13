// src/modules/forms/forms.service.js

import * as repo from './forms.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';

const UI_TO_DB_FIELD_TYPE = {
  TEXT: 'TEXT',
  TEXTAREA: 'TEXTAREA',
  NUMBER: 'NUMBER',
  DATE: 'DATE',
  DATETIME: 'TIME',
  SELECT: 'DROPDOWN',
  MULTI_SELECT: 'DROPDOWN',
  CHECKBOX: 'CHECKBOX',
  RADIO: 'RADIO',
  FILE: 'FILE_UPLOAD',
  SIGNATURE: 'SIGNATURE',
  SECTION_HEADER: 'SECTION_HEADER',
};

const DB_TO_UI_FIELD_TYPE = {
  TEXT: 'TEXT',
  TEXTAREA: 'TEXTAREA',
  NUMBER: 'NUMBER',
  DATE: 'DATE',
  TIME: 'DATETIME',
  DROPDOWN: 'SELECT',
  CHECKBOX: 'CHECKBOX',
  RADIO: 'RADIO',
  FILE_UPLOAD: 'FILE',
  SIGNATURE: 'SIGNATURE',
  SECTION_HEADER: 'SECTION_HEADER',
  RATING: 'NUMBER',
};

const UI_TO_DB_SUBMISSION_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'REVIEWED',
  APPROVED: 'APPROVED',
  REJECTED: 'REVIEWED',
  ARCHIVED: 'REVIEWED',
};

const DB_TO_UI_SUBMISSION_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  REVIEWED: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
};

function toDbFieldType(fieldType) {
  return UI_TO_DB_FIELD_TYPE[fieldType] || fieldType;
}

function toUiFieldType(fieldType, validation) {
  if (fieldType === 'DROPDOWN' && validation?.multiple) return 'MULTI_SELECT';
  return DB_TO_UI_FIELD_TYPE[fieldType] || fieldType;
}

function toDbSubmissionStatus(status) {
  return UI_TO_DB_SUBMISSION_STATUS[status] || status;
}

function toUiSubmissionStatus(status) {
  return DB_TO_UI_SUBMISSION_STATUS[status] || status;
}

function normalizeFieldForWrite(field, idx, templateId) {
  const mappedType = toDbFieldType(field.fieldType);
  const isMultiSelect = field.fieldType === 'MULTI_SELECT';

  return {
    ...(templateId ? { templateId } : {}),
    ...field,
    fieldType: mappedType,
    displayOrder: field.displayOrder ?? idx + 1,
    options: Array.isArray(field.options) ? field.options : [],
    validation: isMultiSelect
      ? { ...(field.validation || {}), multiple: true }
      : (field.validation ?? null),
  };
}

function normalizeFieldForRead(field) {
  return {
    ...field,
    fieldType: toUiFieldType(field.fieldType, field.validation),
  };
}

function normalizeTemplateForRead(template) {
  if (!template) return template;
  if (!Array.isArray(template.fields)) return template;
  return {
    ...template,
    fields: template.fields.map(normalizeFieldForRead),
  };
}

function normalizeSubmissionForRead(submission) {
  if (!submission) return submission;
  return {
    ...submission,
    status: toUiSubmissionStatus(submission.status),
  };
}

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
  return normalizeTemplateForRead(template);
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
    const fieldItems = fields.map((field, idx) => normalizeFieldForWrite(field, idx, template.id));
    await repo.createManyFields(fieldItems);
  }

  const createdTemplate = await repo.findTemplateById(template.id, organizationId);
  return normalizeTemplateForRead(createdTemplate);
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
      const fieldItems = fields.map((field, idx) => normalizeFieldForWrite(field, idx, id));
      await repo.createManyFields(fieldItems);
    }
  }

  const updatedTemplate = await repo.updateTemplate(id, templateData);
  return normalizeTemplateForRead(updatedTemplate);
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
  const { page = 1, limit = 20, status, ...rest } = options;
  const normalizedOptions = {
    ...rest,
    page,
    limit,
    ...(status && { status: toDbSubmissionStatus(status) }),
  };
  const { data, total } = await repo.findAllSubmissions(organizationId, normalizedOptions);
  return {
    data: data.map(normalizeSubmissionForRead),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
  };
}

export async function getSubmissionById(organizationId, id) {
  const submission = await repo.findSubmissionById(id);
  if (!submission) throw new NotFoundError('Form submission not found');
  return normalizeSubmissionForRead(submission);
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
    status: toDbSubmissionStatus(data.status || 'SUBMITTED'),
  });
}

export async function updateSubmission(organizationId, id, data) {
  const submission = await repo.findSubmissionById(id);
  if (!submission) throw new NotFoundError('Form submission not found');

  if (submission.status === 'ARCHIVED') {
    throw new BadRequestError('Cannot update an archived submission');
  }

  const updateData = {
    ...data,
    ...(data.status && { status: toDbSubmissionStatus(data.status) }),
  };

  const updated = await repo.updateSubmission(id, updateData);
  return normalizeSubmissionForRead(updated);
}

export default {
  listTemplates, getTemplateById, createTemplate, updateTemplate, archiveTemplate,
  listSubmissions, getSubmissionById, createSubmission, updateSubmission,
};
