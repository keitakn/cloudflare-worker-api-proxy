import { isAcceptableCatImage } from '../api/isAcceptableCatImage';
import { issueAccessToken } from '../api/issueAccessToken';
import { httpStatusCode } from '../httpStatusCode';
import { isFailureResult } from '../result';
import {
  createErrorResponse,
  createSuccessResponse,
  ResponseHeader,
} from './handlerResponse';

type Dto = {
  env: {
    cognitoTokenEndpoint: string;
    cognitoClientId: string;
    cognitoClientSecret: string;
    apiBaseUrl: string;
  };
  requestBody: {
    image: string;
    imageExtension: string;
  };
};

export const handleCatImageValidation = async (dto: Dto): Promise<Response> => {
  const issueTokenRequest = {
    endpoint: dto.env.cognitoTokenEndpoint,
    cognitoClientId: dto.env.cognitoClientId,
    cognitoClientSecret: dto.env.cognitoClientSecret,
  };

  const issueAccessTokenResult = await issueAccessToken(issueTokenRequest);
  if (isFailureResult(issueAccessTokenResult)) {
    const errorBody = {
      title: 'failed to issue access token',
      type: 'InternalServerError',
      status: httpStatusCode.internalServerError,
    } as const;

    return createErrorResponse(errorBody, httpStatusCode.internalServerError);
  }

  const jsonRequestBody = JSON.stringify(dto.requestBody);

  const isAcceptableCatImageDto = {
    apiBaseUrl: dto.env.apiBaseUrl,
    accessToken: issueAccessTokenResult.value.jwtAccessToken,
    jsonRequestBody,
  };

  const isAcceptableCatImageResult = await isAcceptableCatImage(
    isAcceptableCatImageDto
  );
  if (isFailureResult(isAcceptableCatImageResult)) {
    const errorBody = {
      title: 'failed to is acceptable cat image',
      type: 'InternalServerError',
      status: httpStatusCode.internalServerError,
    } as const;

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
