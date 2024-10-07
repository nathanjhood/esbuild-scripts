import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);
import type ESBuild = require('esbuild');
import fs = require('node:fs');
import getClientPaths = require('../getClientPaths');
import getCommonOptions = require('./getCommonOptions');

interface getBuildOptions {
  (
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test'
  ): ESBuild.BuildOptions;
}

/**
 *
 * @param {NodeJS.Process} proc
 * @param {'development'|'production'|'test'} env
 * @returns {Promise<ESBuild.BuildResult<ESBuild.BuildOptions>>}
 */
const getBuildOptions: getBuildOptions = (
  proc: NodeJS.Process,
  env: 'development' | 'production' | 'test'
): ESBuild.BuildOptions => {
  //

  const paths = getClientPaths(proc);
  const commonOptions = getCommonOptions(proc, env);

  //
  const {
    // INLINE_RUNTIME_CHUNK,
    // ESLINT_NO_DEV_ERRORS,
    // DISABLE_ESLINT_PLUGIN,
    // IMAGE_INLINE_SIZE_LIMIT,
    DISABLE_NEW_JSX_TRANSFORM,
  }: NodeJS.ProcessEnv = proc.env;
  // //
  // // Some apps do not need the benefits of saving a web request, so not inlining
  // // the chunk makes for a smoother build process.
  // const shouldInlineRuntimeChunk: boolean = INLINE_RUNTIME_CHUNK !== 'false';
  // //
  // const emitErrorsAsWarnings: boolean = ESLINT_NO_DEV_ERRORS === 'true';
  // const disableESLintPlugin: boolean = DISABLE_ESLINT_PLUGIN === 'true';
  // //
  // const imageInlineSizeLimit: number = parseInt(
  //   IMAGE_INLINE_SIZE_LIMIT || '10000'
  // );

  // // Check if Tailwind config exists
  // const useTailwind: boolean = fs.existsSync(
  //   path.join(paths.appPath, 'tailwind.config.js') // TODO: use Typescript
  // );

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

  const useTypeScript: boolean = fs.existsSync(paths.appTsConfig);

  const isEnvProduction = env === 'production';
  // Variable used for enabling profiling in Production
  // passed into alias object. Uses a flag if passed into the build command
  // (use actual process so we don't rely on mutations)
  const isEnvProductionProfile =
    isEnvProduction && proc.argv.includes('--profile');

  return {
    bundle: true, // Cannot use "alias" to React Native Web without "bundle"
    metafile: isEnvProduction,
    absWorkingDir: paths.appPath,
    entryPoints: [paths.appIndexJs],
    outbase: paths.appSrc,
    outdir: paths.appBuild,
    // esbuild uses `publicPath` to determine where the app is being served from.
    // It requires a trailing slash, or the file assets will get an incorrect path.
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: paths.publicUrlOrPath,
    tsconfig: paths.appTsConfig,
    loader: {
      // 'file' loaders will be prepending by 'publicPath',
      // i.e., 'https://www.publicurl.com/icon.png'
      '.jsx': 'jsx',
      '.js': 'js',
      '.tsx': 'tsx',
      '.ts': 'ts',
      '.svg': 'base64',
      '.png': 'file',
      '.ico': 'file',
    },
    // external: ['react', 'react-dom'],
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
    jsx: 'automatic',
    plugins: [
      (() => {
        return {
          name: 'env',
          setup(build) {
            // Intercept import paths called "env" so esbuild doesn't attempt
            // to map them to a file system location. Tag them with the "env-ns"
            // namespace to reserve them for this plugin.
            build.onResolve({ filter: /^env$/ }, (args) => ({
              path: args.path,
              namespace: 'env-ns',
            }));

            // Load paths tagged with the "env-ns" namespace and behave as if
            // they point to a JSON file containing the environment variables.
            build.onLoad({ filter: /.*/, namespace: 'env-ns' }, () => ({
              contents: JSON.stringify(proc.env),
              loader: 'json',
            }));
          },
        };
      })(),
    ],
    ...commonOptions,
    //
  } satisfies ESBuild.BuildOptions;
};

export = getBuildOptions;

if (require.main === module) {
  ((
    proc: NodeJS.Process,
    env: 'development' | 'production' | 'test'
  ): ESBuild.BuildOptions => {
    const result = getBuildOptions(proc, env);
    global.console.log(result);
    return result;
  })(global.process, 'development');
}
