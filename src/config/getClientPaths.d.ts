/**
 * @file config/getClientPaths.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
export as namespace GetClientPaths;

export = getClientPaths;

declare type GetClientPathsOptions = {
  moduleFileExtensions?: string[];
  isEjectedOrPublished?: 'beforeEject' | 'afterEject' | 'beforePublish';
};

declare type GetClientPathsResult = {
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
  moduleFileExtensions: string[];
};

declare interface getClientPaths {
  default?: (proc: NodeJS.Process) => GetClientPathsResult;
  (proc: NodeJS.Process): GetClientPathsResult;
  (proc: NodeJS.Process, options?: GetClientPathsOptions): GetClientPathsResult;
}

declare const getClientPaths: getClientPaths;
