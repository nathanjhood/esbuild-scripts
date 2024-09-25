/**
 * @file scripts/build.ts
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

interface build {
  (proc: NodeJS.Process): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>;
  (
    proc: NodeJS.Process,
    options?: ESBuild.BuildOptions
  ): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>;
}

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
  );
  //

  const MAX_SAFE_INTEGER = 2147483647;

  //
  const console = new node_console.Console({
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

  const {
    assert: assert,
    log: log,
    info: info,
    warn: warn,
    error: error,
    debug: debug,
    time: time,
    timeLog: timeLog,
    timeEnd: timeEnd,
  } = console;
  //

  //
  const logName: string = 'esbuild-scripts build';
  time(logName);
  //

  // //
  // const MIMETypes: Util.MIMEType[] = [
  //   new util.MIMEType('image/png'),
  //   new util.MIMEType('image/gif'),
  //   new util.MIMEType('text/javascript'),
  //   new util.MIMEType('text/typescript'),
  //   new util.MIMEType('text/ecmascript'),
  // ];
  // //

  //
  log(logName, 'log message');
  info(logName, 'info message');
  warn(logName, 'warn message');
  error(logName, 'error message');
  debug(logName, 'debug message');
  assert(false, logName + ' assert message');
  timeLog(logName);
  //

  const paths = getClientPaths(proc);

  function copyPublicFolder() {
    return fs.cpSync(paths.appPublic, paths.appBuild, {
      dereference: true,
      recursive: true,
      // filter: (file) => file !== paths.appHtml, // TODO: HTML parser plugin
    });
  }

  copyPublicFolder();

  //
  return await esbuild
    .build<ESBuild.BuildOptions>(getBuildOptions(proc, 'production'))
    .then(
      ({ warnings, errors, metafile, outputFiles, mangleCache }) => {
        info('outputFiles:', outputFiles);
        return { warnings, errors, metafile, outputFiles, mangleCache };
      },
      (err) => {
        throw err;
      }
    )
    .then(
      ({ errors, warnings, metafile, outputFiles, mangleCache }) => {
        if (errors) {
          const errorMessages = esbuild.formatMessagesSync(errors, {
            color: proc.stdout.isTTY,
            terminalWidth: 80,
            kind: 'warning',
          });
          errorMessages.forEach((e) => error(e));
        }
        return { errors, warnings, metafile, outputFiles, mangleCache };
      },
      (err) => {
        throw err;
      }
    )
    .then(
      ({ errors, warnings, metafile, outputFiles, mangleCache }) => {
        if (warnings) {
          const warningMessages = esbuild.formatMessagesSync(warnings, {
            color: proc.stdout.isTTY,
            terminalWidth: 80,
            kind: 'warning',
          });
          warningMessages.forEach((w) => warn(w));
        }
        return { errors, warnings, metafile, outputFiles, mangleCache };
      },
      (err) => {
        throw err;
      }
    )
    .then(
      ({ errors, warnings, metafile, outputFiles, mangleCache }) => {
        if (mangleCache) {
          debug(mangleCache);
        }
        return { errors, warnings, metafile, outputFiles, mangleCache };
      },
      (err) => {
        throw err;
      }
    )
    .then(
      ({ errors, warnings, metafile, outputFiles, mangleCache }) => {
        if (metafile) {
          const analysis = esbuild.analyzeMetafileSync(metafile, {
            color: proc.stdout.isTTY,
            verbose: true,
          });
          log(analysis);
        }
        return { errors, warnings, metafile, outputFiles, mangleCache };
      },
      (err) => {
        throw err;
      }
    )
    .catch((err) => {
      throw err;
    })
    .finally(() => {
      timeEnd(logName);
    });
};

// const buildAsync: (
//   proc: NodeJS.Process,
//   options?: ESBuild.BuildOptions
// ) => Promise<ESBuild.BuildResult<ESBuild.BuildOptions>> = util.promisify<
//   NodeJS.Process,
//   esbuild.BuildOptions | undefined,
//   esbuild.BuildResult<esbuild.BuildOptions>
// >(build);

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
    metafile: true,
    write: false,
    color: true,
    // color: global.process.stdout.hasColors(),
  });
}

export = build;
