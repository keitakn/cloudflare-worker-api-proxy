import { fetchLgtmImagesInRandom } from '../api/fetchLgtmImages';
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
};

export const handleFetchLgtmImagesInRandom = async (
  dto: Dto
): Promise<Response> => {
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

  const fetchLgtmImagesRequest = {
    apiBaseUrl: dto.env.apiBaseUrl,
    accessToken: issueAccessTokenResult.value.jwtAccessToken,
  };

  const fetchLgtmImagesResult = await fetchLgtmImagesInRandom(
    fetchLgtmImagesRequest
  );
  if (isFailureResult(fetchLgtmImagesResult)) {
    const errorBody = {
      title: 'failed to fetch lgtm images in random',
      type: 'InternalServerError',
      status: httpStatusCode.internalServerError,
    } as const;

    return createErrorResponse(errorBody, httpStatusCode.internalServerError);
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

  return createSuccessResponse(responseBody, httpStatusCode.ok, headers);
};
