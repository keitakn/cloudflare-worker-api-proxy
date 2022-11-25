import { Response } from '@cloudflare/workers-types/2021-11-03/index';

export type RequestId = string;

export type LambdaRequestId = string;

type RequestIds = {
  xRequestId?: RequestId;
  xLambdaRequestId?: LambdaRequestId;
};

export const mightExtractRequestIds = (response: Response): RequestIds => {
  const requestIds: RequestIds = {};

  if (response.headers.get('x-request-id') != null) {
    requestIds.xRequestId = response.headers.get('x-request-id') as string;
  }

  if (response.headers.get('x-lambda-request-id') != null) {
    requestIds.xLambdaRequestId = response.headers.get(
      'x-lambda-request-id'
    ) as string;
  }

  return requestIds;
};
