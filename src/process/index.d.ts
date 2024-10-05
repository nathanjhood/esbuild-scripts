/**
 * @file process/index.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import type Util = require('node:util');
import type parseArgv = require('./parseArgv.d');
import type parseCommand = require('./parseCommand.d');
import type parseCwd = require('./parseCwd.d');
import type parseEnv = require('./parseEnv.d');

export as namespace Process;

export = process;

declare type process = {
  parseCommand: parseCommand<Util.ParseArgsConfig>;
  parseArgv: parseArgv<Util.ParseArgsConfig>;
  parseCwd: parseCwd;
  parseEnv: parseEnv;
};

declare const process: process;
