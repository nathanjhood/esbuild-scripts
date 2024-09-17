export = parseEnv;

declare const parseEnv: (proc: NodeJS.Process) => Promise<NodeJS.ProcessEnv>

declare const parseEnvSync: (proc: NodeJS.Process) => NodeJS.ProcessEnv;
