import { createFailureResult, createSuccessResult, Result } from '../result';

import type { JwtAccessToken } from './issueAccessToken';

type IsAcceptableCatImageRequest = {
  accessToken: JwtAccessToken;
  jsonRequestBody: string;
};

export type IsAcceptableCatImageNotAcceptableReason =
  | 'not an allowed image extension'
  | 'not moderation image'
  | 'person face in the image'
  | 'not cat image'
  | 'an error has occurred';

export type IsAcceptableCatImageResponse = {
  isAcceptableCatImage: boolean;
  notAcceptableReason?: IsAcceptableCatImageNotAcceptableReason;
};

export type SuccessResponse = {
  isAcceptableCatImageResponse: IsAcceptableCatImageResponse;
  xRequestId?: string;
  xLambdaRequestId?: string;
};

export type FailureResponse = {
  error: Error;
  xRequestId?: string;
  xLambdaRequestId?: string;
};

export const isAcceptableCatImage = async (
  request: IsAcceptableCatImageRequest,
): Promise<Result<SuccessResponse, FailureResponse>> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${request.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: request.jsonRequestBody,
  };

  const response = await fetch(
    `${IMAGE_RECOGNITION_API_URL}/cat-images/validation-results`,
    options,
  );

  if (!response.ok) {
    const failureResponse: FailureResponse = {
      error: new Error('failed to isAcceptableCatImage'),
    };

    if (response.headers.get('x-request-id')) {
      failureResponse.xRequestId = response.headers.get(
        'x-request-id',
      ) as string;
    }

    if (response.headers.get('x-lambda-request-id')) {
      failureResponse.xLambdaRequestId = response.headers.get(
        'x-lambda-request-id',
      ) as string;
    }

    return createFailureResult<FailureResponse>(failureResponse);
  }

  const responseBody = (await response.json()) as IsAcceptableCatImageResponse;

  const successResponse: SuccessResponse = {
    isAcceptableCatImageResponse: responseBody,
  };

  if (response.headers.get('x-request-id')) {
    successResponse.xRequestId = response.headers.get('x-request-id') as string;
  }

  if (response.headers.get('x-lambda-request-id')) {
    successResponse.xLambdaRequestId = response.headers.get(
      'x-lambda-request-id',
    ) as string;
  }

  return createSuccessResult<SuccessResponse>(successResponse);
};
