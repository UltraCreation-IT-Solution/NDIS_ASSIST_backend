/**
 * Shift Template Controller
 * =========================
 * HTTP handlers for shift template endpoints
 */

import * as service from './shiftTemplate.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

/**
 * List shift templates
 * GET /api/v1/shift-templates
 */
export async function list(req, res) {
  const result = await service.listTemplates(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Shift templates retrieved');
}

/**
 * Get template statistics
 * GET /api/v1/shift-templates/stats
 */
export async function getStats(req, res) {
  const stats = await service.getStats(req.organizationId);
  return success(res, stats, 'Template statistics retrieved');
}

/**
 * Get template by ID
 * GET /api/v1/shift-templates/:id
 */
export async function getById(req, res) {
  const template = await service.getTemplateById(req.organizationId, req.params.id);
  return success(res, template, 'Shift template retrieved');
}

/**
 * Create template
 * POST /api/v1/shift-templates
 */
export async function create(req, res) {
  const template = await service.createTemplate(req.organizationId, req.body);
  return created(res, template, 'Shift template created');
}

/**
 * Update template
 * PATCH /api/v1/shift-templates/:id
 */
export async function update(req, res) {
  const template = await service.updateTemplate(
    req.organizationId,
    req.params.id,
    req.body
  );
  return success(res, template, 'Shift template updated');
}

/**
 * Delete template
 * DELETE /api/v1/shift-templates/:id
 */
export async function remove(req, res) {
  const result = await service.deleteTemplate(
    req.organizationId,
    req.params.id,
    req.query.hard === 'true'
  );
  return success(res, result, 'Shift template deleted');
}

/**
 * Toggle default status
 * POST /api/v1/shift-templates/:id/toggle-default
 */
export async function toggleDefault(req, res) {
  const template = await service.toggleDefault(req.organizationId, req.params.id);
  return success(res, template, 'Template default status toggled');
}

/**
 * Record usage
 * POST /api/v1/shift-templates/:id/use
 */
export async function recordUsage(req, res) {
  const template = await service.recordUsage(req.params.id);
  return success(res, template, 'Template usage recorded');
}

export default {
  list,
  getStats,
  getById,
  create,
  update,
  remove,
  toggleDefault,
  recordUsage,
};
