import util = require('node:util');

export = parseCommand;

declare type ParseArgsConfig = util.ParseArgsConfig;

declare type ParseArgs<T extends ParseArgsConfig> = typeof util.parseArgs<T>;

declare type ParsedResult<T extends ParseArgsConfig> = ReturnType<ParseArgs<T>>;

declare type ParseCommandOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
  throws?: true | false;
  env?: NodeJS.ProcessEnv;
  parseArgsConfig?: ParseArgsConfig;
};

declare interface parseCommand<T extends ParseArgsConfig> {
  (proc: NodeJS.Process): ParsedResult<T>;
  (proc: NodeJS.Process, options?: ParseCommandOptions): ParsedResult<T>;
}

declare const parseCommand: parseCommand<ParseArgsConfig>;

declare namespace parseCommand {}
