import { createFailureResult, createSuccessResult, Result } from '../result';

import { JwtAccessToken } from './issueAccessToken';

type LgtmImage = { id: number; url: string };

type LgtmImages = LgtmImage[];

type FetchLgtmImagesRequest = {
  apiUrl: string;
  accessToken: JwtAccessToken;
};

type SuccessResponse = {
  lgtmImages: LgtmImages;
  xRequestId?: string;
  xLambdaRequestId?: string;
};

type FailureResponse = {
  error: Error;
  xRequestId?: string;
  xLambdaRequestId?: string;
};

export const fetchLgtmImagesInRandom = async (
  request: FetchLgtmImagesRequest
): Promise<Result<SuccessResponse, FailureResponse>> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${request.accessToken}`,
    },
  };

  const response = await fetch(`${request.apiUrl}/lgtm-images`, options);
  if (!response.ok) {
    const failureResponse: FailureResponse = {
      error: new Error('failed to fetchLgtmImagesInRandom'),
    };

    if (response.headers.get('x-request-id')) {
      failureResponse.xRequestId = response.headers.get(
        'x-request-id'
      ) as string;
    }

    if (response.headers.get('x-lambda-request-id')) {
      failureResponse.xLambdaRequestId = response.headers.get(
        'x-lambda-request-id'
      ) as string;
    }

    return createFailureResult<FailureResponse>(failureResponse);
  }

  const responseBody = await response.json();

  const successResponse: SuccessResponse = {
    lgtmImages: responseBody,
  };

  if (response.headers.get('x-request-id')) {
    successResponse.xRequestId = response.headers.get('x-request-id') as string;
  }

  if (response.headers.get('x-lambda-request-id')) {
    successResponse.xLambdaRequestId = response.headers.get(
      'x-lambda-request-id'
    ) as string;
  }

  return createSuccessResult<SuccessResponse>(successResponse);
};
