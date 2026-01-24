interface ImportMetaEnv {
  readonly APP_URL: string;
  readonly BACKEND_URL: string;
  readonly BACKEND_API_KEY: string;
  readonly SPACE_ID: string;
  readonly R2_URL: string;
  readonly LARAVEL_STORAGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
