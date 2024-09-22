/**
 * @file process/parseEnv.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

export as namespace ParseEnv;

export = parseEnv;

declare type ParseEnvOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
  cwd?: string | URL | Buffer;
};

declare type ParseEnvResult = NodeJS.ProcessEnv;

declare interface parseEnv {
  (proc: NodeJS.Process): ParseEnvResult;
  (proc: NodeJS.Process, options?: ParseEnvOptions): ParseEnvResult;
}

declare const parseEnv: parseEnv;

declare interface parseEnvAsync {
  (proc: NodeJS.Process): Promise<ParseEnvResult>;
  (proc: NodeJS.Process, options?: ParseEnvOptions): Promise<ParseEnvResult>;
}

declare const parseEnvAsync: parseEnvAsync;
