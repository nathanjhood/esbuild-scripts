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

import options = require("./setupTests");

type NodeTestRunnerParameters = Required<Parameters<typeof test.run>>;
type NodeTestRunnerOptions = NodeTestRunnerParameters[0];
type NodeTestRunnerReturnType = ReturnType<typeof test.run>;

// const abortController: AbortController = new AbortController();

const run = (process: NodeJS.Process) => {
  //
  process.on('uncaughtException', (error) => {
    const e = new Error('uncaughtException', { cause: error })
    // abortController.abort(e);
    process.exitCode = 1;
    throw error;
  });
  //
  process.on('unhandledRejection', (error) => {
    const e = new Error('unhandledRejection', { cause: error })
    // abortController.abort(e);
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
