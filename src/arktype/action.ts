import type { requiredKeyOf } from "@ark/util";
import {
  scope,
  Type,
  type inferScope,
  type inferTypeRoot,
  type validateTypeRoot,
} from "arktype";
import {
  createCodecs,
  type expectedCodecs,
  type flattenCodecs,
  type validateCodecs,
} from "./codecs.js";
import type { Codec } from "../types/codec.js";
import type { Action } from "../types/action.js";

export type expectedAction<input = unknown, output = unknown> = {
  types?: expectedCodecs;
  input?: input;
  output?: output;
  execute: (args: {
    input: input extends undefined ? never : input;
  }) => Promise<output | Error>;
};

export type validateExecute<
  action,
  $ = "types" extends keyof action
    ? inferScope<flattenCodecs<"decode", action["types"]>>
    : {},
> = (args: {
  input: "input" extends keyof action
    ? Type<inferTypeRoot<action["input"], $>, $>["infer"]
    : never;
}) => Promise<
  "output" extends keyof action
    ? Type<inferTypeRoot<action["output"], $>, $>["infer"] | Error
    : void | Error
>;

// TODO: ensure no extraneous keys, helps with typos
export type validateAction<action> =
  requiredKeyOf<expectedAction> extends keyof action
    ? {
        [k in keyof action]: k extends "types"
          ? // TODO: allow existing codecs from `createCodecs` to be passed in
            validateCodecs<action[k]>
          : k extends "input" | "output"
            ? // TODO: test that these are bidirectional
              validateTypeRoot<
                action[k],
                // TODO: is it necessary to `inferScope` here?
                "types" extends keyof action ? inferScope<action["types"]> : {}
              >
            : k extends "execute"
              ? validateExecute<action>
              : action[k];
      }
    : expectedAction;

export function defineAction<const action>(
  action: validateAction<action>
): action {
  return action as never;
}

export type getCodec<
  codec extends "input" | "output",
  action,
  encodeScope = "types" extends keyof action
    ? inferScope<flattenCodecs<"encode", action["types"]>>
    : {},
  decodeScope = "types" extends keyof action
    ? inferScope<flattenCodecs<"decode", action["types"]>>
    : {},
> = codec extends keyof action
  ? Codec<
      Type<inferTypeRoot<action[codec], encodeScope>, encodeScope>["inferIn"],
      Type<inferTypeRoot<action[codec], decodeScope>, decodeScope>["infer"]
    >
  : never;

export type createAction<action> = Action<
  getCodec<"input", action>,
  getCodec<"output", action>
>;

export function createAction<const action>(
  action: validateAction<action>
): createAction<action> {
  const codecs = createCodecs("types" in action ? action.types : {});
  const encodeScope = scope(codecs.encode);
  const decodeScope = scope(codecs.decode);
  const input =
    "input" in action
      ? {
          encode: encodeScope.type(action.input as never).from,
          decode: decodeScope.type(action.input as never).from,
        }
      : null;
  const output =
    "output" in action
      ? {
          encode: encodeScope.type(action.output as never).from,
          decode: decodeScope.type(action.output as never).from,
        }
      : null;
  return {
    ...(input != null ? { input } : null),
    ...(output != null ? { output } : null),
    // @ts-expect-error
    execute: action.execute,
  } as never;
}
