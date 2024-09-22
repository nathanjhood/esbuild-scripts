/**
 * @file index.d.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import type Process = require('./process/index.d');

/**
 * Type definitions for esbuild-scripts 0.1.0
 *
 * Project: esbuild-scripts
 *
 * Definitions by: Nathan J. Hood <nathanjhood@googlemail.com>
 *
 * Note that ES6 modules cannot directly export class objects.
 *
 * This file should be imported using the CommonJS-style:
 * @example
 * ```ts
 * import esbuildScripts = require('esbuild-scripts');
 * ```
 *
 * Alternatively, if `--allowSyntheticDefaultImports` or `--esModuleInterop` is
 * turned on, this file can also be imported as a default import:
 * @example
 * ```ts
 * import x from 'esbuild-scripts';
 * ```
 */
export = index;

declare type index = {
  process: typeof Process;
};

declare const index: index;
