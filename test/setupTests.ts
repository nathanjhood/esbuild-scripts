#!/usr/bin/env -S yarn tsx

/**
 * @file setupTests.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require('node:test');
import reporters = require('node:test/reporters');
import path = require('node:path');
import os = require('node:os');

type NodeTestRunnerParameters = Required<Parameters<typeof test.run>>;
type NodeTestRunnerOptions = NodeTestRunnerParameters[0];

const abortController: AbortController = new AbortController();

const options: Readonly<NodeTestRunnerOptions> =
  Object.freeze<NodeTestRunnerOptions>({
    files: [
      // path.resolve(path.join(__dirname, '/config/env/index.test.ts')),
      // path.resolve(path.join(__dirname, '/config/paths/index.test.ts')),
      path.resolve(path.join(__dirname, '/process/parseCwd.test.ts')),
      path.resolve(path.join(__dirname, '/process/parseEnv.test.ts')),
      path.resolve(path.join(__dirname, '/process/parseCommand.test.ts')),
      path.resolve(path.join(__dirname, '/process/parseArgv.test.ts')),
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
        console.error(testFail);
        process.exitCode = 1; // must be != 0, to avoid false positives in CI pipelines
      });
      // coverage reporter
      const isTTY = process.stdout.isTTY;
      const reporter = isTTY ? reporters.spec : reporters.tap;
      testsStream.compose(reporter).pipe(process.stdout);
    },
    // testNamePatterns: [
    //   "**/*.test.?(c|m)js",
    //   "**/*-test.?(c|m)js",
    //   "**/*_test.?(c|m)js",
    //   "**/test-*.?(c|m)js",
    //   "**/test.?(c|m)js",
    //   "**/test/**/*.?(c|m)js"
    // ],
  });

// before(() => {
//   console.log("NodeJS test runner starting with", path.resolve(__filename))
// }, { signal: abortController.signal });
// after(() => {
//   console.log("NodeJS test runner completed with", path.resolve(__filename))
// }, { signal: abortController.signal });

export = options;
