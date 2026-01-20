/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string;
  readonly VITE_PRIVY_CLIENT_ID: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CANTON_NODE_ID: string;
  readonly VITE_SUPA_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}





