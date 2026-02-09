// src/modules/documents/documents.routes.js

import { Router } from 'express';
import * as c from './documents.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as v from './documents.validator.js';

const router = Router();

// Categories
router.get('/categories', authenticate, c.listCategories);
router.post('/categories', authenticate, requirePermission('settings:write'), validate(v.createCategorySchema), c.createCategory);
router.patch('/categories/:id', authenticate, requirePermission('settings:write'), validate(v.updateCategorySchema), c.updateCategory);
router.delete('/categories/:id', authenticate, requirePermission('settings:write'), validate(v.deleteCategorySchema), c.deleteCategory);

// Documents
router.get('/', authenticate, validate(v.listDocumentsSchema), c.listDocuments);
router.post('/', authenticate, requirePermission('settings:write'), validate(v.createDocumentSchema), c.createDocument);
router.get('/pending-signatures', authenticate, c.getPendingSignatures);
router.get('/:id', authenticate, validate(v.getDocumentSchema), c.getDocument);
router.patch('/:id', authenticate, requirePermission('settings:write'), validate(v.updateDocumentSchema), c.updateDocument);
router.post('/:id/archive', authenticate, requirePermission('settings:write'), validate(v.archiveDocumentSchema), c.archiveDocument);

// Signatures
router.get('/:id/signatures', authenticate, c.listSignatures);
router.post('/:id/sign', authenticate, validate(v.signDocumentSchema), c.signDocument);

export default router;
