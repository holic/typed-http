import type { ErrorMessage } from "@ark/util";
import { isRoute, type Route } from "./route.js";
import { notFound } from "./respond.js";

export type Api = {
  // TODO: top-level types/scope
  // TODO: are nested definitions more pain than they're worth?
  readonly [k in string]: Route<any, any, any> | Api;
};

export function defineApi<const api extends Api>(api: api): api {
  return api;
}

export type validateApi<api> = api extends Api ? api : Api;
export type createApi<api> = api extends Api
  ? {
      readonly api: api;
      // TODO: make strongly typed
      readonly routes: readonly Route<any, any, any>[];
      // TODO: decide how to handle 404 so this can fall through to other handlers
      readonly handler: (req: Request) => Promise<Response>;
      // TODO: client, map of api -> fetcher
    }
  : ErrorMessage<"Invalid route. Did you validate it first?">;

export function createApi<const api>(api: validateApi<api>): createApi<api> {
  const routes = Object.values(api).reduce(
    function flatten(routes, entry): readonly Route<any, any, any>[] {
      if (isRoute(entry)) return [...routes, entry];
      return Object.values(entry).reduce(flatten, routes);
    },
    [] as readonly Route<any, any, any>[]
  );

  async function handler(req: Request): Promise<Response> {
    for (const route of routes) {
      const res = await route.handler(req);
      if (res) return res;
    }
    return notFound();
  }

  // TODO: client
  return { api, routes, handler } as never;
}
