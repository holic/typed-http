import { type Json } from "@ark/util";
import type { Method, RoutePath } from "./json-api/common.js";
import type { Action } from "./types/action.js";
import type { Codec } from "./types/codec.js";
import type { InputParams } from "./types/inputParams.js";

const brand = Symbol("Route");
type brand = typeof brand;

export type Route<method, path, action> = {
  // Route is branded because it can live in a deeply nested object and it needs to be easy to detect.
  readonly [brand]: true;
  readonly method: method;
  readonly path: path;
  readonly action: action;
};

// TODO: validate
export function defineRoute<
  const route extends Omit<Route<any, any, any>, brand>,
>(route: route): route & { [brand]: true } {
  return { ...route, [brand]: true };
}

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
  return (path, action) => defineRoute({ method, path, action });
}

export const get = bindMethod("GET");
export const post = bindMethod("POST");
export const patch = bindMethod("PATCH");
export const put = bindMethod("PUT");
export const del = bindMethod("DELETE");
