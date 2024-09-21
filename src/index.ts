/**
 * @file index.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */

import process = require('./process');

type index = {
  process: typeof process;
};

const index: index = {
  process: process,
};

export = index;
