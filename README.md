# esbuild-scripts

esbuild-flavoured `react-scripts`.

## Usage

This repository is intended to be consumed as an ECMAscript module via being an npm package. It's main purpose is provide Javascript/Typescript projects targeting browsers and/or NodeJS with some simple commands for developing projects with libraries and frameworks such as React and React Native Web.

Once complete, the installed `esbuild-scripts` package will provide a simple command-line interface which exposes four primary commands: `build` for bundling the application, `test` for running unit test files found in the project, `start` for running a local development server with modern features such as hot reloading/fast-refresh and error overlay middleware, and `init` for quickly drafting up a new project from a chosen template. Additionally, `eject` *might* also provided, which transforms the application into a deployable bundle, containing the scripts described above, along with other dependencies.

For the time being while working towards a suitable `v0.0.1` baseline, a fully-working draft of this entire project, including the four commands *and* react/react-native-web project templates, can be found at:

- [`ts-esbuild-react`](https://github.com/nathanjhood/ts-esbuild-react) - A react app template uing esbuild and Typescript, with working version of all four scripts
- [`ts-esbuild-react-native-web`](https://github.com/nathanjhood/ts-esbuild-react-native-web) - A react app template uing esbuild and Typescript *and* React Native Web, with working version of all four scripts
- [`nathanjhood.github.io`](https://github.com/nathanjhood/nathanjhood.github.io) - my under-construction GitHub page, which is the intended final consumer of `esbuild-scripts`, and was created from the `ts-esbuild-react-native-web` template; it shall mostly resemble the template but serve as an eventual landing page, linking together all of my individual GitHub Pages under one root URL

*this repository has been created as a means to centralize further extended development of the concepts demonstrated in the above-mentioned projects. In time, their script contents shall be replaced with `esbuild-scripts`.

---

## Motivations

Personal gains. I am very interested in improving my knowledge and skills in the following areas;

- getting to the bottom of the `commonjs`/`module` paradigm
- deeper understanding of modern transpilers and bundlers
- deeper integration with React Native Web
- NodeJS test runner and v8 coverage reporting
- extending esbuild with plugins

More specifically, I am really intrigued at how 'close to the metal' one can get in terms of minimal dependencies in a NodeJS web-facing project; relying on as many standard globals and universal syntaxes as possible, to create a bedrock for developing further projects atop of.

I had considered - even, began an attempt at - doing this for metro in place of esbuild, so that I can target React Native directly. However, as of writing, metro does not quite make sense in a project which *only* intends to go as far as the browser, rather than a full native app.

There is some inclination here to write the final Javascript by hand with JSDoc support, *if* the transpiling/bundling of Typescript is not able to provide the desired output. Close attention must be paid to the syntax being used going in, and the syntax coming out, when transpiling.

I look forward to updating this documentation shortly with actual usage instructions and less concepts; readers, please take a look at the above-mentioned projects for a better glimpse of actual working functionality, until the initial `esbuild-scripts` baseline version is established.

---
