/**
 * @file parseEnv.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

export = parseEnv;

declare type ParseEnvOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
  path?: string | URL | Buffer;
};

declare interface parseEnv {
  default?(proc: NodeJS.Process): {
    raw: NodeJS.ProcessEnv;
    stringified: { 'process.env': NodeJS.ProcessEnv };
  };
  (proc: NodeJS.Process): {
    raw: NodeJS.ProcessEnv;
    stringified: { 'process.env': NodeJS.ProcessEnv };
  };
  (
    proc: NodeJS.Process,
    options?: ParseEnvOptions
  ): {
    raw: NodeJS.ProcessEnv;
    stringified: { 'process.env': NodeJS.ProcessEnv };
  };
}

declare const parseEnv: parseEnv;

declare namespace parseEnv {}
