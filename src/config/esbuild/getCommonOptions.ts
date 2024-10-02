import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);

import type ESBuild = require('esbuild');
import getClientEnvironment = require('../getClientEnvironment');
// import browsersList = require('browserslist');

interface getCommonOptions {
  (
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test'
  ): ESBuild.CommonOptions;
  (
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test',
    options?: ESBuild.CommonOptions
  ): ESBuild.CommonOptions;
}

const getCommonOptions: getCommonOptions = (
  proc: NodeJS.Process,
  env: 'development' | 'production' | 'test',
  options?: ESBuild.CommonOptions
) => {
  //

  //
  const isEnvDevelopment: boolean = env === 'development';
  const isEnvProduction: boolean = env === 'production';

  //
  return {
    //
    treeShaking: isEnvProduction,
    minify: isEnvProduction,
    sourcemap: isEnvDevelopment,
    //
    color: proc.stderr.isTTY,
    logLimit: 10,
    lineLimit: 80,
    //
    // target: browsersList(
    //   isEnvProduction
    //     ? ['>0.2%', 'not dead', 'not op_mini all']
    //     : [
    //         'last 1 chrome version',
    //         'last 1 firefox version',
    //         'last 1 safari version',
    //       ]
    // ),
    // platform: 'neutral', // 'node' | browser | neutral,
    //
    define: {
      'process.env': JSON.stringify(
        getClientEnvironment(proc).stringified['process.env']
      ),
    },
    //
  } satisfies ESBuild.CommonOptions;
};

export = getCommonOptions;

if (require.main === module) {
  ((
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test',
    options?: ESBuild.CommonOptions
  ): ESBuild.CommonOptions => {
    const commonOptions = getCommonOptions(
      proc,
      env,
      options ? options : undefined
    );
    // global.console.log(commonOptions);
    return commonOptions;
  })(global.process, 'development');
}
