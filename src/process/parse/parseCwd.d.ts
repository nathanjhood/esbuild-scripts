/**
 * @file parseCwd.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import path = require('node:path');

declare type ParseCwdOptions = {
  sync?: true | false;
};

declare type ParsedCwd = path.ParsedPath;

declare interface parseCwd {
  default?(proc: NodeJS.Process): Promise<ParsedCwd>;
  (proc: NodeJS.Process): Promise<ParsedCwd>;
  (proc: NodeJS.Process, options?: ParseCwdOptions): Promise<ParsedCwd>;
}

declare const parseCwd: parseCwd;

declare interface parseCwdSync {
  default?(proc: NodeJS.Process): ParsedCwd;
  (proc: NodeJS.Process): ParsedCwd;
  (proc: NodeJS.Process, options?: ParseCwdOptions): ParsedCwd;
}

declare const parseCwdSync: parseCwdSync;

export = parseCwd;
