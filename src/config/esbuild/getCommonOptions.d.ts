import type ESBuild = require('esbuild');

export as namespace GetCommonOptions;

export = getCommonOptions;

declare interface getCommonOptions {
  (
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test'
  ): ESBuild.CommonOptions;
  (
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test'
  ): ESBuild.CommonOptions;
}

declare const getCommonOptions: (
  proc: NodeJS.Process,
  env: 'development' | 'production' | 'test'
) => ESBuild.CommonOptions;
