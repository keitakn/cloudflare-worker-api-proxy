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

export type ProblemDetails = {
  title: string;
  type: 'ResourceNotFound' | 'ValidationError' | 'InternalServerError';
  status?: HttpStatusCode;
  detail?: string;
};

export const createErrorResponse = (
  problemDetails: ProblemDetails,
  statusCode: HttpStatusCode = httpStatusCode.internalServerError
): Response => createSuccessResponse(problemDetails, statusCode);
