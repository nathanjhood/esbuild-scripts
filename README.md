# esbuild-scripts

esbuild-flavoured `react-scripts`.

## Under Construction

Once development is complete, the installed `esbuild-scripts` package will provide a simple command-line interface which exposes four primary commands available to consumers.

React single-web-page application projects which consume `esbuild-scripts` shall be able to alias the below "script" commands via `npm`/`yarn`:

- `build` for bundling React single-web-page applications
- `test` for running unit test files for React single-web-page applications
- `start` for running a local development server with modern features such as hot reloading/fast-refresh and error overlay middleware
- `init` for quickly drafting up a new React single-web-page application project from a chosen template.
- Additionally, `eject` *might* also provided, which transforms React single-web-page applications into deployable bundles
- Additionally, esbuild's Javascript API has some interesting other features that *might* also get added to the list of available scripts, such as the fast-and-minimal `transform()` method

React projects which consume `esbuild-scripts` shall be able to use the above commands via `npm`/`yarn`, providing React projects with the same functionality of the usual `react-scripts` package, but using - primarily - only ESBuild and NodeJS as dependencies.

## Example intended usage (proposal - development pending)

From the root directory of your React project, add `esbuild-scripts` to your NodeJS dependencies:

```sh
$ yarn add esbuild-scripts@latest
```

Alias the four scripts to make them available by `yarn run <name>`

```jsonc
// package.json
{
  "name": "yourReactWebPage",
  "homepage": "https://yourDomain.com",
  "main": "public/index.html",
  "dependencies": {
    "esbuild-scripts": "1.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "scripts": {
    "build": "esbuild-scripts build",
    "start": "esbuild-scripts start",
    "test": "esbuild-scripts test",
    "eject": "esbuild-scripts eject"
  }
}
```

### Basic Commands

To build your React single-page web application with ESBuild:

```sh
$ yarn build
```

To serve your React single-page web application with ESBuild's local development server with fast-refresh and dev error overlay:

```sh
$ yarn start
```

To test your React single-page web application:

```sh
$ yarn test
```

To prepare your React single-page web for deployment as a bundle:

```sh
$ yarn eject
```
---

### Chained Commands

When invoking this package via its' command line interface (the `esbuild-scripts` part of the `esbuild-scripts build` command), additionally functionality is available, with regards to the original `react-scripts`, such as chaining multiple scripts in a "workflow"-like pattern in a single invocation.

For example, the following commands:

```sh
$ yarn esbuild-scripts test
```

```sh
$ yarn esbuild-scripts build
```

```sh
$ yarn esbuild-scripts start
```

can be chained together to create a concurrent "for each command":

```sh
$ yarn esbuild-scripts test build start
```

