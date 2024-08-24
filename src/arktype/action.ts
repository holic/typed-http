import type { requiredKeyOf } from "@ark/util";
import {
  Type,
  type,
  type inferScope,
  type inferTypeRoot,
  type validateTypeRoot,
} from "arktype";
import {
  type expectedCodecs,
  type flattenCodecs,
  type validateCodecs,
} from "./codecs.js";

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

export type validateAction<action> =
  requiredKeyOf<expectedAction> extends keyof action
    ? {
        [k in keyof action]: k extends "types"
          ? // TODO: allow existing codecs from `createCodecs` to be passed in
            validateCodecs<action[k]>
          : k extends "input" | "output"
            ? validateTypeRoot<
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
