/**
 * Organization Controller
 * ========================
 * 
 * HTTP handlers for Organization module
 */

import * as orgService from './organization.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

export async function list(req, res) {
  const result = await orgService.listOrganizations(req.query);
  return paginated(res, result.data, result.pagination, 'Organizations retrieved successfully');
}

export async function getById(req, res) {
  const { id } = req.params;
  const organization = await orgService.getOrganization(id);
  return success(res, organization, 'Organization retrieved successfully');
}

export async function getStats(req, res) {
  const stats = await orgService.getOrganizationStats();
  return success(res, stats, 'Organization stats retrieved successfully');
}

export async function create(req, res) {
  const organization = await orgService.createOrganization(req.body);
  return created(res, organization, 'Organization created successfully');
}

export async function update(req, res) {
  const { id } = req.params;
  const organization = await orgService.updateOrganization(id, req.body);
  return success(res, organization, 'Organization updated successfully');
}

export async function suspend(req, res) {
  const { id } = req.params;
  const { reason } = req.body;
  const organization = await orgService.suspendOrganization(id, reason);
  return success(res, organization, 'Organization suspended successfully');
}

export async function activate(req, res) {
  const { id } = req.params;
  const organization = await orgService.activateOrganization(id);
  return success(res, organization, 'Organization activated successfully');
}

export async function deactivate(req, res) {
  const { id } = req.params;
  const organization = await orgService.deactivateOrganization(id);
  return success(res, organization, 'Organization deactivated successfully');
}

export default {
  list,
  getById,
  getStats,
  create,
  update,
  suspend,
  activate,
  deactivate,
};