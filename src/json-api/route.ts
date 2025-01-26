import { flatMorph } from "@ark/util";
import { toInputParams, type InputParams } from "../types/inputParams.js";
import * as respond from "./respond.js";
import pathToRegexp from "path-to-regexp";
import {
  type Method,
  type RouteAction,
  type RouteHandler,
  type RoutePath,
} from "./common.js";
import { isArkError, RouteHandlerError } from "./errors.js";

export function createRouteHandler({
  method,
  path,
  action,
}: {
  method: Method;
  path: RoutePath;
  action: RouteAction;
}): RouteHandler {
  const matchPath = pathToRegexp.match(path);
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

    try {
      const input = await (async () => {
        if (!action.input) return;
        const encodedInput = await inputParams();
        try {
          return action.input.decode(encodedInput);
        } catch (error) {
          if (isArkError(error)) {
            throw new RouteHandlerError({
              status: 400,
              message: "Could not decode request input params.",
              cause: error,
            });
          }
          throw error;
        }
      })();

      const output = await action.execute({ input });
      // TODO: check if we got output but no output codec?
      const body = action.output ? action.output.encode(output) : undefined;

      return respond.ok(body);
    } catch (error) {
      return respond.error(
        error instanceof RouteHandlerError
          ? error
          : new RouteHandlerError({
              status: 500,
              message: "Unexpected error while processing request.",
              cause: error,
            })
      );
    }
  };
}
