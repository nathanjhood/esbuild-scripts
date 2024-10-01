/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createRequire } from 'node:module';

const require: NodeRequire = createRequire(__filename);

import type Url = require('node:url');
import url = require('node:url');

type GetClientPublicUrlOrPathOptions = {
  isEnvDevelopment: true | false;
  homepage?: string;
  envPublicUrl?: string | undefined;
};

interface getClientPublicUrlOrPath {
  (proc: NodeJS.Process, options: GetClientPublicUrlOrPathOptions): string;
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
const getClientPublicUrlOrPath: getClientPublicUrlOrPath = (
  proc: NodeJS.Process,
  options: GetClientPublicUrlOrPathOptions
): string => {
  //
  proc.on('unhandledRejection', (err) => {
    throw err;
  });
  //
  const stubDomain: string = 'https://nathanjhood.dev';
  //

  const isEnvDevelopment: boolean = options.isEnvDevelopment;
  let envPublicUrl: string | undefined = options.envPublicUrl;
  let homepage: string | undefined = options.homepage;

  //
  if (envPublicUrl) {
    // ensure last slash exists
    envPublicUrl = envPublicUrl.endsWith('/')
      ? envPublicUrl
      : envPublicUrl + '/';

    // validate if `envPublicUrl` is a URL or path like
    // `stubDomain` is ignored if `envPublicUrl` contains a domain
    const validPublicUrl: Url.URL = new url.URL(envPublicUrl, stubDomain);

    return isEnvDevelopment
      ? envPublicUrl.startsWith('.')
        ? '/'
        : validPublicUrl.pathname
      : // Some apps do not use client-side routing with pushState.
        // For these, "homepage" can be set to "." to enable relative asset paths.
        envPublicUrl;
  }
  //

  //
  if (homepage) {
    // strip last slash if exists
    homepage = homepage.endsWith('/') ? homepage : homepage + '/';

    // validate if `homepage` is a URL or path like and use just pathname
    const validHomepagePathname: string = new url.URL(homepage, stubDomain)
      .pathname;

    //
    const result = isEnvDevelopment
      ? homepage.startsWith('.')
        ? '/'
        : validHomepagePathname
      : // Some apps do not use client-side routing with pushState.
        // For these, "homepage" can be set to "." to enable relative asset paths.
        homepage.startsWith('.')
        ? homepage
        : validHomepagePathname;

    return result satisfies string;
  }

  return '/';
};

export = getClientPublicUrlOrPath;

if (require.main === module) {
  ((proc: NodeJS.Process) => {
    const result = getClientPublicUrlOrPath(proc, {
      isEnvDevelopment: proc.env['NODE_ENV'] === 'development' ? true : false,
    });
    global.console.assert(result);
  })(global.process);
}
