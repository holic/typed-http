import { Type, type inferAmbient, type validateAmbient } from "arktype";
import type { deepFreeze } from "./common.js";
import type { ErrorMessage, Json, show } from "@ark/util";

// TODO: validate inputDef is always an object def or type instance
// TODO: validate outputDef is always an object/array def or type instance
// TODO: allow providing scope with user defined types that can be used in input/output
// TODO: allow for extending with context (or use scope for this?)

/**
 * Serializable data compatible with `URLSearchParams` and `FormData`.
 */
export type InputParams = {
  [param: string]: string | string[];
};

export type validateInput<inputDef> = validateAmbient<inputDef> &
  (Type<inferAmbient<inputDef>>["inferIn"] extends InputParams
    ? unknown
    : ErrorMessage<"Input must be compatible with `URLSearchParams` and `FormData`, i.e. `string` keys and `string` or `string[]` values.">);

export type validateOutput<outputDef> = validateAmbient<outputDef> &
  (Type<inferAmbient<outputDef>>["infer"] extends Json
    ? unknown
    : ErrorMessage<"Output must be JSON serializable.">);

export type executeFn<inputDef, outputDef> = (opts: {
  input: inputDef extends undefined
    ? undefined
    : Type<inferAmbient<inputDef>>["infer"];
}) => Promise<
  outputDef extends undefined
    ? void
    : deepFreeze<Type<inferAmbient<outputDef>>["infer"]>
>;

export type resolveAction<inputDef, outputDef> = {
  readonly input: inputDef;
  readonly output: outputDef;
  readonly execute: executeFn<inputDef, outputDef>;
};

export function defineAction<inputDef, outputDef>(opts: {
  input?: validateInput<inputDef>;
  output?: validateOutput<outputDef>;
  execute: executeFn<inputDef, outputDef>;
}): show<resolveAction<inputDef, outputDef>> {
  return {
    input: opts.input as inputDef,
    output: opts.output as outputDef,
    execute: opts.execute,
  };
}
