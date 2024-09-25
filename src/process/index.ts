/**
 * @file process/process/index.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import { createRequire } from 'node:module';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const require: NodeRequire = createRequire(__filename);

import parseArgv = require('./parseArgv');
import parseCommand = require('./parseCommand');
import parseCwd = require('./parseCwd');
import parseEnv = require('./parseEnv');

type process = {
  parseCommand: typeof parseCommand;
  parseArgv: typeof parseArgv;
  parseCwd: typeof parseCwd;
  parseEnv: typeof parseEnv;
};

const process: process = {
  parseCommand: parseCommand,
  parseArgv: parseArgv,
  parseCwd: parseCwd,
  parseEnv: parseEnv,
};

export = process;
