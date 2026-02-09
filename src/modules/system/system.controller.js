// src/modules/system/system.controller.js

import * as service from './system.service.js';
import { success, paginated } from '../../shared/utils/response.util.js';

// Settings
export async function listSettings(req, res) {
  const settings = await service.listSettings(req.organizationId);
  return success(res, settings, 'Settings retrieved');
}

export async function getSetting(req, res) {
  const setting = await service.getSetting(req.organizationId, req.params.key);
  return success(res, setting, 'Setting retrieved');
}

export async function updateSetting(req, res) {
  const setting = await service.updateSetting(req.organizationId, req.body.key, req.body.value, req.userId);
  return success(res, setting, 'Setting updated');
}

export async function updateBulkSettings(req, res) {
  const results = await service.updateBulkSettings(req.organizationId, req.body.settings, req.userId);
  return success(res, results, 'Settings updated');
}

export async function resetSetting(req, res) {
  const setting = await service.resetSetting(req.organizationId, req.params.key);
  return success(res, setting, 'Setting reset to default');
}

// Audit Logs
export async function listAuditLogs(req, res) {
  const result = await service.listAuditLogs(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Audit logs retrieved');
}

// Activity Logs
export async function listActivityLogs(req, res) {
  const result = await service.listActivityLogs(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Activity logs retrieved');
}

// System Health
export async function getOrgStats(req, res) {
  const stats = await service.getOrgStats(req.organizationId);
  return success(res, stats, 'Organization stats retrieved');
}

export default {
  listSettings, getSetting, updateSetting, updateBulkSettings, resetSetting,
  listAuditLogs, listActivityLogs, getOrgStats,
};
