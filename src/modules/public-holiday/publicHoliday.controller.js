// src/modules/public-holiday/publicHoliday.controller.js

import * as service from './publicHoliday.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

export async function list(req, res) {
  const result = await service.listPublicHolidays(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Public holidays retrieved');
}

export async function getById(req, res) {
  const holiday = await service.getPublicHolidayById(req.organizationId, req.params.id);
  return success(res, holiday, 'Public holiday retrieved');
}

export async function create(req, res) {
  const holiday = await service.createPublicHoliday(req.organizationId, req.body);
  return created(res, holiday, 'Public holiday created');
}

export async function update(req, res) {
  const holiday = await service.updatePublicHoliday(req.organizationId, req.params.id, req.body);
  return success(res, holiday, 'Public holiday updated');
}

export async function remove(req, res) {
  await service.deletePublicHoliday(req.organizationId, req.params.id);
  return success(res, null, 'Public holiday deleted');
}

export async function seed(req, res) {
  const result = await service.seedAustralianHolidays(req.organizationId, req.body.year);
  return created(res, result, `Australian holidays seeded for ${result.year}`);
}

export default { list, getById, create, update, remove, seed };