import type { LgtmImage } from '../lgtmImage';
import { createFailureResult, createSuccessResult, Result } from '../result';
import { FetchLgtmImagesInRandomError } from './errors/FetchLgtmImagesInRandomError';
import {
  isFetchLgtmImagesResponseBody,
  validateFetchLgtmImagesResponseBody,
} from './fetchLgtmImagesResponse';
import { JwtAccessToken } from './issueAccessToken';
import {
  LambdaRequestId,
  mightExtractRequestIds,
  RequestId,
} from './mightExtractRequestIds';
import {
  createValidationErrorResponse,
  ValidationErrorResponse,
} from './validationErrorResponse';

type Dto = {
  apiBaseUrl: string;
  accessToken: JwtAccessToken;
};

type SuccessResponse = {
  lgtmImages: LgtmImage[];
  xRequestId?: RequestId;
  xLambdaRequestId?: LambdaRequestId;
};

type FailureResponse = {
  error: Error;
  xRequestId?: RequestId;
  xLambdaRequestId?: LambdaRequestId;
};

export const fetchLgtmImagesInRandom = async (
  dto: Dto
): Promise<
  Result<SuccessResponse, FailureResponse | ValidationErrorResponse>
> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${dto.accessToken}`,
    },
  };

  const response = await fetch(`${dto.apiBaseUrl}/lgtm-images`, options);
  if (!response.ok) {
    const requestIds = mightExtractRequestIds(response);

    throw new FetchLgtmImagesInRandomError(
      `X-Request-Id=${String(
        requestIds.xRequestId
      )}:X-Lambda-Request-Id:${String(requestIds.xLambdaRequestId)}`
    );
  }

  const responseBody = await response.json();
  if (isFetchLgtmImagesResponseBody(responseBody)) {
    const successResponse: SuccessResponse = {
      lgtmImages: responseBody.lgtmImages.map((value) => {
        return { id: Number(value.id), imageUrl: value.url };
      }),
    };

    const requestIds = mightExtractRequestIds(response);

    return createSuccessResult<SuccessResponse>({
      ...successResponse,
      ...requestIds,
    });
  }

  const validationResult = validateFetchLgtmImagesResponseBody(responseBody);
  if (!validationResult.isValidate && validationResult.invalidParams != null) {
    return createFailureResult<ValidationErrorResponse>(
      createValidationErrorResponse(validationResult.invalidParams, response)
    );
  }

  const requestIds = mightExtractRequestIds(response);

  throw new FetchLgtmImagesInRandomError(
    `X-Request-Id=${String(requestIds.xRequestId)}:X-Lambda-Request-Id:${String(
      requestIds.xLambdaRequestId
    )}`
  );
};
