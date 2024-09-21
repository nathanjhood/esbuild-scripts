# how to write tests

... using NodeJS test runner with Typescript and [tsx](https://tsx.is/).

```ts
import test = require('node:test');

const { describe, it } = test;

describe('the foo() function', () => {
  it('accepts an input', () => {});
  it('returns a value', () => {});
  it('throws an error', () => {})
});
```

---

##

Create file with the extension `*.test.ts` - where `*` matches the name of the file you are writing tests for.

The test file may reside next to the file it is testing:

```sh
/src/
  |-app.ts
  |-app.test.ts
  |-/config/
    |-config.ts
    |-config.test.ts

```

*or*, the test file may reside in a mirrored directory structure, seperated from the source files:

```sh
/src/
  |-app.ts
  |-/config/
    |-config.ts
/test/
  |-app.test.ts
  |-/config/
    |-config.test.ts
```

##

In the test file; Import `node:test` with your desired syntax:

```ts
import test = require("node:test");
```

*or*

```ts
import test from "node:test";
```

*or*

```ts
import * as test from "node:test";
```

*or*

```ts
const test: typeof import("node:test") = require("node:test");
```

##

Create a "test suite", by passing in the name of the file (or any valid string that makes sense), as the first argument to the `test.describe()` function:

```ts
import test = require("node:test");

//
test.describe('application.ts');
```

##

As a second parameter to the `test.describe()` function, pass in an anonymous 'arrow' function using the `() => {}` syntax:

```ts
import test = require("node:test");

test.describe('application.ts', () => {});
```

We will write our tests inside the object - `{}` - which is, the *body* of the arrow function.

```ts
import test = require("node:test");

test.describe('application.ts', () => {
  // tests go here...
});
```

A 'test suite' is an abstract name for a *context* in which we can write a set of tests, and run them all under one common, top-level structure, the test suite.

##

Using the same syntax used for the test suite, create some actual tests by calling `test.it()` and passing similar arguments (a descriptive name, and an arrow function):

```ts
import test = require("node:test");

test.describe('application.ts', () => {
  test.it('should equal one', () => {});
  test.it('should be false', () => {});
});
```

##

Each time we pass an arrow function to create a test - and/or a suite - the `()` parenthesis operator can *optionally* provide a parameter, which contains the testing methods we can use to write our tests with. To access it, pass a name (any name - we chose `ctx` as it's short for `context`) to the parenthesis operators where desired:

```ts
import test = require("node:test");

test.describe('application.ts', () => {
  test.it('should equal one', (ctx) => {});
  test.it('should be false', (ctx) => {});
});
```

This variable contains an `assert` object, which is where the testing methods can be found:

```ts
import test = require("node:test");

test.describe('application.ts', () => {
  test.it('should equal one', (ctx) => { ctx.assert.equals(0.25 + 0.75, 1) });
  test.it('should be false', (ctx) => { ctx.assert.ok(true) });
});
```

The variable is scoped to the function body which it's arrow `=>` operator points at:

```ts
import test = require("node:test");

test.describe('application.ts', () => {
  test.it('should equal one', (ctx) => { ctx.assert.ok() });
  test.it('should be false', () => { /** no 'ctx' here! */});
});
```

Because of this, it *may* be helpful to create very verbose data structures for tests in some cases:

```ts
import test = require("node:test");

test.describe('application.ts', (suiteCtx) => {
  test.it('should equal one', (testCtxA) => { testCtxA.assert.ok() });
  test.it('should be false', (testCtxB) => { testCtxB.assert.ok() });
});
```

Suites may nest other suites. Tests may nest other tests. Consider the following as a *possible* test structure:

```ts
import test = require("node:test");

test.describe('application.ts', (suiteCtxA) => {
  test.describe('functions', (suiteCtxB) => {
    test.it('should', (testCtxA) => {
      testCtxA.assert.ok(true);
    });
    test.it('should not', (tesCtxB) => {
      test.it('equal one', (testCtxC) => {
        testCtxC.assert.equals(3 + 7, 1)
      })
    });
  });
});
```

##

Tests, and Suites, can also be configured via various parameters. These are accessed as properties on an object `{}`, which is *optoinally* passed in as the second parameter to either `test.describe()` (for suites) or `test.it()` (for tests); this means that the arrow functions shall become the *third* parameter, any time you wish to specify some options to that scope:

```ts
import test = require("node:test");

const maxTime: number = 10000; // milliseconds

const halfTime: number = maxTime / 2;

test.describe('application.ts', { timeout: maxTime },  () => {
  test.it('should equal one', { timeout: halfTime }, (ctx) => {});
  test.it('should be false', (ctx) => {});
});
```

In the above, all tests inside the `application.ts` suite shall timeout, if not completed, with the value of `maxTime` - here, 10 seconds.

The test `should equal one` shall timeout, if not completed, with the value of `halfTime` - here, 5 seconds.

The test `should be false` shall timeout, if not completed, with the value of the suite it is contained in (if any were specified).

##

An `AbortController` signal can be instantiated and passed to each suite and test's options object; the `AbortController` is a means of signalling that a task or process should exit immediately. It *may* be useful to pass a control signal around, to prevent some tests from running in the event that some preceding tests have failed, for example:

```ts
import test = require("node:test");

const maxTime: number = 10000; // milliseconds

const halfTime: number = maxTime / 2;

const abortController = new AbortController();

test.describe('application.ts', { timeout: maxTime },  () => {
  test.it('should equal one', { timeout: halfTime }, (ctx) => { abortController.abort(); });
  test.it('should be false', { signal: abortController.signal }, (ctx) => {});
});
```

In the above, the first test calls `abortController.abort()`, which is the singaller method to instruct recievers that they should exit immediately.

By passing that same `abortController` instance to the `should be false` test, we should see that this test gets aborted when `should equal one` runs and calls `abort()`; more useful means can be constructed to save time on CI pipeline runs and other potentially uneccessary testing run time.

These control signals can also be found on the context object being passed in by the parenthesis operator, allowing a more logical chaining of event control:

```ts
import test = require("node:test");

const maxTime: number = 10000; // milliseconds

const pi: number = 3.14159;

const abortController = new AbortController();

test.describe('application.ts', { timeout: maxTime, signal: abortController.signal }, (suiteCtx) => {
  test.it('should equal pi', { timeout: halfTime, signal: suiteCtx.signal /** <-- taken from outer context... */ }, (testCtx) => {
    testCtx.assert.equals(0.14159 + 3, pi)
  });
});
```

##

Tests can be async and/or return promises.

```ts
import test = require("node:test");

const someCondition = false;

test.describe('application.ts', () => {
  test.it('should resolve', async (ctx) => {
    return new Promise((resolveTest, rejectTest) => {
      if (ctx.assert.ok(someCondition)) { // <-- this is the test
        return resolveTest()
      } else {
        return rejectTest("assertion failed")
      }
    })
  });
});
```

##

Once test files have been written, they can be run in several ways.

The test files can be executed by running them in NodeJS. However, since these are written in Typescript, use `tsx` instead of `node` on the command line, and (in either case) pass the `--test` flag followed by the file(s) to be tested:

```sh
$ yarn tsx --test ./test/**/*.test.ts
```

For greater control, the imported `test` object contains a function, `test.run()`, which accepts an options object `{}` with various options for specifying which test files to run, and other various conditions.

This can be used in a seperate file, for example `runTests.ts`:

```ts
import test = require("node:test");
import path = require("node:path");
import os = require("node:os");

const options = {
  files: [
    path.resolve(path.join(__dirname, '/test/functions/someFunctions.test.ts')),
    path.resolve(path.join(__dirname, '/test/functions/moreFunctions.test.ts')),
    path.resolve(path.join(__dirname, '/test/application.test.ts')),
  ],
  signal: abortController.signal,
  concurrency: os.availableParallelism() - 1
}

test.run(options);

```

The file is then executed with tsx:

```sh
yarn tsx runTests.ts
```

*or* the file could be made executable with `chmod` and a hashbang:

```sh
chmod +x runTests.ts
```

```ts
#!/usr/bin/env -S yarn tsx

import test = require("node:test");
import path = require("node:path");
import os = require("node:os");

const options = {
  ...
}

test.run(options);
```

If no config is needed, the test files themselves can be made executable, without needing to call `test.run(options)`:

```ts
#!/usr/bin/env -S yarn tsx

import test = require("node:test");
import path = require("node:path");
import os = require("node:os");


test.describe('execute me directly!', () => {
  test.it('should pass', (ctx) => {
    ctx.assert.ok(true)
  })
});
```

```sh
test/application.test.ts

#
...
test passed.
```

##

Don't forget to test the actual files, instead of writing tests in isolation:

```ts
import test = require("node:test");
import application = require("./application.ts");

test.describe('application.ts', () => {
  test.describe('someFunctions', () => {
    test.it('should equal one', (ctx) => {
      const result: number = application.someFunctions.add(0.25, 0.75);
      ctx.assert.equals(result, 1);
    })
  })
});
```

Tests *should not be concerned* about the implementations of what they are testing.

Mocking may be used to re-create functionality found within the file(s) being tested. This is useful for reducing complex/costly behaviours like network requests into simple Javascript integrals that behave consistently, for the context of the test being performed.

Snapshots are currently an experimental feature with regards to the NodeJS test runner, but functionality is already working nicely. They are used to store values and results of tests between runs, and provide another layer to test against. For example, if a function named `getPi()` does some complex maths internally and returns the classical number Pi, this result can be stored in a 'snapshot' file alongside the test file (or elsewhere in the project tree, often). When the `getPi()` function goes through further development cycles, the test runner will check that this function returns the same value as stored in it's snapshot (Pi, ideally, in this case). Should something go wrong and the return value of the `getPi()` function begin returning some incorrect value, the snapshot test will *fail*, since the returned value will not match the one recorded in on previous runs. This alerts the developer that, even *if* the function successfully returned a number such that no other tests failed, the returned value did *not* match what was expected based on previous runs. Snapshot files are typically auto-generated and maintained by the test runner; usually, one shapshot file - per test-file is automatically written to disk, in the project tree. The snapshot files are most usually committed to version control systems, as they are (perhaps most) useful in CI/CD runs on remote machines. Since their syntax is not intended to be constructed humans, it often makes sense to direct the test runner to create it's snapshot files in some dedicated sub-directory, where they can exist as needed, without much human/developer interference. Snapshot files will often have an extension such as `*.snapshot.ts`, where `*` is the name of the test file it is capturing. One snapshot - per - test-file is usually generated.
