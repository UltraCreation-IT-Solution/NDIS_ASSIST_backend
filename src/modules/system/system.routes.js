// src/modules/system/system.routes.js

import { Router } from 'express';
import * as c from './system.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as v from './system.validator.js';

const router = Router();

// Organization Settings
router.get('/settings', authenticate, requirePermission('settings:read'), c.listSettings);
router.get('/settings/:key', authenticate, requirePermission('settings:read'), validate(v.getSettingSchema), c.getSetting);
router.put('/settings', authenticate, requirePermission('settings:write'), validate(v.updateSettingSchema), c.updateSetting);
router.put('/settings/bulk', authenticate, requirePermission('settings:write'), validate(v.updateBulkSettingsSchema), c.updateBulkSettings);
router.delete('/settings/:key', authenticate, requirePermission('settings:write'), validate(v.resetSettingSchema), c.resetSetting);

// Audit Logs (read-only)
router.get('/audit-logs', authenticate, requirePermission('settings:read'), validate(v.listAuditLogsSchema), c.listAuditLogs);

// Activity Logs (read-only)
router.get('/activity-logs', authenticate, requirePermission('settings:read'), validate(v.listActivityLogsSchema), c.listActivityLogs);

// Org Stats
router.get('/stats', authenticate, requirePermission('dashboard:read'), c.getOrgStats);

export default router;
