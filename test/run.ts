#!/usr/bin/env -S yarn tsx

/**
 * @file run.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import type Test = require('node:test');
import test = require('node:test');
import parseEnv = require('../src/process/parseEnv');
import setupTests = require('./setupTests');

type NodeTestRunnerParameters = Required<Parameters<typeof Test.run>>;
type NodeTestRunnerOptions = NodeTestRunnerParameters[0];
type NodeTestRunnerReturnType = ReturnType<typeof Test.run>;

const run = (
  proc: NodeJS.Process,
  options?: NodeTestRunnerOptions
): NodeTestRunnerReturnType => {
  //
  proc.on('uncaughtException', (error) => {
    proc.exitCode = 1;
    throw error;
  });
  //
  proc.on('unhandledRejection', (error) => {
    proc.exitCode = 1;
    throw error;
  });
  //
  proc.on('beforeExit', (code) => {
    console.info('process', proc.pid, 'exiting with code', code);
  });
  //
  proc.on('exit', (code) => {
    console.info('process', proc.pid, 'exited with code', code);
  });
  parseEnv(proc);
  if (proc.env.NODE_ENV === undefined)
    throw new Error("'NODE_ENV' should be 'test', but it was undefined");
  if (proc.env.NODE_ENV !== 'test')
    throw new Error(
      "'NODE_ENV' should be 'test', but it was '" + process.env.NODE_ENV + "'"
    );

  if (!options || !options.files)
    throw new Error('no files passed to test runner');

  //
  return test.run(options) satisfies NodeTestRunnerReturnType;
};

if (require.main === module) {
  ((
    proc: NodeJS.Process,
    options?: NodeTestRunnerOptions
  ): NodeTestRunnerReturnType => {
    const testsStream = run(proc, options);
    return testsStream;
  })(global.process, setupTests);
}
