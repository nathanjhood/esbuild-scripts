/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv extends NodeJS.Dict<string> {
    readonly NODE_ENV?: 'development' | 'test' | 'production';
    readonly HOST?: '127.0.0.1' | 'localhost' | string | undefined;
    readonly PORT?: string | undefined;
    readonly HTTPS?: 'true' | 'false' | undefined;
    /**
     * Assumes your application is hosted at the serving web server's root or a
     * subpath as specified in `package.json#homepage`. Normally ignores the
     * hostname. You may use this variable to force assets to be referenced
     * verbatim to the url you provide (hostname included). This may be
     * particularly useful when using a CDN to host your application.
     */
    readonly PUBLIC_URL?: '/' | string | undefined;
    readonly BUILD_DIR?: 'dist' | string | undefined;
    /**
     * When set, will run the development server with a custom websocket
     * hostname for hot module reloading. Defaults to `window.location.hostname`
     * for the SockJS hostname. You may use this variable to start local
     * development on more than one project at a time.
     */
    readonly WDS_SOCKET_HOST?: string | undefined;
    /**
     * When set, will run the development server with a custom websocket path
     * for hot module reloading. Defaults to `/ws` for the SockJS pathname. You
     * may use this variable to start local development on more than one project
     * at a time
     */
    readonly WDS_SOCKET_PATH?: '/ws' | string | undefined;
    /**
     * When set, will run the development server with a custom websocket port
     * for hot module reloading. Defaults to `window.location.port` for the
     * SockJS port. You may use this variable to start local development on more
     * than one project at a time.
     */
    readonly WDS_SOCKET_PORT?: string | undefined;
  }
}
