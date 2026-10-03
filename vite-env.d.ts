interface ImportMetaEnv {
  readonly VITE_CRYOVIGIL_PLATFORM_API_URL: string;
  readonly VITE_LABORATORIES_ENDPOINT_PATH: string;
  readonly VITE_HISTORY_ENDPOINT_PATH: string;
  readonly VITE_ALERTS_ENDPOINT_PATH: string;
  readonly VITE_REPORTS_ENDPOINT_PATH: string;
  readonly VITE_SIGNUP_ENDPOINT_PATH: string;
  readonly VITE_SIGNIN_ENDPOINT_PATH: string;
  readonly VITE_USERS_ENDPOINT_PATH: string;
  readonly VITE_PRIME_UI_LICENSE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
