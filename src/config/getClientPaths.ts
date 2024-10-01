/**
 * @file config/getClientPaths.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import { createRequire } from 'node:module';

const require: NodeRequire = createRequire(__filename);

import path = require('node:path');
import fs = require('node:fs');
import ownPackageJson = require('../../package.json');
import getClientPublicUrlOrPath = require('./getClientPublicUrlOrPath');

/**
 *
 */
type GetClientPathsOptions = {
  color?: true | false;
  moduleFileExtensions?: string[];
  /**
   * - if `beforeEject: we're in `./node_modules/react-scripts/config/` (default)
   * - if `afterEject`: we're in `./config/`
   * - if `beforePublish`: we're in `./packages/esbuild-scripts/config/`
   */
  isEjectedOrPublished?: 'beforeEject' | 'afterEject' | 'beforePublish';
};

type GetClientPathsResult = {
  dotenv: string;
  appPath: string;
  appBuild: string;
  appPublic: string;
  appHtml: string;
  appIndexJs: string;
  appPackageJson: string;
  appSrc: string;
  appTsConfig: string;
  appJsConfig: string;
  yarnLockFile: string;
  testsSetup: string;
  proxySetup: string;
  appNodeModules: string;
  appWebpackCache: string;
  appTsBuildInfoFile: string;
  swSrc: string;
  publicUrlOrPath: string;
  ownPath?: string; // begin after eject
  ownNodeModules?: string;
  appTypeDeclarations?: string;
  ownTypeDeclarations?: string; // end after eject
  moduleFileExtensions: string[];
};

interface getClientPaths {
  default?: (proc: NodeJS.Process) => GetClientPathsResult;
  (proc: NodeJS.Process): GetClientPathsResult;
  (proc: NodeJS.Process, options?: GetClientPathsOptions): GetClientPathsResult;
}

