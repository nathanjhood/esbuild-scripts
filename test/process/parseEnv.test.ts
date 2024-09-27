/**
 * @file parseCommand.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import type Test = require('node:test');
import test = require('node:test');
import path = require('node:path');

import type ParseEnv = require('../../src/process/parseEnv');

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
    const { describe, it, before, after, beforeEach, afterEach } = test;

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
                  default: (proc: NodeJS.Process) => {
                    raw: NodeJS.ProcessEnv;
                    stringified: { 'process.env': NodeJS.ProcessEnv };
                  };
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
                default: (proc: NodeJS.Process) => {
                  raw: NodeJS.ProcessEnv;
                  stringified: { 'process.env': NodeJS.ProcessEnv };
                };
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
          async (testContext_asAModule: Test.TestContext): Promise<void> => {
            //

            afterEach(
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

            // import the function
            const parseEnv: typeof import('../../src/process/parseEnv') = require('../../src/process/parseEnv');
            // create a spy
            const parseEnvSpy: Test.Mock<ParseEnv> =
              testContext_asAModule.mock.fn<ParseEnv>(parseEnv);
            //

            // minimum: client-side env, as found on esbuild's 'BuildOptions.defines'
            const env: NodeJS.ProcessEnv = {
              NODE_ENV: 'test',
              PUBLIC_URL: '/',
              WDS_SOCKET_HOST: undefined,
              WDS_SOCKET_PORT: undefined,
              WDS_SOCKET_PATH: undefined,
              FAST_REFRESH: 'false',
              __TEST_VARIABLE__: 'false',
            } satisfies NodeJS.ProcessEnv;
            //

            //
            const cwd = testContext_asAModule.mock.fn<() => string>(
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
            const mockProcess: NodeJS.Process = {
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

            const logCallCounts = (
              ctx: Test.TestContext | Test.SuiteContext
            ) => {
              const checks = [on, off, cwd, exit, loadEnvFile];
              checks.forEach((check) => {
                global.console.info(
                  name,
                  ctx.name,
                  `called`,
                  check.name,
                  check.mock.callCount(),
                  'times'
                );
              });
            };

            const resetCalls = () => {
              const checks = [on, off, cwd, exit, loadEnvFile];
              checks.forEach((check) => {
                check.mock.resetCalls();
              });
            };

            testContext_asAModule.afterEach(
              (ctx, done) => {
                ctx.mock.reset();
                return done();
              },
              {
                signal: testContext_asAModule.signal,
              }
            );

            //
            (await testContext_asAModule.test(
              'loads .env from cwd()',
              { signal: testContext_asAModule.signal },
              (ctx: Test.TestContext, done): void => {
                //

                // use the function, sample the result
                const result = parseEnvSpy(mockProcess, {
                  verbose: false, //config.verbose,
                });
                // result type-checks
                ctx.assert.ok(result);
                ctx.assert.ok(typeof result === 'object');
                ctx.assert.ok(result instanceof Object);
                ctx.assert.ok(result.raw satisfies NodeJS.ProcessEnv);
                ctx.assert.ok(
                  result.stringified['process.env'] satisfies NodeJS.ProcessEnv
                );
                // impl. should only call 'proc.cwd()' once
                ctx.assert.deepStrictEqual(cwd.mock.callCount(), 1);
                //
                if (config.verbose) logCallCounts(ctx);
                resetCalls();
                return done();
              }
            )) satisfies void; // 'loads .env from cwd()'
            //

            //
            (await testContext_asAModule.test(
              'loads .env from cwd()',
              { signal: testContext_asAModule.signal },
              (ctx: Test.TestContext, done): void => {
                //

                // 'before' value
                const before = mockProcess.env;
                // 'result' value
                const result = parseEnvSpy(mockProcess, {
                  verbose: config.verbose,
                }).raw;
                // 'after' value
                const after = mockProcess.env;
                // should only call 'proc.cwd()' once
                ctx.assert.deepStrictEqual(cwd.mock.callCount(), 1);
                // compare 'before' to 'after'
                ctx.assert.deepStrictEqual(after, before);
                // compare 'result' to 'after'
                ctx.assert.notDeepStrictEqual(after, result);
                // compare 'result' to 'before'
                ctx.assert.notDeepStrictEqual(before, result);
                // if 'process.env' has changed, test has passed.
                if (config.verbose) logCallCounts(ctx);
                resetCalls();
                return done();
              }
            )) satisfies void; // 'mutates process.env correctly'
            //

            //
          }
        ) satisfies Promise<void>; // 'parses '.env' files from cwd()';

        //
      }
    ) satisfies Promise<void>; // suiteContext_runs
    //

    if (config.verbose) global.console.timeEnd(name);

    //
  }
) satisfies Promise<void>; // suiteContext_parseEnv
