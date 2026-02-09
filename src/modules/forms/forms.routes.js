// src/modules/forms/forms.routes.js

import { Router } from 'express';
import * as c from './forms.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as v from './forms.validator.js';

const router = Router();

// Templates
router.get('/templates', authenticate, requirePermission('settings:read'), validate(v.listTemplatesSchema), c.listTemplates);
router.post('/templates', authenticate, requirePermission('settings:write'), validate(v.createTemplateSchema), c.createTemplate);
router.get('/templates/:id', authenticate, requirePermission('settings:read'), validate(v.getTemplateSchema), c.getTemplate);
router.patch('/templates/:id', authenticate, requirePermission('settings:write'), validate(v.updateTemplateSchema), c.updateTemplate);
router.post('/templates/:id/archive', authenticate, requirePermission('settings:write'), validate(v.archiveTemplateSchema), c.archiveTemplate);

// Submissions
router.get('/submissions', authenticate, validate(v.listSubmissionsSchema), c.listSubmissions);
router.post('/submissions', authenticate, validate(v.createSubmissionSchema), c.createSubmission);
router.get('/submissions/:id', authenticate, validate(v.getSubmissionSchema), c.getSubmission);
router.patch('/submissions/:id', authenticate, validate(v.updateSubmissionSchema), c.updateSubmission);

export default router;
