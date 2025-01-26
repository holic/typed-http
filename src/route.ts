import type { Json } from "@ark/util";
import type { Method, RoutePath } from "./json-api/common.js";
import type { Action } from "./types/action.js";
import type { Codec } from "./types/codec.js";
import type { InputParams } from "./types/inputParams.js";

export type Route<method, path, action> = {
  method: method;
  path: path;
  action: action;
};

export function bindMethod<const method extends Method>(
  method: method
): <
  const path extends RoutePath,
  const action extends Action<
    Codec<InputParams, unknown>,
    Codec<Json, unknown>
  >,
>(
  path: path,
  action: action
) => Route<method, path, action> {
  return (path, action) => ({ method, path, action: action });
}

export const get = bindMethod("GET");
export const post = bindMethod("POST");
export const patch = bindMethod("PATCH");
export const put = bindMethod("PUT");
export const del = bindMethod("DELETE");
