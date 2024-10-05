import type ESBuild = require('esbuild');

export as namespace GetCommonOptions;

export = getCommonOptions;

declare interface getCommonOptions {
  (proc: NodeJS.Process): ESBuild.CommonOptions;
}

declare const getCommonOptions: getCommonOptions;
