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
