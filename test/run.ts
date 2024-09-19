#!/usr/bin/env -S yarn tsx

/**
 * @file run.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import test = require('node:test');
import parseEnv = require('../src/process/parseEnv');
import setupTests = require('./setupTests');

type NodeTestRunnerParameters = Required<Parameters<typeof test.run>>;
type NodeTestRunnerOptions = NodeTestRunnerParameters[0];
type NodeTestRunnerReturnType = ReturnType<typeof test.run>;

// const abortController: AbortController = new AbortController();

const run = (proc: NodeJS.Process, options?: NodeTestRunnerOptions) => {
  //
  proc.on('uncaughtException', (error) => {
    const e = new Error('uncaughtException', { cause: error });
    // abortController.abort(e);
    proc.exitCode = 1;
    throw error;
  });
  //
  proc.on('unhandledRejection', (error) => {
    const e = new Error('unhandledRejection', { cause: error });
    // abortController.abort(e);
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
  //
  const testsStream = test.run(options);
  //
  return testsStream;
};

if (require.main === module) {
  run(global.process, setupTests);
}
