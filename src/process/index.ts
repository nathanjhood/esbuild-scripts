/**
 * @file process/process/index.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import { createRequire } from 'node:module';

const require: NodeRequire = createRequire(__filename);
import type Util = require('node:util');
import parseArgv = require('./parseArgv');
import parseCommand = require('./parseCommand');
import parseCwd = require('./parseCwd');
import parseEnv = require('./parseEnv');

type process = {
  parseCommand: parseCommand<Util.ParseArgsConfig>;
  parseArgv: parseArgv<Util.ParseArgsConfig>;
  parseCwd: parseCwd;
  parseEnv: parseEnv;
};

const process = {
  parseCommand: parseCommand,
  parseArgv: parseArgv,
  parseCwd: parseCwd,
  parseEnv: parseEnv,
};

export = process;

if (require.main === module) {
  //
}
