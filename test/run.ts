#!/usr/bin/env -S yarn tsx

/**
 * @file setupTests.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require("node:test");
import assert = require("node:assert");
import assertStrict = require("node:assert/strict");
import reporters = require("node:test/reporters");
import path = require("node:path");
import os = require("node:os");
import constants = require("node:constants");

type NodeTestRunnerParameters = Required<Parameters<typeof test.run>>;
type NodeTestRunnerOptions = NodeTestRunnerParameters[0];
type NodeTestRunnerReturnType = ReturnType<typeof test.run>;

const abortController = new AbortController();

const options = Object.freeze<NodeTestRunnerOptions>({
  files: [
    path.resolve(path.join(__dirname, '/config/env/index.test.ts')),
    path.resolve(path.join(__dirname, '/config/paths/index.test.ts')),
    path.resolve(path.join(__dirname, '/cli.test.ts')),
  ],
  concurrency: os.availableParallelism() - 1,
  forceExit: false,
  only: false,
  timeout: Infinity,
  signal: abortController.signal,
  setup(testsStream) {
    // Log test failures to console
    testsStream.on('test:fail', (testFail) => {
      console.error(testFail)
      process.exitCode = 1;
    });
    // coverage reporter: spec
    testsStream.compose(reporters.spec).pipe(process.stdout);
  },
  // testNamePatterns: [
  //   "**/*.test.?(c|m)js",
  //   "**/*-test.?(c|m)js",
  //   "**/*_test.?(c|m)js",
  //   "**/test-*.?(c|m)js",
  //   "**/test.?(c|m)js",
  //   "**/test/**/*.?(c|m)js"
  // ],
})

const run = (process: NodeJS.Process) => {
  //
  process.on('uncaughtException', (error) => {
    const e = new Error('uncaughtException', { cause: error })
    abortController.abort(e);
    process.exitCode = 1;
    throw error;
  });
  //
  process.on('unhandledRejection', (error) => {
    const e = new Error('unhandledRejection', { cause: error })
    abortController.abort(e);
    process.exitCode = 1;
    throw error;
  });
  //
  process.on('beforeExit', (code) => {
    console.info('process', process.pid, 'exiting with code', code)
  });
  //
  process.on('exit', (code) => {
    console.info('process', process.pid, 'exited with code', code)
  });
  if(process.env.NODE_ENV === undefined) throw new Error("'NODE_ENV' should be 'test', but it was undefined")
  if(process.env.NODE_ENV !== "test") throw new Error("'NODE_ENV' should be 'test', but it was '" + process.env.NODE_ENV + "'")
  //
  const testsStream = test.run(options);
  //
  return testsStream;
}


if (require.main === module) {
  run(process)
}
