import type ESBuild = require('esbuild');

export as namespace GetServeOptions;

export = getServeOptions;

declare interface getServeOptions {
  (
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test'
  ): ESBuild.ServeOptions;
  (
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test',
    options?: ESBuild.ServeOptions
  ): ESBuild.ServeOptions;
}

declare const getServeOptions: getServeOptions;
