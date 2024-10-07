import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);
import type ESBuild = require('esbuild');
import getClientEnvironment = require('../getClientEnvironment');
import browsersList = require('browserslist');

interface getCommonOptions {
  (
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test'
  ): ESBuild.CommonOptions;
}

const getCommonOptions: getCommonOptions = (
  proc: NodeJS.Process,
  env: 'development' | 'production' | 'test'
) => {
  //
  const isEnvDevelopment: boolean = env === 'development';
  const isEnvProduction: boolean = env === 'production';

  const supportedTargets = [
    'chrome',
    'deno',
    'edge',
    'firefox',
    'hermes',
    'ie',
    'ios',
    'node',
    'opera',
    'rhino',
    'safari',
  ];

  // Source maps are resource heavy and can cause out of memory issue for large
  // source files.
  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

  return {
    treeShaking: isEnvProduction,
    minify: isEnvProduction,
    sourcemap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
    color: proc.stdout.isTTY,
    logLimit: 10,
    // lineLimit: 80,

    target: browsersList(
      isEnvProduction
        ? ['>0.2%', 'not dead', 'not op_mini all']
        : [
            'last 1 chrome version',
            'last 1 firefox version',
            'last 1 safari version',
          ]
    )
      .filter((testTarget) => {
        const targetToTest = testTarget.split(' ')[0];
        if (targetToTest && supportedTargets.includes(targetToTest))
          return true;
        return false;
      })
      .map<string>((browser) => {
        return browser.replaceAll(' ', '');
      }),
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
    env: 'development' | 'production' | 'test'
  ): ESBuild.CommonOptions => {
    const commonOptions = getCommonOptions(proc, env);
    global.console.log(commonOptions);
    return commonOptions;
  })(global.process, global.process.env.NODE_ENV!);
}
