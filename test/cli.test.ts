import test = require("node:test");
// import cliTestingLibrary = require("cli-testing-library");

const timeout = 10000;

test.suite('cli', { timeout: timeout }, (suiteContext_cli) => {
  //

  //
  const mock = test.mock;
  //

  //
  test.afterEach((ctx, done) => {
    mock.restoreAll();
    done();
  }, { signal: suiteContext_cli.signal }) satisfies void;
  //
  test.after((ctx, done) => {
    mock.reset();
    done();
  }, { signal: suiteContext_cli.signal }) satisfies void;
  //

  //
  test.suite('imports', { timeout: timeout, signal: suiteContext_cli.signal }, (suiteContext_imports) => {
    //

    //
    test.test('require', { timeout: timeout, signal: suiteContext_imports.signal }, (testContextA) => {
      return testContextA.assert.doesNotThrow((): typeof import('../src/cli') => require('../src/cli'));
    }) satisfies Promise<void>;
    //

    //
    test.test('import', { timeout: timeout, signal: suiteContext_imports.signal }, (testContextA) => {
      return testContextA.assert.doesNotReject(import('../src/cli'));
    }) satisfies Promise<void>;
    //

    //
    test.test('import <Promise>', { timeout: timeout, signal: suiteContext_imports.signal }, (testContextA) => {
      return testContextA.assert.doesNotReject(() => import('../src/cli'));
    }) satisfies Promise<void>;
    //

    //
    test.test('import (async)', { timeout: timeout, signal: suiteContext_imports.signal }, (testContextA) => {
      return testContextA.assert.doesNotThrow(async (): Promise<{ default: (proc: NodeJS.Process) => void }> => await import('../src/cli'));
    }) satisfies Promise<void>;
    //

  //
  }) satisfies Promise<void>;
  //

//
}) satisfies Promise<void>;
