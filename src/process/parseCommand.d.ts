/**
 * @file parseCommand.d.ts
 *
 */

import util = require("node:util");

export = parseCommand;

declare const parseCommand: (proc: NodeJS.Process) => Promise<ReturnType<typeof util.parseArgs>>;

// declare const parseCommandSync: (proc: NodeJS.Process) => ReturnType<typeof util.parseArgs>;
