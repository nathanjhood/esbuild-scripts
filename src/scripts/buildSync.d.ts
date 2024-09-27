/**
 * @file scripts/buildSync.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

declare const require: NodeRequire;

import type ESBuild = require('esbuild');

export as namespace BuildSync;

export = buildSync;

declare interface buildSync {
  (proc: NodeJS.Process): ESBuild.BuildResult<ESBuild.BuildOptions>;
  (
    proc: NodeJS.Process,
    options?: ESBuild.BuildOptions
  ): ESBuild.BuildResult<ESBuild.BuildOptions>;
}

declare const buildSync: buildSync;
