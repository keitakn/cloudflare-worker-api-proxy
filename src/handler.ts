/* eslint-disable require-await */

import { isAcceptableCatImage } from './api/isAcceptableCatImage';
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
    const errorBody = {
      title: 'issue_access_token_failed',
      status: defaultErrorStatus,
    };

    return createErrorResponse(errorBody, defaultErrorStatus);
  }

  const body = await request.json();
  const jsonRequestBody = JSON.stringify(body);

  const isAcceptableCatImageRequest = {
    accessToken: issueAccessTokenResult.value.jwtAccessToken,
    jsonRequestBody,
  };

  const isAcceptableCatImageResult = await isAcceptableCatImage(
    isAcceptableCatImageRequest,
  );
  if (isFailureResult(isAcceptableCatImageResult)) {
    const errorBody = {
      title: 'is_acceptable_cat_image_failed',
      status: defaultErrorStatus,
    };

    return createErrorResponse(errorBody, defaultErrorStatus);
  }

  const responseBody =
    isAcceptableCatImageResult.value.isAcceptableCatImageResponse;

  return createSuccessResponse(responseBody);
};

export const handleNotFound = async (request: Request): Promise<Response> => {
  const status = 404;

  const responseBody = {
    title: `not_found`,
    detail: `requestMethod is ${request.method}`,
    status,
  };

  return createErrorResponse(responseBody, status);
};
