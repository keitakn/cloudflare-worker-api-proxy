import { httpStatusCode } from '../httpStatusCode';
import { createErrorResponse } from './handlerResponse';

type Dto = {
  url: string;
};

export const handleNotFound = (dto: Dto): Response => {
  const responseBody = {
    title: `not_found`,
    detail: `${dto.url} is not found.`,
    status: httpStatusCode.notFound,
  };

  return createErrorResponse(responseBody, httpStatusCode.notFound);
};
