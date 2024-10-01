#!/usr/bin/env -S yarn tsx

/**
 * @file cli.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);

import type ESBuild = require('esbuild');
import type ChildProcess = require('node:child_process');
import path = require('node:path');
import util = require('node:util');
import fs = require('node:fs');
import node_console = require('node:console');
import childProcess = require('node:child_process');

import parseEnv = require('./process/parseEnv');
import parseCommand = require('./process/parseCommand');
import parseCwd = require('./process/parseCwd');
import parseArgv = require('./process/parseArgv');

import packageJson = require('../package.json');

const MAX_SAFE_INTEGER: number = 2147483647;

type CliOptions = {
  logLevel?: ESBuild.LogLevel;
  ignoreWarnings?: true | false;
  ignoreErrors?: true | false;
  treatWarningsAsErrors?: true | false;
};

interface cli {
  (proc: NodeJS.Process): void;
  (proc: NodeJS.Process, options?: CliOptions): void;
}

const cli: cli = (proc: NodeJS.Process, options?: CliOptions) => {
  //
  const logLevelValue: (logLevel: ESBuild.LogLevel) => number = (
    logLevel: ESBuild.LogLevel
  ): number => {
    switch (logLevel) {
      case 'silent': {
        return 0;
      }
      case 'error': {
        return 1;
      }
      case 'warning': {
        return 2;
      }
      case 'info': {
        return 3;
      }
      case 'debug': {
        return 4;
      }
      case 'verbose': {
        return 5;
      }
      default: {
        throw new Error('No matching case in switch statement');
      }
    }
  };
  //
  const logLevel: ReturnType<typeof logLevelValue> =
    options && options.logLevel !== undefined
      ? logLevelValue(options.logLevel)
      : logLevelValue('info');
  //
  const ignoreWarnings: true | false =
    options && options.ignoreWarnings ? options.ignoreWarnings : false;
  //
  const ignoreErrors: true | false =
    options && options.ignoreErrors ? options.ignoreErrors : false;
  //
  const treatWarningsAsErrors: true | false =
    options && options.treatWarningsAsErrors
      ? options.treatWarningsAsErrors
      : false;
  //
  const console: Console = new node_console.Console({
    groupIndentation: 2,
    ignoreErrors: ignoreErrors,
    stdout: proc.stdout,
    stderr: proc.stderr,
    inspectOptions: {
      depth: MAX_SAFE_INTEGER,
      breakLength: 80,
      // compact: verbose === true,
      // colors: proc.stdout.hasColors(),
    },
  });

  const ac: AbortController = new AbortController();

  const signalsListener: NodeJS.SignalsListener = (
    signal: NodeJS.Signals
  ): void => {
    switch (signal) {
      default: {
        throw new Error('Recieved unhandled signal', { cause: signal });
      }
      case 'SIGKILL': {
        ac.abort(signal);
        fs.writeSync(
          proc.stderr.fd,
          util.format(
            'The build failed because the process exited too early. ' +
              'This probably means the system ran out of memory or someone called ' +
              '`kill -9` on the process.'
          ),
          null,
          'utf8'
        );
        return proc.exit(1);
      }
      case 'SIGTERM': {
        ac.abort(signal);
        fs.writeSync(
          proc.stderr.fd,
          util.format(
            'The build failed because the process exited too early. ' +
              'Someone might have called `kill` or `killall`, or the system could ' +
              'be shutting down.'
          ),
          null,
          'utf8'
        );
        return proc.exit(1);
      }
      case 'SIGABRT': {
        fs.writeSync(proc.stderr.fd, util.format(signal), null, 'utf8');
        // return proc.exit(1);
      }
    }
  };

  const warningListener: NodeJS.WarningListener = (warning: Error): void => {
    // ac.abort(warning);
    fs.writeSync(proc.stderr.fd, util.format(warning), null, 'utf8');
    // proc.exit(1);
  };

  const unhandledRejectionListener: NodeJS.UnhandledRejectionListener = (
    err: unknown,
    origin: Promise<unknown>
  ): void => {
    const error: Error =
      err instanceof Error
        ? err
        : new Error(util.styleText('red', 'Recieved unhandled rejection'), {
            cause: origin,
          });
    ac.abort(error.message);
    fs.writeSync(proc.stderr.fd, util.format(error), null, 'utf8');
    // return proc.exit(1);
    throw error;
  };

  const uncaughtExceptionListener: NodeJS.UncaughtExceptionListener = (
    error: Error,
    origin: NodeJS.UncaughtExceptionOrigin
  ): void => {
    ac.abort(error);
    fs.writeSync(proc.stderr.fd, util.format(error, origin), null, 'utf8');
    // return proc.exit(1);
    throw error;
  };

  proc.on(
    'unhandledRejection',
    unhandledRejectionListener
  ) satisfies NodeJS.Process;

  proc.on(
    'uncaughtException',
    uncaughtExceptionListener
  ) satisfies NodeJS.Process;

  proc.on('warning', warningListener) satisfies NodeJS.Process;

  proc.on('SIGTERM', signalsListener) satisfies NodeJS.Process;

  const scripts: string[] = ['build', 'start'];

  if (proc.stdout.isTTY) console.clear(); // do this before any helpers

  const show = {
    name: () => packageJson.name,
    version: () => packageJson.version,
    commands: () => packageJson.scripts,
    totalTime: () =>
      '├─ ' + util.styleText('blue', packageJson.name) + ' time taken',
    scriptTime: (script: string) =>
      '└─ ' + util.styleText('blue', script) + ' time taken',
  };

  // start console timer for totalTime()
  console.time(show.totalTime());

  if (logLevel >= logLevelValue('info')) {
    console.info(
      util.styleText('white', 'Starting'),
      util.styleText('blue', packageJson.name),
      util.styleText('white', 'v' + packageJson.version),
      util.styleText('blue', '\n┊')
    );
    console.info('├──' + '┐  ');
  }

  const cwd: ReturnType<typeof parseCwd> = parseCwd(proc);

  const env: ReturnType<typeof parseEnv> = parseEnv(proc, {
    cwd: path.format({
      base: cwd.base,
      dir: cwd.dir,
      ext: cwd.ext,
      name: cwd.name,
      root: cwd.root,
    }),
  });

  const command: ReturnType<typeof parseCommand> = parseCommand(proc);

  const argv: ReturnType<typeof parseArgv> = parseArgv(proc);

  const warnings: Error[] = [];
  const errors: Error[] = [];

  // (shouldn't happen; handles 'undefined' cases)..
  if (!command.tokens) throw new Error('parseCommand returned no tokens');
  if (!argv.tokens) throw new Error('parseArgv returned no tokens');

  // local helper
  type PositionalArg = {
    kind: 'positional';
    index: number;
    value: string;
  };

  const childCommand: string[] = [];

  // compose command...
  if (command.tokens)
    command.tokens.forEach((token) => {
      switch (token.kind) {
        case 'option': {
          childCommand.push(token.rawName);
          if (token.value) childCommand.push(token.value);
          break;
        }
        case 'positional': {
          childCommand.push(token.value);
          break;
        }
        case 'option-terminator': {
          childCommand.push('--');
          break;
        }
        default: {
          break;
        }
      }
    });

  if (logLevel >= logLevelValue('debug')) {
    console.debug('childCommand', childCommand);
  }

  const childArgs: string[] = [];

  // compose args...
  if (argv.tokens)
    argv.tokens.forEach((token) => {
      switch (token.kind) {
        case 'option': {
          childArgs.push(token.rawName);
          if (token.value) childArgs.push(token.value);
          break;
        }
        case 'positional': {
          childArgs.push(token.value);
          break;
        }
        case 'option-terminator': {
          childArgs.push('--');
          break;
        }
        default: {
          break;
        }
      }
    });

  if (logLevel >= logLevelValue('debug')) {
    console.debug('childArgs', childArgs);
  }

  // filter scripts from argv.tokens to child processes or errors..
  argv.tokens
    .filter<PositionalArg>((token) => token.kind === 'positional')
    .forEach((token, id) => {
      // if the current positional token is one of 'scripts' array...
      if (scripts.includes(token.value)) {
        // prevent any possibility of passing both '<script>' and '--<script>'
        const foundScript: string = token.value;
        if (argv.values[foundScript]) delete argv.values[foundScript];
      } else {
        if (!argv.tokens) throw new Error('parseArgv returned no tokens'); // (shouldn't happen; just handles 'undefined' case)
        // add the unknown script to the errors array
        const unknownScript: string = token.value;
        const error: Error = new Error(
          util.styleText('red', 'Unknown script'),
          { cause: new Error(unknownScript) }
        );
        errors.push(error);
        // delete the unknown script from argv
        delete argv.values[unknownScript];
        delete argv.tokens[id];
      }
    });

  // run the validated tokens as scripts with spawnSync
  argv.tokens
    .filter<PositionalArg>((token) => token.kind === 'positional')
    .forEach((token, id, array) => {
      //

      const scriptToRun = token.value;
      const isLast: boolean = id === array.length - 1;
      const tab: string = isLast ? '│  ' + '└─ ' : '│  ' + '├─ ';
      const timeTab: string = isLast ? '   ' : '│  ';
      const midTab: string = isLast ? '   ' : '│  ';

      console.time('│  ' + timeTab + show.scriptTime(scriptToRun));
      console.log('│  ' + '│  ');
      console.log(
        tab + 'Recieved Script:',
        util.styleText('blue', scriptToRun)
      );
      console.log('│  ' + midTab + '│  ');

      const result: ChildProcess.SpawnSyncReturns<Buffer> =
        childProcess.spawnSync(
          childCommand[0]!,
          childCommand
            .slice(1)
            .concat([path.resolve(__dirname, 'scripts', scriptToRun)]),
          {
            env: proc.env,
            argv0: childCommand[0],
            signal: ac.signal,
            cwd: proc.cwd(),
            stdio: 'inherit',
          }
        );
      if (result.signal) {
        signalsListener(result.signal);
        proc.exit(1); // TODO - optional...
      }
      console.timeEnd('│  ' + timeTab + show.scriptTime(scriptToRun));
    });

  //
  if (warnings.length != 0 && !ignoreWarnings) {
    //

    console.warn('│  ');
    console.warn('├─ ' + 'Finished with Warning:');

    warnings.forEach((warning, id, array) => {
      //

      const isLast: boolean = id === array.length;
      const tab: string = isLast ? '└─ ' : '├─ ';

      console.warn(
        '│  ' + tab + warning.name,
        util.styleText('white', warning.message)
      );

      //
    }); // warnings.forEach()
    //

    console.warn(
      '│  ' + '├─ ' + 'Perhaps you need to update',
      packageJson.name + '?'
    );
    console.warn(
      '│  ' + '└─ ' + 'See:',
      util.styleText('underline', packageJson.homepage)
    );

    //
    if (treatWarningsAsErrors) {
      console.log('│  ');
      console.timeEnd(show.totalTime());
      console.log(util.styleText('red', '┊'));
      // log(show.commands());
      proc.exitCode = warnings.length;
      const msg = util.styleText('yellow', 'Finished with warning');
      throw new Error(msg, {
        cause: warnings,
      });
    }
    //

    //
  } // if (warnings.length != 0 && ignoreWarnings)
  //

  console.log('│  ');
  console.timeEnd(show.totalTime());
  console.log(util.styleText('green', '┊'));
  return;
};

export = cli;

if (require.main === module) {
  (async (proc: NodeJS.Process, options?: CliOptions) => {
    cli(proc, options);
    return;
  })(global.process, { logLevel: 'info' });
}

// type CliOptions = {
//   sync?: true | false;
//   verbose?: true | false;
//   debug?: true | false;
//   signal?: AbortSignal;
//   timeoutMs?: number;
//   ignoreErrors?: true | false;
//   ignoreWarnings?: true | false;
//   treatWarningsAsErrors?: true | false;
// };

// interface cli {
//   (proc: NodeJS.Process): void;
//   (proc: NodeJS.Process, options?: CliOptions): void;
// }

// /**
//  * The {@link https://github.com/nathanjood/esbuild-scripts esbuild-scripts}
//  * command line interface.
//  *
//  * @param {NodeJS.Process} proc The {@link NodeJS.Process} to use
//  * @param {(CliOptions|undefined)} options the {@link CliOptions} oject to use
//  * @returns {void}
//  *
//  * @example
//  * ```ts
//  * const result = cli(process);
//  * ```
//  * @example
//  * ```ts
//  * const result = cli(process, { verbose: true });
//  * ```
//  * @author Nathan J. Hood <nathanjhood@googlemail.com>
//  * @copyright 2024 MIT License
//  */
// const cli: (proc: NodeJS.Process, options?: CliOptions) => void = (
//   proc: NodeJS.Process,
//   options?: CliOptions
// ): void => {
//   //

