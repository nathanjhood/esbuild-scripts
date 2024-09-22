// import type Url = require('node:url');
// import type Path = require('node:path');
// import url = require('node:url');
import util = require('node:util');
// import path = require('node:path');
import fs = require('node:fs');
import node_console = require('node:console');
import esbuild = require('esbuild');

// const file: Readonly<Path.ParsedPath> = path.parse(__filename);
// const dir: Readonly<Path.ParsedPath> = path.parse(__dirname);

const build: (
  proc: NodeJS.Process,
  options?: esbuild.BuildOptions
) => Promise<esbuild.BuildResult<esbuild.BuildOptions>> = async (
  proc: NodeJS.Process,
  options?: esbuild.BuildOptions
): Promise<esbuild.BuildResult<esbuild.BuildOptions>> => {
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
  } = new node_console.Console({
    groupIndentation: 2,
    ignoreErrors: options && options.logLevel === 'error' ? true : false,
    stdout: proc.stdout,
    stderr: proc.stderr,
    inspectOptions: {
      depth: MAX_SAFE_INTEGER,
      breakLength: 80,
      colors: options && options.color,
      compact: options && options.logLevel === 'verbose' ? true : false,
    },
  });
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

  //
  return esbuild
    .build<esbuild.BuildOptions>(options ? options : {})
    .then((result) => {
      const { warnings, errors, metafile, outputFiles, mangleCache } = result;
      debug(mangleCache);
      error(errors);
      warn(warnings);
      info(outputFiles);
      log(metafile);
      return result;
    })
    .catch((err) => {
      throw err;
    })
    .finally(() => {
      timeEnd(logName);
    });
};

const buildAsync: (
  proc: NodeJS.Process,
  options?: esbuild.BuildOptions
) => Promise<esbuild.BuildResult<esbuild.BuildOptions>> = util.promisify<
  NodeJS.Process,
  esbuild.BuildOptions | undefined,
  esbuild.BuildResult<esbuild.BuildOptions>
>(build);

if (require.main === module) {
  (async (proc: NodeJS.Process, options?: esbuild.BuildOptions) => {
    //

    //
    await buildAsync(proc, options)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
    //

    //
  })(global.process, {
    logLevel: 'verbose',
    // color: global.process.stdout.hasColors(),
  });
}

export = build;
