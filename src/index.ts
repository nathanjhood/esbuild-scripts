/**
 * @file index.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/**
 *
 */

import parseCommand = require('./process/parse/parseCommand');
import parseArgV = require('./process/parse/parseArgV');
import parseCwd = require('./process/parse/parseCwd');
import parseEnv = require('./process/parse/parseEnv');

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
