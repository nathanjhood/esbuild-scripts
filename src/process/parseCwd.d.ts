/**
 * @file process/parseCwd.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import type Path = require('node:path');

export = parseCwd;

declare type ParseCwdOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
};

declare type ParseCwdResult = Path.ParsedPath;

declare interface parseCwd {
  default?(proc: NodeJS.Process): ParseCwdResult;
  (proc: NodeJS.Process): ParseCwdResult;
  (proc: NodeJS.Process, options?: ParseCwdOptions): ParseCwdResult;
}

declare const parseCwd: parseCwd;

declare namespace parseCwd {}
