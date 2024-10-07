/**
 * @file scripts/start.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);
import type ESBuild = require('esbuild');
import util = require('node:util');
import fs = require('node:fs');
import path = require('node:path');
import node_console = require('node:console');
import esbuild = require('esbuild');
import childProcess = require('node:child_process');
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

  if (env['NODE_ENV'] !== 'development')
    throw new Error(
      util.styleText(
        'red',
        "'NODE_ENV' should be 'development', but it was " + env['NODE_ENV']
      )
    );

  // const argv = parseArgv(proc);

  const defaultBuildOptions: ESBuild.BuildOptions = getBuildOptions(
    proc,
    'production'
  );

  const defaultServeOptions: ESBuild.ServeOptions = getServeOptions(proc);

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

  const logLevel = buildOptions.logLevel;

  const paths = getClientPaths(proc);

  const buildServiceWorker = async () => {
    return await esbuild.build({
      entryPoints: [paths.swSrc],
      bundle: false, // TODO: how to set the swr build up?
      minify: false,
      outfile: path.resolve(paths.appBuild, 'service-worker.js'),
    });
  };

  const buildHTML = () => {
    let html = fs.readFileSync(paths.appHtml, { encoding: 'utf8' });
    // let htmlresult;
    Object.keys(proc.env).forEach((key) => {
      const escapeStringRegexp = (str: string) => {
        return str
          .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
          .replace(/-/g, '\\x2d');
      };
      const value = proc.env[key];
      const htmlsrc = new RegExp('%' + escapeStringRegexp(key) + '%', 'g');

      if (value) html = html.replaceAll(htmlsrc, value);
    });
    return fs.writeFileSync(path.resolve(paths.appBuild, 'index.html'), html);
  };

  /**
   *
   * @param paths
   * @returns {void}
   */
  const copyPublicFolder: (paths: {
    appPublic: string;
    appBuild: string;
    appHtml: string;
  }) => void = (paths: {
    appPublic: string;
    appBuild: string;
    appHtml: string;
  }): void => {
    return fs.cpSync(paths.appPublic, paths.appBuild, {
      dereference: true,
      recursive: true,
      filter: (file) => file !== paths.appHtml,
    });
  };

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

  /**
   *
   * @param {ESBuild.BuildResult<ESBuild.BuildOptions>} result
   * @returns {Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>}
   * @async
   */
  const formatErrors = async (
    result: ESBuild.BuildResult<ESBuild.BuildOptions>
  ): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>> => {
    //
    const { errors } = result;
    //
    if (errors) {
      //
      const errorMessages: string[] = await esbuild.formatMessages(errors, {
        color: proc.stdout.isTTY,
        terminalWidth: 80,
        kind: 'error',
      });
      //
      if (logLevel && logLevelValue(logLevel) >= 1)
        errorMessages.forEach((e) => console.error(e));
      //
    }
    //
    return result satisfies ESBuild.BuildResult<ESBuild.BuildOptions>;
  };

  /**
   *
   * @param {ESBuild.BuildResult<ESBuild.BuildOptions>} result
   * @returns {Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>}
   * @async
   */
  const formatWarnings = async (
    result: ESBuild.BuildResult<ESBuild.BuildOptions>
  ): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>> => {
    //
    const { warnings } = result;
    //
    if (warnings) {
      //
      const warningMessages: string[] = await esbuild.formatMessages(warnings, {
        color: proc.stdout.isTTY,
        terminalWidth: 80,
        kind: 'warning',
      });
      //
      if (logLevel && logLevelValue(logLevel) >= 2)
        warningMessages.forEach((w) => console.warn(w));
      //
    }
    //
    return result satisfies ESBuild.BuildResult<ESBuild.BuildOptions>;
  };

  /**
   *
   * @param {ESBuild.BuildResult<ESBuild.BuildOptions>} result
   * @returns {Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>}
   * @async
   */
  const analyzeMetaFile = async (
    result: ESBuild.BuildResult<ESBuild.BuildOptions>
  ): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>> => {
    //
    const { metafile } = result;
    //
    if (metafile) {
      //
      const analysis: string = await esbuild.analyzeMetafile(metafile, {
        color: proc.stdout.isTTY,
        verbose: true,
      });
      //
      if (logLevel && logLevelValue(logLevel) >= 3) console.log(analysis);
      //
    }
    //
    return result satisfies ESBuild.BuildResult<ESBuild.BuildOptions>;
  };

  /**
   *
   * @param {ESBuild.BuildResult<ESBuild.BuildOptions>} result
   * @returns {Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>}
   * @async
   */
  const logOutputFiles = async (
    result: ESBuild.BuildResult<ESBuild.BuildOptions>
  ): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>> => {
    //
    return new Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>(
      (onResolve, onReject) => {
        //
        const { outputFiles } = result;
        //
        if (logLevel && logLevelValue(logLevel) >= 4) {
          if (!outputFiles)
            return onReject('logOutputFiles failed... did you set write=true?');

          outputFiles.forEach((outputFile) => console.info(outputFile));
        }
        return onResolve(result);
      }
    );
  };

  /**
   *
   * @param {ESBuild.BuildResult<ESBuild.BuildOptions>} result
   * @returns {Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>}
   * @async
   */
  const logMangleCache = async (
    result: ESBuild.BuildResult<ESBuild.BuildOptions>
  ): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>> => {
    //
    return new Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>(
      (onResolve /**, onReject */) => {
        //
        const { mangleCache } = result;
        // //
        if (mangleCache) {
          //
          if (logLevel && logLevelValue(logLevel) >= 5)
            console.debug(mangleCache);
        }

        //
        return onResolve(result);
      }
    );
  };

  copyPublicFolder({
    appBuild: options && options.outdir ? options.outdir : paths.appBuild,
    appPublic:
      options && options.publicPath ? options.publicPath : paths.appPublic,
    appHtml: paths.appHtml,
  });

  if (fs.existsSync(paths.swSrc)) buildServiceWorker();

  buildHTML();

  return esbuild
    .context(buildOptions)
    .then(watchContext, (err) => {
      throw err;
    })
    .then(serveContext, (err) => {
      throw err;
    })
    .then(({ result, ctx }) => {
      const { host, port } = result;

      // if (isInteractive) {
      //   clearConsole();
      // }

      // if (env.raw.FAST_REFRESH && semver.lt(react.version, '16.10.0')) {
      //   console.log(
      //     util.styleText('yellow',
      //       `Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`
      //     )
      //   );
      // }

      const isHttps: true | false = proc.env['HTTPS'] === 'true' ? true : false;

      let protocol: string = 'http';
      if (isHttps) protocol += 's';

      console.log(
        util.styleText('cyan', 'Starting the development server...\n')
      );
      console.log(
        'Serving app at',
        util.styleText('yellow', protocol + '://' + host + ':' + port),
        '\n'
      );
      // openBrowser(urls.localUrlForBrowser);
      console.log(
        'Edit any',
        util.styleText('yellow', "'.ts/tsx'"),
        'file and save to fast-refresh.'
      );
      console.log('Press', util.styleText('yellow', 'Enter'), 'to reload.');
      console.log('Press', util.styleText('yellow', 'Ctrl + c'), 'to quit.');
      console.log();

      ['SIGINT', 'SIGTERM'].forEach(function (sig) {
        proc.on(sig, function () {
          console.log();
          console.log(
            util.styleText('cyan', sig),
            'recieved: shutting down gracefully...'
          );
          cancelContext(ctx).then(() => {
            disposeContext(ctx).then(() => {
              process.exit();
            });
          });
        });
      });

      if (proc.env.CI !== 'true') {
        // Whenever we get some data over stdin
        ['data'].forEach(function (ev) {
          console.log();
          proc.stdin.on(ev, () => {
            console.log('stdin recieved event:', util.styleText('cyan', ev));
            // Cancel the already-running build
            ctx
              .cancel()
              .then(() => {
                // Then start a new build
                ctx
                  .rebuild()
                  .then<ESBuild.BuildResult<ESBuild.BuildOptions>>(
                    logMangleCache,
                    (err) => {
                      throw err;
                    }
                  )
                  .then<ESBuild.BuildResult<ESBuild.BuildOptions>>(
                    formatErrors,
                    (err) => {
                      throw err;
                    }
                  )
                  .then<ESBuild.BuildResult<ESBuild.BuildOptions>>(
                    formatWarnings,
                    (err) => {
                      throw err;
                    }
                  )
                  .then<ESBuild.BuildResult<ESBuild.BuildOptions>>(
                    logOutputFiles,
                    (err) => {
                      throw err;
                    }
                  )
                  .then<ESBuild.BuildResult<ESBuild.BuildOptions>>(
                    analyzeMetaFile,
                    (err) => {
                      throw err;
                    }
                  )
                  .then<ESBuild.BuildResult<ESBuild.BuildOptions>>((result) => {
                    console.log(
                      'Edit any',
                      util.styleText('yellow', "'.ts/tsx'"),
                      'file and save to fast-refresh.'
                    );
                    console.log(
                      'Press',
                      util.styleText('yellow', 'Enter'),
                      'to reload.'
                    );
                    console.log(
                      'Press',
                      util.styleText('yellow', 'Ctrl + c'),
                      'to quit.'
                    );
                    console.log();
                    return result;
                  });
              })
              .catch((err) => {
                throw err;
              });
          });
        });
        // Gracefully exit when stdin ends
        proc.stdin.on('end', function () {
          console.log();
          console.log(`shutting down gracefully...`);
          ctx.cancel().then(() => {
            ctx.dispose().then(() => {
              proc.exit();
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
      : 3000,
  });
}

export = start;
