/**
 * @file build.test.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import type Test = require('node:test');
import test = require('node:test');
import path = require('node:path');
import type Build = require('../../src/scripts/build');
import build = require('../../src/scripts/build');

const timeoutMs: number = 10000;

test.suite(
  'build()',
  { timeout: timeoutMs },
  (suiteContext_build: Test.SuiteContext) => {
    //

    //
    const mock = test.mock;

    const { it } = test;

    it('runs', { signal: suiteContext_build.signal }, async (ctx) => {
      //
      const mockBuild: Test.Mock<Build> = ctx.mock.fn<Build>(build);
      const result = await mockBuild(global.process, {
        platform: 'node',
        outdir: path.resolve(__dirname, 'dist'),
        entryPoints: [path.resolve(__dirname, '../', 'setupTests.ts')],
        logLevel: 'silent',
        write: false,
        publicPath: path.resolve(__dirname, '../', 'mocks', 'public'),
      });
      //
      (await ctx.test(
        'passes',
        (testContext_passes: Test.TestContext, done) => {
          testContext_passes.assert.ok(result !== undefined);
          return done();
        }
      )) satisfies void;
    }) satisfies Promise<void>;

    //
  }
) satisfies Promise<void>;
