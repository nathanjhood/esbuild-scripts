/**
 * @file parseCommand.d.ts
 *
 */

import util = require("node:util");

declare type ParseCommandOptions = {
  sync?: true | false;
};

declare type ParsedCommand = ReturnType<typeof util.parseArgs>;

declare interface parseCommand {
  default?(proc: NodeJS.Process): Promise<ParsedCommand>;
  (proc: NodeJS.Process): Promise<ParsedCommand>;
  (proc: NodeJS.Process, options?: ParseCommandOptions): Promise<ParsedCommand>;
}

declare interface parseCommandSync {
  default?(proc: NodeJS.Process): ParsedCommand;
  (proc: NodeJS.Process): ParsedCommand;
  (proc: NodeJS.Process, options?: ParseCommandOptions): ParsedCommand;
}

declare const parseCommand: parseCommand;

export = parseCommand;

// declare const parseCommandSync: (proc: NodeJS.Process) => ParsedCommands;
