/**
 * @file scripts/start.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import type ESBuild = require('esbuild');

export as namespace Start;

export = start;

declare interface start {
  (proc: NodeJS.Process): Promise<void>;
  (
    proc: NodeJS.Process,
    options?: ESBuild.ServeOptions & ESBuild.BuildOptions
  ): Promise<void>;
}

/**
 *
 * @param {NodeJS.Process} proc
 * @param {ESBuild.ServeOptions & ESBuild.BuildOptions} options
 * @returns {Promise<void>}
 * @async
 */
declare const start: start;
