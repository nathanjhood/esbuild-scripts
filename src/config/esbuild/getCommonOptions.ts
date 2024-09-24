import type FS = require('node:fs');
import type Path = require('node:path');
import type ESBuild = require('esbuild');
import fs = require('node:fs');
import path = require('node:path');
import getClientEnvironment = require('../getClientEnvironment');
import getClientPaths = require('../getClientPaths');

//
import browsersList = require('browserslist');

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
  proc.on('unhandledRejection', (error) => {
    throw error;
  }) satisfies NodeJS.Process;
  //
  proc.on('uncaughtException', (error) => {
    throw error;
  }) satisfies NodeJS.Process;
  //

  const paths = getClientPaths(proc);

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
    //
    treeShaking: isEnvProduction,
    minify: isEnvProduction,
    sourcemap: isEnvDevelopment,
    //
    color: proc.stderr.isTTY,
    logLimit: 10,
    lineLimit: 80,
    //
    target: browsersList(
      isEnvProduction
        ? ['>0.2%', 'not dead', 'not op_mini all']
        : [
            'last 1 chrome version',
            'last 1 firefox version',
            'last 1 safari version',
          ]
    ),
    //
    define: {
      'process.env': JSON.stringify(
        getClientEnvironment(proc, { verbose: true }).stringified['process.env']
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
    global.console.log(commonOptions);
    return commonOptions;
  })(global.process, 'development');
}

//
type Platform = 'browser' | 'node' | 'neutral';
type Format = 'iife' | 'cjs' | 'esm';
type Loader =
  | 'base64'
  | 'binary'
  | 'copy'
  | 'css'
  | 'dataurl'
  | 'default'
  | 'empty'
  | 'file'
  | 'js'
  | 'json'
  | 'jsx'
  | 'local-css'
  | 'text'
  | 'ts'
  | 'tsx';
type LogLevel = 'verbose' | 'debug' | 'info' | 'warning' | 'error' | 'silent';
type Charset = 'ascii' | 'utf8';
type Drop = 'console' | 'debugger';
//

const sample: {
  /** Documentation: https://esbuild.github.io/api/#sourcemap */
  sourcemap?: boolean | 'linked' | 'inline' | 'external' | 'both';
  /** Documentation: https://esbuild.github.io/api/#legal-comments */
  legalComments?: 'none' | 'inline' | 'eof' | 'linked' | 'external';
  /** Documentation: https://esbuild.github.io/api/#source-root */
  sourceRoot?: string;
  /** Documentation: https://esbuild.github.io/api/#sources-content */
  sourcesContent?: boolean;

  /** Documentation: https://esbuild.github.io/api/#format */
  format?: ESBuild.Format;
  /** Documentation: https://esbuild.github.io/api/#global-name */
  globalName?: string;
  /** Documentation: https://esbuild.github.io/api/#target */
  target?: string | string[];
  /** Documentation: https://esbuild.github.io/api/#supported */
  supported?: Record<string, boolean>;
  /** Documentation: https://esbuild.github.io/api/#platform */
  platform?: ESBuild.Platform;

  /** Documentation: https://esbuild.github.io/api/#mangle-props */
  mangleProps?: RegExp;
  /** Documentation: https://esbuild.github.io/api/#mangle-props */
  reserveProps?: RegExp;
  /** Documentation: https://esbuild.github.io/api/#mangle-props */
  mangleQuoted?: boolean;
  /** Documentation: https://esbuild.github.io/api/#mangle-props */
  mangleCache?: Record<string, string | false>;
  /** Documentation: https://esbuild.github.io/api/#drop */
  drop?: ESBuild.Drop[];
  /** Documentation: https://esbuild.github.io/api/#drop-labels */
  dropLabels?: string[];
  /** Documentation: https://esbuild.github.io/api/#minify */
  minify?: boolean;
  /** Documentation: https://esbuild.github.io/api/#minify */
  minifyWhitespace?: boolean;
  /** Documentation: https://esbuild.github.io/api/#minify */
  minifyIdentifiers?: boolean;
  /** Documentation: https://esbuild.github.io/api/#minify */
  minifySyntax?: boolean;
  /** Documentation: https://esbuild.github.io/api/#line-limit */
  lineLimit?: number;
  /** Documentation: https://esbuild.github.io/api/#charset */
  charset?: ESBuild.Charset;
  /** Documentation: https://esbuild.github.io/api/#tree-shaking */
  treeShaking?: boolean;
  /** Documentation: https://esbuild.github.io/api/#ignore-annotations */
  ignoreAnnotations?: boolean;

  /** Documentation: https://esbuild.github.io/api/#jsx */
  jsx?: 'transform' | 'preserve' | 'automatic';
  /** Documentation: https://esbuild.github.io/api/#jsx-factory */
  jsxFactory?: string;
  /** Documentation: https://esbuild.github.io/api/#jsx-fragment */
  jsxFragment?: string;
  /** Documentation: https://esbuild.github.io/api/#jsx-import-source */
  jsxImportSource?: string;
  /** Documentation: https://esbuild.github.io/api/#jsx-development */
  jsxDev?: boolean;
  /** Documentation: https://esbuild.github.io/api/#jsx-side-effects */
  jsxSideEffects?: boolean;

  /** Documentation: https://esbuild.github.io/api/#define */
  define?: { [key: string]: string };
  /** Documentation: https://esbuild.github.io/api/#pure */
  pure?: string[];
  /** Documentation: https://esbuild.github.io/api/#keep-names */
  keepNames?: boolean;

  /** Documentation: https://esbuild.github.io/api/#color */
  color?: boolean;
  /** Documentation: https://esbuild.github.io/api/#log-level */
  logLevel?: ESBuild.LogLevel;
  /** Documentation: https://esbuild.github.io/api/#log-limit */
  logLimit?: number;
  /** Documentation: https://esbuild.github.io/api/#log-override */
  logOverride?: Record<string, ESBuild.LogLevel>;

  /** Documentation: https://esbuild.github.io/api/#tsconfig-raw */
  tsconfigRaw?: string | ESBuild.TsconfigRaw;
} = {} satisfies ESBuild.CommonOptions;
