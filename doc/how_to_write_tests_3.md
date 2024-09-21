#

With the testing framework and methodology established, we have legislated some requirements of our code, and can start shaping development cycles according to the needs of these tests.

Previously, we had a simple test suite which expresses a bare minimum of requirements that the `foo()` function should offer to it's consumers.

The implementation file was seperated from the test file, so that we can better simulate being a "blind" consumer, with no 'inside' perspective of how `foo()` works; we only care *that it works* as expected:

```ts
import test = require('node:test');

import foo = require('./path/to/foo')

test.describe('the foo() function', () => {
  test.it('should return a value', (ctx, done) => {
    //
    const baz = foo('bar'); // use 'foo()'
    ctx.assert.ok(baz);     // test the returned value
    return done();          // exit test
  })
})
```

The test is perhaps valid but not thorough. It returns a value, but is the data what we expect it to be?

What do we expect it to be?

This is where Typescript comes in.

Let's conceptualize what data we expect from `foo()`, by creating a *declaration file* using the `*.d.ts` file extension:

```ts
// path/to/foo.d.ts

export = foo;

declare type FooResult = string;

declare const foo: (bar: string) => FooResult;
```

We can go one slightly further by also expressing our function's signature as a type, establishing another requirement of the actual code implementation (still to come):

```ts
// path/to/foo.d.ts

export = foo;

declare type FooResult = string;

declare interface Foo {
  (bar: string): FooResult;
}

declare const foo: Foo;
```

Additionally, `foo()` might accept smome options as another one of it's parameters; it might offer function signature overloads to provide more than one possible signature:

```ts
// path/to/foo.d.ts

export = foo;

declare type FooResult = string;

declare type FooOptions = {
  verbose?: boolean;  // if true, print output to console
  debug?: boolean;    // if true, print input and output to console
}

declare interface Foo {
  (bar: string): FooResult;
  (bar: string, options?: FooOptions): FooResult;
}

declare const foo: Foo;
```

Now, we can take a look at our test plan and begin to write some implementations accordingly, with the types additional contractual bindings to guide us in development:

```ts
import type Foo = require('./path/to/foo');

import test = require('node:test');
import foo = require('./path/to/foo');

const { describe, it, mock } = test;

describe('the foo() function', () => {
  //
  const mockFoo = mock.fn(foo);
  const mockOptions = {
    verbose: false,
    debug: true
  }
  //
  it('accepts a string input', (ctx) => {ç
    let first_param: Parameters<typeof foo>[0];
    ctx.assert.ok(typeof first_param === 'string')
  });
  //
  it('accepts an options object', (ctx) => {ç
    let second_param: Parameters<typeof foo>[1];
    ctx.assert.equal(second_param, mockOptions)
  });
  //
  it('returns a value', (ctx) => {
    const baz = mockFoo('bar');
    ctx.assert.ok(baz satisfies Foo.FooResult);
  });
  //
  it('throws an error', (ctx) => {
    // ...
  });
});
```

*note: the above is psuedo-code and likely won't quite work exactly as shown, although it is close enough to express the general idea using real keywords and semantics - the test files in this project are a more truthful, and therefore expansive, demonstration of the concepts explained in this piece.*

##

The job now, then, is to write code that passes the tests, by adhering to the declared types:

```ts
// path/to/foo.ts

type FooResult = string;

type FooOptions = {
  verbose?: boolean;  // if true, print output to console
  debug?: boolean;    // if true, print input and output to console
}

interface Foo {
  (bar: string): FooResult;
  (bar: string, options?: FooOptions): FooResult;
}

const foo: Foo = (bar: string, options?: FooOptions): FooResult => {
  // implementation goes here... must return a 'FooResult'!
  // return bar;
}

export = foo;
```
