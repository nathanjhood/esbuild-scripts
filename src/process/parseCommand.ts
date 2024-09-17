/**
 * @file parseCommand.ts
 *
 */

/** */
import util = require("node:util");

type ParseCommandOptions = {
  sync?: true | false;
}

type ParsedCommand = ReturnType<typeof util.parseArgs>;

interface parseCommand {
  (proc: NodeJS.Process): Promise<ParsedCommand>;
  (proc: NodeJS.Process, options?: ParseCommandOptions): Promise<ParsedCommand>;
  default?(proc: NodeJS.Process): Promise<ParsedCommand>;
}

const parseCommand: parseCommand = (proc: NodeJS.Process, options?: ParseCommandOptions) => {
  //
  type ParsedCommands = ReturnType<typeof util.parseArgs>;
  //
  const { argv0: nodeExecutable, execArgv: nodeArgs, allowedNodeEnvironmentFlags } = proc;
  //
  const parseArgsOptionsConfig: { [key: string]: { type: 'string' | 'boolean' } } = {};
  const args: string[] = [];
  const allowedList: string[] = [];

  //
  return new Promise<ParsedCommands>((resolveCommand, rejectCommand) => {
    // push node executable to args[0], and nodeArgs[x] to args[x+1]
    args.push(nodeExecutable);
    nodeArgs.forEach(arg => args.push(arg));
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
    })
    // push node args from allowedList[] to the 'options' object
    allowedList.forEach(key => parseArgsOptionsConfig[key] = { type: 'string' });

    // parse the executor and it's args
    const {
      values: values,
      positionals: positionals,
      tokens: tokens
    } = util.parseArgs({
      args: args,
      strict: true,
      allowNegative: true,
      tokens: true,
      allowPositionals: true,
      options: parseArgsOptionsConfig
    });
    // return the parsed executor (at value[0]) and args
    return resolveCommand({ values, positionals, tokens });
  }).catch((err) => {
    throw err;
  });

};

export = parseCommand;

if (require.main === module) {
  ((proc: NodeJS.Process, options?: ParseCommandOptions) => {
    return parseCommand(proc)
    .then(
      (command) => {
        const { values, positionals, tokens } = command;
        console.log("values:", values);
        console.log("positionals:", positionals);
        console.log("tokens:", tokens);
        return command;
      }
    ).catch(
      (reason) => {
        console.error(reason);
        throw reason;
      }
    );
  })(global.process, { sync: true });
}
