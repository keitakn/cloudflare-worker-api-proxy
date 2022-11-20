/* eslint-disable require-await */

import { fetchLgtmImagesInRandom } from './api/fetchLgtmImages';
import { isAcceptableCatImage } from './api/isAcceptableCatImage';
import { issueAccessToken } from './api/issueAccessToken';
import { isFailureResult } from './result';

const defaultSuccessStatus = 200;

const defaultErrorStatus = 500;

type ResponseHeader = {
  'Content-Type': 'application/json';
  'X-Request-Id'?: string;
  'X-Lambda-Request-Id'?: string;
};

const createSuccessResponse = (
  body: unknown,
  statusCode = defaultSuccessStatus,
  headers: ResponseHeader = { 'Content-Type': 'application/json' }
): Response => {
  const jsonBody = JSON.stringify(body);

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
  statusCode = defaultErrorStatus
): Response => createSuccessResponse(body, statusCode);

export const handleCatImageValidation = async (
  request: Request
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
    isAcceptableCatImageRequest
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

  const headers: ResponseHeader = {
    'Content-Type': 'application/json',
  };

  if (isAcceptableCatImageResult.value.xRequestId != null) {
    headers['X-Request-Id'] = isAcceptableCatImageResult.value.xRequestId;
  }

  if (isAcceptableCatImageResult.value.xLambdaRequestId != null) {
    headers['X-Lambda-Request-Id'] =
      isAcceptableCatImageResult.value.xLambdaRequestId;
  }

  return createSuccessResponse(responseBody, defaultSuccessStatus, headers);
};

export const handleFetchLgtmImagesInRandom = async (): Promise<Response> => {
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

  const fetchLgtmImagesRequest = {
    apiUrl: LGTMEOW_API_URL,
    accessToken: issueAccessTokenResult.value.jwtAccessToken,
  };

  const fetchLgtmImagesResult = await fetchLgtmImagesInRandom(
    fetchLgtmImagesRequest
  );
  if (isFailureResult(fetchLgtmImagesResult)) {
    const errorBody = {
      title: 'fetch_lgtm_images_in_random_failed',
      status: defaultErrorStatus,
    };

    return createErrorResponse(errorBody, defaultErrorStatus);
  }

  const responseBody = fetchLgtmImagesResult.value.lgtmImages;

  const headers: ResponseHeader = {
    'Content-Type': 'application/json',
  };

  if (fetchLgtmImagesResult.value.xRequestId != null) {
    headers['X-Request-Id'] = fetchLgtmImagesResult.value.xRequestId;
  }

  if (fetchLgtmImagesResult.value.xLambdaRequestId != null) {
    headers['X-Lambda-Request-Id'] =
      fetchLgtmImagesResult.value.xLambdaRequestId;
  }

  return createSuccessResponse(responseBody, defaultSuccessStatus, headers);
};

export const handleNotFound = (request: Request): Response => {
  const status = 404;

  const responseBody = {
    title: `not_found`,
    detail: `requestMethod is ${request.method}`,
    status,
  };

  return createErrorResponse(responseBody, status);
};
