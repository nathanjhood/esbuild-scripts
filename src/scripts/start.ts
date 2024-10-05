/**
 * @file scripts/start.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);

import type ESBuild = require('esbuild');
// import type Util = require('node:util');
import util = require('node:util');
import fs = require('node:fs');
import node_console = require('node:console');
import esbuild = require('esbuild');

import parseEnv = require('../process/parseEnv');
import getClientPaths = require('../config/getClientPaths');
import getBuildOptions = require('../config/esbuild/getBuildOptions');
import getServeOptions = require('../config/esbuild/getServeOptions');

interface start {
  (proc: NodeJS.Process): Promise<void>;
  (
    proc: NodeJS.Process,
    options?: ESBuild.ServeOptions & ESBuild.BuildOptions
  ): Promise<void>;
}

/**
 *
 * @param {NodeJS.Process} proc
 * @param {ESBuild.ServeOptions & ESBuild.BuildOptions} options
 * @returns {Promise<void>}
 * @async
 */
const start: start = async (
  proc: NodeJS.Process,
  options?: ESBuild.ServeOptions & ESBuild.BuildOptions
): Promise<void> => {
  //
  const ac: AbortController = new AbortController();
  //
  const MAX_SAFE_INTEGER: number = 2147483647;
  //
  const unhandledRejectionListener: NodeJS.UnhandledRejectionListener = (
    err: unknown,
    origin: Promise<unknown>
  ): void => {
    const error: Error =
      err instanceof Error
        ? err
        : new Error(util.styleText('red', 'Recieved unhandled rejection'), {
            cause: origin,
          });
    ac.abort(error.message);
    fs.writeSync(proc.stderr.fd, util.format(error), null, 'utf8');
    throw error;
  };
  //
  const uncaughtExceptionListener: NodeJS.UncaughtExceptionListener = (
    error: Error,
    origin: NodeJS.UncaughtExceptionOrigin
  ): void => {
    ac.abort(error);
    fs.writeSync(proc.stderr.fd, util.format(error, origin), null, 'utf8');
    throw error;
  };

  //
  proc.on(
    'uncaughtException',
    uncaughtExceptionListener
  ) satisfies NodeJS.Process;
  //
  proc.on(
    'unhandledRejection',
    unhandledRejectionListener
  ) satisfies NodeJS.Process;
  //

  const logLevelValue: (logLevel: ESBuild.LogLevel) => number = (
    logLevel: ESBuild.LogLevel
  ): number => {
    switch (logLevel) {
      case 'silent': {
        return 0;
      }
      case 'error': {
        return 1;
      }
      case 'warning': {
        return 2;
      }
      case 'info': {
        return 3;
      }
      case 'debug': {
        return 4;
      }
      case 'verbose': {
        return 5;
      }
      default: {
        throw new Error('No matching case in switch statement');
      }
    }
  };

  //
  const console: Console = new node_console.Console({
    groupIndentation: 2,
    ignoreErrors: options && options.logLevel === 'error' ? true : false,
    stdout: proc.stdout,
    stderr: proc.stderr,
    inspectOptions: {
      depth: MAX_SAFE_INTEGER,
      breakLength: 80,
      colors: options && options.color ? options.color : false,
    },
    // colorMode: 'auto', // cannot be used if using 'inspectOptions.colors'
  });

  //
  const logName: string = 'esbuild-scripts build';
  console.time(logName);
  //

  const env = parseEnv(proc);

  if (proc.env['NODE_ENV'] !== 'development')
    throw new Error(
      util.styleText(
        'red',
        "'NODE_ENV' should be 'development', but it was " + proc.env['NODE_ENV']
      )
    );

  // const argv = parseArgv(proc);

  const defaultBuildOptions: ESBuild.BuildOptions = getBuildOptions(
    proc,
    'production'
  );

  const defaultServeOptions: ESBuild.ServeOptions = getServeOptions(
    proc,
    'production'
  );

  const buildOptions: ESBuild.BuildOptions = {
    // defaults
    ...defaultBuildOptions,
    // // args
    // ...options,
    // required
    banner: {
      js: `new EventSource('/esbuild').addEventListener('change', () => location.reload());`,
    },
    sourcemap: true,
  };

  const serveOptions: ESBuild.ServeOptions = {
    // defaults
    ...defaultServeOptions,
    // // args
    // ...options,
  };

  const paths = getClientPaths(proc);

  const logLevel = buildOptions.logLevel;

  const watchContext = async (
    ctx: ESBuild.BuildContext<ESBuild.BuildOptions>
  ): Promise<ESBuild.BuildContext<ESBuild.BuildOptions>> => {
    return ctx
      .watch()
      .then(() => {
        return ctx;
      })
      .catch((err) => {
        throw err;
      });
  };

  const serveContext = async (
    ctx: ESBuild.BuildContext<ESBuild.BuildOptions>
  ): Promise<{ result: ESBuild.ServeResult; ctx: ESBuild.BuildContext }> => {
    return ctx
      .serve(serveOptions)
      .then((result) => {
        return { result, ctx };
      })
      .catch((err) => {
        throw err;
      });
  };

  const cancelContext = async (
    ctx: ESBuild.BuildContext<ESBuild.BuildOptions>
  ): Promise<void> => {
    return ctx
      .cancel()
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  };

  const disposeContext = async (
    ctx: ESBuild.BuildContext<ESBuild.BuildOptions>
  ): Promise<void> => {
    return ctx
      .dispose()
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  };

  return esbuild
    .context(buildOptions)
    .then(watchContext, (err) => {
      throw err;
    })
    .then(serveContext, (err) => {
      throw err;
    })
    .then(({ result, ctx }) => {
      // if (isInteractive) {
      //   clearConsole();
      // }

      // if (env.raw.FAST_REFRESH && semver.lt(react.version, '16.10.0')) {
      //   console.log(
      //     chalk.yellow(
      //       `Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`
      //     )
      //   );
      // }

      // console.log(chalk.cyan('Starting the development server...\n'));
      // console.log(
      //   'Serving app at',
      //   chalk.yellow(urls.localUrlForBrowser),
      //   '\n'
      // );
      // openBrowser(urls.localUrlForBrowser);
      // console.log('Press', chalk.yellow('Enter'), 'to reload.');
      // console.log('Press', chalk.yellow('Ctrl + c'), 'to quit.');
      // console.log();

      ['SIGINT', 'SIGTERM'].forEach(function (sig) {
        proc.on(sig, function () {
          console.log();
          console.log(
            util.styleText('cyan', sig),
            'recieved: shutting down gracefully...'
          );
          ctx.cancel().then(() => {
            ctx.dispose().then(() => {
              process.exit();
            });
          });
        });
      });

      if (process.env.CI !== 'true') {
        // Whenever we get some data over stdin
        ['data'].forEach(function (ev) {
          console.log();
          process.stdin.on(ev, () => {
            try {
              console.log('stdin recieved event:', util.styleText('cyan', ev));
              // Cancel the already-running build
              ctx.cancel().then(() => {
                // Then start a new build
                ctx.rebuild().then((result) => {
                  return console.log('build:', result);
                });
              });
            } catch (err) {
              console.error(err);
            }
          });
        });
        // Gracefully exit when stdin ends
        process.stdin.on('end', function () {
          console.log();
          console.log(`shutting down gracefully...`);
          ctx.cancel().then(() => {
            ctx.dispose().then(() => {
              process.exit();
            });
          });
        });
      }
    })
    .catch((err) => {
      throw err;
    })
    .finally(() => {
      console.timeEnd(logName);
    });
};

if (require.main === module) {
  (async (proc: NodeJS.Process, options?: esbuild.ServeOptions) => {
    await start(proc, options);
  })(global.process, {
    host: global.process.env['HOST'] ? global.process.env['HOST'] : '127.0.0.1',
    port: global.process.env['PORT']
      ? parseInt(global.process.env['PORT'])
      : 5173,
  });
}

export = start;
