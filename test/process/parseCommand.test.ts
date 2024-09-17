/**
 * @file parseCommand.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require("node:test");

const timeout = 10000;

test.describe('parseCommand', { timeout: timeout }, (suiteContext_parseCommand) => {
  //
  const mock = test.mock;
  //
  test.afterEach((ctx, done) => {
    done();
  }, { signal: suiteContext_parseCommand.signal })
  //
  test.after((ctx, done) => {
    mock.reset();
    done();
  }, { signal: suiteContext_parseCommand.signal });
  //
  test.describe('imports', () => {
    test.it('require', (ctx) => {
      return ctx.assert.doesNotThrow(() => require('../../src/process/parseCommand'));
    });
    test.it('import', (ctx) => {
      return ctx.assert.doesNotReject(() => import('../../src/process/parseCommand'));
    });
    test.it('import (async)', (ctx) => {
      return ctx.assert.doesNotThrow(async () => await import('../../src/process/parseCommand'));
    });
  })
})
