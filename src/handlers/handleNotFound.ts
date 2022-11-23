import { httpStatusCode } from '../httpStatusCode';
import { createErrorResponse } from './handlerResponse';

export const handleNotFound = (request: { url: string }): Response => {
  const responseBody = {
    title: `not_found`,
    detail: `${request.url} is not found.`,
    status: httpStatusCode.notFound,
  };

  return createErrorResponse(responseBody, httpStatusCode.notFound);
};
