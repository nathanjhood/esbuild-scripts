/**
 * @file process/parseCommand.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);
import type Util = require('node:util');
import util = require('node:util');

type ParseCommandConfig = Util.ParseArgsConfig;

type ParseCommandResult<T extends ParseCommandConfig> = ReturnType<
  typeof util.parseArgs<T>
>;

interface parseCommand<T extends ParseCommandConfig> {
  (proc: NodeJS.Process): ParseCommandResult<T>;
}

/**
 *
 * @param {NodeJS.Process} proc
 * @returns {ParseCommandResult<ParseCommandConfig>}
 */
const parseCommand: parseCommand<ParseCommandConfig> = (
  proc: NodeJS.Process
): ParseCommandResult<ParseCommandConfig> => {
  //

  //
  const args: string[] = [];
  const allowedList: string[] = [];
  const parseArgsOptionsConfig: {
    [key: string]: { type: 'string' | 'boolean' };
  } = {};
  //

  //
  const errors: Error[] = [];
  proc.exitCode = errors.length;
  //

  //
  const {
    argv0: nodeExecutable,
    execArgv: nodeArgs,
    allowedNodeEnvironmentFlags,
  } = proc;
  //

  // 1) push node executable to args[0]
  args.push(nodeExecutable);

  // 2) push nodeArgs[x] to args[x] (+1)
  nodeArgs.forEach((arg) => args.push(arg));

  // 3) gather permissable flags from current process
  allowedNodeEnvironmentFlags.forEach((flag) => {
    // 3.1) formatting...
    if (flag.startsWith('--')) {
      const trimmedFlag = flag.slice(2);
      flag = trimmedFlag;
    } else if (flag.startsWith('-')) {
      const trimmedFlag = flag.slice(1);
      flag = trimmedFlag;
    }
    // 3.2) push allowed flags from running process into allowedList[]
    allowedList.push(flag);
    return flag;
  });

  // 4) push node args from allowedList[] to the 'parseArgsOptionsConfig' object
  allowedList.forEach(
    (key) => (parseArgsOptionsConfig[key] = { type: 'string' })
  );

  // 5) parse argv0
  const { values, positionals, tokens } = util.parseArgs<ParseCommandConfig>({
    args: args,
    strict: true, // throws internally if 'strict: true'
    allowNegative: true,
    tokens: true,
    allowPositionals: true,
    options: parseArgsOptionsConfig,
  });

  // (this should never happen in theory... but it removes the 'undefined' case)
  if (!tokens) throw new Error('parseCommand returned no tokens');

  return {
    values: values,
    positionals: positionals,
    tokens: tokens,
  } satisfies ParseCommandResult<ParseCommandConfig>;
};

export = parseCommand;

if (require.main === module) {
  ((proc: NodeJS.Process) => {
    parseCommand(proc);
  })(global.process);
}
