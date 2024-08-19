import type { inferAmbient, validateAmbient } from "arktype";
import type { deepFreeze } from "./common.js";

// TODO: allow providing scope with user defined types that can be used in input/output
// TODO: add context to query

type queryFn<input, output> = undefined extends input
  ? (opts?: {}) => Promise<deepFreeze<inferAmbient<output>>>
  : (opts: { input: input }) => Promise<deepFreeze<inferAmbient<output>>>;

export function defineQuery<input, output>(opts: {
  // TODO: constrain to something compatible with URLSearchParams
  input?: validateAmbient<input>;
  // TODO: constrain to Json
  output: validateAmbient<output>;
  query: NoInfer<queryFn<input, output>>;
}): typeof opts.query {
  return opts.query;
}
