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

type JwtAccessToken = string;

export const issueAccessToken = async (
  request: IssueAccessTokenRequest,
): Promise<Result<JwtAccessToken, Error>> => {
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
    return createFailureResult(new Error('failed to issueAccessToken'));
  }

  const responseBody = (await response.json()) as CognitoTokenResponseBody;

  return createSuccessResult(responseBody.access_token);
};
