#!/usr/bin/env -S yarn tsx

import fs = require('node:fs');
import path = require('node:path');
// import childProcess = require('node:child_process');
import util = require('node:util');
import console = require('node:console');

import parseCommand = require('./process/parseCommand');
import parseArgv = require('./process/parseArgv');
import parseCwd = require('./process/parseCwd');
import parseEnv = require('./process/parseEnv');

type CliOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
};

const cli = (proc: NodeJS.Process, options?: CliOptions) => {
  //

  const abortController = new AbortController();

  //
  proc.on('unhandledRejection', (err) => {
    abortController.abort(err);
    throw err;
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
        global.console.warn('Unkown script: ' + token.value);
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
    }
  );
}
