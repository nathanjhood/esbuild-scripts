/**
 * @file process/parseArgv.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import type Util = require('node:util');
import util = require('node:util');

type ParseArgsConfig = Util.ParseArgsConfig;

type ParseArgs<T extends ParseArgsConfig> = typeof util.parseArgs<T>;

type ParseArgvResult<T extends ParseArgsConfig> = ReturnType<ParseArgs<T>>;

type ParseArgvOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
  throws?: true | false;
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

  //
  const errors: Error[] = [];
  proc.exitCode = errors.length;
  //

  const {
    // assert,
    info,
    // warn,
    // error,
    // log,
    debug,
    // clear,
    // time,
    // timeLog,
    // timeEnd,
  } = new console.Console({
    stdout: proc.stdout,
    stderr: proc.stderr,
    groupIndentation: 2,
    inspectOptions: {
      breakLength: 80,
    },
  });

  //
  const { argv: argv } = proc;
  //
  const args: string[] = argv.slice(2);
  //

  //
  const parsedArgs = util.parseArgs<ParseArgsConfig>({
    args: args,
    strict: false, // don't throw; allow to exit normally
    allowNegative: true,
    tokens: true,
    allowPositionals: true,
    options: {
      // acceptable args go here
      verbose: { type: 'boolean' },
      'no-verbose': { type: 'boolean' },
      debug: { type: 'boolean' },
      'no-debug': { type: 'boolean' },
      color: { type: 'boolean' },
      'no-color': { type: 'boolean' },
      logfile: { type: 'string' },
      'no-logfile': { type: 'boolean' },
    },
  });
  //

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
  //

  // (this should never happen in theory... but it removes the 'undefined' case)
  if (!tokens) throw new Error('util.parseArgs returned no tokens');

  // 6) log the collected arg/value pairs from argv0
  if (options && options.verbose && !options.debug) {
    const msg: string[] = [];
    tokens.forEach((token) => {
      switch (token.kind) {
        case 'option': {
          msg.push(token.rawName);
          if (token.value) msg.push(token.value);
          break;
        }
        case 'positional': {
          msg.push(token.value);
          break;
        }
        case 'option-terminator': {
          msg.push('--');
          break;
        }
        default: {
          break;
        }
      }
    });
    info(msg);
  }

  // 7) log the parsed argv0
  if (options && options.debug) debug({ values, positionals, tokens });

  // 8) return the parsed argv0
  return {
    values: values,
    positionals: positionals,
    tokens: tokens,
  } satisfies ParseArgvResult<ParseArgsConfig>;
};

export = parseArgv;

// if (require.main === module) {
//   ((proc: NodeJS.Process, options?: ParseArgvOptions) => {
//     parseArgv(proc, options);
//   })(global.process, {
//     verbose: global.process.env['VERBOSE'] !== undefined ? true : false,
//     debug: global.process.env['DEBUG'] !== undefined ? true : false,
//   });
// }
