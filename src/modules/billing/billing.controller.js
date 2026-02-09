// src/modules/billing/billing.controller.js

import * as service from './billing.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

export async function listInvoices(req, res) {
  const result = await service.listInvoices(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Invoices retrieved');
}
export async function getInvoice(req, res) {
  const invoice = await service.getInvoiceById(req.organizationId, req.params.id);
  return success(res, invoice, 'Invoice retrieved');
}
export async function createInvoice(req, res) {
  const invoice = await service.createInvoice(req.organizationId, req.body);
  return created(res, invoice, 'Invoice created');
}
export async function updateInvoice(req, res) {
  const invoice = await service.updateInvoice(req.organizationId, req.params.id, req.body);
  return success(res, invoice, 'Invoice updated');
}
export async function voidInvoice(req, res) {
  const invoice = await service.voidInvoice(req.organizationId, req.params.id);
  return success(res, invoice, 'Invoice voided');
}
export async function listPayments(req, res) {
  const result = await service.listPayments(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Payments retrieved');
}
export async function createPayment(req, res) {
  const payment = await service.createPayment(req.organizationId, req.body);
  return created(res, payment, 'Payment recorded');
}
export async function updatePayment(req, res) {
  const payment = await service.updatePayment(req.organizationId, req.params.id, req.body);
  return success(res, payment, 'Payment updated');
}
export async function listCreditNotes(req, res) {
  const result = await service.listCreditNotes(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Credit notes retrieved');
}
export async function createCreditNote(req, res) {
  const note = await service.createCreditNote(req.organizationId, req.body);
  return created(res, note, 'Credit note created');
}
export async function updateCreditNote(req, res) {
  const note = await service.updateCreditNote(req.organizationId, req.params.id, req.body);
  return success(res, note, 'Credit note updated');
}

export default {
  listInvoices, getInvoice, createInvoice, updateInvoice, voidInvoice,
  listPayments, createPayment, updatePayment,
  listCreditNotes, createCreditNote, updateCreditNote,
};
