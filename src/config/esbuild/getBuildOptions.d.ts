import type ESBuild = require('esbuild');

export = getBuildOptions;

export as namespace GetBuildOptions;

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
