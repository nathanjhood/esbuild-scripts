/**
 * @file parseCommand.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import util = require('node:util');

type ParseCommandOptions = {
  sync?: true | false;
};

type ParsedCommand = ReturnType<typeof util.parseArgs>;

interface parseCommand {
  default?(proc: NodeJS.Process): Promise<ParsedCommand>;
  (proc: NodeJS.Process): Promise<ParsedCommand>;
  (proc: NodeJS.Process, options?: ParseCommandOptions): Promise<ParsedCommand>;
}

const parseCommand: parseCommand = (
  proc: NodeJS.Process,
  options?: ParseCommandOptions
) => {
  //
  type ParsedCommands = ReturnType<typeof util.parseArgs>;
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
  const parseArgsOptionsConfig: {
    [key: string]: { type: 'string' | 'boolean' };
  } = {};
  const args: string[] = [];
  const allowedList: string[] = [];

  //
  return new Promise<ParsedCommands>((resolveCommand, rejectCommand) => {
    // push node executable to args[0]
    args.push(nodeExecutable);
    // push nodeArgs[x] to args[x] (+1)
    nodeArgs.forEach((arg) => args.push(arg));
    // gather permissable flags from current process
    allowedNodeEnvironmentFlags.forEach((flag) => {
      // formatting...
      if (flag.startsWith('--')) {
        const trimmedFlag = flag.slice(2);
        flag = trimmedFlag;
      } else if (flag.startsWith('-')) {
        const trimmedFlag = flag.slice(1);
        flag = trimmedFlag;
      }
      // push allowed flags from running process into allowedList[]
      allowedList.push(flag);
      return flag;
    });
    // push node args from allowedList[] to the 'parseArgsOptionsConfig' object
    allowedList.forEach(
      (key) => (parseArgsOptionsConfig[key] = { type: 'string' })
    );

    // parse the running executable from argv0, and it's args
    const {
      values: values,
      positionals: positionals,
      tokens: tokens,
    } = util.parseArgs({
      args: args,
      strict: true,
      allowNegative: true,
      tokens: true,
      allowPositionals: true,
      options: parseArgsOptionsConfig,
    });
    //

    if (errors.length < 0)
      return rejectCommand(
        new Error('parseCommand() failed', { cause: errors })
      );

    // return the parsed executor (at value[0]) and args
    return resolveCommand({ values, positionals, tokens });
    //

    //
  }).catch((err) => {
    errors.push(err);
    throw err;
  });
};

export = parseCommand;

if (require.main === module) {
  ((proc: NodeJS.Process, options?: ParseCommandOptions) => {
    //
    const errors: Error[] = [];
    proc.exitCode = errors.length;
    //
    return parseCommand(proc)
      .then((command) => {
        //
        const { values, positionals, tokens } = command;
        console.log('values:', values);
        console.log('positionals:', positionals);
        console.log('tokens:', tokens);
        return command;
      })
      .catch((reason) => {
        console.error(reason);
        throw reason;
      });
  })(global.process, { sync: true });
}
