#!/usr/bin/env -S yarn tsx

/**
 * @file cli.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

//
import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);

import type ChildProcess = require('node:child_process');
import path = require('node:path');
import util = require('node:util');
import fs = require('node:fs');
import console = require('node:console');
import childProcess = require('node:child_process');

import parseEnv = require('./process/parseEnv');
import parseCommand = require('./process/parseCommand');
import parseCwd = require('./process/parseCwd');
import parseArgv = require('./process/parseArgv');

import packageJson = require('../package.json');

const MAX_SAFE_INTEGER: number = 2147483647;

type CliOptions = {
  sync?: true | false;
  verbose?: true | false;
  debug?: true | false;
  signal?: AbortSignal;
  timeoutMs?: number;
  ignoreErrors?: true | false;
  ignoreWarnings?: true | false;
  treatWarningsAsErrors?: true | false;
};

interface cli {
  (proc: NodeJS.Process): void;
  (proc: NodeJS.Process, options?: CliOptions): void;
}

/**
 * The {@link https://github.com/nathanjood/esbuild-scripts esbuild-scripts}
 * command line interface.
 *
 * @param {NodeJS.Process} proc The {@link NodeJS.Process} to use
 * @param {(CliOptions|undefined)} options the {@link CliOptions} oject to use
 * @returns {void}
 *
 * @example
 * ```ts
 * const result = cli(process);
 * ```
 * @example
 * ```ts
 * const result = cli(process, { verbose: true });
 * ```
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */
const cli: (proc: NodeJS.Process, options?: CliOptions) => void = (
  proc: NodeJS.Process,
  options?: CliOptions
): void => {
  //

  /** handlers */

  const ac = new AbortController();

  proc.on('unhandledRejection', (err, origin) => {
    ac.abort(err);
    fs.writeSync(proc.stderr.fd, util.format(err, origin), null, 'utf8');
    // throw err;
    proc.exit(1);
  }) satisfies NodeJS.Process;

  proc.on('SIGTERM', (signal) => {
    fs.writeSync(proc.stderr.fd, util.format(signal), null, 'utf8');
    ac.abort(signal);
    proc.exit();
  }) satisfies NodeJS.Process;

  /** defaults */

  const sync: true | false = options && options.sync ? options.sync : true;

  const verbose: true | false =
    options && options.verbose
      ? options.verbose
      : global.process.env['VERBOSE'] !== undefined
        ? true
        : false;

  const debug: true | false =
    options && options.debug
      ? options.debug
      : global.process.env['DEBUG'] !== undefined
        ? true
        : false;

  const signal: AbortSignal =
    options && options.signal ? options.signal : ac.signal;

  // const timeoutMs: number =
  //   options && options.timeoutMs ? options.timeoutMs : MAX_SAFE_INTEGER;

  const ignoreWarnings: true | false =
    options && options.ignoreWarnings ? options.ignoreWarnings : false;

  const ignoreErrors: true | false =
    options && options.ignoreErrors ? options.ignoreErrors : false;

  const treatWarningsAsErrors: true | false =
    options && options.treatWarningsAsErrors
      ? options.treatWarningsAsErrors
      : false;

  // // set timeout > abort controller
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // ((reason?: any, ms?: number) => setTimeout(() => ac.abort(reason), ms))({
  //   reason: 'timeout',
  //   ms: timeoutMs,
  // });
  // //

  // if (signal)
  //   signal.addEventListener(
  //     'abort',
  //     (event) => {
  //       fs.writeSync(proc.stderr.fd, util.format(event), null, 'utf8');
  //     },
  //     { once: true }
  //   );

  const {
    // assert,
    info,
    warn,
    // error,
    log,
    // debug,
    clear,
    time,
    // timeLog,
    timeEnd,
  }: Console = new console.Console({
    groupIndentation: 2,
    ignoreErrors: ignoreErrors,
    stdout: proc.stdout,
    stderr: proc.stderr,
    inspectOptions: {
      depth: MAX_SAFE_INTEGER,
      breakLength: 80,
      compact: verbose === true,
      // colors: proc.stdout.hasColors(),
    },
  });

  const scripts: string[] = ['build', 'start', 'test', 'eject'];

  const show = {
    name: () => packageJson.name,
    version: () => packageJson.version,
    commands: () => packageJson.scripts,
    totalTime: () =>
      '├─ ' + util.styleText('blue', packageJson.name) + ' time taken',
    scriptTime: (script: string) =>
      '└─ ' + util.styleText('blue', script) + ' time taken',
  };

  time(show.totalTime());

  if (proc.stdout.isTTY) clear();

  log(
    util.styleText('white', 'Starting'),
    util.styleText('blue', packageJson.name),
    util.styleText('white', 'v' + packageJson.version),
    util.styleText('blue', '\n┊')
  );

  log('├──' + '┐  ');

  const cwd: ReturnType<typeof parseCwd> = parseCwd(proc, {
    debug: debug,
    verbose: verbose,
  });

  const env: ReturnType<typeof parseEnv> = parseEnv(proc, {
    debug: debug,
    verbose: verbose,
    cwd: path.format({
      base: cwd.base,
      dir: cwd.dir,
      ext: cwd.ext,
      name: cwd.name,
      root: cwd.root,
    }),
  });

  const command: ReturnType<typeof parseCommand> = parseCommand(proc, {
    debug: debug,
    verbose: verbose,
  });

  const argv: ReturnType<typeof parseArgv> = parseArgv(proc, {
    debug: debug,
    verbose: verbose,
  });

  const warnings: Error[] = [];
  // const errors: Error[] = [];

  /** (shouldn't happen; handles 'undefined' case) */
  if (!argv.tokens) throw new Error('parseArgv returned no tokens');

  const childCommand: string[] = [];

  /** compose command... */
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

  /** log the collected arg/value pairs from argv0 */
  if (verbose && !debug) {
    info(childCommand);
  }

  const childArgs: string[] = [];

  /** compose args... */
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

  /** log the collected arg/value pairs from argv */
  if (verbose && !debug) {
    info(childArgs);
  }

  /** local helper */
  type PositionalArg = {
    kind: 'positional';
    index: number;
    value: string;
  };

  /** filter scripts from argv.tokens to child processes or warnings */
  argv.tokens
    .filter<PositionalArg>((token) => token.kind === 'positional')
    .forEach((token, id) => {
      //

      /** if the current positional token is one of 'scripts' array... */
      if (scripts.includes(token.value)) {
        //

        const foundScript: string = token.value;

        /** prevent any possibility of passing both '<script>' and '--<script>' */
        if (argv.values[foundScript]) delete argv.values[foundScript];
        //

        //
      } else {
        //

        /** (shouldn't happen; just handles 'undefined' case) */
        if (!argv.tokens) throw new Error('parseArgv returned no tokens');

        const unknownScript: string = token.value;

        /** add the unknown script to the warnings array */
        warnings.push(
          new Error(
            util.styleText('yellow', 'Unknown script: ' + unknownScript)
          )
        );

        /** delete the unknown script from argv */
        delete argv.values[unknownScript];
        delete argv.tokens[id];
        //

        //
      } // if (scripts.includes(token.value))
      //

      //
    }); // argv.tokens.forEach<PositionalArg>()
  //

  if (sync) {
    /** run the validated tokens as scripts with spawnSync */
    argv.tokens
      .filter((token) => token.kind === 'positional')
      .forEach((token, id, array) => {
        //

        const scriptToRun = token.value;
        const isLast: boolean = id === array.length - 1;
        const tab: string = isLast ? '│  ' + '└─ ' : '│  ' + '├─ ';
        const timeTab: string = isLast ? '   ' : '│  ';
        const midTab: string = isLast ? '   ' : '│  ';

        time('│  ' + timeTab + show.scriptTime(scriptToRun));
        log('│  ' + '│  ');
        log(tab + 'Recieved Script:', util.styleText('blue', scriptToRun));
        log('│  ' + midTab + '│  ');

        const result: ChildProcess.SpawnSyncReturns<Buffer> =
          childProcess.spawnSync(
            childCommand[0]!,
            childCommand
              .slice(1)
              .concat([path.resolve(__dirname, 'scripts', scriptToRun)]),
            {
              env: env.raw,
              argv0: childCommand[0],
              signal: signal,
              cwd: path.format(cwd),
              stdio: 'inherit',
            }
          );
        if (result.signal) {
          switch (result.signal) {
            case 'SIGKILL': {
              log(
                'The build failed because the process exited too early. ' +
                  'This probably means the system ran out of memory or someone called ' +
                  '`kill -9` on the process.'
              );
              break;
            }
            case 'SIGTERM': {
              log(
                'The build failed because the process exited too early. ' +
                  'Someone might have called `kill` or `killall`, or the system could ' +
                  'be shutting down.'
              );
              break;
            }
            default: {
              break;
            }
          }
          proc.exit(1); // TODO - optional...
        }
        timeEnd('│  ' + timeTab + show.scriptTime(scriptToRun));
        //

        //
      }); // argv.tokens.forEach<PositionalArg>()
    //

    //
  } else {
    // if(!sync)

    /** run the validated tokens as scripts with spawn */
    argv.tokens
      .filter((token) => token.kind === 'positional')
      .forEach(async (token, id, array) => {
        //

        const scriptToRun = token.value;
        const isLast: boolean = id === array.length - 1;
        const tab: string = isLast ? '│  ' + '└─ ' : '│  ' + '├─ ';
        const timeTab: string = isLast ? '   ' : '│  ';
        const midTab: string = isLast ? '   ' : '│  ';

        time('│  ' + timeTab + show.scriptTime(scriptToRun));
        log('│  ' + '│  ');
        log(tab + 'Recieved Script:', util.styleText('blue', scriptToRun));
        log('│  ' + midTab + '│  ');

        const result: ChildProcess.ChildProcess = childProcess.spawn(
          childCommand[0]!,
          childCommand
            .slice(1)
            .concat([path.resolve(__dirname, 'scripts', scriptToRun)]),
          {
            env: env.raw,
            argv0: childCommand[0],
            signal: signal,
            cwd: path.format(cwd),
            stdio: 'inherit',
          }
        );
        if (result.signalCode) {
          //

          switch (result.signalCode) {
            case 'SIGKILL': {
              log(
                'The build failed because the process exited too early. ' +
                  'This probably means the system ran out of memory or someone called ' +
                  '`kill -9` on the process.'
              );
              break;
            }
            case 'SIGTERM': {
              log(
                'The build failed because the process exited too early. ' +
                  'Someone might have called `kill` or `killall`, or the system could ' +
                  'be shutting down.'
              );
              break;
            }
            default: {
              break;
            }
          } // switch (result.signalCode)

          proc.exit(1); // TODO - optional...

          //
        } // if (result.signalCode)
        //

        timeEnd('│  ' + timeTab + show.scriptTime(scriptToRun));

        //
      }); // argv.tokens.forEach<PositionalArg>()
    //

    //
  } // if(sync)
  //

  if (warnings.length != 0 && !ignoreWarnings) {
    //

    warn('│  ');
    warn('├─ ' + 'Finished with Warning:');

    warnings.forEach((warning, id, array) => {
      //

      const isLast: boolean = id === array.length;
      const tab: string = isLast ? '└─ ' : '├─ ';

      warn(
        '│  ' + tab + warning.name,
        util.styleText('white', warning.message)
      );

      //
    }); // warnings.forEach()
    //

    warn('│  ' + '├─ ' + 'Perhaps you need to update', packageJson.name + '?');
    warn(
      '│  ' + '└─ ' + 'See:',
      util.styleText('underline', packageJson.homepage)
    );

    //
    if (treatWarningsAsErrors) {
      log('│  ');
      timeEnd(show.totalTime());
      log(util.styleText('red', '┊'));
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

  log('│  ');
  timeEnd(show.totalTime());
  log(util.styleText('green', '┊'));
  return;
};

/**
 * The {@link https://github.com/nathanjood/esbuild-scripts esbuild-scripts}
 * command line interface.
 *
 * @param {NodeJS.Process} proc
 * @param {(CliOptions|undefined)} options
 * @returns {Promise<void>}
 * @throws
 *
 * @example
 * ```ts
 * const result = await cli(process);
 * ```
 * @example
 * ```ts
 * const result = await cli(process, { verbose: true });
 * ```
 * @example
 * ```ts
 * cli(process, { verbose: true })
 *   .then((result) => { return result; })
 *   .catch((error) => { throw error; });
 * ```
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */
const cliAsync: (proc: NodeJS.Process, options?: CliOptions) => Promise<void> =
  util.promisify<NodeJS.Process, CliOptions | undefined, void>(cli);

export = cli;

if (require.main === module) {
  (async (proc: NodeJS.Process, options?: CliOptions): Promise<void> => {
    return await cliAsync(proc, options)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  })(
    /** process -> */ global.process,
    /** options -> */ {
      sync: true,
      verbose: true, // global.process.env['VERBOSE'] !== undefined ? true : false,
      debug: global.process.env['DEBUG'] !== undefined ? true : false,
      timeoutMs: MAX_SAFE_INTEGER,
      ignoreErrors: false,
      ignoreWarnings: false,
      treatWarningsAsErrors: false,
    }
  );
}
