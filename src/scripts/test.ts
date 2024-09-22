#!/usr/bin/env -S yarn tsx

import console = require('node:console');

const test = (proc: NodeJS.Process) => {
  const {
    assert: assert,
    info: info,
    warn: warn,
    error: error,
    debug: debug,
    // time: time,
    // timeLog: timeLog,
    // timeEnd: timeEnd,
  } = new console.Console({
    stdout: proc.stdout,
    stderr: proc.stdout,
    ignoreErrors: false,
    groupIndentation: 2,
  });
  //
  proc.on(
    'uncaughtException',
    (err: Error, origin: NodeJS.UncaughtExceptionOrigin) => {
      error(origin, err);
      throw err;
    }
  );
  //
  info('info message');
  warn('warn message');
  error('error message');
  debug('debug message');
  assert(false, 'assert message');
  //
  return;
};

if (require.main === module) {
  test(global.process);
}

export = test;
