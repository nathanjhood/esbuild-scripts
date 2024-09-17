/**
 * @file parseArgV.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
import util = require('node:util');

type ParseArgVOptions = {
  sync?: true | false;
};

type ParsedArgV = ReturnType<typeof util.parseArgs>;

interface parseArgV {
  default?(proc: NodeJS.Process): Promise<ParsedArgV>;
  (proc: NodeJS.Process): Promise<ParsedArgV>;
  (proc: NodeJS.Process, options?: ParseArgVOptions): Promise<ParsedArgV>;
}

interface parseArgVSync {
  default?(proc: NodeJS.Process): ParsedArgV;
  (proc: NodeJS.Process): ParsedArgV;
  (proc: NodeJS.Process, options?: ParseArgVOptions): ParsedArgV;
}

const parseArgV: parseArgV = (
  proc: NodeJS.Process,
  options?: ParseArgVOptions
) => {
  //
  type ArgV = util.ParseArgsConfig['options'];
  type ParsedArgV = ReturnType<typeof util.parseArgs>;
  type Positionals = ParsedArgV['positionals'];
  type Values = ParsedArgV['values'];
  type Tokens = ParsedArgV['tokens'];
  type Scripts = string[];
  //
  const { argv: argv } = proc;
  //
  const args: string[] = argv.slice(2);
  //
  const parseArgsOptionsConfig: ArgV = {
    //
    verbose: { type: 'boolean' },
    'no-verbose': { type: 'boolean' },
    color: { type: 'boolean' },
    'no-color': { type: 'boolean' },
    logfile: { type: 'string' },
    'no-logfile': { type: 'boolean' },
  };
  const scripts: Scripts = ['build', 'test', 'start', 'init'];
  //

  //
  const result = new Promise<ParsedArgV>((resolveArgV, rejectArgV) => {
    //
    const {
      values: values,
      positionals: positionals,
      tokens: tokens,
    } = util.parseArgs({
      args: args,
      options: parseArgsOptionsConfig,
      strict: true,
      allowNegative: true,
      tokens: true,
      allowPositionals: true,
    });
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
    // validate the positional args
    tokens
      .filter((token) => token.kind === 'positional')
      .forEach((token) => {
        if (scripts.includes(token.value)) {
          // prevent any possibility of passing both '<script>' and '--<script>'
          const foundScript = token.value;
          if (values[foundScript]) delete values[foundScript];
        } else {
          return rejectArgV('unknown script: ' + token.value);
        }
      });
    //
    return resolveArgV({
      values: values,
      positionals: positionals,
      tokens: tokens,
    });
  }).catch((err) => {
    throw err;
  }); // result

  //
  return result;
};

export = parseArgV;

if (require.main === module) {
  ((proc: NodeJS.Process, options?: ParseArgVOptions) => {
    parseArgV(proc)
      .then((args) => {
        const { values, positionals, tokens } = args;
        console.log('values:', values);
        console.log('positionals:', positionals);
        console.log('tokens:', tokens);
        return args;
      })
      .catch((reason) => {
        console.error(
          new Error('require.main.parseArgV failed', { cause: reason })
        );
        throw reason;
      });
  })(global.process, { sync: true });
}
