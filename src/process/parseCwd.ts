/**
 * @file parseCwd.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import path = require('node:path');

type ParseCwdOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
};

type ParseCwdResult = path.ParsedPath;

interface parseCwd {
  default?(proc: NodeJS.Process): ParseCwdResult;
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
    console.info(formattedPath);
  }

  if (options && options.debug) {
    console.debug(parsedPath);
    console.debug(formattedPath);
  }

  return {
    base: base,
    dir: dir,
    ext: ext,
    name: name,
    root: root,
  };
};

export = parseCwd;

if (require.main === module) {
  ((proc: NodeJS.Process, options?: ParseCwdOptions) => {
    return parseCwd(proc);
    //
  })(global.process, { sync: true });
}
