/**
 * @file process/parseCommand.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import type Util = require('node:util');
import util = require('node:util');

export as namespace ParseCommand;

export = parseCommand;

declare type ParseCommandConfig = Util.ParseArgsConfig;

declare type ParseCommandResult<T extends ParseCommandConfig> = ReturnType<
  typeof util.parseArgs<T>
>;

declare type ParseCommandOptions = {
  throws?: true | false;
  env?: NodeJS.ProcessEnv;
  parseArgsConfig?: ParseCommandConfig;
};

declare interface parseCommand<T extends ParseCommandConfig> {
  (proc: NodeJS.Process): ParseCommandResult<T>;
  (proc: NodeJS.Process, options?: ParseCommandOptions): ParseCommandResult<T>;
}

declare const parseCommand: parseCommand<ParseCommandConfig>;
