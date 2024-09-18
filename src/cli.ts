#!/usr/bin/env -S yarn tsx

import fs = require('node:fs');
import path = require('node:path');
import childProcess = require('node:child_process');
import util = require('node:util');
import os = require('node:os');
import console = require('node:console');
import process = require('node:process');
import Module = require('node:module');

import packageJson = require('../package.json');
import parseCommand = require('./process/parse/parseCommand');
import parseArgV = require('./process/parse/parseArgV');
import parseEnv = require('./process/parse/parseEnv');
import parseCwd = require('./process/parse/parseCwd');

type CliOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
};

/**
 *
 * @param {NodeJS.Process} proc
 * @returns
 */
const cli = async (proc: NodeJS.Process, options?: CliOptions) => {
  //

  //
  const errors: Error[] = [];
  //

  proc.exitCode = errors.length; // TODO: collecting an integer number of recursive 'error.cause' objects (+1 for current-level) would be better...

  //
  proc.on('unhandledRejection', (err, origin) => {
    const error = new Error('cli.unhandledRejection', { cause: origin });
    errors.push(error);
    throw error;
  });
  //

  //
  const abortController = new AbortController();
  //

  const debug = options && options.debug;
  const verbose = options && options.verbose;

  //
  return parseCommand(proc)
    .then((runtime) => {
      //
      if (debug) console.debug(runtime.tokens);
      //
      return parseArgV(proc)
        .then((args) => {
          //
          if (debug) console.debug(args.tokens);
          //
          return parseCwd(proc)
            .then((cwd) => {
              //
              if (debug) console.debug(cwd);
              //
              return parseEnv(proc)
                .then((env) => {
                  //
                  if (debug || verbose) console.debug(env);
                  //

                  //
                  const joinedRtArgs: string[] = [];
                  //

                  //
                  if (runtime.tokens)
                    runtime.tokens.forEach((token) => {
                      if (token.kind === 'option') {
                        joinedRtArgs.push(`${token.rawName}`);
                        if (token.value) joinedRtArgs.push(`${token.value}`);
                      } else if (token.kind === 'positional') {
                        joinedRtArgs.push(`${token.value}`);
                      }
                    });
                  //

                  const result: childProcess.SpawnSyncReturns<Buffer> =
                    childProcess.spawnSync(
                      path.resolve(`${joinedRtArgs[0]!}`),
                      joinedRtArgs
                        .slice(1)
                        .concat(
                          path.resolve(
                            __dirname,
                            'scripts',
                            args.positionals[0]!
                          )
                        ),
                      {
                        stdio: 'inherit',
                        cwd: path.resolve(path.format(cwd)),
                        argv0: path.resolve(joinedRtArgs[0]!),
                        env: proc.env, // from 'parseEnv()'
                        signal: abortController.signal,
                        // shell: true, // depends...
                      }
                    );
                  //

                  //
                  const { error, output, pid, signal, status, stderr, stdout } =
                    result;

                  //
                  if (error) errors.push(error);
                  //

                  //
                  return { error, output, pid, signal, status, stderr, stdout };
                  //
                })
                .catch<void>((err) => {
                  abortController.abort(err);
                  errors.push(err);
                  throw new Error('cli.parseEnv() failed', { cause: err });
                });
            })
            .catch<void>((err) => {
              abortController.abort(err);
              errors.push(err);
              throw new Error('cli.parseCwd failed', { cause: err });
            });
        })
        .catch<void>((err) => {
          abortController.abort(err);
          errors.push(err);
          throw new Error('cli.parseArgs() failed', { cause: err });
        });
    })
    .catch<void>((err) => {
      abortController.abort(err);
      errors.push(err);
      throw new Error('cli.parseCommand() failed', { cause: err });
    });
};

export = cli;

if (require.main === module) {
  ((proc: NodeJS.Process, options?: CliOptions) => cli(proc))(global.process, {
    sync: true,
    debug: true,
  });
}

