/**
 * @file config/getClientEnvironment.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);
import path = require('node:path');
import fs = require('node:fs');
import getClientPaths = require('./getClientPaths');

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
  const errors: Error[] = [];
  proc.exitCode = errors.length;
  //

  // rename 'cwd()' but not 'loadEnvFile()'
  const { loadEnvFile }: NodeJS.Process = proc;

  const paths = getClientPaths(proc);

  const isNotLocalTestEnv =
    proc.env['NODE_ENV'] !== 'test' && `${paths.dotenv}.local`;

  // https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
  const dotenvFiles: string[] = [];
  //
  dotenvFiles.push(`${paths.dotenv}.${proc.env['NODE_ENV']}.local`);
  dotenvFiles.push(`${paths.dotenv}.${proc.env['NODE_ENV']}`);
  if (isNotLocalTestEnv) dotenvFiles.push(`${paths.dotenv}.local`);
  dotenvFiles.push(paths.dotenv);
  //

  // Load environment variables from .env* files. Suppress warnings using silent
  // if this file is missing. Never modify any environment variables
  // that have already been set.  Variable expansion is supported in .env files.
  // https://github.com/motdotla/dotenv
  // https://github.com/motdotla/dotenv-expand
  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile.toString())) {
      //
      // const parsedEnvPath: Path.ParsedPath = path.parse(dotenvFile.toString());

      // if (verbose) info(`parseEnv('${parsedEnvPath.base}')`);
      //
      loadEnvFile(dotenvFile); // throws internally, or changes 'proc.env'
      //
    } else {
      const error = new Error("no '.env' file found", { cause: dotenvFile });
      errors.push(error);
    }
  });

  // We support resolving modules according to `NODE_PATH`.
  // This lets you use absolute paths in imports inside large monorepos:
  // https://github.com/facebook/create-react-app/issues/253.
  // It works similar to `NODE_PATH` in Node itself:
  // https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
  // Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
  // Otherwise, we risk importing Node.js core modules into an app instead of webpack shims.
  // https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421
  // We also resolve them to make sure all tools using them work consistently.
  const appDirectory = fs.realpathSync(proc.cwd());
  proc.env['NODE_PATH'] = (proc.env['NODE_PATH'] || '')
    .split(path.delimiter)
    .filter((folder) => folder && !path.isAbsolute(folder))
    .map((folder) => path.resolve(appDirectory, folder))
    .join(path.delimiter);

  if (errors.length < 0)
    throw new Error('parseEnv() failed', { cause: errors });

  // const env = parseEnv(proc);

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
    NODE_ENV: proc.env.NODE_ENV || 'development',
    // Useful for resolving the correct path to static assets in `public`.
    // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
    // This should only be used as an escape hatch. Normally you would put
    // images into the `src` and `import` them in code to get their paths.
    PUBLIC_URL: proc.env.PUBLIC_URL || '/', // 'publicUrl',
    // We support configuring the sockjs pathname during development.
    // These settings let a developer run multiple simultaneous projects.
    // They are used as the connection `hostname`, `pathname` and `port`
    // in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
    // and `sockPort` options in webpack-dev-server.
    WDS_SOCKET_HOST: proc.env.WDS_SOCKET_HOST || window.location.hostname,
    WDS_SOCKET_PATH: proc.env.WDS_SOCKET_PATH || '/ws',
    WDS_SOCKET_PORT: proc.env.WDS_SOCKET_PORT || window.location.port,
    // Whether or not react-refresh is enabled.
    // It is defined here so it is available in the webpackHotDevClient.
    FAST_REFRESH: proc.env.FAST_REFRESH || 'false', // !== 'false',
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
  const raw: NodeJS.ProcessEnv = Object.keys(proc.env)
    .filter((key) => REACT_APP.test(key))
    .reduce<NodeJS.ProcessEnv>((env, key) => {
      env[key] = proc.env[key];
      return env;
    }, envDefaults);

  // Stringify all values (except 'NODE_*') so we can feed into esbuild defines
  const stringified: {
    'process.env': NodeJS.ProcessEnv;
  } = {
    'process.env': Object.keys(raw)
      .filter((key) => NODE.test(key))
      .reduce<NodeJS.ProcessEnv>((env, key) => {
        env[key] = JSON.stringify(raw[key]);
        return env;
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
    getClientEnvironment(proc);
  })(global.process);
}
