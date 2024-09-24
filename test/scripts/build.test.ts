/**
 * @file build.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import type Test = require('node:test');
import test = require('node:test');

const timeoutMs: number = 10000;

test.suite(
  'build()',
  { timeout: timeoutMs },
  (suiteContext_build: Test.SuiteContext) => {
    //

    //
    const mock = test.mock;

    const defaultBrowsers: {
      production: string[];
      development: string[];
    } = {
      production: ['>0.2%', 'not dead', 'not op_mini all'],
      development: [
        'last 1 chrome version',
        'last 1 firefox version',
        'last 1 safari version',
      ],
    };

    function shouldSetBrowsers(isInteractive: boolean) {
      if (!isInteractive) {
        return Promise.resolve(true);
      }
    }

    const mockBuild: Test.Mock<() => undefined> = mock.fn(() => {});

    test.it(
      'placeholder for CI',
      { signal: suiteContext_build.signal },
      async (ctx) => {
        (await ctx.test(
          'passes',
          (testContext_passes: Test.TestContext, done) => {
            testContext_passes.assert.ok(true);
            return done();
          }
        )) satisfies void;
      }
    ) satisfies Promise<void>;

    //
  }
) satisfies Promise<void>;