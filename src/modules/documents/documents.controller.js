// src/modules/documents/documents.controller.js

import * as service from './documents.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

// Categories
export async function listCategories(req, res) {
  const categories = await service.listCategories(req.organizationId);
  return success(res, categories, 'Document categories retrieved');
}

export async function createCategory(req, res) {
  const category = await service.createCategory(req.organizationId, req.body);
  return created(res, category, 'Document category created');
}

export async function updateCategory(req, res) {
  const category = await service.updateCategory(req.organizationId, req.params.id, req.body);
  return success(res, category, 'Document category updated');
}

export async function deleteCategory(req, res) {
  await service.deleteCategory(req.organizationId, req.params.id);
  return success(res, null, 'Document category deleted');
}

// Documents
export async function listDocuments(req, res) {
  const result = await service.listDocuments(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Documents retrieved');
}

export async function getDocument(req, res) {
  const doc = await service.getDocumentById(req.organizationId, req.params.id);
  return success(res, doc, 'Document retrieved');
}

export async function createDocument(req, res) {
  const doc = await service.createDocument(req.organizationId, req.body, req.userId);
  return created(res, doc, 'Document uploaded');
}

export async function updateDocument(req, res) {
  const doc = await service.updateDocument(req.organizationId, req.params.id, req.body);
  return success(res, doc, 'Document updated');
}

export async function archiveDocument(req, res) {
  const doc = await service.archiveDocument(req.organizationId, req.params.id);
  return success(res, doc, 'Document archived');
}

// Signatures
export async function listSignatures(req, res) {
  const sigs = await service.listSignatures(req.organizationId, req.params.id);
  return success(res, sigs, 'Signatures retrieved');
}

export async function signDocument(req, res) {
  const sig = await service.signDocument(req.organizationId, req.params.id, req.userId, req.body);
  return created(res, sig, 'Document signed');
}

export async function getPendingSignatures(req, res) {
  const docs = await service.getPendingSignatures(req.organizationId, req.userId);
  return success(res, docs, 'Pending signatures retrieved');
}

export default {
  listCategories, createCategory, updateCategory, deleteCategory,
  listDocuments, getDocument, createDocument, updateDocument, archiveDocument,
  listSignatures, signDocument, getPendingSignatures,
};