// const _cli = (process: NodeJS.Process) => {
//   //
//   const options: util.ParseArgsConfig['options'] = {
//     //
//     'verbose': { type: 'boolean' },
//     'no-verbose': { type: 'boolean' },
//     'color': { type: 'boolean' },
//     'no-color': { type: 'boolean' },
//     'logfile': { type: 'string' },
//     'no-logfile': { type: 'boolean' },
//     //
//     'build': { type: 'boolean' },
//     'test': { type: 'boolean' },
//     'start': { type: 'boolean' },
//     'init': { type: 'boolean' },
//     'eject': { type: 'boolean' }
//   };
//   //
//   const { argv, execPath } = process;
//   //
//   const args: string[] = argv.slice(2);
//   //
//   const {
//     values,
//     positionals,
//     tokens
//   } = util.parseArgs(
//     {
//       args: args,
//       options: options,
//       strict: true,
//       allowNegative: true,
//       tokens: true
//     }
//   );
//   // Reprocess the option tokens and overwrite the returned values.
//   tokens
//     .filter((token) => token.kind === 'option')
//     .forEach((token) => {
//       if (token.name.startsWith('no-')) {
//         // Store foo:false for --no-foo
//         const positiveName = token.name.slice(3);
//         values[positiveName] = false;
//         delete values[token.name];
//       } else {
//         // Resave value so last one wins if both --foo and --no-foo.
//         values[token.name] = token.value ?? true;
//       }
//   });
//   const verbose = values['verbose'];
//   const color = values['color'];
//   const logFile = values['logfile'] ?? 'default.log';
//   //
//   const {
//     assert: assert,
//     clear: clear,
//     error: error,
//     count: count,
//     countReset: countReset,
//     warn: warn,
//     time: time,
//     timeEnd: timeEnd
//   } = new console.Console(
//     {
//       stdout: process.stdout,
//       stderr: process.stderr,
//       ignoreErrors: false,
//       groupIndentation: 2,
//       colorMode: 'auto'
//     }
//   );
//   //
//   if (process.stdout.isTTY) clear();
//   // start a timer with the name of `__filename`
//   time(__filename);
//   //
//   const abortController = new AbortController();
//   //
//   process.on('uncaughtException', (err: Error, origin: NodeJS.UncaughtExceptionOrigin) => {
//     switch (origin) {
//       case 'uncaughtException': {
//         fs.writeSync(
//           process.stderr.fd,
//           util.styleText('red',
//             `Uncaught exception: ${err}\n` +
//             `Exception origin: ${origin}\n`,
//           ),
//         );
//         break;
//       }
//       case 'unhandledRejection': {
//         fs.writeSync(
//           process.stderr.fd,
//           util.styleText('red',
//             `Uncaught rejection: ${err}\n` +
//             `Promise origin: ${origin}\n`,
//           )
//         );
//         break;
//       }
//       default: {
//         // should never happen...
//         throw err;
//       }
//     }
//     //
//     abortController.abort(err);
//     process.exitCode = 1;
//     throw err;
//   });
//   //
//   process.on('unhandledRejection', (reason, promise) => {
//     fs.writeSync(
//       process.stderr.fd,
//       util.styleText('red',
//       `Caught rejection: ${reason}\n` +
//         `Promise origin: ${promise}\n`,
//       )
//     );
//     abortController.abort(reason);
//     throw reason;
//   });
//   //
//   process.on('warning', (warning) => {
//     fs.writeSync(
//       process.stderr.fd,
//       util.styleText('yellow',
//         `Warning: ${warning}\n`
//       )
//     );
//   })
//   //
//   const scriptIndex: number = args.findIndex(
//     (x) => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
//   );
//   //
//   const script: string | undefined = scriptIndex === -1 ? args[0] : args[scriptIndex];
//   //
//   if (!script) {
//     const err = new Error("no scripts passed in");
//     abortController.abort(err);
//     process.exitCode = 1;
//     throw err;
//   };
//   //
//   const nodeArgs: string[] = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];
//   //
//   if (['build', 'eject', 'start', 'test'].includes(script)) {
//     //
//     const result = childProcess.spawnSync(
//       require.resolve('./scripts/' + script), // execPath,
//       nodeArgs
//         // .concat(require.resolve('./scripts/' + script))
//         .concat(args.slice(scriptIndex + 1)),
//       { stdio: 'inherit' }
//     );
//     //
//     if (result.signal) {
//       if (result.signal === 'SIGKILL') {
//         error(
//           'The build failed because the process exited too early. ' +
//             'This probably means the system ran out of memory or someone called ' +
//             '`kill -9` on the process.'
//         );
//       } else if (result.signal === 'SIGTERM') {
//         error(
//           'The build failed because the process exited too early. ' +
//             'Someone might have called `kill` or `killall`, or the system could ' +
//             'be shutting down.'
//         );
//       }
//       // process.exit(1);
//       process.exitCode = 1;
//       return;
//     }
//     //
//     // process.exit(result.status);
//     process.exitCode = result.status ?? 1;
//     return;
//    } else {
//     //
//     error('Unknown script "' + script + '".');
//   }
//   //
//   timeEnd(__filename);
//   return;
// };

// const exports = {
//   default: cli,
//   cli: cli
// }

// const index = { exports: {} }
