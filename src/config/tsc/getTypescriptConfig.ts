import type ESBuild = require('esbuild');

const getTypescriptConfig = (): ESBuild.TsconfigRaw => {
  const result: {
    compilerOptions?: {
      alwaysStrict?: boolean;
      baseUrl?: string;
      experimentalDecorators?: boolean;
      importsNotUsedAsValues?: 'remove' | 'preserve' | 'error';
      jsx?:
        | 'preserve'
        | 'react-native'
        | 'react'
        | 'react-jsx'
        | 'react-jsxdev';
      jsxFactory?: string;
      jsxFragmentFactory?: string;
      jsxImportSource?: string;
      paths?: Record<string, string[]>;
      preserveValueImports?: boolean;
      strict?: boolean;
      target?: string;
      useDefineForClassFields?: boolean;
      verbatimModuleSyntax?: boolean;
    };
  } = {} satisfies ESBuild.TsconfigRaw;
  return result;
};

export = getTypescriptConfig;
