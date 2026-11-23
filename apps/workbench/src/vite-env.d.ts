/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TARGET_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
