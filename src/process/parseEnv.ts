/**
 * @file process/parseEnv.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);
import fs = require('node:fs');
import getClientPaths = require('../config/getClientPaths');

type ParseEnvResult = NodeJS.ProcessEnv;

interface parseEnv {
  (proc: NodeJS.Process): ParseEnvResult;
}

const parseEnv: parseEnv = (proc: NodeJS.Process): ParseEnvResult => {
  //
  const errors: Error[] = [];
  proc.exitCode = errors.length;

  const paths = getClientPaths(proc);

  const isNotLocalTestEnv =
    proc.env['NODE_ENV'] !== 'test' && `${paths.dotenv}.local`;

  // https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
  const dotenvFiles: string[] = [];
  //
  dotenvFiles.push(`${paths.dotenv}.${proc.env['NODE_ENV']}.local`);
  dotenvFiles.push(`${paths.dotenv}.${proc.env['NODE_ENV']}`);
  if (isNotLocalTestEnv) dotenvFiles.push(`${paths.dotenv}.local`);
  dotenvFiles.push(paths.dotenv);
  //

  // Load environment variables from .env* files. Suppress warnings using silent
  // if this file is missing. Never modify any environment variables
  // that have already been set.  Variable expansion is supported in .env files.
  // https://github.com/motdotla/dotenv
  // https://github.com/motdotla/dotenv-expand
  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile.toString())) {
      //
      // const parsedEnvPath: Path.ParsedPath = path.parse(dotenvFile.toString());

      // if (verbose) info(`parseEnv('${parsedEnvPath.base}')`);
      //
      proc.loadEnvFile(dotenvFile); // throws internally, or changes 'proc.env'
      //
    } else {
      const error = new Error("no '.env' file found", { cause: dotenvFile });
      errors.push(error);
    }
  });

  if (errors.length < 0)
    throw new Error('parseEnv() failed', { cause: errors });

  return proc.env satisfies ParseEnvResult;
};

export = parseEnv;

if (require.main === module) {
  ((proc: NodeJS.Process) => {
    parseEnv(proc);
  })(global.process);
}
