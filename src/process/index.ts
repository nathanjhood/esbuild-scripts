/**
 * @file process/process/index.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */

import parseArgv = require('./parseArgv');
import parseCommand = require('./parseCommand');
import parseCwd = require('./parseCwd');
import parseEnv = require('./parseEnv');

type index = {
  parseCommand: typeof parseCommand;
  parseArgv: typeof parseArgv;
  parseCwd: typeof parseCwd;
  parseEnv: typeof parseEnv;
};

const index: index = {
  parseCommand: parseCommand,
  parseArgv: parseArgv,
  parseCwd: parseCwd,
  parseEnv: parseEnv,
};

export = index;
