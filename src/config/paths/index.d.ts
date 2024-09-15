/**
 * @file index.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/**
 *
 * @param {NodeJS.Process} process
 */
declare const paths: (process: NodeJS.Process) => {
  dotenv: string,
  appPath: string,
  appBuild: string,
  appPublic: string,
  appHtml: string,
  appIndexJs: string,
  appPackageJson: string,
  appSrc: string,
  appTsConfig: string,
  appJsConfig: string,
  yarnLockFile: string,
  testsSetup: string,
  proxySetup: string,
  appNodeModules: string,
  appWebpackCache: string,
  appTsBuildInfoFile: string,
  swSrc: string,
  publicUrlOrPath: string,
  moduleFileExtensions: string[]
}
