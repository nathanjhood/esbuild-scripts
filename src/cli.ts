#!/usr/bin/env -S yarn tsx

/**
 * @file cli.ts
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @copyright 2024 MIT License
 */

/** */
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

const MAX_SAFE_INTEGER = 2147483647;

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

const cli = (proc: NodeJS.Process, options?: CliOptions): void => {
  //

  //
  const ac = new AbortController();
  //

  //
  proc.on('unhandledRejection', (err, origin) => {
    ac.abort(err);
    fs.writeSync(proc.stderr.fd, util.format(err, origin), null, 'utf8');
    // throw err;
    proc.exit(1);
  });
  proc.on('SIGTERM', (signal) => {
    fs.writeSync(proc.stderr.fd, util.format(signal), null, 'utf8');
    ac.abort(signal);
    proc.exit();
  });

  // defaults
  //
  const sync: true | false = options && options.sync ? options.sync : false;
  //
  const verbose: true | false =
    options && options.verbose
      ? options.verbose
      : global.process.env['VERBOSE'] !== undefined
        ? true
        : false;
  //
  const debug: true | false =
    options && options.debug
      ? options.debug
      : global.process.env['DEBUG'] !== undefined
        ? true
        : false;
  //
  const signal: AbortSignal =
    options && options.signal ? options.signal : ac.signal;
  // //
  // const timeoutMs: number =
  //   options && options.timeoutMs ? options.timeoutMs : MAX_SAFE_INTEGER;
  // //
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
    // assert: assert,
    info: info,
    warn: warn,
    // error: error,
    log: log,
    // debug: debug,
    clear: clear,
    time: time,
    // timeLog: timeLog,
    timeEnd: timeEnd,
  }: Console = new console.Console({
    groupIndentation: 2,
    ignoreErrors: ignoreErrors,
    stdout: proc.stdout,
    stderr: proc.stderr,
    inspectOptions: {
      depth: MAX_SAFE_INTEGER,
      breakLength: 80,
      colors: proc.stdout.hasColors(proc.stdout.getColorDepth()),
      compact: verbose,
    },
  });

  const { exit: exit } = proc;

  const scripts: string[] = ['build', 'start', 'test', 'eject'];

  //
  const show = {
    name: () => packageJson.name,
    version: () => packageJson.version,
    commands: () => packageJson.scripts,
    totalTime: () =>
      '├─ ' + util.styleText('blue', packageJson.name) + ' time taken',
    scriptTime: (script: string) =>
      /**'│  ' +*/ '└─ ' + util.styleText('blue', script) + ' time taken',
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

  const cwd: ReturnType<typeof parseCwd> = parseCwd(proc, { debug: false });

  const env: ReturnType<typeof parseEnv> = parseEnv(proc, {
    debug: false,
    cwd: path.format({
      base: cwd.base,
      dir: cwd.dir,
      ext: cwd.ext,
      name: cwd.name,
      root: cwd.root,
    }),
  });

  const command: ReturnType<typeof parseCommand> = parseCommand(proc, {
    debug: false,
  });

  const argv: ReturnType<typeof parseArgv> = parseArgv(proc, {
    debug: false,
  });

  const warnings: Error[] = [];
  // const errors: Error[] = [];

  // (shouldn't happen; handles 'undefined' case)
  if (!argv.tokens) throw new Error('parseArgv returned no tokens');

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

  // log the collected arg/value pairs from argv0
  if (verbose && !debug) {
    info(childCommand);
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

  // log the collected arg/value pairs from argv
  if (verbose && !debug) {
    info(childArgs);
  }

  //
  type PositionalArg = {
    kind: 'positional';
    index: number;
    value: string;
  };

  // filter invalid scripts from argv.tokens into warnings
  argv.tokens
    .filter<PositionalArg>((token) => token.kind === 'positional')
    .forEach((token, id) => {
      //

      // if the current positional token is one of 'scripts' array...
      if (scripts.includes(token.value)) {
        //
        const foundScript: string = token.value;

        // prevent any possibility of passing both '<script>' and '--<script>'
        if (argv.values[foundScript]) delete argv.values[foundScript];
        //

        //
      } else {
        //

        // (shouldn't happen; just handles 'undefined' case)
        if (!argv.tokens) throw new Error('parseArgv returned no tokens');

        //
        const unknownScript: string = token.value;
        //

        // add the unknown script to the warnings array
        warnings.push(
          new Error(
            util.styleText('yellow', 'Unknown script: ' + unknownScript)
          )
        );
        //
        // delete the unknown script from argv
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
    // run the validated tokens as scripts with spawnSync
    argv.tokens
      .filter((token) => token.kind === 'positional')
      .forEach((token, id, array) => {
        //
        const scriptToRun = token.value;
        const isLast: boolean = id === array.length - 1;
        const tab: string = isLast ? '│  ' + '└─ ' : '│  ' + '├─ ';
        const timeTab: string = isLast ? '   ' : '│  ';
        const midTab: string = isLast ? '   ' : '│  ';
        //

        //
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
          if (result.signal === 'SIGKILL') {
            log(
              'The build failed because the process exited too early. ' +
                'This probably means the system ran out of memory or someone called ' +
                '`kill -9` on the process.'
            );
          } else if (result.signal === 'SIGTERM') {
            log(
              'The build failed because the process exited too early. ' +
                'Someone might have called `kill` or `killall`, or the system could ' +
                'be shutting down.'
            );
          }
          exit(1); // TODO - optional...
        }
        timeEnd('│  ' + timeTab + show.scriptTime(scriptToRun));
        //

        //
      }); // argv.tokens.forEach<PositionalArg>()
    //
  } else {
    // run the validated tokens as scripts with spawSync
    argv.tokens
      .filter((token) => token.kind === 'positional')
      .forEach(async (token, id, array) => {
        //
        const scriptToRun = token.value;
        const isLast: boolean = id === array.length - 1;
        const tab: string = isLast ? '│  ' + '└─ ' : '│  ' + '├─ ';
        const timeTab: string = isLast ? '   ' : '│  ';
        const midTab: string = isLast ? '   ' : '│  ';
        //

        //
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
          if (result.signalCode === 'SIGKILL') {
            log(
              'The build failed because the process exited too early. ' +
                'This probably means the system ran out of memory or someone called ' +
                '`kill -9` on the process.'
            );
          } else if (result.signalCode === 'SIGTERM') {
            log(
              'The build failed because the process exited too early. ' +
                'Someone might have called `kill` or `killall`, or the system could ' +
                'be shutting down.'
            );
          }
          exit(1); // TODO - optional...
        }
        timeEnd('│  ' + timeTab + show.scriptTime(scriptToRun));
        //

        //
      }); // argv.tokens.forEach<PositionalArg>()
    //

    //
  } // if(sync)

  //
  if (warnings.length != 0 && !ignoreWarnings) {
    //

    //
    //
    warn('│  ');
    //
    warn('├─ ' + 'Finished with Warning:');
    //

    //
    warnings.forEach((warning, id, array) => {
      //
      const isLast: boolean = id === array.length;
      const tab: string = isLast ? '└─ ' : '├─ ';
      //

      //
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

  log('│  ');
  timeEnd(show.totalTime());
  log(util.styleText('green', '┊'));
  return;
};

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
  })(global.process, {
    sync: false,
    verbose: global.process.env['VERBOSE'] !== undefined ? true : false,
    debug: global.process.env['DEBUG'] !== undefined ? true : false,
    timeoutMs: MAX_SAFE_INTEGER,
    ignoreErrors: false,
    ignoreWarnings: false,
    treatWarningsAsErrors: false,
  });
}
