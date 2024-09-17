/**
 * @file parseArgV.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import util = require('node:util');

declare type ParseArgVOptions = {
  sync?: true | false;
};

declare type ParsedArgV = ReturnType<typeof util.parseArgs>;

declare interface parseArgV {
  default?(proc: NodeJS.Process): Promise<ParsedArgV>;
  (proc: NodeJS.Process): Promise<ParsedArgV>;
  (proc: NodeJS.Process, options?: ParseArgVOptions): Promise<ParsedArgV>;
}

declare interface parseArgVSync {
  default?(proc: NodeJS.Process): ParsedArgV;
  (proc: NodeJS.Process): ParsedArgV;
  (proc: NodeJS.Process, options?: ParseArgVOptions): ParsedArgV;
}

declare const parseArgV: parseArgV;

export = parseArgV;

// declare const parseArgVSync: (proc: NodeJS.Process) => ReturnType<typeof util.parseArgs>;
