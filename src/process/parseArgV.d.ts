/**
 * @file parseArgV.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import util = require("node:util");

export = parseArgV;

declare const parseArgV: (process: NodeJS.Process) => Promise<ReturnType<typeof util.parseArgs>>;

declare const parseArgVSync: (process: NodeJS.Process) => ReturnType<typeof util.parseArgs>;
