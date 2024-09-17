/**
 * @file parseCommand.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require("node:test");

const { describe, it, before, after, beforeEach, afterEach } = test;

const timeout = 10000;

describe('parseCommand', () => {
  describe('imports', () => {
    it('require', (ctx) => {
      return ctx.assert.doesNotThrow(() => require('../../src/process/parseCommand'));
    });
    it('import', (ctx) => {
      return ctx.assert.doesNotReject(() => import('../../src/process/parseCommand'));
    });
    it('import (async)', (ctx) => {
      return ctx.assert.doesNotThrow(async () => await import('../../src/process/parseCommand'));
    });
  })
})
