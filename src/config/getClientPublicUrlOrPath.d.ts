/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export = getClientPublicUrlOrPath;

declare interface getClientPublicUrlOrPath {
  default?: (
    isEnvDevelopment: boolean,
    homepage: string | undefined,
    envPublicUrl: string | undefined
  ) => string;
  (
    isEnvDevelopment: boolean,
    homepage: string | undefined,
    envPublicUrl: string | undefined
  ): string;
}

/**
 * Returns a URL or a path with slash at the end.
 * - if `NODE_ENV=production`, can be URL, abolute path, relative path.
 * - if `NODE_ENV=development`, always will be an absolute path.
 * - if `NODE_ENV=development`, can use `path` module functions for operations.
 *
 * @param {boolean} isEnvDevelopment
 * @param {(string|undefined)} homepage a valid url or pathname
 * @param {(string|undefined)} envPublicUrl a valid url or pathname
 * @returns {string}
 *
 * @copyright Copyright (c) 2015-present, Facebook, Inc.
 * @license MIT - This source code is licensed under the MIT license found in
 * the LICENSE file in the root directory of this source tree.
 */
declare const getClientPublicUrlOrPath: getClientPublicUrlOrPath;
