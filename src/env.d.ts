/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_SIGN_IN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