const getClientPaths: getClientPaths = (
  proc: NodeJS.Process,
  options?: GetClientPathsOptions
): GetClientPathsResult => {
  //
  proc.on('unhandledRejection', (err) => {
    throw err;
  });

  // defaults
  const moduleFileExtensions: string[] =
    options && options.moduleFileExtensions
      ? options.moduleFileExtensions
      : [
          'web.mjs',
          'mjs',
          'web.js',
          'js',
          'web.ts',
          'ts',
          'web.tsx',
          'tsx',
          'json',
          'web.jsx',
          'jsx',
        ];
  //

  const isEjectedOrPublished: 'beforeEject' | 'afterEject' | 'beforePublish' =
    options && options.isEjectedOrPublished
      ? options.isEjectedOrPublished
      : 'beforeEject';

  // Make sure any symlinks in the project folder are resolved:
  // https://github.com/facebook/create-react-app/issues/637
  const appDirectory: string = fs.realpathSync(proc.cwd());

  //
  const resolveApp: (relativePath: string) => string = (relativePath: string) =>
    path.resolve(appDirectory, relativePath);
  //

  // We use `PUBLIC_URL` environment variable or "homepage" field to infer
  // "public path" at which the app is served.
  // webpack needs to know it to put the right <script> hrefs into HTML even in
  // single-page apps that may serve index.html for nested URLs like /todos/42.
  // We can't use a relative path in HTML because we don't want to load something
  // like /todos/42/static/js/bundle.7289d.js. We have to know the root.
  const publicUrlOrPath: string = getClientPublicUrlOrPath(proc, {
    isEnvDevelopment: proc.env['NODE_ENV'] === 'development',
    homepage: require(resolveApp('package.json')).homepage,
    envPublicUrl: proc.env['PUBLIC_URL'],
  });
  //

  //
  const buildDir: string = proc.env['BUILD_DIR'] || 'dist';
  //

  // Resolve file paths in the same order as webpack
  const resolveModule: (
    resolveFn: (path: string) => string,
    filePath: string
  ) => string = (resolveFn: (path: string) => string, filePath: string) => {
    const extension = moduleFileExtensions.find((extension) =>
      fs.existsSync(resolveFn(`${filePath}.${extension}`))
    );

    if (extension) {
      return resolveFn(`${filePath}.${extension}`);
    }

    return resolveFn(`${filePath}.js`);
  };
  //

  switch (isEjectedOrPublished) {
    case 'afterEject': {
      // config after eject: we're in ./config/
      const result = Object.freeze<GetClientPathsResult>({
        dotenv: resolveApp('.env'),
        appPath: resolveApp('.'),
        appBuild: resolveApp(buildDir),
        appPublic: resolveApp('public'),
        appHtml: resolveApp('public/index.html'),
        appIndexJs: resolveModule(resolveApp, 'src/index'),
        appPackageJson: resolveApp('package.json'),
        appSrc: resolveApp('src'),
        appTsConfig: resolveApp('tsconfig.json'),
        appJsConfig: resolveApp('jsconfig.json'),
        yarnLockFile: resolveApp('yarn.lock'),
        testsSetup: resolveModule(resolveApp, 'src/setupTests'),
        proxySetup: resolveApp('src/setupProxy.js'),
        appNodeModules: resolveApp('node_modules'),
        appWebpackCache: resolveApp('node_modules/.cache'),
        appTsBuildInfoFile: resolveApp(
          'node_modules/.cache/tsconfig.tsbuildinfo'
        ),
        swSrc: resolveModule(resolveApp, 'src/serviceWorker'),
        publicUrlOrPath,
        moduleFileExtensions,
      } as const satisfies Readonly<GetClientPathsResult>);

      return result;
    }
    case 'beforeEject': {
      //
      const resolveOwn: (relativePath: string) => string = (
        relativePath: string
      ) => path.resolve(__dirname, '..', relativePath);

      // config before eject: we're in ./node_modules/react-scripts/config/
      const result = Object.freeze<GetClientPathsResult>({
        dotenv: resolveApp('.env'),
        appPath: resolveApp('.'),
        appBuild: resolveApp(buildDir),
        appPublic: resolveApp('public'),
        appHtml: resolveApp('public/index.html'),
        appIndexJs: resolveModule(resolveApp, 'src/index'),
        appPackageJson: resolveApp('package.json'),
        appSrc: resolveApp('src'),
        appTsConfig: resolveApp('tsconfig.json'),
        appJsConfig: resolveApp('jsconfig.json'),
        yarnLockFile: resolveApp('yarn.lock'),
        testsSetup: resolveModule(resolveApp, 'src/setupTests'),
        proxySetup: resolveApp('src/setupProxy.js'),
        appNodeModules: resolveApp('node_modules'),
        appWebpackCache: resolveApp('node_modules/.cache'),
        appTsBuildInfoFile: resolveApp(
          'node_modules/.cache/tsconfig.tsbuildinfo'
        ),
        swSrc: resolveModule(resolveApp, 'src/serviceWorker'),
        publicUrlOrPath,
        // These properties only exist before ejecting:
        ownPath: resolveOwn('.'),
        ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
        appTypeDeclarations: resolveApp('src/react-app-env.d.ts'),
        ownTypeDeclarations: resolveOwn('lib/react-app.d.ts'),
        moduleFileExtensions,
      } as const satisfies Readonly<GetClientPathsResult>);

      return result;
    }
    case 'beforePublish': {
      const resolveOwn: (relativePath: string) => string = (
        relativePath: string
      ) => path.resolve(__dirname, '..', relativePath);
      const esbuildScriptsPath: string = resolveApp(
        `node_modules/${ownPackageJson.name}`
      );
      const esbuildScriptsLinked: boolean =
        fs.existsSync(esbuildScriptsPath) &&
        fs.lstatSync(esbuildScriptsPath).isSymbolicLink();

      // config before publish: we're in ./packages/esbuild-scripts/config/
      if (
        !esbuildScriptsLinked &&
        __dirname.indexOf(
          path.join('packages', 'esbuild-scripts', 'config')
        ) !== -1
      ) {
        const templatePath = '../ts-esbuild-react/template'; // TODO: figure out where to put this...

        const result = Object.freeze<GetClientPathsResult>({
          dotenv: resolveOwn(`${templatePath}/.env`),
          appPath: resolveApp('.'),
          appBuild: resolveOwn(path.join('../../../', buildDir)), // TODO: added one more backslash, need to test this...
          appPublic: resolveOwn(`${templatePath}/public`),
          appHtml: resolveOwn(`${templatePath}/public/index.html`),
          appIndexJs: resolveModule(resolveOwn, `${templatePath}/src/index`),
          appPackageJson: resolveOwn('package.json'),
          appSrc: resolveOwn(`${templatePath}/src`),
          appTsConfig: resolveOwn(`${templatePath}/tsconfig.json`),
          appJsConfig: resolveOwn(`${templatePath}/jsconfig.json`),
          yarnLockFile: resolveOwn(`${templatePath}/yarn.lock`),
          testsSetup: resolveModule(
            resolveOwn,
            `${templatePath}/src/setupTests`
          ),
          proxySetup: resolveOwn(`${templatePath}/src/setupProxy.js`),
          appNodeModules: resolveOwn('node_modules'),
          appWebpackCache: resolveOwn('node_modules/.cache'),
          appTsBuildInfoFile: resolveOwn(
            'node_modules/.cache/tsconfig.tsbuildinfo'
          ),
          swSrc: resolveModule(resolveOwn, `${templatePath}/src/serviceWorker`),
          publicUrlOrPath,
          // These properties only exist before ejecting:
          ownPath: resolveOwn('.'),
          ownNodeModules: resolveOwn('node_modules'),
          appTypeDeclarations: resolveOwn(
            `${templatePath}/src/react-app-env.d.ts`
          ),
          ownTypeDeclarations: resolveOwn('lib/react-app.d.ts'),
          moduleFileExtensions,
        } as const satisfies Readonly<GetClientPathsResult>);

        return result;
      } else {
        throw new Error(
          'Unknown option passed to getClientPaths:' + isEjectedOrPublished
        );
      }
    }
    default: {
      throw new Error(
        'Unknown option passed to getClientPaths:' + isEjectedOrPublished
      );
    }
  }
};

export = getClientPaths;

if (require.main === module) {
  ((proc: NodeJS.Process, options?: GetClientPathsOptions) => {
    const result = getClientPaths(proc, options);
    global.console.assert(result);
  })(global.process);
}
