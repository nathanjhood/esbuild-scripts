# CLI dev notes

Some notes on the creation of the CLI.

##

I often tend to find "fail-first" to be a good design approach; start by programming a 'successful' failure, which exits safely and gracefully, taking good care to do any cleanup and provide clear and useful feedback to the user before returning a status code of `0` - the *success* code.

It is then the developer's burden to *prove* the success of the results of future developments; the safe-failing feature is there to let you know "that didn't work", and rule out false positives early.

It may sound counter-intuitive, but nonetheless, it's always *quite easy* to ascertain early on what your program *should not do* - often, easier than conceptualizing actual *desired* behaviours - and on those grounds alone, this approach can lead to productive beginnings.

In the case of `esbuild-scripts`, our (finished) package aims to provide the following mechanics, to users who *consume* this package via npm in new React projects:

- add `esbuild-scripts` to `package.json#dependencies`
- add `"build": "esbuild-scripts build"` to `package.json#scripts`
- add `"start": "esbuild-scripts start"` to `package.json#scripts`
- add `"test": "esbuild-scripts test"` to `package.json#scripts`

Consumers can then call the usual React project commands in the terminal - `yarn start`, `yarn build`, and `yarn test`, for now - and `esbuild-scripts` shall spin up a configured esbuild instance via the underlying script in our `scripts` directory - of course, entirely indebted to the OG `react-scripts` (my motivations for this project are mostly achedemic, best discussed elsewhere - I'm not condoning `react-scripts`).

Essentially, this project exports an exectuble Javascript application - the CLI part - which accepts exactly ONE argument; one of either `build` `start`, or `test`. (yes in reality there are a few others, which we'll arive at later).

From this high-level overview, we can immediately see a few obvious potential points of failure; the most obvious perhaps is that the `esbuild-scripts` CLI *might* somehow get invoked with either an argument it doesn't recognize, or maybe with no argument at all: `esbuild-scripts make-me-dinner` or just `esbuild-scripts` by itself *should* fail; and, they should fail *successfully* - clean, helpful, no crashes or hangs, this is a simple and well-understood problem.

It makes a perfect starting point for building.

##

```ts
// src/cli.ts
const cli = (proc: NodeJS.Process) => {

  proc.on('unhandledRejection', (err) => {
    throw err;
  });

  console.log('Unknown script');
  console.log('Perhaps you need to update esbuild-scripts?');
  console.log(
    'See: https://github.com/nathanjhood/esbuild-scripts'
  );

  return;
};
```

In the above application, nice and compact, we have a function (a Javascript arrow function, denoted with the `() => {}` syntax) which accepts a [NodeJS Process](https://nodejs.org/docs/latest/api/process.html) object, and returns `void` (or, "nothing" - it's the same thing).

The NodeJS Process being passed in has been named `proc` instead of the usual name `process`; important, because `process` is actually a *global* and can be found anywhere in a NodeJS app at any time. By giving our function-scoped Process a slightly different name, it's clear to all - developers, reviewers, compilers - precisely which Process you are trying to work with, and also which *not*.

`process.on('someEvent')` is an [Event listener](https://nodejs.org/docs/latest/api/events.html); the "event model" in reference being one of the key building blocks in NodeJS applications, as well as in many other places. In this one, a function is 'registered' for `unhandledRejection` events - a certain type of failure in ECMAscript - any time one of those events of that particular error fires within our function body, the listener will pick up the event and `throw` it, causing our application to exit (in a 'bad' way we wish to avoid, eventually). This is *just a safety measure* and not something we hope to interact with further, for the time being.

Beyond that, we simply inform the user - by printing the terminal - that the script (which we will be pasing in as an argument) was not found. The program then exits normally.

This is a "safe" failure; the program gives the user helpful feedback, then proceeds to end 'as normal', with a status code of `0`.

To call the `cli` function, we can wrap the call in some nice ECMA module logic which determines whether the file is being called directly (running as an application), or is being imported by another module (running as a module).

To have it run when we call the file directly on the terminal (note: Windows support is touchy), we can add a shebang to the top of the file, instucting the executing environment *how* to run the file, i.e., by pointing `tsx` at it:

```ts
#!/usr/bin/env -S yarn tsx

const cli = (proc: NodeJS.Process) => {

  proc.on('unhandledRejection', (err) => {
    throw err;
  });

  console.log('Unknown script');
  console.log('Perhaps you need to update esbuild-scripts?');
  console.log(
    'See: https://github.com/nathanjhood/esbuild-scripts'
  );

  return;
};

// if we're running directly/not a module...
if (require.main === module) {
  // call 'cli' and pass in the globally running 'process'
  cli(global.process);
}
```

Now it can be executed with `tsx`:

```sh
yarn tsx ./src/cli.ts
```

Or, thanks to the shebang (`#!/usr/bin/env -S yarn tsx`), we can call the `chmod` command line utility to make the script executable directly, by doing the following command *once*:

```sh
chmod +x ./src/cli.ts
```

Now, the file can be executed directly without any other executable (again, Windows support is touchy):

```sh
./src/cli.ts
```

Executing the script either with `yarn tsx` or by executing the file directly will produce the *expected* failure:

```sh
$ ./src/cli.ts
Unknown script
Perhaps you need to update esbuild-scripts?
See: https://github.com/nathanjhood/esbuild-scripts
Done in xyz seconds.
```

Now, the next step is already crystal clear; without changing this behaviour, we need to define what a "success" status would be, and write our logic accordingly...

```ts
import child_process = require('node:child_process');

const cli = (proc: NodeJS.Process) => {

  proc.on('unhandledRejection', (err) => {
    throw err;
  });

  const scripts = ['build', 'start', 'test']; // <- the scripts we allow

  const arg = proc.argv[0]; // <- the arg passed in from the terminal

  if(scripts.includes(arg)) {
    // begin program...
    console.log('Starting script:', arg);
    return child_process.spawnSync(arg);

  } else {
    console.log('Unknown script');
    console.log('Perhaps you need to update esbuild-scripts?');
    console.log(
      'See: https://github.com/nathanjhood/esbuild-scripts'
    );
    return;
  }
};

if (require.main === module) {
  cli(global.process);
}
```
