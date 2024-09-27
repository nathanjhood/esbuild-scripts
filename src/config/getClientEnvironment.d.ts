/**
 * @file config/getClientEnvironment.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/**
 *
 */

export as namespace GetClientEnvironment;

export = getClientEnvironment;

declare type GetClientEnvironmentOptions = {
  verbose?: true | false;
  debug?: true | false;
  color?: true | false;
};

declare type GetClientEnvironmentResult = {
  raw: NodeJS.ProcessEnv;
  stringified: { 'process.env': NodeJS.ProcessEnv };
};

declare interface getClientEnvironment {
  (proc: NodeJS.Process): GetClientEnvironmentResult;
  (
    proc: NodeJS.Process,
    options?: GetClientEnvironmentOptions
  ): GetClientEnvironmentResult;
}

declare const getClientEnvironment: getClientEnvironment;

declare namespace getClientEnvironment {}
