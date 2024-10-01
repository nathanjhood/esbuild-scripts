/**
 * @file process/parseCwd.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import type Path = require('node:path');

export as namespace ParseCwd;

export = parseCwd;

declare type ParseCwdResult = Path.ParsedPath;

declare interface parseCwd {
  (proc: NodeJS.Process): ParseCwdResult;
}

declare const parseCwd: parseCwd;

declare interface parseCwdAsync {
  (proc: NodeJS.Process): Promise<ParseCwdResult>;
}

declare const parseCwdAsync: parseCwdAsync;
