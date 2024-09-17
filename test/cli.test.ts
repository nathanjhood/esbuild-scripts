import test = require("node:test");
// import cliTestingLibrary = require("cli-testing-library");

const timeout = 10000;

test.suite('cli', { timeout: timeout }, (suiteContext_cli) => {
  //
  const mock = test.mock;
  //
  test.afterEach((ctx, done) => {
    mock.restoreAll();
    done();
  }, { signal: suiteContext_cli.signal });
  //
  test.after((ctx, done) => {
    mock.reset();
    done();
  }, { signal: suiteContext_cli.signal });
  //
  test.suite('imports', { timeout: timeout, signal: suiteContext_cli.signal }, (suiteContext_imports) => {
    //
    test.test('require', { timeout: timeout, signal: suiteContext_imports.signal }, (testContextA) => {
      return testContextA.assert.doesNotThrow(() => require('../src/cli'));
    });
    test.test('import', { timeout: timeout, signal: suiteContext_imports.signal }, (testContextA) => {
      return testContextA.assert.doesNotReject(import('../src/cli'));
    });
    test.test('import (async)', { timeout: timeout, signal: suiteContext_imports.signal }, (testContextA) => {
      return testContextA.assert.doesNotThrow(async () => await import('../src/cli'));
    });
  });
})
