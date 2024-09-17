import util = require("node:util");
import path = require("node:path");
import fs = require("node:fs");

const parseEnv = (proc: NodeJS.Process) => {

  return new Promise<NodeJS.ProcessEnv>((resolveEnv, rejectEnv) => {
      //
  const {
    cwd: getCwd,
    loadEnvFile: loadEnvFile,
  } = proc;
  //
  const cwd = getCwd();
  //
    //
    loadEnvFile(cwd + '/.env');
    //
    return resolveEnv(proc.env)
  }).catch((err) => {
    throw new Error("parseEnv failed", { cause: err })
  });
}

export = parseEnv;

if (require.main === module) {
  parseEnv(process)
    .then(
      (env)     => console.log(env)
    )
    .catch(
      (reason)  => console.error(reason)
    )
}
