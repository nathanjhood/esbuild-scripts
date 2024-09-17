/**
 * @file index.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/**
 *
 */
// import parseCommand = require("./process/parseCommand");
// import parseArgV = require("./process/parseArgV");

import type parseArgV from './process/parseArgV.d';
import type parseCommand from './process/parseCommand.d';
import type parseEnv from './process/parseEnv.d';

export = index;

declare interface Index {
  parseCommand: parseCommand;
  parseArgV: parseArgV;
  parseEnv: parseEnv;
}

declare const index: Index;
