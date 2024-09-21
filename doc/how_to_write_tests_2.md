#

##

Start by describing your needs.

These might be business requirements - what does the business need this code to do? Or if a personal project, what do *you* need this code to do?

NodeJS Test Runner helpfully provides some aliases to it's `suite()` and `test()` functions with more tactile names:

```ts

import test = require('node:test');

const { describe, it } = test;

describe('the foo() function', () => {});
```

Here, `describe()` is an alias to `test.suite()` the two are completely interchangable. So, in `describe`-ing our needs, we are actually creating a suite of tests.

The syntax scans nicely - keep in mind, *tests ARE documentation*:

```ts
import test = require('node:test');

const { describe, it } = test;

describe('the foo() function', () => {
  it('accepts an input', () => {});
  it('returns a value', () => {});
  it('throws an error', () => {})
});
```

##

Now to write some software - TDD style.

The `test` object contains a `mock` feature, which is used to encapsulate some function or code that we want to test; mocking provides a means to create models of our intentions, and adds some useful reporting and diagnostic methods that tell us about how our mocked code behaved while being tested.

This allows developers to validate designs and concepts against expressed specifications of interest, while gaining a solid understanding of technical requirements and dependecies early, besides of course catching bugs and quirks from the beginning.

The mocking function, named `fn` (for 'function'), is a function which *accepts a function as a parameter* - which is, the one being tested.

One can write their code directly in the `mock.fn` function's first parameter, via an arrow `() => {}` function:

```ts
import test = require('node:test');

const { describe, it, mock } = test;

describe('the foo() function', () => {

  const foo = mock.fn(() => { return "bar"; });

  // tbd
  it('accepts an input', () => {});

  // fails if 'bar' is empty, i.e., foo() did not return a value
  it('returns a value', () => {
    const bar = foo();
    test.assert.ok(bar);
  });

  // tbd
  it('throws an error', () => {})
});
```

A slightly more useful syntax can seperate the tested code from the mock instance:

```ts
import test = require('node:test');

const { describe, it, mock } = test;

describe('the foo() function', () => {

  const foo = () => { return "bar"; };
  const mockFoo = mock.fn(foo);

  // tbd
  it('accepts an input', () => {});

  // fails if 'bar' is empty, i.e., foo() did not return a value
  it('returns a value', () => {
    const bar = mockFoo();
    test.assert.ok(bar);
  });

  // tbd
  it('throws an error', () => {})
});
```

Note the difference:

- `foo` is the code we are writing to be tested, but is *not* used directly in the test
- `mockFoo` is the `mock.fn` instance and *is* used directly in the test

This approach makes it possible to import the `foo` function from another file instead:

```ts
import test = require('node:test');
import foo = require('./path/to/foo');

const { describe, it, mock } = test;

describe('the foo() function', () => {

  const mockFoo = mock.fn(foo);

  // tbd
  it('accepts an input', () => {});

  // fails if 'bar' is empty, i.e., foo() did not return a value
  it('returns a value', () => {
    const bar = mockFoo();
    test.assert.ok(bar);
  });

  // tbd
  it('throws an error', () => {})
});
```

The above obviously makes sense - once the imported code is mature enough.

In "ideal" software development cycles, these unit tests would not usually take a great interest in the implementations - the inner workings - of the code being tested.

For the most part, the most useful tests are ones which reflect real-world use cases of consumers and end-users.

The following aspects make ideal targets for writing unit tests for a single function:

- input parameter(s)
- returned data
- exceptions (think 'throw/catch')
- acquisition (think 'import/require', and so forth)

The above is just an example of tests that best support software development; they represent how the code behaves out in the wild.

##

Under the premise that we want assurances that our code behaves as expected for our end-users (clients, customers, readers, peers...), test-driven development can be a powerful tool for bridging the gap between a concept and a working model.

Consider the following:

```ts
// path/to/foo.ts
const foo = (bar?: string) => {
  if(!bar) throw new Error('foo expected a parameter')
  return bar;
};
```

By passing the tested function signature directly into `mock.fn`, the mock instance shall inherit the same function signature - including it's parameters and return type:

```ts
import test = require('node:test');
import foo = require('./path/to/foo');

const { describe, it, mock } = test;

describe('the foo() function', () => {

  const mockFoo = mock.fn(foo);

  it('accepts an input', (ctx: test.TestSuite, done) => {
    const barFn = (bar: string) => mockFoo(bar);
    const baz = barFn('this is an input');
    ctx.assert.ok(baz);
    return done();
  });

  it('returns a value', (ctx: test.TestSuite, done) => {
    const bar = mockFoo('baz');
    ctx.assert.ok(bar);
    return done();
  });

  // tbd
  it('throws an error', () => {
    const barFn = (bar: any) => mockFoo(bar);
    ctx.assert.throws(barFn('3.14159'));
    return done();
  })

  mock.reset();

});
```