//   /** handlers */

//   const ac = new AbortController();

//   proc.on('unhandledRejection', (err, origin) => {
//     // ac.abort(err);
//     fs.writeSync(proc.stderr.fd, util.format(err, origin), null, 'utf8');
//     // throw err;
//     proc.exit(1);
//   }) satisfies NodeJS.Process;

//   proc.on('SIGTERM', (signal) => {
//     // ac.abort(signal);
//     fs.writeSync(proc.stderr.fd, util.format(signal), null, 'utf8');
//     proc.exit(1);
//   }) satisfies NodeJS.Process;

//   /** defaults */

//   // const sync: true | false = options && options.sync ? options.sync : true;

//   const verbose: true | false =
//     options && options.verbose
//       ? options.verbose
//       : global.process.env['VERBOSE'] !== undefined
//         ? true
//         : false;

//   const debug: true | false =
//     options && options.debug
//       ? options.debug
//       : global.process.env['DEBUG'] !== undefined
//         ? true
//         : false;

//   const signal: AbortSignal =
//     options && options.signal ? options.signal : ac.signal;

//   // const timeoutMs: number =
//   //   options && options.timeoutMs ? options.timeoutMs : MAX_SAFE_INTEGER - 1;

//   const ignoreWarnings: true | false =
//     options && options.ignoreWarnings ? options.ignoreWarnings : false;

