/**
 * @file parseCommand.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require('node:test');
// import process = require('node:process');

const timeout = 10000;

test.suite('parseEnv', { timeout: timeout }, (suiteContext_parseEnv) => {
  //

  //
  const mock = test.mock;
  const env = {
    NODE_ENV: 'test',
  };
  const getCwd = mock.fn<() => string>(() => '/base/dir');
  const loadEnvFile = mock.fn<(cwd: string) => void>((cwd: string) => {
    if (cwd) JSON.stringify(env);
    return;
  });
  const mockProcess = {
    env: env,
    loadEnvFile: loadEnvFile(getCwd()),
    cwd: getCwd,
  };
  //

  //
  test.afterEach(
    (ctx, done) => {
      //
      mock.restoreAll();
      return done();
      //
    },
    { signal: suiteContext_parseEnv.signal }
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
    { signal: suiteContext_parseEnv.signal }
  ) satisfies void;
  //

  //
  test.describe(
    'imports',
    { signal: suiteContext_parseEnv.signal, timeout: timeout },
    (suiteContext_imports) => {
      //

      //
      test.it(
        'require',
        { timeout: timeout, signal: suiteContext_imports.signal },
        (ctx, done) => {
          const t: void = ctx.assert.doesNotThrow(
            (): typeof import('../../../src/process/parse/parseEnv') =>
              require('../../../src/process/parse/parseEnv')
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
            .doesNotReject(import('../../../src/process/parse/parseEnv'))
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
                default: (proc: NodeJS.Process) => Promise<NodeJS.ProcessEnv>;
              }> => import('../../../src/process/parse/parseEnv')
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
              default: (proc: NodeJS.Process) => Promise<NodeJS.ProcessEnv>;
            }> => await import('../../../src/process/parse/parseEnv')
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
    { signal: suiteContext_parseEnv.signal, timeout: timeout },
    (suiteContext_runs) => {
      //

      test.it(
        'as a module',
        { timeout: timeout, signal: suiteContext_runs.signal },
        async (testContext_asAModule) => {
          //
          const parseEnv: typeof import('../../../src/process/parse/parseEnv') = require('../../../src/process/parse/parseEnv');
          //

          //
          const loadEnvFileSpy = testContext_asAModule.mock.fn(
            (
              path?: Parameters<(typeof import('node:process'))['loadEnvFile']>
            ): (typeof import('node:process'))['loadEnvFile'] =>
              require('node:process')['loadEnvFile'](path)
          );
          //

          //
          const parseEnvSpy = testContext_asAModule.mock.fn(
            (proc: NodeJS.Process) => parseEnv(proc)
          );
          //

          //
          (await test.it(
            'loads .env from cwd()',
            { timeout: timeout, signal: testContext_asAModule.signal },
            (ctx: test.TestContext, done) => {
              //
              parseEnv(process)
                .then((env) => ctx.assert.ok(env))
                .then(done)
                .catch(done);
              //
            }
          )) satisfies void; // 'loads .env from cwd()'
          //

          (await test.it(
            'mutates process.env correctly',
            { timeout: timeout, signal: testContext_asAModule.signal },
            (ctx: test.TestContext, done) => {
              const before = global.process.env.FAST_REFRESH;
              parseEnv(global.process)
                .then((env) => {
                  const after = env.FAST_REFRESH;
                  ctx.assert.notStrictEqual(after, before);
                  return;
                })
                .then(done)
                .catch(done);
            }
          )) satisfies void; // 'mutates process.env correctly'
        }
      ); // testcontext_asAModule

      //
    }
  ) satisfies Promise<void>; // suiteContext_runs
  //

  //
}) satisfies Promise<void>; // suiteContext_parseEnv
