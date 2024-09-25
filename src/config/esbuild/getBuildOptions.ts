import { createRequire } from 'node:module';

const require: NodeRequire = createRequire(__filename);

// import type Path = require('node:path');
// import type FS = require('node:fs');
import type ESBuild = require('esbuild');

import fs = require('node:fs');
import path = require('node:path');
import getClientPaths = require('../getClientPaths');
import getCommonOptions = require('./getCommonOptions');

interface getBuildOptions {
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

const getBuildOptions: getBuildOptions = (
  proc: NodeJS.Process,
  env: 'development' | 'production' | 'test',
  options?: ESBuild.BuildOptions
): ESBuild.BuildOptions => {
  //

  //
  proc.on('unhandledRejection', (error) => {
    throw error;
  }) satisfies NodeJS.Process;
  //
  proc.on('uncaughtException', (error) => {
    throw error;
  }) satisfies NodeJS.Process;
  //

  const paths = getClientPaths(proc);
  const commonOptions = getCommonOptions(proc, env);

  //
  const {
    INLINE_RUNTIME_CHUNK,
    ESLINT_NO_DEV_ERRORS,
    DISABLE_ESLINT_PLUGIN,
    IMAGE_INLINE_SIZE_LIMIT,
    DISABLE_NEW_JSX_TRANSFORM,
  }: NodeJS.ProcessEnv = proc.env;
  //
  // Some apps do not need the benefits of saving a web request, so not inlining
  // the chunk makes for a smoother build process.
  const shouldInlineRuntimeChunk: boolean = INLINE_RUNTIME_CHUNK !== 'false';
  //
  const emitErrorsAsWarnings: boolean = ESLINT_NO_DEV_ERRORS === 'true';
  const disableESLintPlugin: boolean = DISABLE_ESLINT_PLUGIN === 'true';
  //
  const imageInlineSizeLimit: number = parseInt(
    IMAGE_INLINE_SIZE_LIMIT || '10000'
  );
  //
  // Check if TypeScript is setup
  const useTypeScript: boolean = fs.existsSync(paths.appTsConfig);
  // Check if Tailwind config exists
  const useTailwind: boolean = fs.existsSync(
    path.join(paths.appPath, 'tailwind.config.js') // TODO: use Typescript
  );
  // Get the path to the uncompiled service worker (if it exists).
  const swSrc: string = paths.swSrc;
  // style files regexes
  const cssRegex: RegExp = /\.css$/;
  const cssModuleRegex: RegExp = /\.module\.css$/;
  const sassRegex: RegExp = /\.(scss|sass)$/;
  const sassModuleRegex: RegExp = /\.module\.(scss|sass)$/;
  //
  const hasJsxRuntime: boolean = (() => {
    if (DISABLE_NEW_JSX_TRANSFORM === 'true') {
      return false;
    }
    //
    try {
      require.resolve('react/jsx-runtime');
      return true;
    } catch (e) {
      return false;
    }
  })();
  //

  //
  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';
  // Variable used for enabling profiling in Production
  // passed into alias object. Uses a flag if passed into the build command
  const isEnvProductionProfile =
    isEnvProduction && proc.argv.includes('--profile'); // use actual process so we don't rely on mutations
  //

  //
  return {
    bundle: true, // Cannot use "alias" to React Native Web without "bundle"
    metafile: isEnvProduction,
    absWorkingDir: paths.appPath,
    entryPoints: [paths.appIndexJs],
    outbase: paths.appSrc,
    // outfile: fileURLToPath(new URL(publicOutFile, import.meta.url)), // can't use outdir and outfile together...
    outdir: paths.appBuild,
    // esbuild uses `publicPath` to determine where the app is being served from.
    // It requires a trailing slash, or the file assets will get an incorrect path.
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: paths.publicUrlOrPath,
    loader: {
      '.jsx': 'jsx',
      '.js': 'js',
      '.tsx': 'tsx',
      '.ts': 'ts',
      '.svg': 'base64',
      '.png': 'file', // 'file' loaders will be prepending by 'publicPath', i.e., 'https://www.publicurl.com/icon.png'
      '.ico': 'file',
    },
    // TODO: fix paths with HTML interp plugin
    // entryNames: isEnvProduction
    //   ? "static/[ext]/[name].[hash]"
    //   : isEnvDevelopment && "static/[ext]/bundle",
    // // There are also additional JS chunk files if you use code splitting.
    // chunkNames: isEnvProduction
    //   ? "static/[ext]/[name].[hash].chunk"
    //   : isEnvDevelopment && "static/[ext]/[name].chunk",
    // assetNames: isEnvProduction
    //   ? "static/media/[name].[hash][ext]"
    //   : isEnvDevelopment && "static/media/[name]",

    entryNames: 'static/[ext]/bundle',
    chunkNames: 'static/[ext]/[name].chunk',
    assetNames: 'static/media/[name]',
    // splitting: true, // Splitting currently only works with the "esm" format

    alias: {
      // 'oldpkg': 'newpkg',
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
      // Allows for better profiling with ReactDevTools
      ...(isEnvProductionProfile && {
        'react-dom$': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling',
      }),
    },

    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebook/create-react-app/issues/290
    // `web` extension prefixes have been added for better support
    // for React Native Web.
    resolveExtensions: paths.moduleFileExtensions
      .map((ext) => `.${ext}`)
      .filter((ext) => useTypeScript || !ext.includes('ts')),
    //
    ...commonOptions,
    //
  } satisfies ESBuild.BuildOptions;
};

export = getBuildOptions;

// ((
//   proc: NodeJS.Process,
//   env: 'development' | 'production' | 'test',
//   options?: ESBuild.BuildOptions
// ): ESBuild.BuildOptions => {
//   //

//   //
//   const result = getBuildOptions(proc, env);
//   global.console.log(result);
//   return result;
//   //
// })(global.process, 'development');

// const sample: {
//   /** Documentation: https://esbuild.github.io/api/#bundle */
//   bundle?: boolean;
//   /** Documentation: https://esbuild.github.io/api/#splitting */
//   splitting?: boolean;
//   /** Documentation: https://esbuild.github.io/api/#preserve-symlinks */
//   preserveSymlinks?: boolean;
//   /** Documentation: https://esbuild.github.io/api/#outfile */
//   outfile?: string;
//   /** Documentation: https://esbuild.github.io/api/#metafile */
//   metafile?: boolean;
//   /** Documentation: https://esbuild.github.io/api/#outdir */
//   outdir?: string;
//   /** Documentation: https://esbuild.github.io/api/#outbase */
//   outbase?: string;
//   /** Documentation: https://esbuild.github.io/api/#external */
//   external?: string[];
//   /** Documentation: https://esbuild.github.io/api/#packages */
//   packages?: 'bundle' | 'external';
//   /** Documentation: https://esbuild.github.io/api/#alias */
//   alias?: Record<string, string>;
//   /** Documentation: https://esbuild.github.io/api/#loader */
//   loader?: { [ext: string]: ESBuild.Loader };
//   /** Documentation: https://esbuild.github.io/api/#resolve-extensions */
//   resolveExtensions?: string[];
//   /** Documentation: https://esbuild.github.io/api/#main-fields */
//   mainFields?: string[];
//   /** Documentation: https://esbuild.github.io/api/#conditions */
//   conditions?: string[];
//   /** Documentation: https://esbuild.github.io/api/#write */
//   write?: boolean;
//   /** Documentation: https://esbuild.github.io/api/#allow-overwrite */
//   allowOverwrite?: boolean;
//   /** Documentation: https://esbuild.github.io/api/#tsconfig */
//   tsconfig?: string;
//   /** Documentation: https://esbuild.github.io/api/#out-extension */
//   outExtension?: { [ext: string]: string };
//   /** Documentation: https://esbuild.github.io/api/#public-path */
//   publicPath?: string;
//   /** Documentation: https://esbuild.github.io/api/#entry-names */
//   entryNames?: string;
//   /** Documentation: https://esbuild.github.io/api/#chunk-names */
//   chunkNames?: string;
//   /** Documentation: https://esbuild.github.io/api/#asset-names */
//   assetNames?: string;
//   /** Documentation: https://esbuild.github.io/api/#inject */
//   inject?: string[];
//   /** Documentation: https://esbuild.github.io/api/#banner */
//   banner?: { [type: string]: string };
//   /** Documentation: https://esbuild.github.io/api/#footer */
//   footer?: { [type: string]: string };
//   /** Documentation: https://esbuild.github.io/api/#entry-points */
//   entryPoints?:
//     | string[]
//     | Record<string, string>
//     | { in: string; out: string }[];
//   /** Documentation: https://esbuild.github.io/api/#stdin */
//   stdin?: ESBuild.StdinOptions;
//   /** Documentation: https://esbuild.github.io/plugins/ */
//   plugins?: ESBuild.Plugin[];
//   /** Documentation: https://esbuild.github.io/api/#working-directory */
//   absWorkingDir?: string;
//   /** Documentation: https://esbuild.github.io/api/#node-paths */
//   nodePaths?: string[]; // The "NODE_PATH" variable from Node.js
// } = {} satisfies ESBuild.BuildOptions;
