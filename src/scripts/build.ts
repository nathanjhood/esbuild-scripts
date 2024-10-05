/**
 * @file scripts/build.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);
import type ESBuild = require('esbuild');
import util = require('node:util');
import fs = require('node:fs');
import node_console = require('node:console');
import esbuild = require('esbuild');
import parseEnv = require('../process/parseEnv');
import getClientPaths = require('../config/getClientPaths');
import getBuildOptions = require('../config/esbuild/getBuildOptions');

interface build {
  (proc: NodeJS.Process): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>;
  (
    proc: NodeJS.Process,
    options?: ESBuild.BuildOptions
  ): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>;
}

/**
 *
 * @param {NodeJS.Process} proc
 * @param {(ESBuild.BuildOptions|undefined)} options
 * @returns {Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>}
 * @async
 */
const build: build = async (
  proc: NodeJS.Process,
  options?: ESBuild.BuildOptions
): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>> => {
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

  if (env['NODE_ENV'] !== 'production')
    throw new Error(
      util.styleText(
        'red',
        "'NODE_ENV' should be 'production', but it was " + env['NODE_ENV']
      )
    );

  const defaultBuildOptions: ESBuild.BuildOptions = getBuildOptions(
    proc,
    'production'
  );

  const buildOptions: ESBuild.BuildOptions = {
    // defaults
    ...defaultBuildOptions,
    // args
    ...options,
  };

  const paths = getClientPaths(proc);

  const logLevel = buildOptions.logLevel;

  /**
   *
   * @param paths
   * @returns {void}
   */
  const copyPublicFolder: (paths: {
    appPublic: string;
    appBuild: string;
  }) => void = (paths: { appPublic: string; appBuild: string }): void => {
    return fs.cpSync(paths.appPublic, paths.appBuild, {
      dereference: true,
      recursive: true,
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
  });

  //
  return esbuild
    .build<ESBuild.BuildOptions>(buildOptions)
    .then<ESBuild.BuildResult<ESBuild.BuildOptions>>(logMangleCache, (err) => {
      throw err;
    })
    .then<ESBuild.BuildResult<ESBuild.BuildOptions>>(formatErrors, (err) => {
      throw err;
    })
    .then<ESBuild.BuildResult<ESBuild.BuildOptions>>(formatWarnings, (err) => {
      throw err;
    })
    .then<ESBuild.BuildResult<ESBuild.BuildOptions>>(logOutputFiles, (err) => {
      throw err;
    })
    .then<ESBuild.BuildResult<ESBuild.BuildOptions>>(analyzeMetaFile, (err) => {
      throw err;
    })
    .catch<never>((err) => {
      throw err;
    })
    .finally(() => {
      console.timeEnd(logName);
    });
};

export = build;

if (require.main === module) {
  (async (
    proc: NodeJS.Process,
    options?: ESBuild.BuildOptions
  ): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>> => {
    //

    //
    return build(proc, options)
      .then((result: ESBuild.BuildResult<ESBuild.BuildOptions>) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    //
  })(global.process, {
    logLevel: 'info',
    metafile: false,
    write: true,
    color: true,
  });
}
