/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production site origin for canonical URLs & Open_graph, e.g. https://striply.example.com */
  readonly VITE_PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
