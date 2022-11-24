import { Hono } from 'hono';
import { Bindings } from './bindings';
import { handleCatImageValidation } from './handlers/handleCatImageValidation';
import { handleFetchLgtmImagesInRandom } from './handlers/handleFetchLgtmImagesInRandom';
import { handleNotFound } from './handlers/handleNotFound';
import { AcceptedTypesImageExtension } from './lgtmImage';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/lgtm-images', async (c) => {
  // TODO 環境変数のバリデーションを実施する
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

  // TODO バリデーションを追加する
  const requestBody = await c.req.json<{
    image: string;
    imageExtension: AcceptedTypesImageExtension;
  }>();

  return await handleCatImageValidation({ env, requestBody });
});

app.all('*', (c) => {
  return handleNotFound({ url: c.req.url });
});

export default app;
