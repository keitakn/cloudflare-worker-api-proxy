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
  notAcceptableReason: IsAcceptableCatImageNotAcceptableReason;
};

export const isAcceptableCatImage = async (
  request: IsAcceptableCatImageRequest,
): Promise<Result<IsAcceptableCatImageResponse, Error>> => {
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
    return createFailureResult(new Error('failed to isAcceptableCatImage'));
  }

  const responseBody = (await response.json()) as IsAcceptableCatImageResponse;

  return createSuccessResult<IsAcceptableCatImageResponse>(responseBody);
};
