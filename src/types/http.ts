import type { ErrorMessage, Json } from "@ark/util";
import type { InputParams } from "../inputParams.js";
import type { Codec } from "./codec.js";

export type validateHttpAction<action> = {
  [k in keyof action]: k extends "input"
    ? action[k] extends Codec<infer encoded, any>
      ? encoded extends InputParams
        ? action[k]
        : ErrorMessage<"Action must be able to encode `URLSearchParams` and `FormData` with `string` keys and `string` or `string[]` values.">
      : ErrorMessage<"Action `input` was not a Codec.">
    : k extends "output"
      ? action[k] extends Codec<any, infer decoded>
        ? decoded extends Json
          ? action[k]
          : ErrorMessage<"Action must be able to decode a JSON serializable object or array.">
        : ErrorMessage<"Action `input` was not a Codec.">
      : action[k];
};

export function defineHttpAction<const action>(
  action: validateHttpAction<action>
): action {
  return action as never;
}
