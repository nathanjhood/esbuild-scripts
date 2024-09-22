/**
 * @file index.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */

import Process = require('./process');

type index = {
  process: typeof Process;
};

const index: index = {
  process: Process,
};

export = index;
