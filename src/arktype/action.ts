import type { ErrorMessage, ErrorType, requiredKeyOf } from "@ark/util";
import {
  scope,
  Type,
  type inferScope,
  type inferTypeRoot,
  type validateTypeRoot,
} from "arktype";
import { flattenCodecs } from "./codecs.js";
import type { Codec } from "../types/codec.js";
import type { Action } from "../types/action.js";
import {
  createCodec,
  type expectedCodec,
  type validateCodec,
} from "./codec.js";
import type { distillIn, distillOut, validate } from "./utils.js";

export type expectedAction<input = unknown, output = unknown> = {
  types?: { [k: string]: expectedCodec };
  input?: input;
  output?: output;
  execute: (args: {
    input: input extends undefined ? never : input;
  }) => Promise<output | Error>;
};

export type validateTypes<types> = {
  [k in keyof types]: validateCodec<types[k]>;
};

export type validateBidirectional<def, encode$, decode$> = [
  distillIn<def, encode$>,
  distillOut<def, encode$>,
] extends [distillOut<def, decode$>, distillIn<def, decode$>]
  ? def
  : ErrorMessage<`Type definition should be bidirectional. Try replacing your morphs with codecs?`>;

// assumes validated types
export type validateDef<
  def,
  types = {},
  encode$ = inferScope<flattenCodecs<"encode", types>>,
  decode$ = inferScope<flattenCodecs<"decode", types>>,
> = validate<
  def,
  [
    validateTypeRoot<def, encode$>,
    validateTypeRoot<def, decode$>,
    validateBidirectional<def, encode$, decode$>,
  ]
>;

// assumes validated def, types
export type inferDef<
  def,
  types = {},
  encode$ = inferScope<flattenCodecs<"encode", types>>,
> = Codec<distillOut<def, encode$>, distillIn<def, encode$>>;

// assumes validated types, input, output
export type validateExecute<
  action,
  types = "types" extends keyof action ? action["types"] : {},
  encode$ = inferScope<flattenCodecs<"encode", types>>,
> = (args: {
  input: "input" extends keyof action
    ? Type<inferTypeRoot<action["input"], encode$>, encode$>["infer"]
    : never;
}) => Promise<
  "output" extends keyof action
    ? Type<inferTypeRoot<action["output"], encode$>, encode$>["infer"]
    : void
>;

export type validateAction<action> =
  requiredKeyOf<expectedAction> extends keyof action
    ? {
        [k in keyof action]: k extends "types"
          ? validateTypes<action[k]>
          : k extends "input" | "output"
            ? validateDef<
                action[k],
                "types" extends keyof action ? action["types"] : {}
              >
            : k extends "execute"
              ? validateExecute<action>
              : ErrorType<
                  "Invalid key.",
                  [expected: "types" | "input" | "output" | "execute"]
                >;
      }
    : expectedAction;

export function defineAction<const action>(
  action: validateAction<action>
): action {
  return action as never;
}

export type createAction<
  action,
  types = "types" extends keyof action ? action["types"] : {},
> = Action<
  "input" extends keyof action ? inferDef<action["input"], types> : never,
  "output" extends keyof action ? inferDef<action["output"], types> : never
>;

export function createAction<const action>(
  _action: validateAction<action>
): createAction<action> {
  const action = _action as never as expectedAction;
  const types = "types" in action ? action.types : {};

  const encode$ = scope(flattenCodecs("encode", types));
  const decode$ = scope(flattenCodecs("decode", types));

  const input =
    "input" in action
      ? createCodec({
          encode: encode$.type(action.input as never),
          decode: decode$.type(action.input as never),
        })
      : null;

  const output =
    "output" in action
      ? createCodec({
          encode: encode$.type(action.output as never),
          decode: decode$.type(action.output as never),
        })
      : null;

  return {
    ...(input != null ? { input } : null),
    ...(output != null ? { output } : null),
    execute: action.execute,
  } as never;
}
