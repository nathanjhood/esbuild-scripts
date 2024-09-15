#!/usr/bin/env -S yarn tsx

import url = require("node:url");
import path = require("node:path");
import fs = require("node:fs");
import util = require("node:util");
import os = require("node:os");
import console = require("node:console");
import childProcess = require("node:child_process");
import process = require("node:process");

// import Module = require("node:module");
// const __filename: string = url.fileURLToPath(import.meta.url);
// const __dirname: string = path.dirname(__filename);
// const require: NodeRequire = Module.createRequire(__filename);
// module.id = __filename;
// module.filename = __filename;
// module.path = __dirname;
// module.require = require;

// // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-var
// var main: NodeModule = {
//   id: url.fileURLToPath(import.meta.url),
//   filename: url.fileURLToPath(import.meta.url),
//   path: path.dirname(__filename),
//   require: await import("node:module").then((mod) => mod.default.createRequire(url.fileURLToPath(import.meta.url)))
// }

const build = (process: NodeJS.Process) => {
  const {
    assert: assert,
    info: info,
    warn: warn,
    error: error,
    debug: debug,
    time: time,
    timeLog: timeLog,
    timeEnd: timeEnd
  } = new console.Console({
    stdout: process.stdout,
    stderr: process.stdout,
    ignoreErrors: false,
    groupIndentation: 2
  })
  //
  process.on('uncaughtException', (err: Error, origin: NodeJS.UncaughtExceptionOrigin) => {
    error(origin, err);
    throw err;
  });
  //
  info("info message");
  warn("warn message");
  error("error message");
  debug("debug message");
  assert(false, "assert message");
  //
  return;
}

if (require.main === module) {
  build(process);
}

// export = module.exports = exports = build;

export = build;
