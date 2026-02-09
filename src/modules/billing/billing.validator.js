// src/modules/billing/billing.validator.js

import Joi from 'joi';

const INVOICE_STATUSES = ['DRAFT', 'APPROVED', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'VOID', 'EXPORTED_TO_XERO'];
const PAYMENT_METHODS = ['BANK_TRANSFER', 'CREDIT_CARD', 'DIRECT_DEBIT', 'NDIS_PORTAL', 'BPAY', 'CASH', 'CHEQUE'];
const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
const CREDIT_NOTE_STATUSES = ['DRAFT', 'ISSUED', 'APPLIED', 'CANCELLED'];

const idParam = Joi.object({ id: Joi.string().required() });
const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Invoices
export const listInvoicesSchema = {
  query: paginationQuery.keys({
    search: Joi.string().trim().max(100).optional(),
    status: Joi.string().valid(...INVOICE_STATUSES).optional(),
    clientId: Joi.string().optional(),
    isNdisInvoice: Joi.boolean().optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional(),
    sortBy: Joi.string().valid('invoiceDate', 'dueDate', 'totalAmount', 'createdAt').default('invoiceDate'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getInvoiceSchema = { params: idParam };

export const createInvoiceSchema = {
  body: Joi.object({
    clientId: Joi.string().required(),
    invoiceNumber: Joi.string().trim().max(20).optional(),
    invoiceDate: Joi.date().iso().optional(),
    dueDate: Joi.date().iso().optional(),
    isNdisInvoice: Joi.boolean().default(false),
    notes: Joi.string().trim().max(2000).optional().allow('', null),
    lineItems: Joi.array().items(Joi.object({
      shiftId: Joi.string().optional().allow(null),
      supportItemNo: Joi.string().trim().max(50).optional().allow('', null),
      description: Joi.string().trim().min(1).max(500).required(),
      date: Joi.date().iso().optional().allow(null),
      quantity: Joi.number().precision(2).min(0).required(),
      unitPrice: Joi.number().precision(2).min(0).required(),
    })).optional(),
  }),
};

export const updateInvoiceSchema = {
  params: idParam,
  body: Joi.object({
    invoiceDate: Joi.date().iso().optional(),
    dueDate: Joi.date().iso().optional(),
    status: Joi.string().valid(...INVOICE_STATUSES).optional(),
    isNdisInvoice: Joi.boolean().optional(),
    notes: Joi.string().trim().max(2000).optional().allow('', null),
  }).min(1),
};

export const voidInvoiceSchema = { params: idParam };

// Payments
export const listPaymentsSchema = {
  query: paginationQuery.keys({
    status: Joi.string().valid(...PAYMENT_STATUSES).optional(),
    clientId: Joi.string().optional(),
    invoiceId: Joi.string().optional(),
    sortBy: Joi.string().valid('paymentDate', 'amount', 'createdAt').default('paymentDate'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const createPaymentSchema = {
  body: Joi.object({
    invoiceId: Joi.string().required(),
    amount: Joi.number().precision(2).min(0.01).required(),
    paymentMethod: Joi.string().valid(...PAYMENT_METHODS).required(),
    referenceNumber: Joi.string().trim().max(100).optional().allow('', null),
    status: Joi.string().valid(...PAYMENT_STATUSES).default('COMPLETED'),
    paymentDate: Joi.date().iso().required(),
    notes: Joi.string().trim().max(1000).optional().allow('', null),
  }),
};

export const updatePaymentSchema = {
  params: idParam,
  body: Joi.object({
    status: Joi.string().valid(...PAYMENT_STATUSES).optional(),
    notes: Joi.string().trim().max(1000).optional().allow('', null),
  }).min(1),
};

// Credit Notes
export const listCreditNotesSchema = {
  query: paginationQuery.keys({
    status: Joi.string().valid(...CREDIT_NOTE_STATUSES).optional(),
    clientId: Joi.string().optional(),
    invoiceId: Joi.string().optional(),
    sortBy: Joi.string().valid('createdAt', 'amount').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const createCreditNoteSchema = {
  body: Joi.object({
    invoiceId: Joi.string().required(),
    amount: Joi.number().precision(2).min(0.01).required(),
    reason: Joi.string().trim().max(1000).optional().allow('', null),
    status: Joi.string().valid(...CREDIT_NOTE_STATUSES).default('DRAFT'),
  }),
};

export const updateCreditNoteSchema = {
  params: idParam,
  body: Joi.object({
    amount: Joi.number().precision(2).min(0.01).optional(),
    reason: Joi.string().trim().max(1000).optional().allow('', null),
    status: Joi.string().valid(...CREDIT_NOTE_STATUSES).optional(),
  }).min(1),
};

export default {
  listInvoicesSchema, getInvoiceSchema, createInvoiceSchema, updateInvoiceSchema, voidInvoiceSchema,
  listPaymentsSchema, createPaymentSchema, updatePaymentSchema,
  listCreditNotesSchema, createCreditNoteSchema, updateCreditNoteSchema,
};
