import { Hono } from 'hono';
import { Bindings } from './bindings';
import {
  handleCatImageValidation,
  validateHandleCatImageValidationRequestBody,
} from './handlers/handleCatImageValidation';
import { handleFetchLgtmImagesInRandom } from './handlers/handleFetchLgtmImagesInRandom';
import { handleNotFound } from './handlers/handleNotFound';
import { createValidationErrorResponse } from './handlers/handlerResponse';
import { AcceptedTypesImageExtension } from './lgtmImage';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/lgtm-images', async (c) => {
  return await handleFetchLgtmImagesInRandom({
    env: {
      cognitoTokenEndpoint: c.env.COGNITO_TOKEN_ENDPOINT,
      cognitoClientId: c.env.COGNITO_CLIENT_ID,
      cognitoClientSecret: c.env.COGNITO_CLIENT_SECRET,
      apiBaseUrl: c.env.LGTMEOW_API_URL,
    },
  });
});

app.post('/cat-images/validation-results', async (c) => {
  const env = {
    cognitoTokenEndpoint: c.env.COGNITO_TOKEN_ENDPOINT,
    cognitoClientId: c.env.COGNITO_CLIENT_ID,
    cognitoClientSecret: c.env.COGNITO_CLIENT_SECRET,
    apiBaseUrl: c.env.IMAGE_RECOGNITION_API_URL,
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

app.all('*', (c) => {
  return handleNotFound({ url: c.req.url });
});

export default app;
