/**
 * @file index.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/**
 *
 * @param {string} publicUrl
 */
declare const getClientEnvironment: (publicUrl: string) => {
  env: {
    NODE_ENV: "development" | "production" | "test";
    PUBLIC_URL: any;
    WDS_SOCKET_HOST: string | undefined;
    WDS_SOCKET_PATH: string | undefined;
    WDS_SOCKET_PORT: string | undefined;
    FAST_REFRESH: boolean;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  stringified: {}
};

/**
 * @param {NodeJS.Process} process
 */
declare const setupEnv: (process: NodeJS.Process) => {
  getClientEnvironment: (publicUrl: string) => {
    env: {
      NODE_ENV: "development" | "production" | "test";
      PUBLIC_URL: any;
      WDS_SOCKET_HOST: string | undefined;
      WDS_SOCKET_PATH: string | undefined;
      WDS_SOCKET_PORT: string | undefined;
      FAST_REFRESH: boolean;
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    stringified: {}
  }
};
