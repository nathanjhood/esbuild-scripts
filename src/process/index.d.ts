/**
 * @file process/index.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */

export as namespace Process;

export = process;

import type parseArgv = require('./parseArgv.d');
import type parseCommand = require('./parseCommand.d');
import type parseCwd = require('./parseCwd.d');
import type parseEnv = require('./parseEnv.d');

declare type process = {
  parseCommand: typeof parseCommand;
  parseArgv: typeof parseArgv;
  parseCwd: typeof parseCwd;
  parseEnv: typeof parseEnv;
};

declare const process: process;
