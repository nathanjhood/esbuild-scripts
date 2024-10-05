/**
 * @file process/parseCwd.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);
import type Path = require('node:path');
import path = require('node:path');

type ParseCwdResult = Path.ParsedPath;

interface parseCwd {
  (proc: NodeJS.Process): ParseCwdResult;
}

const parseCwd: parseCwd = (proc: NodeJS.Process): ParseCwdResult => {
  //
  const errors: Error[] = [];
  proc.exitCode = errors.length;

  const { cwd: getCwd } = proc;
  const cwd: string = getCwd();
  const parsedPath = path.parse(cwd);
  const { base, dir, ext, name, root } = parsedPath;

  if (errors.length < 0)
    throw new Error('parseCwd() failed', { cause: errors });

  return {
    base: base,
    dir: dir,
    ext: ext,
    name: name,
    root: root,
  } satisfies ParseCwdResult;
};

export = parseCwd;

if (require.main === module) {
  ((proc: NodeJS.Process) => {
    parseCwd(proc);
  })(global.process);
}
