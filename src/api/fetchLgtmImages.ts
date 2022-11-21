import { z } from 'zod';
import { createFailureResult, createSuccessResult, Result } from '../result';
import { validation } from '../validator';
import { JwtAccessToken } from './issueAccessToken';

type LgtmImage = { id: string; url: string };

type LgtmImages = LgtmImage[];

const lgtmImageSchema = z.object({
  id: z.union([z.string().min(1), z.number().min(1)]),
  url: z.string().url(),
});

const lgtmImagesSchema = z.object({
  lgtmImages: z.array(lgtmImageSchema),
});

const isLgtmImages = (value: unknown): value is LgtmImages => {
  return validation(lgtmImagesSchema, value).isValidate;
};

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

    if (response.headers.get('x-request-id') != null) {
      failureResponse.xRequestId = response.headers.get(
        'x-request-id'
      ) as string;
    }

    if (response.headers.get('x-lambda-request-id') != null) {
      failureResponse.xLambdaRequestId = response.headers.get(
        'x-lambda-request-id'
      ) as string;
    }

    return createFailureResult<FailureResponse>(failureResponse);
  }

  const responseBody = await response.json();
  if (isLgtmImages(responseBody)) {
    // TODO idはnumber型で返すように変更する
    const successResponse: SuccessResponse = {
      lgtmImages: responseBody,
    };

    if (response.headers.get('x-request-id') != null) {
      successResponse.xRequestId = response.headers.get(
        'x-request-id'
      ) as string;
    }

    if (response.headers.get('x-lambda-request-id') != null) {
      successResponse.xLambdaRequestId = response.headers.get(
        'x-lambda-request-id'
      ) as string;
    }

    return createSuccessResult<SuccessResponse>(successResponse);
  }

  // TODO 後でバリデーション専用のエラーレスポンスを返すようにする
  const failureResponse: FailureResponse = {
    error: new Error('response body is invalid'),
  };

  if (response.headers.get('x-request-id') != null) {
    failureResponse.xRequestId = response.headers.get('x-request-id') as string;
  }

  if (response.headers.get('x-lambda-request-id') != null) {
    failureResponse.xLambdaRequestId = response.headers.get(
      'x-lambda-request-id'
    ) as string;
  }

  return createFailureResult<FailureResponse>(failureResponse);
};
