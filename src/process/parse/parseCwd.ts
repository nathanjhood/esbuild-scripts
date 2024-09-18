/**
 * @file parseCwd.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import path = require('node:path');

type ParseCwdOptions = {
  sync?: true | false;
};

type ParsedCwd = path.ParsedPath;

interface parseCwd {
  default?(proc: NodeJS.Process): Promise<ParsedCwd>;
  (proc: NodeJS.Process): Promise<ParsedCwd>;
  (proc: NodeJS.Process, options?: ParseCwdOptions): Promise<ParsedCwd>;
}

const parseCwd: parseCwd = (
  proc: NodeJS.Process,
  options?: ParseCwdOptions
) => {
  //

  //
  const errors: Error[] = [];
  proc.exitCode = errors.length;
  //

  //
  return new Promise<ParsedCwd>((resolveCwd, rejectCwd) => {
    //
    const { cwd: getCwd } = proc;
    //
    const cwd: string = getCwd();
    //
    const parsedPath = path.parse(cwd);
    //
    const { base, dir, ext, name, root } = parsedPath;
    //

    //
    if (errors.length < 0)
      return rejectCwd(new Error('parseCwd() failed', { cause: errors }));
    //

    //
    return resolveCwd({
      base: base,
      dir: dir,
      ext: ext,
      name: name,
      root: root,
    });
    //
  }).catch((err) => {
    throw err;
  });
};

export = parseCwd;

if (require.main === module) {
  ((proc: NodeJS.Process, options?: ParseCwdOptions) => {
    return parseCwd(proc)
      .then((cwd) => {
        console.log({
          base: cwd.base,
          dir: cwd.dir,
          ext: cwd.ext,
          name: cwd.name,
          root: cwd.root,
        });
        return cwd;
      })
      .catch((reason) => {
        console.error(reason);
        throw reason;
      });
    //
  })(global.process, { sync: true });
}
