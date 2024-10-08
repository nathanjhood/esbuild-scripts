/**
 * @file build.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import type Test = require('node:test');
import test = require('node:test');
import path = require('node:path');
import type Build = require('../../src/scripts/build');
import build = require('../../src/scripts/build');

const timeoutMs: number = 10000;

test.suite(
  'build()',
  { timeout: timeoutMs },
  (suiteContext_build: Test.SuiteContext) => {
    //

    //
    const mock = test.mock;

    // minimum: client-side env, as found on esbuild's 'BuildOptions.defines'
    // eslint-disable-next-line prefer-const
    let env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      BUILD_DIR: undefined,
      // PUBLIC_URL: '/',
      // WDS_SOCKET_HOST: undefined,
      // WDS_SOCKET_PORT: undefined,
      // WDS_SOCKET_PATH: undefined,
      // FAST_REFRESH: 'false',
      __TEST_VARIABLE__: 'false',
    } satisfies NodeJS.ProcessEnv;
    //

    // eslint-disable-next-line prefer-const
    let cwd = mock.fn<() => string>(global.process.cwd);
    //
    const loadEnvFile = mock.fn<(path?: string | URL | Buffer) => void>(
      global.process.loadEnvFile
    );
    //
    const exit = mock.fn<(code?: number | string | null | undefined) => never>(
      global.process.exit
    );
    //
    const on = mock.fn(global.process.on);
    const off = mock.fn(global.process.off);
    //
    // eslint-disable-next-line prefer-const
    let mockProcess: NodeJS.Process = {
      ...global.process,
      env: env,
      loadEnvFile: loadEnvFile,
      cwd: cwd,
      on: on,
      off: off,
      exit: exit,
      exitCode: 0,
    };

    const { it } = test;

    it('runs', { signal: suiteContext_build.signal }, async (ctx) => {
      //
      const mockBuild: Test.Mock<Build> = ctx.mock.fn<Build>(build);
      const result = await mockBuild(mockProcess, {
        platform: 'node',
        outdir: path.resolve(__dirname, 'dist'),
        entryPoints: [path.resolve(__dirname, '../', 'setupTests.ts')],
        logLevel: 'silent',
        write: false,
        publicPath: path.resolve(__dirname, '../', 'mocks', 'public'),
      });
      //
      (await ctx.test(
        'passes',
        (testContext_passes: Test.TestContext, done) => {
          testContext_passes.assert.ok(result !== undefined);
          return done();
        }
      )) satisfies void;
    }) satisfies Promise<void>;

    //
  }
) satisfies Promise<void>;
