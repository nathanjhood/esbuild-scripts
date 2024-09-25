/**
 * @file index.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import { createRequire } from 'node:module';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const require: NodeRequire = createRequire(__filename);

import process = require('./process');

type index = {
  process: typeof process;
};

const index: index = {
  process: process,
};

export = index;
