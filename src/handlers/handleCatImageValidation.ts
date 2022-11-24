import { z } from 'zod';
import { isAcceptableCatImage } from '../api/isAcceptableCatImage';
import { issueAccessToken } from '../api/issueAccessToken';
import { httpStatusCode } from '../httpStatusCode';
import type { AcceptedTypesImageExtension } from '../lgtmImage';
import { acceptedTypesImageExtensions } from '../lgtmImage';
import { isFailureResult } from '../result';
import { validation, ValidationResult } from '../validator';
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
    imageExtension: AcceptedTypesImageExtension;
  };
};

export const validateHandleCatImageValidationRequestBody = (
  value: unknown
): ValidationResult => {
  const schema = z.object({
    image: z.string().min(1),
    imageExtension: z.enum(acceptedTypesImageExtensions),
  });

  return validation(schema, value);
};

export const handleCatImageValidation = async (dto: Dto): Promise<Response> => {
  const issueTokenRequest = {
    endpoint: dto.env.cognitoTokenEndpoint,
    cognitoClientId: dto.env.cognitoClientId,
    cognitoClientSecret: dto.env.cognitoClientSecret,
  };

  const issueAccessTokenResult = await issueAccessToken(issueTokenRequest);
  if (isFailureResult(issueAccessTokenResult)) {
    const problemDetails = {
      title: 'failed to issue access token',
      type: 'InternalServerError',
      status: httpStatusCode.internalServerError,
    } as const;

    return createErrorResponse(
      problemDetails,
      httpStatusCode.internalServerError
    );
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
    const problemDetails = {
      title: 'failed to is acceptable cat image',
      type: 'InternalServerError',
      status: httpStatusCode.internalServerError,
    } as const;

    return createErrorResponse(
      problemDetails,
      httpStatusCode.internalServerError
    );
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
