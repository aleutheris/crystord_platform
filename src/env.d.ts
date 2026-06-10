/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_SIGN_IN_URL: string;
  readonly PUBLIC_APP_SIGN_UP_URL?: string;
  readonly PUBLIC_APP_DEMO_URL?: string;
  readonly PUBLIC_GRAPHQL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
