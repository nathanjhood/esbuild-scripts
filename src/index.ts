/**
 * @file index.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/**
 *
 */

import parseCommand = require('./process/parseCommand');
import parseArgV = require('./process/parseArgv');
import parseCwd = require('./process/parseCwd');
import parseEnv = require('./process/parseEnv');

interface Index {
  parseCommand: typeof parseCommand;
  parseArgV: typeof parseArgV;
  parseCwd: typeof parseCwd;
  parseEnv: typeof parseEnv;
}

const index: Index = {
  parseCommand: parseCommand,
  parseArgV: parseArgV,
  parseCwd: parseCwd,
  parseEnv: parseEnv,
};

export = index;
