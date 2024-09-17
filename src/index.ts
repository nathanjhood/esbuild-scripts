/**
 * @file index.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/**
 *
 */

import parseCommand = require('./process/parseCommand');
import parseArgV = require('./process/parseArgV');

interface Index {
  parseCommand: typeof parseCommand;
  parseArgV: typeof parseArgV;
}

const index: Index = {
  parseCommand: parseCommand,
  parseArgV: parseArgV,
};

export = index;
