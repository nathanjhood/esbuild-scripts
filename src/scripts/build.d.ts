/**
 * @file scripts/build.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

declare const require: NodeRequire;

import type ESBuild = require('esbuild');

export = build;

declare interface build {
  (proc: NodeJS.Process): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>;
  (
    proc: NodeJS.Process,
    options?: ESBuild.BuildOptions
  ): Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>;
}

declare const build: build;
// declare const buildAsync: (
//   proc: NodeJS.Process,
//   options?: ESBuild.BuildOptions
// ) => Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>;
