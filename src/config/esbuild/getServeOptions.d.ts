import type ESBuild = require('esbuild');

export as namespace GetServeOptions;

export = getServeOptions;

declare interface getServeOptions {
  (proc: NodeJS.Process): ESBuild.ServeOptions;
}

declare const getServeOptions: getServeOptions;