//   const ignoreErrors: true | false =
//     options && options.ignoreErrors ? options.ignoreErrors : false;

//   const treatWarningsAsErrors: true | false =
//     options && options.treatWarningsAsErrors
//       ? options.treatWarningsAsErrors
//       : false;

//   // // set timeout > abort controller
//   // // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   // ((reason?: any, ms?: number) => setTimeout<[]>(() => ac.abort(reason), ms))({
//   //   reason: 'timeout',
//   //   ms: timeoutMs,
//   // });
//   // //

//   // if (signal)
//   //   signal.addEventListener<'abort'>(
//   //     'abort',
//   //     (event) => {
//   //       fs.writeSync(proc.stderr.fd, util.format(event), null, 'utf8');
//   //     },
//   //     { once: true }
//   //   );

//   const console: Console = new node_console.Console({
//     groupIndentation: 2,
//     ignoreErrors: ignoreErrors,
//     stdout: proc.stdout,
//     stderr: proc.stderr,
//     inspectOptions: {
//       depth: MAX_SAFE_INTEGER,
//       breakLength: 80,
//       compact: verbose === true,
//       // colors: proc.stdout.hasColors(),
//     },
//   });

//   const scripts: string[] = ['build', 'start', 'test', 'eject'];

//   // const show = {
//   //   name: () => packageJson.name,
//   //   version: () => packageJson.version,
//   //   commands: () => packageJson.scripts,
//   //   totalTime: () =>
//   //     '├─ ' + util.styleText('blue', packageJson.name) + ' time taken',
//   //   scriptTime: (script: string) =>
//   //     '└─ ' + util.styleText('blue', script) + ' time taken',
//   // };

