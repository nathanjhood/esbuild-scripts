/**
 * @file parseArgV.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

import util = require("node:util");

type Args = util.ParseArgsConfig['options'];
// type Positionals = ReturnType<typeof util.parseArgs>['positionals'];
// type Values = ReturnType<typeof util.parseArgs>['values'];
// type Tokens = ReturnType<typeof util.parseArgs>['tokens'];
type Scripts = string[];

const parseArgV = (process: NodeJS.Process) => {
  //
  const { argv: argv } = process;
  //
  const args: string[] = argv.slice(2);
  //
  const options: Args = {
    //
    'verbose': { type: 'boolean' },
    'no-verbose': { type: 'boolean' },
    'color': { type: 'boolean' },
    'no-color': { type: 'boolean' },
    'logfile': { type: 'string' },
    'no-logfile': { type: 'boolean' }
  };
  const scripts: Scripts = [
    'build',
    'test',
    'start',
    'init'
  ];
  //
  return new Promise<ReturnType<typeof util.parseArgs>>((resolveArgV, rejectArgV) => {
    //
    const {
      values: values,
      positionals: positionals,
      tokens: tokens
    } = util.parseArgs({
      args: args,
      options: options,
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
          if(values[foundScript]) delete values[foundScript];
        } else {
          return rejectArgV("unknown script: " + token.value);
        }
      });
    //
    return resolveArgV({
      values: values,
      positionals: positionals,
      tokens: tokens
    })
  }).catch((err) => {
    throw new Error("parseArgV failed", { cause: err })
  });
}

export = parseArgV;

if (require.main === module) {
  parseArgV(process);
}
