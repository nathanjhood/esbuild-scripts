import test = require("node:test");

test.suite('cli', { timeout: 10000 }, (suiteContextA) => {
  //
  test.suite('imports', { timeout: 10000, signal: suiteContextA.signal }, (suiteContextB) => {
    test.test('require', { timeout: 10000, signal: suiteContextB.signal }, (testContextA) => {
      return testContextA.assert.doesNotThrow(() => require('../src/cli'));
    });
    test.test('import', { timeout: 10000, signal: suiteContextB.signal }, (testContextA) => {
      return testContextA.assert.doesNotThrow(async () => await import('../src/cli'));
    });
    test.test('import', { timeout: 10000, signal: suiteContextB.signal }, (testContextA) => {
      return testContextA.assert.doesNotReject(import('../src/cli'));
    });
  });
  //
  test.suite.todo('types', { timeout: 10000, signal: suiteContextA.signal }, (suiteContextB) => { });
})
