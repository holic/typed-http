import pathToRegexp from "path-to-regexp";
import type { Method, RouteAction, RoutePath } from "./common.js";

export type RouteFetcherOptions = { baseUrl?: string | URL };

// TODO: in case we get `never` in optional input/output, we can use this helper
// type get<t, k> = k extends keyof t ? t[k] : undefined;

// TODO: add fetcher options
export type createRouteFetcher<action extends RouteAction> = action["execute"];
// (
//   ...args: "input" extends action["input"]
//     ? [input: action["input"], options?: RouteFetcherOptions]
//     : [options?: RouteFetcherOptions]
// ) => Promise<action["output"] extends undefined ? action["output"] : void>;

export function createRouteFetcher<const action extends RouteAction>(
  {
    method,
    path,
    action,
  }: {
    method: Method;
    path: RoutePath;
    action: action;
  },
  defaultOptions?: RouteFetcherOptions
): createRouteFetcher<action> {
  const toPath = pathToRegexp.compile(path);
  return async function routeFetcher(...args) {
    const encodedInput = action.input ? action.input.encode(args.shift()) : {};
    const options = args.shift() as RouteFetcherOptions | undefined;

    const baseUrl = options?.baseUrl ?? defaultOptions?.baseUrl ?? "";
    const url = `${baseUrl}${toPath(encodedInput)}`;
    // TODO: append remaining input as query params (for GET/DELETE) or as form body (for POST/PUT/PATCH)

    const res = await fetch(url, {
      method,
    });
    const body = await res.text();

    const encodedOutput =
      res.headers.get("Content-Type") === "application/json"
        ? JSON.parse(body)
        : undefined;

    // TODO: cast to error output type from route handler
    if (encodedOutput && encodedOutput.error) {
      // TODO: better error?
      throw new Error(encodedOutput.error);
    }
    // TODO: throw for other non-200 statuses?

    return action.output?.decode(encodedOutput);
  };
}
