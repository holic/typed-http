import pathToRegexp from "path-to-regexp";
import type { Method, RouteAction, RoutePath } from "./common.js";

export type RouteFetcherOptions = { baseUrl?: string | URL };

// TODO: in case we get `never` in optional input/output, we can use this helper
// type get<t, k> = k extends keyof t ? t[k] : undefined;

export type createRouteFetcher<action extends RouteAction> = (
  ...args: [...Parameters<action["execute"]>, options?: RouteFetcherOptions]
) => Promise<Awaited<ReturnType<action["execute"]>>>;

// action["input"] extends undefined
//   ? (
//       options?: RouteFetcherOptions
//     ) => Promise<"output" extends keyof action ? action["output"] : void>
//   : (
//       input: action["input"],
//       options?: RouteFetcherOptions
//     ) => Promise<"output" extends keyof action ? action["output"] : void>;

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
  defaultOptions: RouteFetcherOptions = {}
): createRouteFetcher<action> {
  const toPath = pathToRegexp.compile(path);
  return async function routeFetcher(...args) {
    const encodedInput = action.input
      ? action.input.encode(args.shift() as never)
      : {};
    const options = {
      ...defaultOptions,
      ...(args.shift() ?? {}),
    };

    const baseUrl = options.baseUrl ?? "";
    const url = `${baseUrl}${toPath(encodedInput)}`;
    // TODO: append remaining input as query params (for GET/DELETE) or as form body (for POST/PUT/PATCH)

    const res = await fetch(url, {
      method,
    });
    const body = await res.text();

    const encodedOutput =
      res.headers.get("Content-Type") === "application/json"
        ? JSON.parse(body)
        : null;

    // TODO: cast to error output type from route handler
    if (encodedOutput != null && encodedOutput.error) {
      // TODO: better error?
      // https://github.com/wevm/viem/blob/1b5e775c51144c20172103472d0b82069ce6dece/src/errors/request.ts
      throw new Error(encodedOutput.error);
    }
    // TODO: throw for other non-200 statuses?

    return action.output?.decode(encodedOutput) as never;
  };
}
