/**
 * @file process/parseEnv.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

export as namespace ParseEnv;

export = parseEnv;

declare type ParseEnvResult = NodeJS.ProcessEnv;

declare interface parseEnv {
  (proc: NodeJS.Process): ParseEnvResult;
}

declare const parseEnv: parseEnv;
