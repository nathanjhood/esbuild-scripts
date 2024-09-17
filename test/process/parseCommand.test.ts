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
        mock.restoreAll();
        return done();
        //
      },
      { timeout: timeout, signal: suiteContext_parseCommand.signal }
    ) satisfies void;
    //
    test.after(
      (ctx, done) => {
        //
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
                  ) => Promise<ReturnType<typeof util.parseArgs>>;
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
                ) => Promise<ReturnType<typeof util.parseArgs>>;
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
          (ctx, done) => {
            //
            const parseCommand: typeof import('../../src/process/parseCommand') = require('../../src/process/parseCommand');
            parseCommand(process)
              .then((env) => ctx.assert.ok(env))
              .then(done)
              .catch(done);
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
