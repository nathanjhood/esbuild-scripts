import type Url = require('node:url');
// import type Path = require('node:path');
import type ESBuild = require('esbuild');
// import url = require('node:url');
import util = require('node:util');
import path = require('node:path');
import fs = require('node:fs');
import node_console = require('node:console');
import esbuild = require('esbuild');

// const file: Readonly<Path.ParsedPath> = path.parse(__filename);
// const dir: Readonly<Path.ParsedPath> = path.parse(__dirname);

const commOptions: ESBuild.CommonOptions = {};

const build: (
  proc: NodeJS.Process,
  options?: ESBuild.BuildOptions
) => Promise<ESBuild.BuildResult<ESBuild.BuildOptions>> = async (
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

  const {
    entryPoints,
    outdir,
    loader,
    metafile,
    write,
    absWorkingDir,
    color,
    logLevel,
  }: ESBuild.BuildOptions = {
    entryPoints: [path.resolve(__dirname, 'test.ts')],
    outdir: path.resolve(proc.cwd(), 'build'),
    loader: {
      '.ts': 'ts',
    },
    metafile: true,
    write: true,
    absWorkingDir: proc.cwd(),
    color: options && options.color ? options.color : false,
    logLevel: options && options.logLevel ? options.logLevel : 'info',
  } satisfies ESBuild.BuildOptions;

  //
  return await esbuild
    .build<ESBuild.BuildOptions>({
      entryPoints: entryPoints,
      outdir: outdir,
      loader: loader,
      metafile: metafile,
      write: write,
      absWorkingDir: absWorkingDir,
      color: color,
      logLevel: 'silent',
    })
    .then(
      (result) => {
        const { warnings, errors, metafile, outputFiles, mangleCache } = result;
        debug('mangleCache:', mangleCache);
        error('errors:', errors);
        warn('warnings:', warnings);
        info('outputFiles:', outputFiles);
        log('metfile:', metafile);
        return result;
      },
      (err) => {
        throw err;
      }
    )
    .catch((err) => {
      throw err;
    });
  // return esbuild.buildSync<esbuild.BuildOptions>({
  //   entryPoints: entryPoints,
  //   outdir: outdir,
  //   loader: loader,
  // });
  // .then((result) => {
  //   const { warnings, errors, metafile, outputFiles, mangleCache } = result;
  //   debug(mangleCache);
  //   error(errors);
  //   warn(warnings);
  //   info(outputFiles);
  //   log(metafile);
  //   return result;
  // })
  // .catch((err) => {
  //   throw err;
  // })
  // .finally(() => {
  //   timeEnd(logName);
  // });
};

const buildAsync: (
  proc: NodeJS.Process,
  options?: ESBuild.BuildOptions
) => Promise<ESBuild.BuildResult<ESBuild.BuildOptions>> = util.promisify<
  NodeJS.Process,
  esbuild.BuildOptions | undefined,
  esbuild.BuildResult<esbuild.BuildOptions>
>(build);

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

    // .then((result) => {
    //   return result;
    // })
    // .catch((err) => {
    //   throw err;
    // });
    //

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
