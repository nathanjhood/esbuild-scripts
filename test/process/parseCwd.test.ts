/**
 * @file parseCwd.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import test = require('node:test');
import path = require('node:path');

const timeout: number = 10000;

test.suite('parseCwd', { timeout: timeout }, (suiteContext_parseCwd) => {
  //

  //
  const mock = test.mock;
  //

  //
  test.afterEach(
    (ctx, done) => {
      //
      mock.restoreAll();
      return done();
      //
    },
    { timeout: timeout, signal: suiteContext_parseCwd.signal }
  ) satisfies void;
  //

  //
  test.after(
    (ctx, done) => {
      //
      mock.reset();
      return done();
      //
    },
    { timeout: timeout, signal: suiteContext_parseCwd.signal }
  ) satisfies void;
  //

  //
  test.describe(
    'imports',
    { signal: suiteContext_parseCwd.signal, timeout: timeout },
    (suiteContext_imports) => {
      //

      //
      test.it(
        'require',
        { timeout: timeout, signal: suiteContext_imports.signal },
        (ctx, done) => {
          const t: void = ctx.assert.doesNotThrow(
            (): typeof import('../../src/process/parseCwd') =>
              require('../../src/process/parseCwd')
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
          ctx.assert
            .doesNotReject(import('../../src/process/parseCwd'))
            .then(done)
            .catch(done);
        }
      ) satisfies Promise<void>;
      //

      //
      test.it(
        'import <Promise>',
        { timeout: timeout, signal: suiteContext_imports.signal },
        (ctx, done) => {
          ctx.assert
            .doesNotReject(
              (): Promise<{
                default: (proc: NodeJS.Process) => path.ParsedPath;
              }> => import('../../src/process/parseCwd')
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
          const t: void = ctx.assert.doesNotThrow(
            async (): Promise<{
              default: (proc: NodeJS.Process) => path.ParsedPath;
            }> => await import('../../src/process/parseCwd')
          );
          return done(t);
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
    { signal: suiteContext_parseCwd.signal, timeout: timeout },
    (suiteContext_runs) => {
      //

      //
      test.it(
        'parses cwd()',
        { timeout: timeout, signal: suiteContext_runs.signal },
        async (ctx: test.TestContext) => {
          //
          const parseCwd: typeof import('../../src/process/parseCwd') = require('../../src/process/parseCwd');
          const parseCwdSpy = ctx.mock.fn(parseCwd);
          //
          (await ctx.test(
            'ok',
            {
              timeout: timeout,
              signal: ctx.signal,
            },
            (ctx_ok: test.TestContext, done) => {
              const argv = parseCwdSpy(process);
              ctx_ok.assert.ok(argv);
              parseCwdSpy.mock.resetCalls();
              return done();
            }
          )) satisfies void;
          (await ctx.test(
            'callcount',
            {
              timeout: timeout,
              signal: ctx.signal,
            },
            (ctx_callcount: test.TestContext, done) => {
              // call parseEnv 5 times consecutively
              for (let i = 0; i < 5; i++) {
                parseCwdSpy(process);
                ctx_callcount.assert.deepStrictEqual(
                  parseCwdSpy.mock.callCount(),
                  i + 1 // assert the callcount each time
                );
              }
              return done();
            }
          )) satisfies void;
        }
      ) satisfies Promise<void>; // 'parses cwd()'
      //

      //
    }
  ) satisfies Promise<void>; // suiteContext_runs
  //
}) satisfies Promise<void>;
