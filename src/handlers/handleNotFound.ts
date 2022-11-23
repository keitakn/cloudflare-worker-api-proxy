import { httpStatusCode } from '../httpStatusCode';
import { createErrorResponse } from './handlerResponse';

type Dto = {
  url: string;
};

export const handleNotFound = (dto: Dto): Response => {
  const responseBody = {
    title: 'not found',
    type: 'ResourceNotFound',
    detail: `${dto.url} is not found.`,
    status: httpStatusCode.notFound,
  } as const;

  return createErrorResponse(responseBody, httpStatusCode.notFound);
};
