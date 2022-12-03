export type Bindings = {
  APP_ENV: 'staging' | 'production';
  COGNITO_CLIENT_ID: string;
  COGNITO_CLIENT_SECRET: string;
  COGNITO_TOKEN_ENDPOINT: string;
  IMAGE_RECOGNITION_API_URL: string;
  LGTMEOW_API_URL: string;
  COGNITO_TOKEN: KVNamespace;
  SENTRY_DSN: `https://${string}@${string}.ingest.sentry.io/${string}`;
};
