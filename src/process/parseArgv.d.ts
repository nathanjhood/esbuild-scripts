/**
 * @file process/parseArgv.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import type ESBuild = require('esbuild');
import type Util = require('node:util');
import util = require('node:util');

export as namespace ParseArgV;

export = parseArgv;

declare type ParseArgsConfig = Util.ParseArgsConfig;

declare type ParseArgs<T extends ParseArgsConfig> = typeof util.parseArgs<T>;

declare type ParseArgvResult<T extends ParseArgsConfig> = ReturnType<
  ParseArgs<T>
>;

declare type ParseArgvOptions = {
  logLevel?: ESBuild.LogLevel;
  env?: NodeJS.ProcessEnv;
  parseArgsConfig?: ParseArgsConfig;
};

declare interface parseArgv<T extends ParseArgsConfig> {
  (proc: NodeJS.Process): ParseArgvResult<T>;
  (proc: NodeJS.Process, options?: ParseArgvOptions): ParseArgvResult<T>;
}

declare const parseArgv: parseArgv<ParseArgsConfig>;
