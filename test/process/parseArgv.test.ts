/**
 * @file parseArgV.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require('node:test');
import util = require('node:util');

const timeout = 10000;

test.suite('parseArgv()', { timeout: timeout }, (suiteContext_parseArgV) => {
  //

  //
  const mock = test.mock;
  //

  //
  test.before(
    (ctx, done) => {
      //
      if (global.process.env['VERBOSE'] === 'true')
        global.console.info(suiteContext_parseArgV.name, ctx.name);
      return done();
      //
    },
    { timeout: timeout, signal: suiteContext_parseArgV.signal }
  ) satisfies void;
  //

  //
  test.afterEach(
    (ctx, done) => {
      //
      if (ctx.signal.aborted) {
        global.console.error(suiteContext_parseArgV.name, ctx.name);
      }
      //
      else if (global.process.env['VERBOSE'] === 'true') {
        global.console.info(suiteContext_parseArgV.name, ctx.name);
      }
      //
      mock.restoreAll();
      return done();
      //
    },
    { timeout: timeout, signal: suiteContext_parseArgV.signal }
  ) satisfies void;
  //

  //
  test.after(
    (ctx, done) => {
      //
      if (global.process.env['VERBOSE'] === 'true')
        global.console.info(suiteContext_parseArgV.name, ctx.name);
      mock.reset();
      return done();
      //
    },
    { timeout: timeout, signal: suiteContext_parseArgV.signal }
  ) satisfies void;
  //

  //
  test.describe(
    'imports',
    { timeout: timeout, signal: suiteContext_parseArgV.signal },
    (suiteContext_imports) => {
      //

      //
      test.it(
        'require',
        { timeout: timeout, signal: suiteContext_imports.signal },
        (ctx, done) => {
          //
          const t: void = ctx.assert.doesNotThrow(
            (): typeof import('../../src/process/parseArgv') =>
              require('../../src/process/parseArgv')
          );
          return done(t);
        }
      ) satisfies Promise<void>;
      //

      //
      test.it(
        'import',
        { timeout: timeout, signal: suiteContext_imports.signal },
        (ctx, done) => {
          //
          ctx.assert
            .doesNotReject(import('../../src/process/parseArgv'))
            .then(done)
            .catch(done);
        }
      ) satisfies Promise<void>;

      //
      test.it(
        'import <Promise>',
        { timeout: timeout, signal: suiteContext_imports.signal },
        (ctx, done) => {
          //
          ctx.assert
            .doesNotReject(
              (): Promise<{
                default: (
                  proc: NodeJS.Process
                ) => ReturnType<typeof util.parseArgs>;
              }> => import('../../src/process/parseArgv')
            )
            .then(done)
            .catch(done);
        }
      ) satisfies Promise<void>;
      //

      //
      test.it(
        'import (async)',
        { timeout: timeout, signal: suiteContext_imports.signal },
        (ctx, done) => {
          //
          const t: void = ctx.assert.doesNotThrow(
            async (): Promise<{
              default: (
                proc: NodeJS.Process
              ) => ReturnType<typeof util.parseArgs>;
            }> => await import('../../src/process/parseArgv')
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
  test.describe(
    'runs',
    { signal: suiteContext_parseArgV.signal, timeout: timeout },
    (suiteContext_runs) => {
      //

      //
      test.it(
        'parses commands passed to running cli instance',
        { timeout: timeout, signal: suiteContext_runs.signal },
        async (ctx: test.TestContext) => {
          //

          //
          const parseArgv: typeof import('../../src/process/parseArgv') = require('../../src/process/parseArgv');
          const parseArgvSpy = ctx.mock.fn(parseArgv);

          //
          (await ctx.test(
            'ok',
            {
              timeout: timeout,
              signal: ctx.signal,
            },
            (ctx_ok: test.TestContext, done) => {
              //
              const argv = parseArgvSpy(process, {
                verbose:
                  global.process.env['VERBOSE'] === 'true' ? true : false,
              });
              ctx_ok.assert.ok(argv);
              parseArgvSpy.mock.resetCalls();
              //
              return done();
              //
            }
          )) satisfies void;
          //

          //
          (await ctx.test(
            'callcount',
            {
              timeout: timeout,
              signal: ctx.signal,
            },
            (ctx_callcount: test.TestContext, done) => {
              // call parseEnv 5 times consecutively
              for (let i = 0; i < 5; i++) {
                parseArgvSpy(process, {
                  verbose:
                    global.process.env['VERBOSE'] === 'true' ? true : false,
                });
                ctx_callcount.assert.deepStrictEqual(
                  parseArgvSpy.mock.callCount(),
                  i + 1 // assert the callcount each time
                );
              }
              //
              return done();
              //
            }
          )) satisfies void;
          //

          //
        }
      ) satisfies Promise<void>; // 'parses commands passed to running cli instance'
      //

      //
    }
  ) satisfies Promise<void>; // suiteContext_runs
  //

  //
}) satisfies Promise<void>; // suiteContext_parseArgV