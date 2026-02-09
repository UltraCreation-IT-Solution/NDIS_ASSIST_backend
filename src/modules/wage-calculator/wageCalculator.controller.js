// src/modules/wage-calculator/wageCalculator.controller.js

import * as service from './wageCalculator.service.js';
import { success } from '../../shared/utils/response.util.js';

export async function calculate(req, res) {
  const result = await service.calculateWage(req.organizationId, req.body);
  return success(res, result, 'Wage calculated');
}

export async function recalculate(req, res) {
  const result = await service.recalculateShift(req.organizationId, req.params.shiftId);
  return success(res, result, 'Shift wages recalculated');
}

export default { calculate, recalculate };