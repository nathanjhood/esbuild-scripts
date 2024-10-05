/**
 * @file process/parseArgv.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import type Util = require('node:util');
import util = require('node:util');

export as namespace ParseArgV;

export = parseArgv;

declare type ParseArgsConfig = Util.ParseArgsConfig;

declare type ParseArgs<T extends ParseArgsConfig> = typeof util.parseArgs<T>;

declare type ParseArgvResult<T extends ParseArgsConfig> = ReturnType<
  ParseArgs<T>
>;

declare interface parseArgv<T extends ParseArgsConfig> {
  (proc: NodeJS.Process): ParseArgvResult<T>;
}

declare const parseArgv: parseArgv<ParseArgsConfig>;
