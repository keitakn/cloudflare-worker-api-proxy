import { getSentry, sentry } from '@honojs/sentry';
import { Hono } from 'hono';
import { Bindings } from './bindings';
import {
  handleCatImageValidation,
  validateHandleCatImageValidationRequestBody,
} from './handlers/handleCatImageValidation';
import { handleFetchLgtmImagesInRandom } from './handlers/handleFetchLgtmImagesInRandom';
import { handleNotFound } from './handlers/handleNotFound';
import {
  createValidationErrorResponse,
  ProblemDetails,
} from './handlers/handlerResponse';
import { httpStatusCode } from './httpStatusCode';
import { AcceptedTypesImageExtension } from './lgtmImage';

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '*',
  sentry({
    dsn: 'https://42809d9efa8849f88f0136ced7917950@o1223117.ingest.sentry.io/4504248714330112',
  })
);

app.get('/lgtm-images', async (c) => {
  return await handleFetchLgtmImagesInRandom({
    env: {
      cognitoTokenEndpoint: c.env.COGNITO_TOKEN_ENDPOINT,
      cognitoClientId: c.env.COGNITO_CLIENT_ID,
      cognitoClientSecret: c.env.COGNITO_CLIENT_SECRET,
      apiBaseUrl: c.env.LGTMEOW_API_URL,
      cacheClient: c.env.COGNITO_TOKEN,
    },
  });
});

app.post('/cat-images/validation-results', async (c) => {
  const env = {
    cognitoTokenEndpoint: c.env.COGNITO_TOKEN_ENDPOINT,
    cognitoClientId: c.env.COGNITO_CLIENT_ID,
    cognitoClientSecret: c.env.COGNITO_CLIENT_SECRET,
    apiBaseUrl: c.env.IMAGE_RECOGNITION_API_URL,
    cacheClient: c.env.COGNITO_TOKEN,
  };

  const requestBody = await c.req.json<{
    image: string;
    imageExtension: AcceptedTypesImageExtension;
  }>();

  const validationResult =
    validateHandleCatImageValidationRequestBody(requestBody);
  if (!validationResult.isValidate && validationResult.invalidParams != null) {
    return createValidationErrorResponse(validationResult.invalidParams);
  }

  return await handleCatImageValidation({ env, requestBody });
});

app.onError((error, c) => {
  const problemDetails: ProblemDetails = {
    title: error.name,
    type: 'InternalServerError',
    status: httpStatusCode.internalServerError,
  } as const;

  const $sentry = getSentry(c);
  $sentry.setTag('requestIds', error.message);
  $sentry.setTag('environment', c.env.APP_ENV);
  $sentry.captureException(error);

  return c.json(problemDetails, httpStatusCode.internalServerError);
});

app.all('*', (c) => {
  return handleNotFound({ url: c.req.url });
});

export default app;
