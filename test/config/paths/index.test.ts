#!/usr/bin/env -S yarn tsx --test

/**
 * @file index.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require("node:test");
import assert = require("node:assert");
import assertStrict = require("node:assert/strict");
import paths = require('../../../src/config/paths')

const timeout = 10000;

const abortController = new AbortController();

const options = {
  timeout: 10000,
  signal: abortController.signal
}

test.suite('config/paths', options, (suiteContextA: test.SuiteContext) => {
  //
  test.suite('imports', { signal: suiteContextA.signal }, (suiteContextB: test.SuiteContext) => {
    test.test('require', { signal: suiteContextB.signal }, (testContextA: test.TestContext) => {
      testContextA.assert.doesNotThrow(() => require('../../../src/config/paths'));
    });
    test.test('import', { signal: suiteContextB.signal }, (testContextA: test.TestContext) => {
      testContextA.assert.doesNotThrow(async () => await import('../../../src/config/paths'));
    });
  })
  //
  test.suite('types', { signal: suiteContextA.signal }, (suiteContextB: test.SuiteContext) => {
    //
    test.test('module', { signal: suiteContextB.signal }, (testContextA: test.TestContext) => {
      testContextA.assert.ok({ value: paths !== null && typeof paths === 'object'})
    })
  })
})
