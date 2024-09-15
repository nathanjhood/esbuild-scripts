/**
 * @file index.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
function getClientEnvironment(publicUrl: string) {
  // Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
  // injected into the application via DefinePlugin in webpack configuration.
  const REACT_APP: RegExp = /^REACT_APP_/i;
  //
  const raw: {
    NODE_ENV: "development" | "production" | "test";
    PUBLIC_URL: string | undefined;
    WDS_SOCKET_HOST: string | undefined;
    WDS_SOCKET_PATH: string | undefined;
    WDS_SOCKET_PORT: string | undefined;
    FAST_REFRESH: boolean;
    // HTTPS: boolean;
    // "HOST": string;
    // PORT: number;
  } = Object.keys(process.env)
    .filter((key) => REACT_APP.test(key))
    .reduce(
      (env, key) => {
        // const __key = _key as keyof typeof _env;
        env[key] = process.env[key];
        return env;
      },
      {
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV: process.env.NODE_ENV || "development",
        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: publicUrl,
        // We support configuring the sockjs pathname during development.
        // These settings let a developer run multiple simultaneous projects.
        // They are used as the connection `hostname`, `pathname` and `port`
        // in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
        // and `sockPort` options in webpack-dev-server.
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
        // Whether or not react-refresh is enabled.
        // It is defined here so it is available in the webpackHotDevClient.
        FAST_REFRESH: process.env.FAST_REFRESH !== "false",
        // // custom
        // HTTPS: HTTPS !== "false",
        // HOST: HOST ? HOST : "0.0.0.0",
        // PORT: PORT ? parseInt(PORT) : 3000
      }
    );
  // Stringify all values so we can feed into esbuild defines
  const stringified: {
    "process.env": {};
  } = {
    "process.env": Object.keys(raw).reduce((_env, _key) => {
      _env[_key] = JSON.stringify(raw[_key]);
      return _env;
    }, {}),
  };

  return { raw, stringified };
};
