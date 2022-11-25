import { z } from 'zod';
import { createFailureResult, createSuccessResult, Result } from '../result';
import { validation } from '../validator';
import type { JwtAccessToken } from './issueAccessToken';
import {
  LambdaRequestId,
  mightExtractRequestIds,
  RequestId,
} from './mightExtractRequestIds';

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
): Promise<Result<SuccessResponse, FailureResponse>> => {
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
    const failureResponse: FailureResponse = {
      error: new Error('failed to isAcceptableCatImage'),
    };

    const requestIds = mightExtractRequestIds(response);

    return createFailureResult<FailureResponse>({
      ...failureResponse,
      ...requestIds,
    });
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

  // TODO 後でバリデーション専用のエラーレスポンスを返すようにする
  const failureResponse: FailureResponse = {
    error: new Error('response body is invalid'),
  };

  const requestIds = mightExtractRequestIds(response);

  return createFailureResult<FailureResponse>({
    ...failureResponse,
    ...requestIds,
  });
};
