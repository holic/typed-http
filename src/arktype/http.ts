import type { ErrorType, Json } from "@ark/util";
import type { InputParams } from "../types/inputParams.js";
import type { inferScope, type } from "arktype";
import type { flattenCodecs } from "./codecs.js";
import { createAction, type validateAction } from "./action.js";

// assumes valid action
export type validateHttpCompatible<
  action,
  types = "types" extends keyof action ? action["types"] : {},
  encode$ = inferScope<flattenCodecs<"encode", types>>,
> = {
  [k in keyof action]: k extends "input"
    ? type.infer.Out<action[k], encode$> extends InputParams
      ? action[k]
      : ErrorType<
          "Action `input` must be able to decode input params with `string` keys and `string` or `string[]` values.",
          [received: type.infer.Out<action[k], encode$>]
        >
    : k extends "output"
      ? type.infer.Out<action[k], encode$> extends Json
        ? action[k]
        : ErrorType<
            "Action `output` must be able to encode to a JSON object or array.",
            [received: action[k]]
          >
      : action[k];
};

export type validateHttpAction<action> = validateAction<action> &
  validateHttpCompatible<action>;

export function defineHttpAction<const action>(
  action: validateHttpAction<action>
): action {
  return action as never;
}

export function createHttpAction<const action>(
  action: validateHttpAction<action>
): createAction<action> {
  return createAction(action as never);
}
