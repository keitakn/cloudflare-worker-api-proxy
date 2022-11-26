import { createFailureResult, createSuccessResult, Result } from '../result';
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

type LgtmImage = { id: string; url: string };

type LgtmImages = LgtmImage[];

type Dto = {
  apiBaseUrl: string;
  accessToken: JwtAccessToken;
};

type SuccessResponse = {
  lgtmImages: LgtmImages;
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
    const failureResponse: FailureResponse = {
      error: new Error('failed to fetchLgtmImagesInRandom'),
    };

    const requestIds = mightExtractRequestIds(response);

    return createFailureResult<FailureResponse>({
      ...failureResponse,
      ...requestIds,
    });
  }

  const responseBody = await response.json();
  if (isFetchLgtmImagesResponseBody(responseBody)) {
    // TODO idはnumber型で返すように変更する
    const successResponse: SuccessResponse = {
      lgtmImages: responseBody,
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

  const failureResponse: FailureResponse = {
    error: new Error('response body is invalid'),
  };

  const requestIds = mightExtractRequestIds(response);

  return createFailureResult<FailureResponse>({
    ...failureResponse,
    ...requestIds,
  });
};
