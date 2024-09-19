/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv extends NodeJS.Dict<string> {
    readonly NODE_ENV: 'development' | 'test' | 'production';
    readonly HOST?: '127.0.0.1' | 'localhost' | string | undefined;
    readonly PORT?: string | undefined;
    readonly HTTPS?: 'true' | 'false' | undefined;
    readonly SSL_CRT_FILE?: string | undefined;
    readonly SSL_KEY_FILE?: string | undefined;
    /**
     * An alias for `NODE_DISABLE_COLORS`. The value of the environment variable
     * is arbitrary.
     */
    readonly NO_COLOR?: any | string | undefined;
    /**
     * The FORCE_COLOR environment variable is used to enable ANSI colorized
     * output. The value may be:
     * - `1`, `true`, or the empty string `''` indicate 16-color support,
     * - `2` to indicate 256-color support, or
     * - `3` to indicate 16 million-color support.
     * When `FORCE_COLOR` is used and set to a supported value,
     * both the `NO_COLOR`, and `NODE_DISABLE_COLORS` environment variables are
     * ignored.
     * Any other value will result in colorized output being disabled.
     */
    readonly FORCE_COLOR?: 'true' | '' | '1' | '2' | '3' | string | undefined;
    /**
     * When set, colors will not be used in the REPL.
     */
    readonly NODE_DISABLE_COLORS?: '1' | undefined;
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
    /**
     * When set to `true`, treat warnings as failures in the build. It also
     * makes the test runner non-watching. Most CIs set this flag by default.
     */
    readonly CI?: 'true' | 'false' | undefined;
    /**
     * When set to `true`, the watcher runs in polling mode, as necessary inside
     * a VM. Use this option if npm start isn't detecting changes.
     */
    readonly CHOKIDAR_USEPOLLING?: 'true' | 'false' | undefined;
    /**
     * When set to `false`, source maps are not generated for a production
     * build. This solves out of memory (OOM) issues on some smaller machines.
     */
    readonly GENERATE_SOURCEMAP?: 'true' | 'false' | undefined;
    /**
     * When set to `false`, disables experimental support for Fast Refresh to
     * allow you to tweak your components in real time without reloading the
     * page.
     */
    readonly FAST_REFRESH?: 'true' | 'false' | undefined;
    /**
     * When set to `true`, you can run and properly build TypeScript projects
     * even if there are TypeScript type check errors. These errors are printed
     * as warnings in the terminal and/or browser console.
     */
    readonly TSC_COMPILE_ON_ERROR?: 'true' | 'false' | undefined;
    /**
     * When set to true, disables the
     * {@link https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html new JSX transform}
     * introduced in React 17 and backported to React 16.14.0, 15.7.0, and
     * 0.14.10. New projects will use a version of React that supports this by
     * default but you may need to disable it in existing projects if you can't
     * upgrade React.
     */
    readonly DISABLE_NEW_JSX_TRANSFORM?: 'true' | 'false' | undefined;
    /**
     * By default, the runtime script will be embedded into index.html during
     * the production build. When set to false, the script will not be embedded
     * and will be imported as usual. This is normally required when dealing
     * with CSP.
     */
    readonly INLINE_RUNTIME_CHUNK?: 'true' | 'false' | undefined;
    /**
     * When set to true, ESLint errors are converted to warnings during
     * development. As a result, ESLint output will no longer appear in the
     * error overlay.
     */
    readonly ESLINT_NO_DEV_ERRORS?: 'true' | 'false' | undefined;
    /**
     * When set to `true`, eslint-webpack-plugin will be completely disabled.
     */
    readonly DISABLE_ESLINT_PLUGIN?: 'true' | 'false' | undefined;
    /**
     * By default, images smaller than 10,000 bytes are encoded as a data URI in
     * base64 and inlined in the CSS or JS build artifact. Set this to control
     * the size limit in bytes. Setting it to `0` will disable the inlining of
     * images.
     */
    readonly IMAGE_INLINE_SIZE_LIMIT?: '10000' | string | undefined;
    readonly VERBOSE?: 'true' | 'false' | undefined;
    readonly DEBUG?: 'true' | 'false' | undefined;
  }
}
