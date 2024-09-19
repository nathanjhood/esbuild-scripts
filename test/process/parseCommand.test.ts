/**
 * @file parseCommand.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require('node:test');
import util = require('node:util');

const timeout = 10000;

test.suite(
  'parseCommand',
  { timeout: timeout },
  (suiteContext_parseCommand) => {
    //

    //
    const mock = test.mock;
    //

    //
    test.afterEach(
      (ctx, done) => {
        //
        console.warn(ctx.name, 'calling mock.restoreAll()');
        mock.restoreAll();
        return done();
        //
      },
      { timeout: timeout, signal: suiteContext_parseCommand.signal }
    ) satisfies void;
    //

    //
    test.after(
      (ctx, done) => {
        //
        console.warn(ctx.name, 'calling mock.reset()');
        mock.reset();
        return done();
        //
      },
      { timeout: timeout, signal: suiteContext_parseCommand.signal }
    ) satisfies void;
    //

    //
    test.describe(
      'imports',
      { timeout: timeout, signal: suiteContext_parseCommand.signal },
      (suiteContext_imports) => {
        //

        //
        test.it(
          'require',
          { timeout: timeout, signal: suiteContext_imports.signal },
          (ctx, done) => {
            const t: void = ctx.assert.doesNotThrow(
              (): typeof import('../../src/process/parseCommand') =>
                require('../../src/process/parseCommand')
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
              .doesNotReject(import('../../src/process/parseCommand'))
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
                  default: (
                    proc: NodeJS.Process
                  ) => ReturnType<typeof util.parseArgs>;
                }> => import('../../src/process/parseCommand')
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
                default: (
                  proc: NodeJS.Process
                ) => ReturnType<typeof util.parseArgs>;
              }> => await import('../../src/process/parseCommand')
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
      { signal: suiteContext_parseCommand.signal, timeout: timeout },
      (suiteContext_runs) => {
        //

        //
        test.it(
          'parses commands passed to running NodeJS instance',
          { timeout: timeout, signal: suiteContext_runs.signal },
          async (ctx) => {
            //

            //
            const parseCommand: typeof import('../../src/process/parseCommand') = require('../../src/process/parseCommand');
            const parseCommandSpy = ctx.mock.fn(parseCommand);
            //

            //
            (await ctx.test(
              'ok',
              {
                timeout: timeout,
                signal: ctx.signal,
              },
              (ctx_ok: test.TestContext, done) => {
                const argv = parseCommandSpy(process);
                ctx_ok.assert.ok(argv);
                parseCommandSpy.mock.resetCalls();
                return done();
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
                  parseCommandSpy(process);
                  ctx_callcount.assert.deepStrictEqual(
                    parseCommandSpy.mock.callCount(),
                    i + 1 // assert the callcount each time
                  );
                }
                return done();
              }
            )) satisfies void;
            //

            //
          }
        ) satisfies Promise<void>; // 'parses commands passed to running NodeJS instance'
        //

        //
      }
    ) satisfies Promise<void>; // suiteContext_runs
    //

    //
  }
) satisfies Promise<void>; // suiteContext_parseCommand
