import { ResponseResolver, MockedRequest, restContext } from 'msw';

import { httpStatusCode } from '../../../httpStatusCode';

export const mockInternalServerError: ResponseResolver<
  MockedRequest,
  typeof restContext
> = (req, res, ctx) =>
  res(
    ctx.status(httpStatusCode.internalServerError),
    ctx.set('X-request-Id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ctx.set('X-lambda-request-Id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ctx.json({
      code: httpStatusCode.internalServerError,
      message: 'Internal Server Error',
    })
  );
