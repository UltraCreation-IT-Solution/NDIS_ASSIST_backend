// src/modules/system/system.service.js

import * as repo from './system.repository.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';

// Default org settings
const DEFAULT_SETTINGS = {
  'general.timezone': 'Australia/Sydney',
  'general.dateFormat': 'DD/MM/YYYY',
  'general.timeFormat': '12h',
  'scheduling.defaultShiftHours': '8',
  'scheduling.earlyClockInMinutes': '15',
  'scheduling.geofenceRadiusMeters': '100',
  'billing.gstRate': '0.10',
  'billing.invoiceDueDays': '14',
  'billing.autoGenerateInvoices': 'false',
  'notifications.emailEnabled': 'true',
  'notifications.smsEnabled': 'false',
  'compliance.documentExpiryWarningDays': '30',
};

// ============================================================================
// SETTINGS
// ============================================================================

export async function listSettings(organizationId) {
  const settings = await repo.findAllSettings(organizationId);

  // Merge with defaults for any missing keys
  const settingsMap = {};
  for (const s of settings) settingsMap[s.key] = s.value;
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (!(key in settingsMap)) settingsMap[key] = value;
  }

  return settingsMap;
}

export async function getSetting(organizationId, key) {
  const setting = await repo.findSettingByKey(organizationId, key);
  if (!setting) {
    if (key in DEFAULT_SETTINGS) return { key, value: DEFAULT_SETTINGS[key], isDefault: true };
    throw new NotFoundError('Setting not found');
  }
  return setting;
}

export async function updateSetting(organizationId, key, value, userId) {
  return repo.upsertSetting(organizationId, key, value, userId);
}

export async function updateBulkSettings(organizationId, settings, userId) {
  const results = [];
  for (const [key, value] of Object.entries(settings)) {
    const result = await repo.upsertSetting(organizationId, key, String(value), userId);
    results.push(result);
  }
  return results;
}

export async function resetSetting(organizationId, key) {
  const setting = await repo.findSettingByKey(organizationId, key);
  if (setting) await repo.deleteSetting(organizationId, key);
  return { key, value: DEFAULT_SETTINGS[key] || null, isDefault: true };
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function listAuditLogs(organizationId, options = {}) {
  const page = Number.parseInt(options.page, 10) || 1;
  const limit = Number.parseInt(options.limit, 10) || 20;
  const { data, total } = await repo.findAllAuditLogs(organizationId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

// Helper used by other services to log actions
export async function logAudit(organizationId, data) {
  return repo.createAuditLog({
    organizationId,
    ...data,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  });
}

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export async function listActivityLogs(organizationId, options = {}) {
  const page = Number.parseInt(options.page, 10) || 1;
  const limit = Number.parseInt(options.limit, 10) || 20;
  const { data, total } = await repo.findAllActivityLogs(organizationId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

// Helper used by middleware/other services
export async function logActivity(organizationId, data) {
  return repo.createActivityLog({ organizationId, ...data });
}

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

export async function getOrgStats(organizationId) {
  return repo.getOrgStats(organizationId);
}

export default {
  listSettings, getSetting, updateSetting, updateBulkSettings, resetSetting,
  listAuditLogs, logAudit,
  listActivityLogs, logActivity,
  getOrgStats,
};
