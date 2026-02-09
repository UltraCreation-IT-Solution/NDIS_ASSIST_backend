// src/modules/forms/forms.controller.js

import * as service from './forms.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

// Templates
export async function listTemplates(req, res) {
  const result = await service.listTemplates(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Form templates retrieved');
}

export async function getTemplate(req, res) {
  const template = await service.getTemplateById(req.organizationId, req.params.id);
  return success(res, template, 'Form template retrieved');
}

export async function createTemplate(req, res) {
  const template = await service.createTemplate(req.organizationId, req.body, req.userId);
  return created(res, template, 'Form template created');
}

export async function updateTemplate(req, res) {
  const template = await service.updateTemplate(req.organizationId, req.params.id, req.body);
  return success(res, template, 'Form template updated');
}

export async function archiveTemplate(req, res) {
  const template = await service.archiveTemplate(req.organizationId, req.params.id);
  return success(res, template, 'Form template archived');
}

// Submissions
export async function listSubmissions(req, res) {
  const result = await service.listSubmissions(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Form submissions retrieved');
}

export async function getSubmission(req, res) {
  const submission = await service.getSubmissionById(req.organizationId, req.params.id);
  return success(res, submission, 'Form submission retrieved');
}

export async function createSubmission(req, res) {
  const submission = await service.createSubmission(req.organizationId, req.body, req.userId);
  return created(res, submission, 'Form submission created');
}

export async function updateSubmission(req, res) {
  const submission = await service.updateSubmission(req.organizationId, req.params.id, req.body);
  return success(res, submission, 'Form submission updated');
}

export default {
  listTemplates, getTemplate, createTemplate, updateTemplate, archiveTemplate,
  listSubmissions, getSubmission, createSubmission, updateSubmission,
};
