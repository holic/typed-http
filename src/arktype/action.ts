import type { ErrorMessage, ErrorType, requiredKeyOf } from "@ark/util";
import { scope, type type } from "arktype";
import { flattenCodecs } from "./codecs.js";
import type { Codec } from "../types/codec.js";
import { defineAction } from "../types/action.js";
import {
  createCodec,
  type expectedCodec,
  type validateCodec,
} from "./codec.js";

export type expectedAction = {
  types?: { [k: string]: expectedCodec };
  input?: any;
  output?: any;
  execute: (args: { input: any }) => Promise<any>;
};

export type validateTypes<types> = {
  [k in keyof types]: validateCodec<types[k]>;
};

export type validateBidirectional<def, encode$, decode$> = [
  type.infer.In<def, encode$>,
  type.infer.Out<def, encode$>,
] extends [type.infer.Out<def, decode$>, type.infer.In<def, decode$>]
  ? def
  : ErrorMessage<`Type definition should be bidirectional. Try replacing your morphs with codecs?`>;

// assumes validated types
export type validateDef<
  def,
  types = {},
  encode$ = scope.infer<flattenCodecs<"encode", types>>,
  decode$ = scope.infer<flattenCodecs<"decode", types>>,
> = type.validate<def, encode$> &
  type.validate<def, decode$> &
  validateBidirectional<def, encode$, decode$>;

// assumes validated def, types
export type inferDef<
  def,
  types = {},
  encode$ = scope.infer<flattenCodecs<"encode", types>>,
> = Codec<type.infer.Out<def, encode$>, type.infer.In<def, encode$>>;

// assumes validated types, input, output
export type expectedExecute<
  action,
  types = "types" extends keyof action ? action["types"] : {},
  encode$ = scope.infer<flattenCodecs<"encode", types>>,
> = (args: {
  input: "input" extends keyof action
    ? type.infer.In<action["input"], encode$>
    : never;
}) => Promise<
  "output" extends keyof action
    ? type.infer.In<action["output"], encode$>
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
              ? expectedExecute<action>
              : ErrorType<
                  "Invalid key.",
                  [expected: "types" | "input" | "output" | "execute"]
                >;
      }
    : expectedAction;

export type createAction<
  action,
  types = "types" extends keyof action ? action["types"] : {},
> = "execute" extends keyof action
  ? defineAction<{
      input: "input" extends keyof action
        ? inferDef<action["input"], types>
        : never;
      output: "output" extends keyof action
        ? inferDef<action["output"], types>
        : never;
      execute: expectedExecute<action>;
    }>
  : ErrorMessage<"Invalid action. Did you validate it first?">;

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
          encode: encode$.type(action.input),
          decode: decode$.type(action.input),
        })
      : null;

  const output =
    "output" in action
      ? createCodec({
          encode: encode$.type(action.output),
          decode: decode$.type(action.output),
        })
      : null;

  return defineAction({
    ...(input != null ? { input } : null),
    ...(output != null ? { output } : null),
    execute: action.execute,
  }) as never;
}
