/**
 * @file process/parseArgv.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import { createRequire } from 'node:module';

const require: NodeRequire = createRequire(__filename);

import type ESBuild = require('esbuild');

import type Util = require('node:util');
import util = require('node:util');

type ParseArgsConfig = Util.ParseArgsConfig;

type ParseArgs<T extends ParseArgsConfig> = typeof util.parseArgs<T>;

type ParseArgvResult<T extends ParseArgsConfig> = ReturnType<ParseArgs<T>>;

type ParseArgvOptions = {
  logLevel?: ESBuild.LogLevel;
  env?: NodeJS.ProcessEnv;
  parseArgsConfig?: ParseArgsConfig;
};

interface parseArgv<T extends ParseArgsConfig> {
  (proc: NodeJS.Process): ParseArgvResult<T>;
  (proc: NodeJS.Process, options?: ParseArgvOptions): ParseArgvResult<T>;
}

/**
 *
 * @param {NodeJS.Process} proc
 * @param {ParseArgvOptions} options
 * @returns {ParseArgvResult<ParseArgsConfig>}
 */
const parseArgv: parseArgv<ParseArgsConfig> = (
  proc: NodeJS.Process,
  options?: ParseArgvOptions
): ParseArgvResult<ParseArgsConfig> => {
  //
  const { argv: argv } = proc;
  //
  const args: string[] = argv.slice(2);
  //
  const parsedArgs = util.parseArgs<ParseArgsConfig>({
    args: args,
    strict: false, // don't throw; allow to exit normally
    allowNegative: true,
    tokens: true,
    allowPositionals: true,
    options: {
      // // TODO: acceptable args go here
      // verbose: { type: 'boolean' },
      // 'no-verbose': { type: 'boolean' },
      // debug: { type: 'boolean' },
      // 'no-debug': { type: 'boolean' },
      // color: { type: 'boolean' },
      // 'no-color': { type: 'boolean' },
      // logfile: { type: 'string' },
      // 'no-logfile': { type: 'boolean' },

      // build args

      bundle: { type: 'boolean', default: false, multiple: false },
      watch: { type: 'boolean', default: false, multiple: false },
      tsconfig: { type: 'string', multiple: false },
      splitting: { type: 'boolean', default: false, multiple: false },

      // shared args
      platform: { type: 'string', default: 'browser', multiple: false },
      'tsconfig-raw': { type: 'string', multiple: false },
      loader: { type: 'string', multiple: true },
      banner: { type: 'string', multiple: true },
      footer: { type: 'string', multiple: true },
      format: { type: 'string', multiple: false },
      'global-name': { type: 'string', multiple: false },
      'legal-comments': { type: 'string', multiple: false },
      'line-limit': { type: 'string', multiple: false },

      // serve args
      servedir: { type: 'string', multiple: false },
    },
  });

  const {
    values: values,
    positionals: positionals,
    tokens: tokens,
  } = parsedArgs;

  // (shouldn't happen... at least, an be empty array; remove 'undefined' case)
  if (!tokens) throw new Error('parseArgv returned no tokens');

  // Reprocess the option tokens and overwrite the returned values.
  tokens
    .filter((token) => token.kind === 'option')
    .forEach((token) => {
      if (token.name.startsWith('no-')) {
        // Store foo:false for --no-foo
        const positiveName = token.name.slice(3);
        values[positiveName] = false;
        delete values[token.name];
      } else {
        // Resave value so last one wins if both --foo and --no-foo.
        values[token.name] = token.value ?? true;
      }
    });

  // (this should never happen; it just removes the 'undefined' case)
  if (!tokens) throw new Error('util.parseArgs returned no tokens');

  // return the parsed argv0
  return {
    values: values,
    positionals: positionals,
    tokens: tokens,
  } satisfies ParseArgvResult<ParseArgsConfig>;
};

export = parseArgv;

if (require.main === module) {
  (async (proc: NodeJS.Process, options?: ParseArgvOptions) => {
    return parseArgv(proc, options);
  })(global.process);
}
