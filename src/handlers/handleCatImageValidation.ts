import { isAcceptableCatImage } from '../api/isAcceptableCatImage';
import { issueAccessToken } from '../api/issueAccessToken';
import { httpStatusCode } from '../httpStatusCode';
import { isFailureResult } from '../result';
import {
  createErrorResponse,
  createSuccessResponse,
  ResponseHeader,
} from './handlerResponse';

export const handleCatImageValidation = async (
  env: {
    cognitoTokenEndpoint: string;
    cognitoClientId: string;
    cognitoClientSecret: string;
    apiUrl: string;
  },
  requestBody: { image: string; imageExtension: string }
): Promise<Response> => {
  const issueTokenRequest = {
    endpoint: env.cognitoTokenEndpoint,
    cognitoClientId: env.cognitoClientId,
    cognitoClientSecret: env.cognitoClientSecret,
  };

  const issueAccessTokenResult = await issueAccessToken(issueTokenRequest);
  if (isFailureResult(issueAccessTokenResult)) {
    const errorBody = {
      title: 'issue_access_token_failed',
      status: httpStatusCode.internalServerError,
    };

    return createErrorResponse(errorBody, httpStatusCode.internalServerError);
  }

  const jsonRequestBody = JSON.stringify(requestBody);

  const isAcceptableCatImageRequest = {
    accessToken: issueAccessTokenResult.value.jwtAccessToken,
    jsonRequestBody,
  };

  const isAcceptableCatImageResult = await isAcceptableCatImage(
    { apiUrl: env.apiUrl },
    isAcceptableCatImageRequest
  );
  if (isFailureResult(isAcceptableCatImageResult)) {
    const errorBody = {
      title: 'is_acceptable_cat_image_failed',
      status: httpStatusCode.internalServerError,
    };

    return createErrorResponse(errorBody, httpStatusCode.internalServerError);
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

  return createSuccessResponse(responseBody, httpStatusCode.ok, headers);
};
