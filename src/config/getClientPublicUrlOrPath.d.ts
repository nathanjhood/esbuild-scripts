/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export as namespace GetClientPublicUrlOrPath;

export = getClientPublicUrlOrPath;

declare type GetClientPublicUrlOrPathOptions = {
  isEnvDevelopment: true | false;
  homepage?: string;
  envPublicUrl?: string | undefined;
};

declare interface getClientPublicUrlOrPath {
  (proc: NodeJS.Process, options: GetClientPublicUrlOrPathOptions): string;
}

declare const getClientPublicUrlOrPath: getClientPublicUrlOrPath;
