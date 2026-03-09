import type {
  Task,
  PriorityLabel,
  TaskValidationErrors,
  TaskValidationResult,
} from '../types';
import {
  MAX_DESCRIPTION_LENGTH,
  MIN_ICE_VALUE,
  MAX_ICE_VALUE,
  LOW_PRIORITY_THRESHOLD,
  HIGH_PRIORITY_THRESHOLD,
} from '../constants';

export const calcularScore = (impact: number, confidence: number, ease: number): number => {
  if (!Number.isFinite(impact) || !Number.isFinite(confidence) || !Number.isFinite(ease)) {
    return 0;
  }
  if (ease <= 0) return 0; // avoid division by zero and invalid ease
  return (impact * confidence * 10) / ease;
};

export const getPriorityLabel = (score: number): PriorityLabel => {
  if (score >= HIGH_PRIORITY_THRESHOLD) return 'high';
  if (score >= LOW_PRIORITY_THRESHOLD) return 'medium';
  return 'low';
};

export const validarTarea = (task: Partial<Task>): TaskValidationResult => {
  const errors: TaskValidationErrors = {};

  const description = task.description?.trim() ?? '';
  if (!description) {
    errors.description = 'La descripción es obligatoria.';
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `La descripción no puede superar los ${MAX_DESCRIPTION_LENGTH} caracteres.`;
  }

  const checkRange = (value: number | undefined, field: keyof TaskValidationErrors) => {
    if (value === undefined || Number.isNaN(value)) {
      errors[field] = 'Valor requerido.';
    } else if (value < MIN_ICE_VALUE || value > MAX_ICE_VALUE) {
      errors[field] = `Debe estar entre ${MIN_ICE_VALUE} y ${MAX_ICE_VALUE}.`;
    }
  };

  checkRange(task.impact, 'impact');
  checkRange(task.confidence, 'confidence');
  checkRange(task.ease, 'ease');

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
};