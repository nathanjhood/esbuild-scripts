/**
 * @file parseEnv.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import path = require('node:path');
import fs = require('node:fs');

type ParseEnvOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
  path?: string | URL | Buffer;
  encoding?: BufferEncoding;
};

interface parseEnv {
  default?(proc: NodeJS.Process): {
    raw: NodeJS.ProcessEnv;
    stringified: { 'process.env': NodeJS.ProcessEnv };
  };
  (proc: NodeJS.Process): {
    raw: NodeJS.ProcessEnv;
    stringified: { 'process.env': NodeJS.ProcessEnv };
  };
  (
    proc: NodeJS.Process,
    options?: ParseEnvOptions
  ): {
    raw: NodeJS.ProcessEnv;
    stringified: { 'process.env': NodeJS.ProcessEnv };
  };
}

const parseEnv: parseEnv = (
  proc: NodeJS.Process,
  options?: ParseEnvOptions
) => {
  //

  //
  const errors: Error[] = [];
  proc.exitCode = errors.length;
  //

  //
  const { cwd: getCwd, loadEnvFile: loadEnvFile } = proc;
  //
  const cwd = getCwd();
  // const encoding = options && options.encoding ? options.encoding : 'utf-8';
  // const debug: boolean = Boolean(options && options.debug);
  //

  const paths = {
    dotenv: path.resolve(cwd, '.env'), // TODO: this should come from 'configs/paths'
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
  // if this file is missing. dotenv will never modify any environment variables
  // that have already been set.  Variable expansion is supported in .env files.
  // https://github.com/motdotla/dotenv
  // https://github.com/motdotla/dotenv-expand
  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile.toString())) {
      //
      const parsedEnvPath = path.parse(dotenvFile.toString());
      // const formattedEnvPath = path.format(parsedEnvPath);
      //
      console.info(`parseEnv('${parsedEnvPath.base}')`);
      //
      loadEnvFile(dotenvFile); // throws internally, or changes 'proc.env'
      //
    } else {
      const error = new Error("no '.env' file found", { cause: dotenvFile });
      errors.push(error);
    }
  });

  const REACT_APP: RegExp = /^REACT_APP_/i;

  const envDefaults = {
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
  };

  if (errors.length < 0)
    throw new Error('parseEnv() failed', { cause: errors });

  //
  const raw = Object.keys(proc.env)
    .filter((key) => REACT_APP.test(key))
    .reduce<NodeJS.ProcessEnv>((env, key) => {
      env[key] = proc.env[key];
      return env;
    }, envDefaults);

  // Stringify all values so we can feed into esbuild defines
  const stringified = {
    'process.env': Object.keys(raw).reduce<typeof raw>((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, raw),
  };

  if (options && options.debug) console.log('raw:', raw);
  if (options && options.debug) console.log('stringified:', stringified);

  //
  return { raw, stringified };
  //
};

export = parseEnv;

// if (require.main === module) {
//   ((proc: NodeJS.Process, options: ParseEnvOptions) => {
//     parseEnv(proc, options);
//   })(global.process, {
//     verbose: global.process.env['VERBOSE'] !== undefined ? true : false,
//     debug: global.process.env['DEBUG'] !== undefined ? true : false,
//   });
// }
