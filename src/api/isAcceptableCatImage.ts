import { z } from 'zod';
import { createFailureResult, createSuccessResult, Result } from '../result';
import { validation } from '../validator';
import { IsAcceptableCatImageError } from './errors/IsAcceptableCatImageError';
import type { JwtAccessToken } from './issueAccessToken';
import {
  LambdaRequestId,
  mightExtractRequestIds,
  RequestId,
} from './mightExtractRequestIds';
import {
  createValidationErrorResponse,
  ValidationErrorResponse,
} from './validationErrorResponse';

type Dto = {
  apiBaseUrl: string;
  accessToken: JwtAccessToken;
  jsonRequestBody: string;
};

const isAcceptableCatImageNotAcceptableReasons = [
  'not an allowed image extension',
  'not moderation image',
  'person face in the image',
  'not cat image',
  'an error has occurred',
] as const;

export type IsAcceptableCatImageNotAcceptableReason =
  typeof isAcceptableCatImageNotAcceptableReasons[number];

export type IsAcceptableCatImageResponse = {
  isAcceptableCatImage: boolean;
  notAcceptableReason?: IsAcceptableCatImageNotAcceptableReason;
};

const isAcceptableCatImageResponseSchema = z.object({
  isAcceptableCatImage: z.boolean(),
  notAcceptableReason: z
    .enum(isAcceptableCatImageNotAcceptableReasons)
    .optional(),
});

const isAcceptableCatImageResponse = (
  value: unknown
): value is IsAcceptableCatImageResponse => {
  return validation(isAcceptableCatImageResponseSchema, value).isValidate;
};

export type SuccessResponse = {
  isAcceptableCatImageResponse: IsAcceptableCatImageResponse;
  xRequestId?: RequestId;
  xLambdaRequestId?: LambdaRequestId;
};

export type FailureResponse = {
  error: Error;
  xRequestId?: RequestId;
  xLambdaRequestId?: LambdaRequestId;
};

export const isAcceptableCatImage = async (
  dto: Dto
): Promise<
  Result<SuccessResponse, FailureResponse | ValidationErrorResponse>
> => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${dto.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: dto.jsonRequestBody,
  };

  const response = await fetch(
    `${dto.apiBaseUrl}/cat-images/validation-results`,
    options
  );

  if (!response.ok) {
    const requestIds = mightExtractRequestIds(response);

    throw new IsAcceptableCatImageError(
      `X-Request-Id=${String(
        requestIds.xRequestId
      )}:X-Lambda-Request-Id:${String(requestIds.xLambdaRequestId)}`
    );
  }

  const responseBody = await response.json();

  if (isAcceptableCatImageResponse(responseBody)) {
    const successResponse: SuccessResponse = {
      isAcceptableCatImageResponse: responseBody,
    };

    const requestIds = mightExtractRequestIds(response);

    return createSuccessResult<SuccessResponse>({
      ...successResponse,
      ...requestIds,
    });
  }

  const validationResult = validation(
    isAcceptableCatImageResponseSchema,
    responseBody
  );
  if (!validationResult.isValidate && validationResult.invalidParams != null) {
    return createFailureResult<ValidationErrorResponse>(
      createValidationErrorResponse(validationResult.invalidParams, response)
    );
  }

  const requestIds = mightExtractRequestIds(response);

  throw new IsAcceptableCatImageError(
    `X-Request-Id=${String(requestIds.xRequestId)}:X-Lambda-Request-Id:${String(
      requestIds.xLambdaRequestId
    )}`
  );
};
