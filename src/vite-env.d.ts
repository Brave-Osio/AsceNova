/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  /** Google OAuth web client ID — public by design. When unset, the Google sign-in button is hidden. */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}
