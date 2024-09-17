/**
 * @file parseEnv.d.ts
 *
 */

declare type ParseEnvOptions = {
  sync?: true | false;
};

declare interface parseEnv {
  default?(proc: NodeJS.Process): Promise<NodeJS.ProcessEnv>;
  (proc: NodeJS.Process): Promise<NodeJS.ProcessEnv>;
  (proc: NodeJS.Process, options?: ParseEnvOptions): Promise<NodeJS.ProcessEnv>;
}

declare interface parseEnvSync {
  default?(proc: NodeJS.Process): NodeJS.ProcessEnv;
  (proc: NodeJS.Process): NodeJS.ProcessEnv;
  (proc: NodeJS.Process, options?: ParseEnvOptions): NodeJS.ProcessEnv;
}

/**
 *
 * @param proc
 * @param options
 * @returns
 */
declare const parseEnv: parseEnv;

export = parseEnv;

// declare const parseEnvSync: (proc: NodeJS.Process) => NodeJS.ProcessEnv;
