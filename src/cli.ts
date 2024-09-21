#!/usr/bin/env -S yarn tsx

import fs = require('node:fs');
import path = require('node:path');
// import childProcess = require('node:child_process');
import console = require('node:console');

// import Process = require('./process');
import parseEnv = require('./process/parseEnv');
import parseCommand = require('./process/parseCommand');
import parseCwd = require('./process/parseCwd');
import parseArgv = require('./process/parseArgv');


const MAX_SAFE_INTEGER = 2147483647;

type CliOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
  signal?: AbortSignal;
  timeoutMs?: number;
};

/**
 *
 * @param proc Shlip it in
 * @param options
 */
const cli = (proc: NodeJS.Process, options?: CliOptions) => {
  //

  //
  proc.on('unhandledRejection', (err) => {
    throw err;
  });

  const ac = new AbortController();

  // defaults
  const sync = options && options.sync ? options.sync : true;
  const verbose =
    options && options.verbose
      ? options.verbose
      : global.process.env['VERBOSE'] !== undefined
        ? true
        : false;
  const debug =
    options && options.debug
      ? options.debug
      : global.process.env['DEBUG'] !== undefined
        ? true
        : false;
  const signal = options && options.signal ? options.signal : ac.signal;
  const timeoutMs =
    options && options.timeoutMs ? options.timeoutMs : MAX_SAFE_INTEGER;

  signal.addEventListener(
    'abort',
    (event) => {
      console.log(event);
      // rl.close();
    },
    { once: true }
  );

  ((reason?: any, ms?: number) => setTimeout(() => ac.abort(reason), ms))({
    reason: 'timeout',
    ms: 100000,
  });

  const cwd = parseCwd(proc, { debug: false });

  const env = parseEnv(proc, { debug: false });

  const command = parseCommand(proc, { debug: false });

  const argv = parseArgv(proc, { debug: false });

  const scripts: string[] = ['build', 'start', 'test'];

  // (shouldn't happen (empty array !== 'undefined'); handles 'undefined' case)
  if (!argv.tokens) throw new Error('parseArgv returned no tokens');

  // validate argv
  argv.tokens
    .filter((token) => token.kind === 'positional')
    .forEach((token) => {
      if (scripts.includes(token.value)) {
        // prevent any possibility of passing both '<script>' and '--<script>'
        const foundScript = token.value;
        if (argv.values[foundScript]) delete argv.values[foundScript];

        // compose command...

        // compose args...

        // spawn process..
        (() => global.console.log('Running script:', foundScript))();
        (() => global.console.log('command:', command.tokens))();
        (() => global.console.log('cwd:', path.format(cwd)))();
        (() => global.console.log('env:', env.stringified))();
        //
      } else {
        global.console.warn('Unknown script: ' + token.value);
        global.console.warn('Perhaps you need to update esbuild-scripts?');
        global.console.warn(
          'See: https://githubcom/nathanjhood/esbuild-scripts'
        );
      }
    });
  //
};

export = cli;

if (require.main === module) {
  ((proc: NodeJS.Process, options?: CliOptions) => cli(proc, options))(
    global.process,
    {
      verbose: true, // global.process.env['VERBOSE'] !== undefined ? true : false,
      debug: global.process.env['DEBUG'] !== undefined ? true : false,
      signal: new AbortController().signal,
      timeoutMs: MAX_SAFE_INTEGER,
    }
  );
}

