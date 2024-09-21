/**
 * @file process/parseEnv.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

export = parseEnv;

declare type ParseEnvOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
  cwd?: string | URL | Buffer;
  encoding?: BufferEncoding;
};

declare type ParseEnvResult = NodeJS.ProcessEnv;

declare interface parseEnv {
  default?(proc: NodeJS.Process): ParseEnvResult;
  (proc: NodeJS.Process): ParseEnvResult;
  (proc: NodeJS.Process, options?: ParseEnvOptions): ParseEnvResult;
}

declare const parseEnv: parseEnv;

declare interface parseEnvAsync {
  default?(proc: NodeJS.Process): Promise<ParseEnvResult>;
  (proc: NodeJS.Process): Promise<ParseEnvResult>;
  (proc: NodeJS.Process, options?: ParseEnvOptions): Promise<ParseEnvResult>;
}

declare const parseEnvAsync: parseEnvAsync;

declare namespace parseEnv {}
