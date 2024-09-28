import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__dirname);

import type ESBuild = require('esbuild');
// import type Util = require('node:util');
import util = require('node:util');
import fs = require('node:fs');
import node_console = require('node:console');
import esbuild = require('esbuild');

const start: (
  proc: NodeJS.Process,
  options?: esbuild.ServeOptions
) => Promise<esbuild.ServeResult> = async (
  proc: NodeJS.Process,
  options?: esbuild.ServeOptions
): Promise<esbuild.ServeResult> => {
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
  proc.on('unhandledRejection', (err: unknown, origin: Promise<unknown>) => {
    fs.writeSync(proc.stderr.fd, util.format(err, origin), null, 'utf8');
    throw err;
  });
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

  //
  const console = new node_console.Console({
    stdout: proc.stdout,
    stderr: proc.stdout,
    ignoreErrors: false,
    groupIndentation: 2,
  });
  //

  //
  const logName: string = 'esbuild-scripts start';
  console.time(logName);
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

  // //
  // console.info('info message');
  // console.warn('warn message');
  // console.error('error message');
  // console.debug('debug message');
  // console.assert(false, 'assert message');
  // console.timeLog(logName);
  // //

  //
  return esbuild
    .context(options ? options : {})
    .then(async (result) => {
      console.info(result);
      return await result.serve(options).then((ctx) => {
        return ctx;
      });
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
