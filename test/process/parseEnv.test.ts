/**
 * @file parseCommand.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require("node:test");
import process = require("node:process");

const timeout = 10000;

test.describe('parseEnv', { timeout: timeout }, (suiteContext_parseEnv) => {
  const mock = test.mock;
  const env = {
    NODE_ENV: "test"
  }
  const getCwd = mock.fn<() => string>(() => "/base/dir");
  const loadEnvFile = mock.fn<(cwd: string) => void>((cwd: string) => { if (cwd) JSON.stringify(env); return; } );
  const mockProcess = {
    env: env,
    loadEnvFile: loadEnvFile(getCwd()),
    cwd: getCwd
  }
  //
  test.afterEach((ctx, done) => {
    mock.restoreAll();
    done();
  }, { signal: suiteContext_parseEnv.signal });
  test.after((ctx, done) => {
    mock.reset();
    done();
  }, { signal: suiteContext_parseEnv.signal });
  //
  test.describe('imports', { signal: suiteContext_parseEnv.signal, timeout: timeout }, (suiteContext_imports) => {
    test.it('require', { signal: suiteContext_imports.signal, timeout: timeout}, (ctx) => {
      return ctx.assert.doesNotThrow(() => require('../../src/process/parseEnv'));
    });
    test.it('import', { signal: suiteContext_imports.signal, timeout: timeout}, (ctx) => {
      return ctx.assert.doesNotReject(() => import('../../src/process/parseEnv'));
    });
    test.it('import (async)', { signal: suiteContext_imports.signal, timeout: timeout}, (ctx) => {
      return ctx.assert.doesNotThrow(async () => await import('../../src/process/parseEnv'));
    });
  });
  test.describe('runs', { signal: suiteContext_parseEnv.signal, timeout: timeout }, (suiteContext_runs) => {
    test.it('loads .env from cwd()', { timeout: timeout, signal: suiteContext_runs.signal }, (ctx) => {
      const parseEnv: typeof import("../../src/process/parseEnv") = require("../../src/process/parseEnv");
      parseEnv(process).then((env) => {
        return ctx.assert.ok(env);
      });
    });
  });
});
