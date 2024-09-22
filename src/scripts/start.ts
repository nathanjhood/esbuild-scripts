// import type Util = require('node:util');
// import util = require('node:util');
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
      error(origin, err);
      throw err;
    }
  );
  //

  //
  const {
    assert: assert,
    info: info,
    warn: warn,
    error: error,
    debug: debug,
    time: time,
    timeLog: timeLog,
    timeEnd: timeEnd,
  } = new console.Console({
    stdout: proc.stdout,
    stderr: proc.stdout,
    ignoreErrors: false,
    groupIndentation: 2,
  });
  //

  //
  const logName: string = 'esbuild-scripts start';
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
  info('info message');
  warn('warn message');
  error('error message');
  debug('debug message');
  assert(false, 'assert message');
  timeLog(logName);
  //

  //
  return esbuild
    .context(options ? options : {})
    .then(async (result) => {
      info(result);
      return await result.serve(options).then((ctx) => {
        return ctx;
      });
    })
    .catch((err) => {
      throw err;
    })
    .finally(() => {
      timeEnd(logName);
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
