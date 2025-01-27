import { type ErrorMessage, type requiredKeyOf } from "@ark/util";
import type { Method, RouteAction, RouteHandler, RoutePath } from "./common.js";
import { createRouteHandler } from "./createRouteHandler.js";
import { createRouteFetcher } from "./createRouteFetcher.js";

const brand = Symbol("Route");
type brand = typeof brand;

export type expectedRoute = { method: any; path: any; action: any };

export type Route<
  method extends Method,
  path extends RoutePath,
  action extends RouteAction,
> = {
  // Route is branded because it can live in a deeply nested object and
  // it needs to be easily detected at runtime.
  // TODO: would it be better to use `class Route` and `instanceof` instead?
  //       or would it be better to just check if each property is there?
  readonly [brand]: true;
  readonly method: method;
  readonly path: path;
  readonly action: action;
  readonly handler: RouteHandler;
  readonly fetch: createRouteFetcher<action>;
};

// TODO: validate
export function defineRoute<
  const route extends Omit<Route<any, any, any>, brand>,
>(route: route): route & { [brand]: true } {
  return { ...route, [brand]: true };
}

export type isRoute<t> = t extends Route<any, any, any> ? true : false;
// TODO: should I use never or unknown in place of any in generic?
export function isRoute(t: unknown): t is Route<any, any, any> {
  return typeof t === "object" && t !== null && brand in t;
}

export type validateRoute<route> =
  requiredKeyOf<expectedRoute> extends keyof route
    ? {
        [k in keyof route]: k extends "method"
          ? route[k] extends Method
            ? route[k]
            : Method
          : k extends "path"
            ? route[k] extends RoutePath
              ? route[k]
              : RoutePath
            : k extends "action"
              ? route[k] extends RouteAction
                ? route[k]
                : RouteAction
              : route[k];
      }
    : expectedRoute;

export type createRoute<route> = route extends expectedRoute
  ? Route<route["method"], route["path"], route["action"]>
  : ErrorMessage<"Invalid route. Did you validate it first?">;

export function createRoute<const route>(
  _route: validateRoute<route>
): createRoute<route> {
  const route = _route as expectedRoute;
  return defineRoute({
    ...route,
    handler: createRouteHandler(route),
    fetch: createRouteFetcher(route) as never,
  }) as never;
}

function bindMethod<const method extends Method>(
  method: method
): <const path extends RoutePath, const action extends RouteAction>(
  path: path,
  action: action
) => Route<method, path, action> {
  return (path, action) => createRoute({ method, path, action });
}

export const get = bindMethod("GET");
export const post = bindMethod("POST");
export const patch = bindMethod("PATCH");
export const put = bindMethod("PUT");
export const del = bindMethod("DELETE");
