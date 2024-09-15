/**
 * @file prettier.config.mjs
 * @author Nathan J. Hood <nathanjhood@googlemail.com>
 * @brief
 * @version 0.1.0
 * @date 2024-09-05
 *
 * @copyright Copyright (c) 2024
 *
 */

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: 'es5',
  /** '.editorconfig' sets the below, don't set these here: */
  // tabWidth: 2,
  // useTabs: false,
  // printWidth: 80,
  // endOfLine: "lf",
  /** custom */
  semi: true,
  singleQuote: true,
  // parser: 'babel', // inferred from environment
};

export default config;
