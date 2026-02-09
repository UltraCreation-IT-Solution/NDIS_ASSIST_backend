// src/modules/wage-calculator/wageCalculator.validator.js

import Joi from 'joi';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const calculateSchema = {
  body: Joi.object({
    staffId: Joi.string().required(),
    date: Joi.date().iso().required(),
    startTime: Joi.string().pattern(timeRegex).required()
      .messages({ 'string.pattern.base': 'startTime must be in HH:MM format (e.g., 08:00)' }),
    endTime: Joi.string().pattern(timeRegex).required()
      .messages({ 'string.pattern.base': 'endTime must be in HH:MM format (e.g., 16:00)' }),
    breakMinutes: Joi.number().integer().min(0).max(480).default(0),
  }),
};

export const recalculateSchema = {
  params: Joi.object({
    shiftId: Joi.string().required(),
  }),
};

export default { calculateSchema, recalculateSchema };