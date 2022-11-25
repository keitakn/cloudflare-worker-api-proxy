import { z } from 'zod';
import { createFailureResult, createSuccessResult, Result } from '../result';
import { validation } from '../validator';
import { JwtAccessToken } from './issueAccessToken';
import { mightExtractRequestIds } from './mightExtractRequestIds';

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

type Dto = {
  apiBaseUrl: string;
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
  dto: Dto
): Promise<Result<SuccessResponse, FailureResponse>> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${dto.accessToken}`,
    },
  };

  const response = await fetch(`${dto.apiBaseUrl}/lgtm-images`, options);
  if (!response.ok) {
    const failureResponse: FailureResponse = {
      error: new Error('failed to fetchLgtmImagesInRandom'),
    };

    const requestIds = mightExtractRequestIds(response);

    return createFailureResult<FailureResponse>({
      ...failureResponse,
      ...requestIds,
    });
  }

  const responseBody = await response.json();
  if (isLgtmImages(responseBody)) {
    // TODO idはnumber型で返すように変更する
    const successResponse: SuccessResponse = {
      lgtmImages: responseBody,
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
