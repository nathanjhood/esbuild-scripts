/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "test" | "production";
    readonly HOST: string;
    readonly PORT: string;
    readonly HTTPS: "true" | "false";
    readonly SSL_CRT_FILE?: string | undefined;
    readonly SSL_KEY_FILE?: string | undefined;
    readonly PUBLIC_URL: string;
    readonly BUILD_DIR: string;
    readonly WDS_SOCKET_HOST?: string | undefined;
    readonly WDS_SOCKET_PATH?: string | undefined;
    readonly WDS_SOCKET_PORT?: string | undefined;
    readonly FAST_REFRESH?: string | undefined;
    readonly TSC_COMPILE_ON_ERROR?: "true" | "false" | undefined;
    readonly DISABLE_NEW_JSX_TRANSFORM?: "true" | "false" | undefined;
    readonly INLINE_RUNTIME_CHUNK?: "true" | "false" | undefined;
    readonly ESLINT_NO_DEV_ERRORS?: "true" | "false" | undefined;
    readonly DISABLE_ESLINT_PLUGIN?: "true" | "false" | undefined;
    readonly IMAGE_INLINE_SIZE_LIMIT?: string | undefined;
  }
}
