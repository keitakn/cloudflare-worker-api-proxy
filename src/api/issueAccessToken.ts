import { z } from 'zod';
import { createFailureResult, createSuccessResult, Result } from '../result';
import { validation } from '../validator';

type Dto = {
  endpoint: string;
  cognitoClientId: string;
  cognitoClientSecret: string;
};

type CognitoTokenResponseBody = {
  access_token: string;
  // eslint-disable-next-line no-magic-numbers
  expires_in: 3600;
  token_type: 'Bearer';
};

const cognitoTokenResponseBodySchema = z.object({
  access_token: z.string(),
  expires_in: z.number().min(3600),
  token_type: z.literal('Bearer'),
});

const isCognitoTokenResponseBody = (
  value: unknown
): value is CognitoTokenResponseBody => {
  return validation(cognitoTokenResponseBodySchema, value).isValidate;
};

export type JwtAccessToken = string;

type SuccessResponse = {
  jwtAccessToken: JwtAccessToken;
};

type FailureResponse = {
  error: Error;
};

export const issueAccessToken = async (
  dto: Dto
): Promise<Result<SuccessResponse, FailureResponse>> => {
  const authorization = btoa(
    `${dto.cognitoClientId}:${dto.cognitoClientSecret}`
  );

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authorization}`,
    },
    body: 'grant_type=client_credentials&scope=api.lgtmeow/all image-recognition-api.lgtmeow/all',
  };

  const response = await fetch(dto.endpoint, options);
  if (!response.ok) {
    const failureResponse = {
      error: new Error('failed to issueAccessToken'),
    };

    return createFailureResult<FailureResponse>(failureResponse);
  }

  const responseBody = await response.json();

  if (isCognitoTokenResponseBody(responseBody)) {
    const issueAccessTokenResponse = {
      jwtAccessToken: responseBody.access_token,
    };

    return createSuccessResult(issueAccessTokenResponse);
  }

  // TODO 後でバリデーション専用のエラーレスポンスを返すようにする
  const failureResponse = {
    error: new Error('response body is invalid'),
  };

  return createFailureResult<FailureResponse>(failureResponse);
};
