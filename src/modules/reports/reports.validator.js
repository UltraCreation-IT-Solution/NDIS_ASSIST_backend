// src/modules/reports/reports.validator.js

import Joi from 'joi';

export const dateRangeSchema = {
  query: Joi.object({
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional(),
  }),
};

export default { dateRangeSchema };
