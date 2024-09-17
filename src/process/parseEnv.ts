type ParseEnvOptions = {
  sync?: true | false;
};

interface parseEnv {
  default?(proc: NodeJS.Process): Promise<NodeJS.ProcessEnv>;
  (proc: NodeJS.Process): Promise<NodeJS.ProcessEnv>;
  (proc: NodeJS.Process, options?: ParseEnvOptions): Promise<NodeJS.ProcessEnv>;
}

interface parseEnvSync {
  default?(proc: NodeJS.Process): NodeJS.ProcessEnv;
  (proc: NodeJS.Process): NodeJS.ProcessEnv;
  (proc: NodeJS.Process, options?: ParseEnvOptions): NodeJS.ProcessEnv;
}

const parseEnv: parseEnv = (
  proc: NodeJS.Process,
  options?: ParseEnvOptions
) => {
  //

  //
  const { cwd: getCwd, loadEnvFile: loadEnvFile, env } = proc;
  //
  const cwd = getCwd();
  // //
  // const nodeEnv = env['NODE_ENV'];
  //

  //
  const result = new Promise<NodeJS.ProcessEnv>((resolveEnv, rejectEnv) => {
    //
    loadEnvFile(cwd + '/.env');
    //
    return resolveEnv(env);
  }).catch((err) => {
    throw err;
  });
  //

  //
  return result;
};

export = parseEnv;

if (require.main === module) {
  ((proc: NodeJS.Process, options: ParseEnvOptions) => {
    parseEnv(proc, options)
      .then((env) => {
        console.log(env);
        return env;
      })
      .catch((reason) => {
        console.error(reason);
        throw reason;
      });
  })(global.process, { sync: true });
}
