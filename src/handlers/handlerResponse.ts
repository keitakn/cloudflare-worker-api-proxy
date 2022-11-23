import { HttpStatusCode, httpStatusCode } from '../httpStatusCode';

export type ResponseHeader = {
  'Content-Type': 'application/json';
  'X-Request-Id'?: string;
  'X-Lambda-Request-Id'?: string;
};

export const createSuccessResponse = (
  body: unknown,
  statusCode: HttpStatusCode = httpStatusCode.ok,
  headers: ResponseHeader = { 'Content-Type': 'application/json' }
): Response => {
  const jsonBody = JSON.stringify(body);

  return new Response(jsonBody, { headers, status: statusCode });
};

export type ErrorBody = {
  title: string;
  detail?: string;
  type?: string | 'about:blank';
  status?: number;
};

export const createErrorResponse = (
  body: ErrorBody,
  statusCode: HttpStatusCode = httpStatusCode.internalServerError
): Response => createSuccessResponse(body, statusCode);
