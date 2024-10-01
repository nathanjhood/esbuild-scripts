/**
 * @file scripts/buildSync.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);

import type ESBuild = require('esbuild');
import util = require('node:util');
import fs = require('node:fs');
import node_console = require('node:console');
import esbuild = require('esbuild');

import getClientPaths = require('../config/getClientPaths');
import getBuildOptions = require('../config/esbuild/getBuildOptions');

interface buildSync {
  (proc: NodeJS.Process): ESBuild.BuildResult<ESBuild.BuildOptions>;
  (
    proc: NodeJS.Process,
    options?: ESBuild.BuildOptions
  ): ESBuild.BuildResult<ESBuild.BuildOptions>;
}

const buildSync: buildSync = (
  proc: NodeJS.Process,
  options?: ESBuild.BuildOptions
): ESBuild.BuildResult<ESBuild.BuildOptions> => {
  //
  proc.on(
    'uncaughtException',
    (err: Error, origin: NodeJS.UncaughtExceptionOrigin) => {
      fs.writeSync(proc.stderr.fd, util.format(err, origin), null, 'utf8');
      throw err;
    }
  );
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

  const copyPublicFolder: (paths: {
    appPublic: string;
    appBuild: string;
  }) => void = (paths: { appPublic: string; appBuild: string }) => {
    return fs.cpSync(paths.appPublic, paths.appBuild, {
      dereference: true,
      recursive: true,
    });
  };

  copyPublicFolder({
    appBuild: options && options.outdir ? options.outdir : paths.appBuild,
    appPublic:
      options && options.publicPath ? options.publicPath : paths.appPublic,
  });

  const {
    errors,
    warnings,
    metafile,
    outputFiles,
    mangleCache,
  }: ESBuild.BuildResult<ESBuild.BuildOptions> =
    esbuild.buildSync<ESBuild.BuildOptions>(buildOptions);

  if (errors) {
    const errorMessages = esbuild.formatMessagesSync(errors, {
      color: proc.stdout.isTTY,
      terminalWidth: 80,
      kind: 'error',
    });
    if (buildOptions.logLevel && logLevelValue(buildOptions.logLevel) <= 1)
      errorMessages.forEach((e) => console.error(e));
  }

  if (warnings) {
    const warningMessages = esbuild.formatMessagesSync(errors, {
      color: proc.stdout.isTTY,
      terminalWidth: 80,
      kind: 'warning',
    });
    if (buildOptions.logLevel && logLevelValue(buildOptions.logLevel) <= 2)
      warningMessages.forEach((w) => console.warn(w));
  }

  if (metafile) {
    const analysis = esbuild.analyzeMetafileSync(metafile, {
      color: proc.stdout.isTTY,
      verbose: true,
    });
    if (buildOptions.logLevel && logLevelValue(buildOptions.logLevel) <= 3)
      console.log(analysis);
  }

  if (mangleCache) {
    if (buildOptions.logLevel && logLevelValue(buildOptions.logLevel) <= 5)
      console.debug(mangleCache);
  }

  if (buildOptions.logLevel && logLevelValue(buildOptions.logLevel) <= 4)
    console.info('outputFiles:', outputFiles);

  return {
    errors,
    warnings,
    metafile,
    outputFiles,
    mangleCache,
  } satisfies ESBuild.BuildResult;
};

if (require.main === module) {
  ((
    proc: NodeJS.Process,
    options?: ESBuild.BuildOptions
  ): ESBuild.BuildResult<ESBuild.BuildOptions> => {
    //

    //
    return buildSync(proc, options);

    //
  })(global.process, {
    logLevel: 'silent',
    metafile: true,
    write: false,
    color: true,
    // platform: 'node',
    // color: global.process.stdout.hasColors(),
  });
}

export = buildSync;
