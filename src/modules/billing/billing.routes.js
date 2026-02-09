// src/modules/billing/billing.routes.js

import { Router } from 'express';
import * as c from './billing.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as v from './billing.validator.js';

const router = Router();

// Invoices
router.get('/invoices', authenticate, requirePermission('billing:read'), validate(v.listInvoicesSchema), c.listInvoices);
router.post('/invoices', authenticate, requirePermission('billing:write'), validate(v.createInvoiceSchema), c.createInvoice);
router.get('/invoices/:id', authenticate, requirePermission('billing:read'), validate(v.getInvoiceSchema), c.getInvoice);
router.patch('/invoices/:id', authenticate, requirePermission('billing:write'), validate(v.updateInvoiceSchema), c.updateInvoice);
router.post('/invoices/:id/void', authenticate, requirePermission('billing:write'), validate(v.voidInvoiceSchema), c.voidInvoice);

// Payments
router.get('/payments', authenticate, requirePermission('billing:read'), validate(v.listPaymentsSchema), c.listPayments);
router.post('/payments', authenticate, requirePermission('billing:write'), validate(v.createPaymentSchema), c.createPayment);
router.patch('/payments/:id', authenticate, requirePermission('billing:write'), validate(v.updatePaymentSchema), c.updatePayment);

// Credit Notes
router.get('/credit-notes', authenticate, requirePermission('billing:read'), validate(v.listCreditNotesSchema), c.listCreditNotes);
router.post('/credit-notes', authenticate, requirePermission('billing:write'), validate(v.createCreditNoteSchema), c.createCreditNote);
router.patch('/credit-notes/:id', authenticate, requirePermission('billing:write'), validate(v.updateCreditNoteSchema), c.updateCreditNote);

export default router;
