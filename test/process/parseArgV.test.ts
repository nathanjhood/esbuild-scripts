/**
 * @file parseArgV.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require("node:test");

const timeout = 10000;

test.suite('parseArgV', (suiteContext_parseArgV) => {
  //
  const mock = test.mock;
  //
  test.after(() => {
    mock.reset();
  });
  //
  test.describe('imports', { signal: suiteContext_parseArgV.signal, timeout: timeout }, (suiteContext_imports) => {
    test.it('require', { signal: suiteContext_imports.signal, timeout: timeout },  (ctx) => {
      return ctx.assert.doesNotThrow(() => require('../../src/process/parseArgV'));
    });
    test.it('import', { signal: suiteContext_imports.signal, timeout: timeout }, (ctx) => {
      return ctx.assert.doesNotReject(() => import('../../src/process/parseArgV'));
    });
    test.it('import (async)', { signal: suiteContext_imports.signal, timeout: timeout }, (ctx) => {
      return ctx.assert.doesNotThrow(async () => await import('../../src/process/parseArgV'));
    });
  })
})
