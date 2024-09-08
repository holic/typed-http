import { flatMorph, type Json } from "@ark/util";
import { toInputParams, type InputParams } from "../types/inputParams.js";
import type { Action } from "../types/action.js";
import type { Codec } from "../types/codec.js";
import * as respond from "./respond.js";
import pathToRegexp from "path-to-regexp";
import type { Method } from "./common.js";

export function createRoute({
  method,
  route,
  action,
}: {
  method: Method;
  route: string;
  action: Action<Codec<InputParams, unknown>, Codec<Json, unknown>>;
}): (req: Request) => Promise<Response | null> {
  const matchPath = pathToRegexp.match(route);
  return async function handler(req: Request) {
    if (req.method.toUpperCase() !== method) return null;

    const url = new URL(req.url);
    // TODO: handle errors from matching path
    const match = matchPath(url.pathname);
    if (match === false) return null;

    const inputParams = async (): Promise<InputParams> => {
      switch (method) {
        case "GET":
        case "DELETE": {
          return {
            ...toInputParams(url.searchParams),
            // TODO: warn/error when encountering query params that overlap with URL params?
            ...flatMorph(match.params, (name, value) =>
              value === undefined ? [] : [name, value]
            ),
          };
        }
        case "POST":
        case "PUT":
        case "PATCH": {
          if (!req.body) return {};
          // TODO: enforce Content-Type: multipart/form-data or application/x-www-form-urlencoded
          // TODO: support multipart
          const body = await req.text();
          return toInputParams(new URLSearchParams(body));
        }
      }
    };

    const input = action.input
      ? // TODO: try/catch
        action.input.decode(await inputParams())
      : undefined;
    const output = await action.execute({ input });
    // TODO: check if we got output but no output codec?
    const body = action.output ? action.output.encode(output) : undefined;

    return respond.ok(body);
  };
}