//   // console.time(show.totalTime());

//   // if (proc.stdout.isTTY) console.clear();

//   // console.log(
//   //   util.styleText('white', 'Starting'),
//   //   util.styleText('blue', packageJson.name),
//   //   util.styleText('white', 'v' + packageJson.version),
//   //   util.styleText('blue', '\n┊')
//   // );

//   // console.log('├──' + '┐  ');

//   const cwd: ReturnType<typeof parseCwd> = parseCwd(proc);

//   const env: ReturnType<typeof parseEnv> = parseEnv(proc, {
//     // debug: debug,
//     // verbose: verbose,
//     cwd: path.format({
//       base: cwd.base,
//       dir: cwd.dir,
//       ext: cwd.ext,
//       name: cwd.name,
//       root: cwd.root,
//     }),
//   });

//   const command: ReturnType<typeof parseCommand> = parseCommand(proc);

//   const argv: ReturnType<typeof parseArgv> = parseArgv(proc);

//   const warnings: Error[] = [];
//   const errors: Error[] = [];

//   /** (shouldn't happen; handles 'undefined' case) */
//   if (!argv.tokens) throw new Error('parseArgv returned no tokens');

//   const childCommand: string[] = [];

//   /** compose command... */
//   if (command.tokens)
//     command.tokens.forEach((token) => {
//       switch (token.kind) {
//         case 'option': {
//           childCommand.push(token.rawName);
//           if (token.value) childCommand.push(token.value);
//           break;
//         }
//         case 'positional': {
//           childCommand.push(token.value);
//           break;
//         }
//         case 'option-terminator': {
//           childCommand.push('--');
//           break;
//         }
//         default: {
//           break;
//         }
//       }
//     });

