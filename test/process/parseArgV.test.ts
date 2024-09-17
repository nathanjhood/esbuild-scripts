/**
 * @file parseArgV.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require("node:test");
import util = require("node:util");

const timeout = 10000;

test.suite('parseArgV', (suiteContext_parseArgV) => {
  //

  //
  const mock = test.mock;
  //

  //
  test.afterEach((ctx, done) => {
    done();
  }, { signal: suiteContext_parseArgV.signal }) satisfies void;
  //
  test.after((ctx, done) => {
    mock.reset();
    done();
  }, { signal: suiteContext_parseArgV.signal }) satisfies void;
  //

  //
  test.describe('imports', { signal: suiteContext_parseArgV.signal, timeout: timeout }, (suiteContext_imports) => {
    //

    //
    test.it('require', { signal: suiteContext_imports.signal, timeout: timeout }, (ctx) => {
      return ctx.assert.doesNotThrow((): typeof import('../../src/process/parseArgV') => require('../../src/process/parseArgV'));
    }) satisfies Promise<void>;
    //

    //
    test.it('import', { signal: suiteContext_imports.signal, timeout: timeout }, (ctx) => {
      return ctx.assert.doesNotReject(import('../../src/process/parseArgV'));
    }) satisfies Promise<void>;

    //
    test.it('import <Promise>', { signal: suiteContext_imports.signal, timeout: timeout }, (ctx) => {
      return ctx.assert.doesNotReject((): Promise<{ default: (proc: NodeJS.Process) => Promise<ReturnType<typeof util.parseArgs>>}> => import('../../src/process/parseArgV'));
    }) satisfies Promise<void>;
    //

    //
    test.it('import (async)', { signal: suiteContext_imports.signal, timeout: timeout }, (ctx) => {
      return ctx.assert.doesNotThrow(async (): Promise<{ default: (proc: NodeJS.Process) => Promise<ReturnType<typeof util.parseArgs>>}> => await import('../../src/process/parseArgV'));
    }) satisfies Promise<void>;
    //

  //
  }) satisfies Promise<void>;
  //

//
}) satisfies Promise<void>;