Each script shall be passed to `esbuild-scripts` and invoked in the same order, either concurrently (sync) or simultaenously (async) (see [Sync vs Async modes](#sync-vs-async-modes)). Addtional arguments, including options (`--option=`), positionals (`option`), and option-terminators (`--`) shall also be correctly parsed and filtered:

```sh
$ yarn esbuild-scripts -- test --timeoutMs=20000 -- build --verbose=true -- start --
```

### Sync vs Async modes

When running multiple scripts in `sync` mode (the default), each script is used to spawn a child process, where each *next* process will begin only once the *previous* process has completed. A typical output might look like this:

```sh
$ yarn esbuild-scripts --sync=true test build start

Starting @nathanjhood/esbuild-scripts v0.1.0
┊
├──┐
│  │
│  ├─ Recieved Script: test
│  │  │
esbuild-scripts test: Done in 12.414ms
│  │  │
│  │  └─ test time taken: 29.265ms
│  │
│  ├─ Recieved Script: build
│  │  │
esbuild-scripts build: Done in 12.847ms
│  │  │
│  │  └─ build time taken: 29.711ms
│  │
│  └─ Recieved Script: start
│     │
esbuild-scripts start: Done in 20.315ms
│     │
│     └─ start time taken: 32.566ms
│
├─ @nathanjhood/esbuild-scripts time taken: 147.669ms
┊
Done in 8.66s
```

When running multiple scripts with `sync` mode explicitly set to `false`, each script is used to spawn a child process, where each process runs simultaneously. A typical output might look like this:

```sh
$ yarn esbuild-scripts --sync=false test build start

Starting @nathanjhood/esbuild-scripts v0.1.0
┊
├──┐
│  │
│  ├─ Recieved Script: test
│  │  │
│  │  └─ test time taken: 29.265ms
│  │
│  ├─ Recieved Script: build
│  │  │
│  │  └─ build time taken: 29.711ms
│  │
│  └─ Recieved Script: start
│     │
│     └─ start time taken: 32.566ms
│
esbuild-scripts test: Done in 12.414ms
esbuild-scripts build: Done in 12.847ms
esbuild-scripts start: Done in 20.315ms
│
├─ @nathanjhood/esbuild-scripts time taken: 147.669ms
┊
Done in 8.66s
```

### Warnings and Errors

Warnings and errors generated by any step are collected and reported after all steps have completed, and before the command line interface exits; failures should be graceful and do proper cleanup routines internally (remove any listeners, release any references, abort any pending tasks, and allow any pending async operations to safely complete before exiting), and can be reported to the terminal, written to a log file, and/or ignored.

Example where some unknown script names were passed in between some valid ones:

```sh
$ yarn esbuild-scripts build foo test bar build baz test

Starting @nathanjhood/esbuild-scripts v0.1.0
┊
├──┐
│  │
│  ├─ Recieved Script: test
│  │  │
│  │  └─ test test taken: 39.177ms
│  │
│  ├─ Recieved Script: build
│  │  │
│  │  └─ build time taken: 22.266ms
│  │
│  ├─ Recieved Script: test
│  │  │
│  │  └─ test time taken: 53.722ms
│  │
│  └─ Recieved Script: build
│     │
│     └─ build time taken: 58.527ms
│
├─ Finished with Warning:
│  ├─ Error Unknown script: foo
│  ├─ Error Unknown script: bar
│  ├─ Error Unknown script: baz
│  ├─ Perhaps you need to update @nathanjhood/esbuild-scripts?
│  └─ See: https://github.com/nathanjhood/esbuild-scripts
│
├─ @nathanjhood/esbuild-scripts time taken: 315.116ms
┊
Done in 8.26s
```

The above behaviour in which errors and/or warnings are collated and displayed upon completion of *all* tasks is guaranteed in both `sync` and non-`sync` modes.

It is possible to both `ignoreWarnings` and `ignoreErrors`.

It is also possible to `treatWarningsAsErrors`, as in optionally exit (gracefully) and abandon any pending tasks (safely) should any warnings/errors be generated:

```sh
$ yarn esbuild-scripts build foo test bar build baz test

Starting @nathanjhood/esbuild-scripts v0.1.0
┊
├──┐
│  │
│  ├─ Recieved Script: test
│  │  │
│  │  └─ test test taken: 39.177ms
Error: Unknown script: baz
          at <anonymous> (/home/***/***/cli.ts:308:11)
error Command failed with exit code 1.
```

Valid scripts may also generate their own warnings/errors and render these according to their respective configurations in consuming projects.

### `.env` Files

Environment variable file support is provided in a fashion that intentionally resembles `dotenv`, in which multiple cascading files are read in order of most-specific-first.

The convention mentioned exactly matches the React (and `dotenv`) documentation, where given the following set of `.env` files in the React projects' root directory, the upper-most file shall have the highest priority in the case of multiple definitions of any variable:

```txt
.env.${NODE_ENV}.local
.env.${NODE_ENV}
.env.local
.env
```

*important* - in this convention, the files with the tag `*.local` in the name should be ignored from any version control systems (i.e., add all `*.local` files to `.gitignore`). Those represent variables which are local to *your* machine; the others, including `.env` itself, shall therefore be over-ruled by the `*.local` files, meaning they can be added to version control to serve as useful default fall-backs and/or example use cases.

## Previews

For the time being while working towards a suitable `v0.0.1` baseline, a fully-working draft of this entire project, including the four commands *and* react/react-native-web project templates, can be found at:

- [`ts-esbuild-react`](https://github.com/nathanjhood/ts-esbuild-react) - A react app template using esbuild and Typescript, with working version of all four scripts
- [`ts-esbuild-react-native-web`](https://github.com/nathanjhood/ts-esbuild-react-native-web) - A react app template uing esbuild and Typescript *and* React Native Web, with working version of all four scripts
- [`nathanjhood.github.io`](https://github.com/nathanjhood/nathanjhood.github.io) - my under-construction GitHub page, which is the intended final consumer of `esbuild-scripts`, and was created from the `ts-esbuild-react-native-web` template; it shall mostly resemble the template but serve as an eventual landing page, linking together all of my individual GitHub Pages under one root URL

*this repository has been created as a means to centralize further extended development of the concepts demonstrated in the above-mentioned projects. In time, their script contents shall be replaced with `esbuild-scripts`.

---

## Intentions

Several features from `react-dev-utils` shall also be ported into this project, as and when need arises; others may be replaced with counterparts which correspond more closely to ESBuild, rather than WebPack (including plugins, where necessary).

The scripts and command-line interface shall be written Typescript-first (with UMD and Module Loader support) using only the NodeJS Javascript API (with Typescript support), developed with [tsx](https://tsx.dev), tested using NodeJS Test Runner, and transpiled then bundled with `pkgroll`; the package should *not* require any further dependencies, so that consumers should only have one additional package in their dependency lock files (`pkgroll` is a developer-only dependency, and thus not required for consumers).

GitHub Actions shall be used to run multi-platform, multi-architecture tests, builds, and deployment, to maintain a reliable interface and baseline of functionality across future changes. The workflows shall support a specified array of NodeJS versions, with an intention to provide compatibility as far back as possible, while referencing latest changes and deprecation warnings.

---

Please feel welcome to express some interest in the project; it might encourage me to allocate more time on it than I currently intend to, post-launch.

Thanks for reading.

---
