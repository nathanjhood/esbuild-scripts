/**
 * @file parseCommand.d.ts
 *
 */

import util = require("node:util");

export = parseCommand;

declare const parseCommand: (process: NodeJS.Process) => Promise<ReturnType<typeof util.parseArgs>>;

declare const parseCommandSync: (process: NodeJS.Process) => ReturnType<typeof util.parseArgs>;
