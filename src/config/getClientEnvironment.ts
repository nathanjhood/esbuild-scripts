/**
 * @file config/getClientEnvironment.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/**
 *
 */
import { createRequire } from 'node:module';

const require: NodeRequire = createRequire(__filename);

import parseEnv = require('../process/parseEnv');

type GetClientEnvironmentResult = {
  raw: NodeJS.ProcessEnv;
  stringified: { 'process.env': NodeJS.ProcessEnv };
};

interface getClientEnvironment {
  (proc: NodeJS.Process): GetClientEnvironmentResult;
}

const getClientEnvironment: getClientEnvironment = (
  proc: NodeJS.Process
): GetClientEnvironmentResult => {
  //
  proc.on('unhandledRejection', (err) => {
    throw err;
  });
  //
  const errors: Error[] = [];
  proc.exitCode = errors.length;
  //

  const env = parseEnv(proc);

  const REACT_APP: RegExp = /^REACT_APP_/i;
  const NODE: RegExp = /^NODE_/i;

  const envDefaults: {
    NODE_ENV: 'development' | 'test' | 'production';
    PUBLIC_URL: string;
    WDS_SOCKET_HOST: string | undefined;
    WDS_SOCKET_PATH: string;
    WDS_SOCKET_PORT: string | undefined;
    FAST_REFRESH: 'true' | 'false';
    // __TEST_VARIABLE__: string | undefined;
  } = {
    // Useful for determining whether we’re running in production mode.
    // Most importantly, it switches React into the correct mode.
    NODE_ENV: env.NODE_ENV || 'development',
    // Useful for resolving the correct path to static assets in `public`.
    // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
    // This should only be used as an escape hatch. Normally you would put
    // images into the `src` and `import` them in code to get their paths.
    PUBLIC_URL: env.PUBLIC_URL || '/', // 'publicUrl',
    // We support configuring the sockjs pathname during development.
    // These settings let a developer run multiple simultaneous projects.
    // They are used as the connection `hostname`, `pathname` and `port`
    // in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
    // and `sockPort` options in webpack-dev-server.
    WDS_SOCKET_HOST: env.WDS_SOCKET_HOST, // || window.location.hostname,
    WDS_SOCKET_PATH: env.WDS_SOCKET_PATH || '/ws',
    WDS_SOCKET_PORT: env.WDS_SOCKET_PORT, // || window.location.port,
    // Whether or not react-refresh is enabled.
    // It is defined here so it is available in the webpackHotDevClient.
    FAST_REFRESH: env.FAST_REFRESH || 'false', // !== 'false',
    // custom
    // FORCE_COLOR: env.FORCE_COLOR || 'true',
    // HTTPS: HTTPS !== "false",
    // HOST: HOST ? HOST : "0.0.0.0",
    // PORT: PORT ? parseInt(PORT) : 3000
    // __TEST_VARIABLE__: proc.env.__TEST_VARIABLE__ || undefined,
  };

  if (errors.length < 0)
    throw new Error('parseEnv() failed', { cause: errors });

  //
  const raw: NodeJS.ProcessEnv = Object.keys(env)
    .filter((key) => REACT_APP.test(key))
    .reduce<NodeJS.ProcessEnv>((_env, key) => {
      _env[key] = env[key];
      return _env;
    }, envDefaults);

  // Stringify all values (except 'NODE_*') so we can feed into esbuild defines
  const stringified: {
    'process.env': NodeJS.ProcessEnv;
  } = {
    'process.env': Object.keys(raw)
      .filter((key) => NODE.test(key))
      .reduce<NodeJS.ProcessEnv>((_env, key) => {
        _env[key] = JSON.stringify(raw[key]);
        return _env;
      }, raw),
  };

  return Object.freeze<GetClientEnvironmentResult>({
    raw,
    stringified,
  } as const satisfies Readonly<GetClientEnvironmentResult>);
};

export = getClientEnvironment;

if (require.main === module) {
  ((proc: NodeJS.Process) => {
    const result = getClientEnvironment(proc);
    global.console.assert(result);
  })(global.process);
}
