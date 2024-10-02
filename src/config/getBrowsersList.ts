import { createRequire } from 'node:module';
const require: NodeRequire = createRequire(__filename);

import type Readline = require('node:readline');
import util = require('node:util');
import readline = require('node:readline');
import console = require('node:console');

const defaultBrowsers: {
  production: string[];
  development: string[];
} = {
  production: ['>0.2%', 'not dead', 'not op_mini all'],
  development: [
    'last 1 chrome version',
    'last 1 firefox version',
    'last 1 safari version',
  ],
};

function shouldSetBrowsers(isInteractive: boolean) {
  if (!isInteractive) {
    return Promise.resolve<boolean>(true);
  }

  const question: {
    type: string;
    name: string;
    message: string;
    initial: boolean;
  } = {
    type: 'confirm',
    name: 'shouldSetBrowsers',
    message:
      util.styleText('yellow', "We're unable to detect target browsers.") +
      `\n\nWould you like to add the defaults to your ${util.styleText('bold', 'package.json')}?`,
    initial: true,
  };
}

((proc: NodeJS.Process) => {})(global.process);

const getBrowsersList: (proc: NodeJS.Process) => void = (
  proc: NodeJS.Process
) => {
  //

  const ac = new AbortController();
  const signal = ac.signal;

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
  } = new console.Console({
    stdout: proc.stdout,
    stderr: proc.stderr,
    groupIndentation: 2,
    inspectOptions: {
      breakLength: 80,
    },
  });

  const rl: Readline.Interface = readline.createInterface({
    input: proc.stdin,
    output: proc.stdout,
    prompt: 'esbuild-scripts > ',
  });

  rl.question('the question is?', { signal: signal }, (answer: string) => {});

  signal.addEventListener(
    'abort',
    () => {
      log('The question timed out');
    },
    { once: true }
  );

  // rl.prompt();

  // rl.on('line', (line) => {
  //   switch (line.trim()) {
  //     case 'hello':
  //       console.log('world!');
  //       break;
  //     default:
  //       console.log(`Say what? I might have heard '${line.trim()}'`);
  //       break;
  //   }
  //   rl.prompt();
  // }).on('close', () => {
  //   console.log('Have a great day!');
  //   process.exit(0);
  // });

  return;
};
