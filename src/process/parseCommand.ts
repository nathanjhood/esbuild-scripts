/**
 * @file parseCommand.ts
 *
 */

/** */
import process = require("node:process");
import util = require("node:util");

const parseCommand = (proc: NodeJS.Process) => {
  //
  const { argv0: nodeExecutable, execArgv: nodeArgs, allowedNodeEnvironmentFlags } = proc;
  //
  const options: { [key: string]: { type: 'string' | 'boolean' } } = {};
  const args: string[] = [];
  const allowedList: string[] = [];

  //
  return new Promise<ReturnType<typeof util.parseArgs>>((resolveCommand, rejectCommand) => {
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
    allowedList.forEach(key => options[key] = { type: 'string' });

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
      options: options
    });
    // return the parsed executor (at value[0]) and args
    return resolveCommand({ values, positionals, tokens });
  }).catch((err) => {
    throw new Error("parseCommand failed", { cause: err })
  });

};

export = parseCommand;

if (require.main === module) {
  parseCommand(process);
}
