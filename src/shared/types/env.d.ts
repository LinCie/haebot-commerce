interface ImportMetaEnv {
  readonly APP_URL: string;
  readonly BACKEND_URL: string;
  readonly BACKEND_API_KEY: string;
  readonly SPACE_ID: string;
  readonly PUBLIC_R2_URL: string;
  readonly PUBLIC_LARAVEL_STORAGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
