import { createFailureResult, createSuccessResult, Result } from '../result';

type IssueAccessTokenRequest = {
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

export type JwtAccessToken = string;

type SuccessResponse = {
  jwtAccessToken: JwtAccessToken;
};

type FailureResponse = {
  error: Error;
};

export const issueAccessToken = async (
  request: IssueAccessTokenRequest,
): Promise<Result<SuccessResponse, FailureResponse>> => {
  const authorization = btoa(
    `${request.cognitoClientId}:${request.cognitoClientSecret}`,
  );

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authorization}`,
    },
    body: 'grant_type=client_credentials&scope=api.lgtmeow/all image-recognition-api.lgtmeow/all',
  };

  const response = await fetch(request.endpoint, options);
  if (!response.ok) {
    const failureResponse = {
      error: new Error('failed to issueAccessToken'),
    };

    return createFailureResult<FailureResponse>(failureResponse);
  }

  const responseBody = (await response.json()) as CognitoTokenResponseBody;

  const issueAccessTokenResponse = {
    jwtAccessToken: responseBody.access_token,
  };

  return createSuccessResult(issueAccessTokenResponse);
};
