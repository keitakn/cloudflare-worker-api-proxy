/* eslint-disable require-await */

import { issueAccessToken } from './api/issueAccessToken';
import { isFailureResult } from './result';

const defaultSuccessStatus = 200;

const defaultErrorStatus = 500;

const createSuccessResponse = (
  body: unknown,
  statusCode = defaultSuccessStatus,
): Response => {
  const jsonBody = JSON.stringify(body);

  const headers = { 'Content-Type': 'application/json' };

  return new Response(jsonBody, { headers, status: statusCode });
};

type ErrorBody = {
  title: string;
  detail?: string;
  type?: string | 'about:blank';
  status?: number;
};

const createErrorResponse = (
  body: ErrorBody,
  statusCode = defaultErrorStatus,
): Response => createSuccessResponse(body, statusCode);

export const handleCatImageValidation = async (
  request: Request,
): Promise<Response> => {
  const issueTokenRequest = {
    endpoint: COGNITO_TOKEN_ENDPOINT,
    cognitoClientId: COGNITO_CLIENT_ID,
    cognitoClientSecret: COGNITO_CLIENT_SECRET,
  };

  const issueAccessTokenResult = await issueAccessToken(issueTokenRequest);
  if (isFailureResult(issueAccessTokenResult)) {
    const status = 500;

    const errorBody = {
      title: 'issue_access_token_failed',
      status,
    };

    return createErrorResponse(errorBody, status);
  }

  const responseBody = {
    message: `Hello World!`,
    requestMethod: request.method,
    jwtAccessTokenLength: issueAccessTokenResult.value.length,
  };

  return createSuccessResponse(responseBody);
};

export const handleNotFound = async (request: Request): Promise<Response> => {
  const status = 404;

  const responseBody = {
    title: `NotFound`,
    detail: `requestMethod is ${request.method}`,
    status,
  };

  return createErrorResponse(responseBody, status);
};
