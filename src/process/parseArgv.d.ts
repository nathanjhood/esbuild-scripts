import util = require('node:util');

export = parseArgv;

declare type ParseArgsConfig = util.ParseArgsConfig;

declare type ParseArgs<T extends ParseArgsConfig> = typeof util.parseArgs<T>;

declare type ParseArgvResult<T extends ParseArgsConfig> = ReturnType<
  ParseArgs<T>
>;

declare type ParseArgvOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
  throws?: true | false;
  env?: NodeJS.ProcessEnv;
  parseArgsConfig?: ParseArgsConfig;
};

declare interface parseArgv<T extends ParseArgsConfig> {
  (proc: NodeJS.Process): ParseArgvResult<T>;
  (proc: NodeJS.Process, options?: ParseArgvOptions): ParseArgvResult<T>;
}

declare const parseArgv: parseArgv<ParseArgsConfig>;

declare namespace parseArgv {}
