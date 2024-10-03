import type ESBuild = require('esbuild');
import path = require('node:path');
import getClientPaths = require('../getClientPaths');

interface getServeOptions {
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

const getServeOptions: getServeOptions = (
  proc: NodeJS.Process,
  env: 'development' | 'production' | 'test',
  options?: ESBuild.ServeOptions
): ESBuild.ServeOptions => {
  //
  if (!proc.env.PORT) throw new Error('PORT was not defined');

  const isEnvDevelopment: boolean = env === 'development';
  const isEnvProduction: boolean = env === 'production';

  const paths = getClientPaths(proc);

  // Tools like Cloud9 rely on this.
  const DEFAULT_PORT = parseInt(proc.env.PORT, 10) || 3000;
  const HOST = proc.env.HOST || '0.0.0.0';

  return {
    port: DEFAULT_PORT, //3000,
    host: HOST, //"127.0.0.1",
    servedir: path.resolve(paths.appBuild),
    fallback: path.resolve(paths.appBuild, 'index.html'),
  } satisfies ESBuild.ServeOptions;
};

export = getServeOptions;
