import { Response } from '@cloudflare/workers-types/2021-11-03/index';
import { z } from 'zod';
import { InvalidParams, validation } from '../validator';
import {
  LambdaRequestId,
  mightExtractRequestIds,
  RequestId,
} from './mightExtractRequestIds';

export type ValidationErrorResponse = {
  invalidParams: InvalidParams;
  xRequestId?: RequestId;
  xLambdaRequestId?: LambdaRequestId;
};

export const createValidationErrorResponse = (
  invalidParams: InvalidParams,
  response: Response
): ValidationErrorResponse => {
  const validationErrorResponse = {
    invalidParams,
  };

  const requestIds = mightExtractRequestIds(response);

  return { ...validationErrorResponse, ...requestIds };
};

const invalidParamSchema = z.object({
  name: z.string().min(1),
  reason: z.string().min(1),
});

const schema = z.object({
  invalidParams: z.array(invalidParamSchema),
  xRequestId: z.string().optional(),
  xLambdaRequestId: z.string().optional(),
});

export const isValidationErrorResponse = (
  value: unknown
): value is ValidationErrorResponse => {
  return validation(schema, value).isValidate;
};
