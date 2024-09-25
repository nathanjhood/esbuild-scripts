import type ESBuild = require('esbuild');

export as namespace GetBuildOptions;

export = getBuildOptions;

declare interface getBuildOptions {
  (
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test'
  ): ESBuild.BuildOptions;
  (
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test',
    options?: ESBuild.BuildOptions
  ): ESBuild.BuildOptions;
}

declare const getBuildOptions: getBuildOptions;
