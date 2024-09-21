/**
 * @file process/parseCommand.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import type Util = require('node:util');
import util = require('node:util');

export = parseCommand;

declare type ParseCommandConfig = Util.ParseArgsConfig;

declare type ParseCommand<T extends ParseCommandConfig> =
  typeof util.parseArgs<T>;

declare type ParseCommandResult<T extends ParseCommandConfig> = ReturnType<
  ParseCommand<T>
>;

declare type ParseCommandOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
  throws?: true | false;
  env?: NodeJS.ProcessEnv;
  parseArgsConfig?: ParseCommandConfig;
};

declare interface parseCommand<T extends ParseCommandConfig> {
  (proc: NodeJS.Process): ParseCommandResult<T>;
  (proc: NodeJS.Process, options?: ParseCommandOptions): ParseCommandResult<T>;
}

declare const parseCommand: parseCommand<ParseCommandConfig>;

declare namespace parseCommand {}
