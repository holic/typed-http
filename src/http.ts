import { Type, type inferAmbient, type validateAmbient } from "arktype";
import type { deepFreeze } from "./common.js";
import type { ErrorMessage, Json } from "@ark/util";

// TODO: allow providing scope with user defined types that can be used in input/output
// TODO: add context to query

/**
 * Serializable data compatible with `URLSearchParams` and `FormData`.
 */
export type InputParams = {
  [param: string]: string | string[];
};

export type validateInput<input> = validateAmbient<input> &
  (Type<inferAmbient<input>>["inferIn"] extends InputParams
    ? unknown
    : ErrorMessage<"Input must be compatible with `URLSearchParams` and `FormData`, i.e. `string` keys and `string` or `string[]` values.">);

export type validateOutput<output> = validateAmbient<output> &
  (Type<inferAmbient<output>>["infer"] extends Json
    ? unknown
    : ErrorMessage<"Output must be JSON serializable.">);

export type queryFn<input, output> = (opts: {
  input: undefined extends input ? never : Type<inferAmbient<input>>["infer"];
}) => Promise<
  undefined extends output
    ? void
    : deepFreeze<Type<inferAmbient<output>>["infer"]>
>;

export type resolveQuery<input, output> = {
  readonly input?: input;
  readonly output?: output;
  readonly query: queryFn<input, output>;
};

export function defineQuery<input, output>(opts: {
  input?: validateInput<input>;
  output?: validateOutput<output>;
  query: queryFn<input, output>;
}): {
  readonly input?: input;
  readonly output?: output;
  readonly query: queryFn<input, output>;
} {
  return opts as never;
}
