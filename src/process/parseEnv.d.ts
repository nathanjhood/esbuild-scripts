export = parseEnv;

declare const parseEnv: (process: NodeJS.Process) => Promise<NodeJS.ProcessEnv>
