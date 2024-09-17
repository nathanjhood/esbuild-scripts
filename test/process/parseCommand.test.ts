/**
 * @file parseCommand.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require("node:test");
import util = require("node:util");

const timeout = 10000;

test.describe('parseCommand', { timeout: timeout }, (suiteContext_parseCommand) => {
  //

  //
  const mock = test.mock;
  //

  //
  test.afterEach((ctx, done) => {
    //
    return done();
    //
  }, { signal: suiteContext_parseCommand.signal }) satisfies void;
  //
  test.after((ctx, done) => {
    //
    mock.reset();
    return done();
    //
  }, { signal: suiteContext_parseCommand.signal }) satisfies void;
  //

  //
  test.describe('imports', { timeout: timeout, signal: suiteContext_parseCommand.signal }, (suiteContext_imports) => {
    //

    //
    test.it('require', (ctx) => {
      return ctx.assert.doesNotThrow((): typeof import('../../src/process/parseCommand') => require('../../src/process/parseCommand'));
    }) satisfies Promise<void>;
    //

    //
    test.it('import', (ctx) => {
      return ctx.assert.doesNotReject(import('../../src/process/parseCommand'));
    }) satisfies Promise<void>;
    //

    //
    test.it('import <Promise>', (ctx) => {
      return ctx.assert.doesNotReject((): Promise<{ default: (proc: NodeJS.Process) => Promise<ReturnType<typeof util.parseArgs>>}> => import('../../src/process/parseCommand'));
    }) satisfies Promise<void>;
    //

    //
    test.it('import (async)', (ctx) => {
      return ctx.assert.doesNotThrow(async (): Promise<{ default: (proc: NodeJS.Process) => Promise<ReturnType<typeof util.parseArgs>>}> => await import('../../src/process/parseCommand'));
    }) satisfies Promise<void>;
    //

    //
  }) satisfies Promise<void>;
  //

  //
}) satisfies Promise<void>;
