import { fetchLgtmImagesInRandom } from '../api/fetchLgtmImages';
import { issueAccessToken } from '../api/issueAccessToken';
import { httpStatusCode } from '../httpStatusCode';
import { isFailureResult } from '../result';
import {
  createErrorResponse,
  createSuccessResponse,
  ResponseHeader,
} from './handlerResponse';

export const handleFetchLgtmImagesInRandom = async (env: {
  endpoint: string;
  cognitoClientId: string;
  cognitoClientSecret: string;
  apiUrl: string;
}): Promise<Response> => {
  const issueTokenRequest = {
    endpoint: env.endpoint,
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

  const fetchLgtmImagesRequest = {
    apiUrl: env.apiUrl,
    accessToken: issueAccessTokenResult.value.jwtAccessToken,
  };

  const fetchLgtmImagesResult = await fetchLgtmImagesInRandom(
    fetchLgtmImagesRequest
  );
  if (isFailureResult(fetchLgtmImagesResult)) {
    const errorBody = {
      title: 'fetch_lgtm_images_in_random_failed',
      status: httpStatusCode.internalServerError,
    };

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
