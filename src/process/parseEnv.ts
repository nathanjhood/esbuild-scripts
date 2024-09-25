/**
 * @file process/parseEnv.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import { createRequire } from 'node:module';

const require: NodeRequire = createRequire(__filename);

import type Path = require('node:path');
import path = require('node:path');
import fs = require('node:fs');
import console = require('node:console');

type ParseEnvOptions = {
  verbose?: true | false;
  debug?: true | false;
  cwd?: string | URL | Buffer;
};

type ParseEnvResult = {
  raw: NodeJS.ProcessEnv;
  stringified: { 'process.env': NodeJS.ProcessEnv };
};

interface parseEnv {
  (proc: NodeJS.Process): ParseEnvResult;
  (proc: NodeJS.Process, options?: ParseEnvOptions): ParseEnvResult;
}

const parseEnv: parseEnv = (
  proc: NodeJS.Process,
  options?: ParseEnvOptions
): ParseEnvResult => {
  //

  //
  const errors: Error[] = [];
  proc.exitCode = errors.length;
  //

  const {
    // assert,
    info,
    // warn,
    // error,
    log,
    // debug,
    // clear,
    // time,
    // timeLog,
    // timeEnd,
  } = new console.Console({
    stdout: proc.stdout,
    stderr: proc.stderr,
    groupIndentation: 2,
    inspectOptions: {
      breakLength: 80,
    },
  });

  // rename 'cwd()' but not 'loadEnvFile()'
  const { loadEnvFile }: NodeJS.Process = proc;
  //
  const cwd: string | URL | Buffer =
    options && options.cwd ? options.cwd : proc.cwd();
  const verbose: boolean =
    options && options.verbose
      ? options.verbose
      : global.process.env['VERBOSE'] !== undefined
        ? true
        : false;
  const debug: boolean =
    options && options.debug
      ? options.debug
      : global.process.env['DEBUG'] !== undefined
        ? true
        : false;

  const paths: {
    dotenv: string;
  } = {
    // TODO: this should come from 'configs/paths' when used in the CLI...
    // we can use `parseEnv(proc, { cwd: paths.dotenv })` there when calling :)
    dotenv: path.resolve(cwd.toString(), '.env'),
  };

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
      const parsedEnvPath: Path.ParsedPath = path.parse(dotenvFile.toString());
      // const formattedEnvPath = path.format(parsedEnvPath);
      //
      if (verbose && !debug) info(`parseEnv('${parsedEnvPath.base}')`);
      //
      loadEnvFile(dotenvFile); // throws internally, or changes 'proc.env'
      //
    } else {
      const error = new Error("no '.env' file found", { cause: dotenvFile });
      errors.push(error);
    }
  });

  const REACT_APP: RegExp = /^REACT_APP_/i;
  const NODE: RegExp = /^NODE_/i;

  const envDefaults: {
    NODE_ENV: 'development' | 'test' | 'production';
    PUBLIC_URL: string;
    WDS_SOCKET_HOST: string | undefined;
    WDS_SOCKET_PATH: string;
    WDS_SOCKET_PORT: string | undefined;
    FAST_REFRESH: 'true' | 'false';
    __TEST_VARIABLE__: string | undefined;
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
    WDS_SOCKET_HOST: proc.env.WDS_SOCKET_HOST, // || window.location.hostname,
    WDS_SOCKET_PATH: proc.env.WDS_SOCKET_PATH || '/ws',
    WDS_SOCKET_PORT: proc.env.WDS_SOCKET_PORT, // || window.location.port,
    // Whether or not react-refresh is enabled.
    // It is defined here so it is available in the webpackHotDevClient.
    FAST_REFRESH: proc.env.FAST_REFRESH || 'false', // !== 'false',
    // custom
    // FORCE_COLOR: proc.env.FORCE_COLOR || 'true',
    // HTTPS: HTTPS !== "false",
    // HOST: HOST ? HOST : "0.0.0.0",
    // PORT: PORT ? parseInt(PORT) : 3000
    __TEST_VARIABLE__: proc.env.__TEST_VARIABLE__ || undefined,
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

  if (debug) log('raw:', raw);
  if (debug) log('stringified:', stringified);

  //
  return { raw, stringified } satisfies ParseEnvResult;
  //
};

export = parseEnv;

if (require.main === module) {
  ((proc: NodeJS.Process, options: ParseEnvOptions) => {
    parseEnv(proc, options);
  })(global.process, {
    verbose: global.process.env['VERBOSE'] !== undefined ? true : false,
    debug: global.process.env['DEBUG'] !== undefined ? true : false,
  });
}
