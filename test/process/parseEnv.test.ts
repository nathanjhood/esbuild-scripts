/**
 * @file parseCommand.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require('node:test');

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
      console.warn(ctx.name, 'calling mock.restoreAll()');
      mock.restoreAll();
      return done();
      //
    },
    { timeout: timeout, signal: suiteContext_parseEnv.signal }
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
    { timeout: timeout, signal: suiteContext_parseEnv.signal }
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
            (): typeof import('../../src/process/parseEnv') =>
              require('../../src/process/parseEnv')
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
            .doesNotReject(import('../../src/process/parseEnv'))
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
                default: (proc: NodeJS.Process) => Promise<{
                  raw: NodeJS.ProcessEnv;
                  stringified: { 'process.env': NodeJS.ProcessEnv };
                }>;
              }> => import('../../src/process/parseEnv')
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
              default: (proc: NodeJS.Process) => {
                raw: NodeJS.ProcessEnv;
                stringified: { 'process.env': NodeJS.ProcessEnv };
              };
            }> => await import('../../src/process/parseEnv')
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
        'parses .env files from cwd()',
        { timeout: timeout, signal: suiteContext_runs.signal },
        async (testContext_asAModule: test.TestContext) => {
          //

          //
          const parseEnv: typeof import('../../src/process/parseEnv') = require('../../src/process/parseEnv');
          const parseEnvSpy = testContext_asAModule.mock.fn(parseEnv);
          //

          //
          (await test.it(
            'loads .env from cwd()',
            { timeout: timeout, signal: testContext_asAModule.signal },
            (ctx: test.TestContext, done) => {
              //
              const env = parseEnvSpy(process);
              ctx.assert.ok(env);
              return done();
              //
            }
          )) satisfies void; // 'loads .env from cwd()'
          //

          (await test.it(
            'mutates process.env correctly',
            { timeout: timeout, signal: testContext_asAModule.signal },
            (ctx: test.TestContext, done) => {
              const before = global.process.env.FAST_REFRESH;
              parseEnvSpy(global.process);
              const after = global.process.env.FAST_REFRESH;
              ctx.assert.deepStrictEqual(after, before);
              return done();
            }
          )) satisfies void; // 'mutates process.env correctly'
        }
      );

      //
    }
  ) satisfies Promise<void>; // suiteContext_runs
  //

  //
}) satisfies Promise<void>; // suiteContext_parseEnv