//   // /** log the collected arg/value pairs from argv0 */
//   // if (verbose && !debug) {
//   //   console.info(childCommand);
//   // }

//   const childArgs: string[] = [];

//   /** compose args... */
//   if (argv.tokens)
//     argv.tokens.forEach((token) => {
//       switch (token.kind) {
//         case 'option': {
//           childArgs.push(token.rawName);
//           if (token.value) childArgs.push(token.value);
//           break;
//         }
//         case 'positional': {
//           childArgs.push(token.value);
//           break;
//         }
//         case 'option-terminator': {
//           childArgs.push('--');
//           break;
//         }
//         default: {
//           break;
//         }
//       }
//     });

//   // /** log the collected arg/value pairs from argv */
//   // if (verbose && !debug) {
//   //   console.info(childArgs);
//   // }

//   /** local helper */
//   type PositionalArg = {
//     kind: 'positional';
//     index: number;
//     value: string;
//   };

//   /** filter scripts from argv.tokens to child processes or warnings */
//   argv.tokens
//     .filter<PositionalArg>((token) => token.kind === 'positional')
//     .forEach((token, id) => {
//       /** if the current positional token is one of 'scripts' array... */
//       if (scripts.includes(token.value)) {
//         const foundScript: string = token.value;

//         /** prevent any possibility of passing both '<script>' and '--<script>' */
//         if (argv.values[foundScript]) delete argv.values[foundScript];
//       } else {
//         /** (shouldn't happen; just handles 'undefined' case) */
//         if (!argv.tokens) throw new Error('parseArgv returned no tokens');

//         const unknownScript: string = token.value;

//         /** add the unknown script to the warnings array */
//         warnings.push(
//           new Error(
//             util.styleText('yellow', 'Unknown script: ' + unknownScript)
//           )
//         );

//         /** delete the unknown script from argv */
//         delete argv.values[unknownScript];
//         delete argv.tokens[id];
//       }
//     });

//   // run the validated tokens as scripts with spawnSync
//   argv.tokens
//     .filter<PositionalArg>((token) => token.kind === 'positional')
//     .forEach((token, id, array) => {
//       const scriptToRun = token.value;
//       // const isLast: boolean = id === array.length - 1;
//       // const tab: string = isLast ? '│  ' + '└─ ' : '│  ' + '├─ ';
//       // const timeTab: string = isLast ? '   ' : '│  ';
//       // const midTab: string = isLast ? '   ' : '│  ';

//       // console.time('│  ' + timeTab + show.scriptTime(scriptToRun));
//       // console.log('│  ' + '│  ');
//       // console.log(
//       //   tab + 'Recieved Script:',
//       //   util.styleText('blue', scriptToRun)
//       // );
//       // console.log('│  ' + midTab + '│  ');

