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
                default: (proc: NodeJS.Process) => Promise<path.ParsedPath>;
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
              default: (proc: NodeJS.Process) => Promise<path.ParsedPath>;
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
        (ctx, done) => {
          //
          const parseCwd: typeof import('../../src/process/parseCwd') = require('../../src/process/parseCwd');
          parseCwd(process)
            .then((cwd) => ctx.assert.ok(cwd))
            .then(done)
            .catch(done);
          //
        }
      ) satisfies Promise<void>; // 'parses cwd()'
      //

      //
    }
  ) satisfies Promise<void>; // suiteContext_runs
  //
}) satisfies Promise<void>;
