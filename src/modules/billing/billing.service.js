// src/modules/billing/billing.service.js

import * as repo from './billing.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';
import { BILLING } from '../../config/constants.js';

// ============================================================================
// INVOICES
// ============================================================================

export async function listInvoices(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findAllInvoices(organizationId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function getInvoiceById(organizationId, id) {
  const invoice = await repo.findInvoiceById(id, organizationId);
  if (!invoice) throw new NotFoundError('Invoice not found');
  return invoice;
}

export async function createInvoice(organizationId, data) {
  const invoiceNumber = data.invoiceNumber || await repo.getNextInvoiceNumber(organizationId);

  const existing = await repo.findInvoiceByNumber(organizationId, invoiceNumber);
  if (existing) throw new ConflictError('Invoice number already exists');

  const { lineItems, ...invoiceData } = data;

  // Calculate totals from line items
  let subtotal = 0;
  const processedItems = (lineItems || []).map((item) => {
    const total = parseFloat((item.quantity * item.unitPrice).toFixed(2));
    const gstAmount = parseFloat((total * (BILLING?.GST_RATE || 0.10)).toFixed(2));
    subtotal += total;
    return { ...item, total, gstAmount, ...(item.date && { date: new Date(item.date) }) };
  });

  const gstAmount = parseFloat((subtotal * (BILLING?.GST_RATE || 0.10)).toFixed(2));
  const totalAmount = parseFloat((subtotal + gstAmount).toFixed(2));

  const invoice = await repo.createInvoice({
    organizationId,
    ...invoiceData,
    invoiceNumber,
    invoiceDate: new Date(invoiceData.invoiceDate || new Date()),
    dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : addDays(new Date(), BILLING?.INVOICE_DUE_DAYS || 14),
    subtotal,
    gstAmount,
    totalAmount,
  });

  // Create line items
  if (processedItems.length > 0) {
    await repo.createManyLineItems(
      processedItems.map((item) => ({ invoiceId: invoice.id, ...item }))
    );
  }

  return repo.findInvoiceById(invoice.id, organizationId);
}

export async function updateInvoice(organizationId, id, data) {
  const invoice = await repo.findInvoiceById(id, organizationId);
  if (!invoice) throw new NotFoundError('Invoice not found');

  if (['PAID', 'VOID', 'EXPORTED_TO_XERO'].includes(invoice.status)) {
    throw new BadRequestError(`Cannot update invoice with status ${invoice.status}`);
  }

  const updateData = { ...data };
  if (data.invoiceDate) updateData.invoiceDate = new Date(data.invoiceDate);
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

  return repo.updateInvoice(id, updateData);
}

export async function voidInvoice(organizationId, id) {
  const invoice = await repo.findInvoiceById(id, organizationId);
  if (!invoice) throw new NotFoundError('Invoice not found');

  if (invoice.status === 'VOID') throw new BadRequestError('Invoice is already voided');
  if (invoice.status === 'PAID') throw new BadRequestError('Cannot void a paid invoice — create a credit note instead');

  return repo.updateInvoice(id, { status: 'VOID' });
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function listPayments(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findAllPayments(organizationId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function createPayment(organizationId, data) {
  const invoice = await repo.findInvoiceById(data.invoiceId, organizationId);
  if (!invoice) throw new NotFoundError('Invoice not found');

  if (['VOID', 'CANCELLED'].includes(invoice.status)) {
    throw new BadRequestError('Cannot record payment against a voided/cancelled invoice');
  }

  const payment = await repo.createPayment({
    organizationId,
    clientId: invoice.clientId,
    ...data,
    paymentDate: new Date(data.paymentDate),
  });

  // Update invoice paid amount and status
  const newPaidAmount = parseFloat(invoice.paidAmount) + parseFloat(data.amount);
  const invoiceUpdate = { paidAmount: newPaidAmount };

  if (newPaidAmount >= parseFloat(invoice.totalAmount)) {
    invoiceUpdate.status = 'PAID';
  } else if (newPaidAmount > 0) {
    invoiceUpdate.status = 'PARTIALLY_PAID';
  }

  await repo.updateInvoice(data.invoiceId, invoiceUpdate);

  return payment;
}

export async function updatePayment(organizationId, id, data) {
  const payment = await repo.findPaymentById(id, organizationId);
  if (!payment) throw new NotFoundError('Payment not found');

  const updateData = { ...data };
  if (data.paymentDate) updateData.paymentDate = new Date(data.paymentDate);

  return repo.updatePayment(id, updateData);
}

// ============================================================================
// CREDIT NOTES
// ============================================================================

export async function listCreditNotes(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findAllCreditNotes(organizationId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function createCreditNote(organizationId, data) {
  const invoice = await repo.findInvoiceById(data.invoiceId, organizationId);
  if (!invoice) throw new NotFoundError('Invoice not found');

  const creditNumber = await repo.getNextCreditNoteNumber(organizationId);

  return repo.createCreditNote({
    organizationId,
    clientId: invoice.clientId,
    creditNumber,
    ...data,
  });
}

export async function updateCreditNote(organizationId, id, data) {
  const note = await repo.findCreditNoteById(id, organizationId);
  if (!note) throw new NotFoundError('Credit note not found');

  if (['APPLIED', 'CANCELLED'].includes(note.status)) {
    throw new BadRequestError(`Cannot update credit note with status ${note.status}`);
  }

  return repo.updateCreditNote(id, data);
}

// Helpers
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default {
  listInvoices, getInvoiceById, createInvoice, updateInvoice, voidInvoice,
  listPayments, createPayment, updatePayment,
  listCreditNotes, createCreditNote, updateCreditNote,
};
