/**
 * @file process/parseCwd.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import type Path = require('node:path');
import path = require('node:path');
import console = require('node:console');

type ParseCwdOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
};

type ParseCwdResult = Path.ParsedPath;

interface parseCwd {
  (proc: NodeJS.Process): ParseCwdResult;
  (proc: NodeJS.Process, options?: ParseCwdOptions): ParseCwdResult;
}

const parseCwd: parseCwd = (
  proc: NodeJS.Process,
  options?: ParseCwdOptions
): ParseCwdResult => {
  //

  //
  const errors: Error[] = [];
  proc.exitCode = errors.length;
  //

  const {
    // assert,
    info,
    // warn,
    // error,
    // log,
    debug,
    // clear,
    // time,
    // timeLog,
    // timeEnd,
  } = new console.Console({
    stdout: proc.stdout,
    stderr: proc.stderr,
    groupIndentation: 2,
    inspectOptions: {
      breakLength: 80,
    },
  });

  //
  const { cwd: getCwd } = proc;
  //
  const cwd: string = getCwd();
  //
  const parsedPath = path.parse(cwd);
  //
  const { base, dir, ext, name, root } = parsedPath;
  //
  const formattedPath = path.format({
    base: base,
    dir: dir,
    ext: ext,
    name: name,
    root: root,
  });

  if (errors.length < 0)
    throw new Error('parseCwd() failed', { cause: errors });

  if (options && options.verbose && !options.debug) {
    info(formattedPath);
  }

  if (options && options.debug) {
    debug(parsedPath);
    debug(formattedPath);
  }

  return {
    base: base,
    dir: dir,
    ext: ext,
    name: name,
    root: root,
  } satisfies ParseCwdResult;
};

export = parseCwd;

// if (require.main === module) {
//   ((proc: NodeJS.Process, options?: ParseCwdOptions) => {
//     return parseCwd(proc, options);
//     //
//   })(global.process, {
//     //     verbose: global.process.env['VERBOSE'] !== undefined ? true : false,
//     //     debug: global.process.env['DEBUG'] !== undefined ? true : false,
//   });
// }
