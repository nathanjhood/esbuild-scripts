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

  //
  proc.on(
    'uncaughtException',
    (err: Error, origin: NodeJS.UncaughtExceptionOrigin) => {
      fs.writeSync(proc.stderr.fd, util.format(err, origin), null, 'utf8');
      throw err;
    }
  ) satisfies NodeJS.Process;
  //
  proc.on('unhandledRejection', (err: unknown, origin: Promise<unknown>) => {
    fs.writeSync(proc.stderr.fd, util.format(err, origin), null, 'utf8');
    throw err;
  }) satisfies NodeJS.Process;
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

  const MAX_SAFE_INTEGER: number = 2147483647;

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

  const paths = getClientPaths(proc);

  /**
   *
   * @returns {Promise<void>}
   * @async
   */
  async function copyPublicFolder(): Promise<void> {
    //
    const publicPath =
      options && options.publicPath ? options.publicPath : paths.appPublic;
    //
    const outdir = options && options.outdir ? options.outdir : paths.appBuild;
    //
    return new Promise<void>((resolvePublicDir) => {
      //
      return resolvePublicDir(
        fs.cpSync(publicPath, outdir, {
          dereference: true,
          recursive: true,
        })
      );
    });
  }

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
      if (buildOptions.logLevel && logLevelValue(buildOptions.logLevel) <= 1)
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
      if (buildOptions.logLevel && logLevelValue(buildOptions.logLevel) <= 2)
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
      if (buildOptions.logLevel && logLevelValue(buildOptions.logLevel) <= 3)
        console.log(analysis);
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
        if (!outputFiles) return onReject();
        //
        if (buildOptions.logLevel && logLevelValue(buildOptions.logLevel) <= 4)
          outputFiles.forEach((outputFile) => console.info(outputFile));
        //
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
          if (
            buildOptions.logLevel &&
            logLevelValue(buildOptions.logLevel) <= 5
          )
            console.debug(mangleCache);
        }

        //
        return onResolve(result);
      }
    );
  };

  await copyPublicFolder().catch((err) => {
    throw err;
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
    logLevel: 'silent',
    metafile: true,
    write: false,
    color: true,
    // color: global.process.stdout.hasColors(),
  });
}
