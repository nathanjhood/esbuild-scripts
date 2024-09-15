#!/usr/bin/env -S yarn tsx --test

/**
 * @file index.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require("node:test");
import assert = require("node:assert");
import assertStrict = require("node:assert/strict");

const timeout = 10000;

const abortController = new AbortController();

const options = {
  timeout: 10000,
  signal: abortController.signal
}

test.suite('config/env', options, (suiteContextA: test.SuiteContext) => {
  //
  test.suite('imports', { signal: suiteContextA.signal }, (suiteContextB: test.SuiteContext) => {
    test.test('require', { signal: suiteContextB.signal }, (testContextA: test.TestContext) => {
      testContextA.assert.doesNotThrow(() => require('../../../src/config/env'));
    });
    test.test('import', { signal: suiteContextB.signal }, (testContextA: test.TestContext) => {
      testContextA.assert.doesNotThrow(async () => await import('../../../src/config/env'));
    });
  })
  //
  test.suite.todo('types', { signal: suiteContextA.signal }, (suiteContextB: test.SuiteContext) => {
    //

  })
})

// //
// abortController.signal.addEventListener(
//   'abort',
//   (event) => console.warn('Received event:', event.type),
//   { once: true }
// );

// process.on('unhandledRejection', (error) => {
//   abortController.abort(error);
//   throw error;
// });

// process.on('uncaughtException', (error) => {
//   abortController.abort(error);
//   throw error;
// });

// process.on('beforeExit', (code) => {
//   console.info('process exiting with code', code)
// });

// process.on('exit', (code) => {
//   console.info('process exited with code', code)
// });
