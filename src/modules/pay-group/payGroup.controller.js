// src/modules/pay-group/payGroup.controller.js

import * as service from './payGroup.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

export async function list(req, res) {
  const result = await service.listPayGroups(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Pay groups retrieved');
}

export async function getById(req, res) {
  const payGroup = await service.getPayGroupById(req.organizationId, req.params.id);
  return success(res, payGroup, 'Pay group retrieved');
}

export async function create(req, res) {
  const payGroup = await service.createPayGroup(req.organizationId, req.body);
  return created(res, payGroup, 'Pay group created');
}

export async function update(req, res) {
  const payGroup = await service.updatePayGroup(req.organizationId, req.params.id, req.body);
  return success(res, payGroup, 'Pay group updated');
}

export async function remove(req, res) {
  await service.deletePayGroup(req.organizationId, req.params.id);
  return success(res, null, 'Pay group deactivated');
}

export async function getStaff(req, res) {
  const result = await service.getPayGroupStaff(req.organizationId, req.params.id, req.query);
  return paginated(res, result.data, result.pagination, 'Pay group staff retrieved');
}

export default { list, getById, create, update, remove, getStaff };