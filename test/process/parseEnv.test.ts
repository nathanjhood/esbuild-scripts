/**
 * @file parseCommand.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import type Test = require('node:test');
import test = require('node:test');
import path = require('node:path');

import type ParseEnv = require('../../src/process/parseEnv');
import parseEnv = require('../../src/process/parseEnv');

// test.suite('parseEnv()', { timeout: 10000 }, (suiteContext) => {
//   test.test(
//     'loadEnvFile',
//     { signal: suiteContext.signal },
//     (testContext: Test.TestContext) => {
//       const before = process.env;
//       console.log(before);
//       process.loadEnvFile(path.resolve(process.cwd(), '.env.example'));
//       console.log(before);
//       const after = process.env;
//       testContext.assert.deepStrictEqual(before, after);
//     }
//   );
// });

const config = {
  timeout: 10000,
  file: path.parse(path.resolve(__dirname, '../../src/process/parseEnv')),
  verbose: global.process.env['VERBOSE'] === 'true',
};

test.suite(
  'parseEnv()',
  { timeout: config.timeout },
  ({ name: name, signal: signal }: Test.SuiteContext) => {
    //

    //
    const { describe, it, before, after, beforeEach, afterEach, mock } = test;

    // create a spy
    const parseEnvSpy: Test.Mock<ParseEnv> = mock.fn<ParseEnv>(parseEnv);
    //

    //
    before(
      (ctx: Test.SuiteContext | Test.TestContext, done): void => {
        //
        // if (config.verbose) global.console.time(ctx.name);
        ctx.signal.throwIfAborted();
        return done();
        //
      },
      { signal: signal }
    ) satisfies void;
    //

    //
    beforeEach(
      (ctx: Test.SuiteContext | Test.TestContext, done): void => {
        //
        // if (config.verbose) global.console.timeLog(ctx.name);
        ctx.signal.throwIfAborted();
        return done();
        //
      },
      { signal: signal }
    ) satisfies void;
    //

    //
    afterEach(
      (ctx: Test.SuiteContext | Test.TestContext, done): void => {
        //
        if (ctx.signal.aborted) {
          // global.console.timeEnd(ctx.name);
          global.console.error(name, ctx.name);
        }
        // //
        // else if (config.verbose) {
        //   global.console.timeEnd(ctx.name);
        // }
        //
        ctx.signal.throwIfAborted();
        return done();
        //
      },
      { signal: signal }
    ) satisfies void;
    //

    //
    after(
      (ctx: Test.SuiteContext | Test.TestContext, done): void => {
        //
        ctx.signal.throwIfAborted();
        return done();
        //
      },
      { signal: signal }
    ) satisfies void;
    //

    //
    describe(
      'imports',
      { signal: signal },
      (suiteContext_imports: Test.SuiteContext): void => {
        //

        //
        it(
          'require',
          { signal: suiteContext_imports.signal },
          (ctx: Test.TestContext, done): void => {
            //
            const t: void = ctx.assert.doesNotThrow(
              (): typeof import('../../src/process/parseEnv') =>
                require('../../src/process/parseEnv')
            );
            //
            return done(t);
          }
        ) satisfies Promise<void>;
        //

        //
        it(
          'import',
          { signal: suiteContext_imports.signal },
          (ctx: Test.TestContext, done): void => {
            //
            ctx.assert
              .doesNotReject(import('../../src/process/parseEnv'))
              .then(done)
              .catch(done);
          }
        ) satisfies Promise<void>;
        //

        //
        it(
          'import <Promise>',
          { signal: suiteContext_imports.signal },
          (ctx: Test.TestContext, done): void => {
            //
            ctx.assert
              .doesNotReject(
                (): Promise<{
                  default: (proc: NodeJS.Process) => NodeJS.ProcessEnv;
                }> => import('../../src/process/parseEnv')
              )
              .then(done)
              .catch(done);
          }
        ) satisfies Promise<void>;
        //

        //
        it(
          'import (async)',
          { signal: suiteContext_imports.signal },
          (ctx: Test.TestContext, done): void => {
            //
            const t: void = ctx.assert.doesNotThrow(
              async (): Promise<{
                default: (proc: NodeJS.Process) => NodeJS.ProcessEnv;
              }> => await import('../../src/process/parseEnv')
            );
            //
            return done(t);
            //
          }
        ) satisfies Promise<void>;
        //

        //
      }
    ) satisfies Promise<void>; // suiteContext_imports
    //

    //
    describe(
      'runs',
      { signal: signal },
      (suiteContext_runs: Test.SuiteContext): void => {
        //

        it(
          'parses .env files from cwd()',
          { signal: suiteContext_runs.signal },
          async (testContext_asAModule: Test.TestContext) => {
            //

            testContext_asAModule.afterEach(
              (ctx: Test.SuiteContext | Test.TestContext, done): void => {
                //
                if (ctx.signal.aborted) {
                  global.console.error(name, ctx.name);
                }
                //
                else if (config.verbose) {
                  global.console.info(name, ctx.name);
                }
                //
                testContext_asAModule.mock.restoreAll();
                return done();
                //
              },
              { signal: testContext_asAModule.signal }
            ) satisfies void;
            //

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
            let cwd = testContext_asAModule.mock.fn<() => string>(
              global.process.cwd
            );
            //
            const loadEnvFile = testContext_asAModule.mock.fn<
              (path?: string | URL | Buffer) => void
            >(global.process.loadEnvFile);
            //
            const exit = testContext_asAModule.mock.fn<
              (code?: number | string | null | undefined) => never
            >(global.process.exit);
            //
            const on = testContext_asAModule.mock.fn(global.process.on);
            const off = testContext_asAModule.mock.fn(global.process.off);
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
            //

            const resetCalls = () => {
              const checks = [on, off, cwd, exit, loadEnvFile];
              checks.forEach((check) => {
                check.mock.resetCalls();
              });
            };

            (await testContext_asAModule.test(
              'loads .env from cwd()',
              { signal: testContext_asAModule.signal },
              (ctx: Test.TestContext, done): void => {
                //

                // use the function, sample the result
                const result = parseEnvSpy(mockProcess);
                // result type-checks
                ctx.assert.ok(result);
                ctx.assert.ok(typeof result === 'object');
                ctx.assert.ok(result instanceof Object);
                ctx.assert.ok(result satisfies NodeJS.ProcessEnv);
                // impl. should only call 'proc.cwd()' once
                ctx.assert.deepStrictEqual(cwd.mock.callCount(), 1);
                resetCalls();
                ctx.mock.reset();
                return done();
              }
            )) satisfies void; // 'loads .env from cwd()'
          }
        ) satisfies Promise<void>; // suiteContext_runs
      }
    ) satisfies Promise<void>; // suiteContext_parseEnv
  }
);
