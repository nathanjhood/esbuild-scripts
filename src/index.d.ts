/**
 * @file index.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */

import type process = require('./process/index.d');

export = index;

declare type index = {
  process: typeof process;
};

declare const index: index;