//       const result: ChildProcess.SpawnSyncReturns<Buffer> =
//         childProcess.spawnSync(
//           childCommand[0]!,
//           childCommand
//             .slice(1)
//             .concat([path.resolve(__dirname, 'scripts', scriptToRun)]),
//           {
//             env: env.raw,
//             argv0: childCommand[0],
//             signal: signal,
//             cwd: path.format(cwd),
//             stdio: 'inherit',
//           }
//         );
//       if (result.signal) {
//         switch (result.signal) {
//           case 'SIGKILL': {
//             console.log(
//               'The build failed because the process exited too early. ' +
//                 'This probably means the system ran out of memory or someone called ' +
//                 '`kill -9` on the process.'
//             );
//             break;
//           }
//           case 'SIGTERM': {
//             console.log(
//               'The build failed because the process exited too early. ' +
//                 'Someone might have called `kill` or `killall`, or the system could ' +
//                 'be shutting down.'
//             );
//             break;
//           }
//           default: {
//             break;
//           }
//         }
//         proc.exit(1); // TODO - optional...
//       }
//       // console.timeEnd('│  ' + timeTab + show.scriptTime(scriptToRun));
//     });

//   if (warnings.length != 0 && !ignoreWarnings) {
//     // console.warn('│  ');
//     // console.warn('├─ ' + 'Finished with Warning:');

//     warnings.forEach((warning, id, array) => {
//       // const isLast: boolean = id === array.length;
//       // const tab: string = isLast ? '└─ ' : '├─ ';

//       // console.warn(
//       //   '│  ' + tab + warning.name,
//       //   util.styleText('white', warning.message)
//       // );
//     });

//     // console.warn(
//     //   '│  ' + '├─ ' + 'Perhaps you need to update',
//     //   packageJson.name + '?'
//     // );
//     // console.warn(
//     //   '│  ' + '└─ ' + 'See:',
//     //   util.styleText('underline', packageJson.homepage)
//     // );

//     // if (treatWarningsAsErrors) {
//     //   console.log('│  ');
//     //   console.timeEnd(show.totalTime());
//     //   console.log(util.styleText('red', '┊'));
//     //   // log(show.commands());
//     //   proc.exitCode = warnings.length;
//     //   const msg = util.styleText('yellow', 'Finished with warning');
//     //   throw new Error(msg, {
//     //     cause: warnings,
//     //   });
//     // }
//   }

//   // console.log('│  ');
//   // console.timeEnd(show.totalTime());
//   // console.log(util.styleText('green', '┊'));
//   return;
// };

// /**
//  * The {@link https://github.com/nathanjood/esbuild-scripts esbuild-scripts}
//  * command line interface.
//  *
//  * @param {NodeJS.Process} proc
//  * @param {(CliOptions|undefined)} options
//  * @returns {Promise<void>}
//  * @throws
//  *
//  * @example
//  * ```ts
//  * const result = await cli(process);
//  * ```
//  * @example
//  * ```ts
//  * const result = await cli(process, { verbose: true });
//  * ```
//  * @example
//  * ```ts
//  * cli(process, { verbose: true })
//  *   .then((result) => { return result; })
//  *   .catch((error) => { throw error; });
//  * ```
//  * @author Nathan J. Hood <nathanjhood@googlemail.com>
//  * @copyright 2024 MIT License
//  */
// const cliAsync: (proc: NodeJS.Process, options?: CliOptions) => Promise<void> =
//   util.promisify<NodeJS.Process, CliOptions | undefined, void>(cli);

// export = cli;

// if (require.main === module) {
//   (async (proc: NodeJS.Process, options?: CliOptions): Promise<void> => {
//     return await cliAsync(proc, options)
//       .then((result) => {
//         return result;
//       })
//       .catch((err) => {
//         throw err;
//       });
//   })(
//     /** process -> */ global.process,
//     /** options -> */ {
//       sync: false,
//       verbose: global.process.env['VERBOSE'] !== undefined ? true : false,
//       debug: global.process.env['DEBUG'] !== undefined ? true : false,
//       timeoutMs: MAX_SAFE_INTEGER,
//       ignoreErrors: false,
//       ignoreWarnings: false,
//       treatWarningsAsErrors: false,
//     }
//   );
// }
