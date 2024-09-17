/**
 * @file parseArgV.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require("node:test");
import util = require("node:util");

const timeout = 10000;

test.suite('parseArgV', { timeout: timeout }, (suiteContext_parseArgV) => {
  //

  //
  const mock = test.mock;
  //

  //
  test.afterEach((ctx, done) => {
    //
    mock.restoreAll();
    return done();
    //
  }, { timeout: timeout, signal: suiteContext_parseArgV.signal }) satisfies void;
  //
  test.after((ctx, done) => {
    //
    mock.reset();
    return done();
    //
  }, { timeout: timeout, signal: suiteContext_parseArgV.signal }) satisfies void;
  //

  //
  test.describe('imports', { timeout: timeout, signal: suiteContext_parseArgV.signal }, (suiteContext_imports) => {
    //

    //
    test.it('require', { timeout: timeout, signal: suiteContext_imports.signal }, (ctx, done) => {
      const t: void = ctx.assert.doesNotThrow((): typeof import('../../src/process/parseArgV') => require('../../src/process/parseArgV'));
      return done(t);
    }) satisfies Promise<void>;
    //

    //
    test.it('import', { timeout: timeout, signal: suiteContext_imports.signal }, (ctx, done) => {
      ctx.assert.doesNotReject(import('../../src/process/parseArgV')).then(done).catch(done);
    }) satisfies Promise<void>;

    //
    test.it('import <Promise>', { timeout: timeout, signal: suiteContext_imports.signal }, (ctx, done) => {
      ctx.assert.doesNotReject((): Promise<{ default: (proc: NodeJS.Process) => Promise<ReturnType<typeof util.parseArgs>>}> => import('../../src/process/parseArgV')).then(done).catch(done);
    }) satisfies Promise<void>;
    //

    //
    test.it('import (async)', { timeout: timeout, signal: suiteContext_imports.signal }, (ctx, done) => {
      const t: void = ctx.assert.doesNotThrow(async (): Promise<{ default: (proc: NodeJS.Process) => Promise<ReturnType<typeof util.parseArgs>> }> => await import('../../src/process/parseArgV'));
      return done(t);
    }) satisfies Promise<void>;
    //

  //
  }) satisfies Promise<void>;
  // suiteContext_imports

  //
  test.describe('runs', { signal: suiteContext_parseArgV.signal, timeout: timeout }, (suiteContext_runs) => {
  //

    //
    test.it('parses commands passed to running cli instance', { timeout: timeout, signal: suiteContext_runs.signal }, (ctx, done) => {
      //
      const parseArgV: typeof import("../../src/process/parseArgV") = require("../../src/process/parseArgV");
      parseArgV(process).then((args) => ctx.assert.ok(args)).then(done).catch(done);
      //
    }) satisfies Promise<void>;
    //

  //
  }) satisfies Promise<void>;

//
}) satisfies Promise<void>;
