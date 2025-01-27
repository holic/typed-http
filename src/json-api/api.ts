import { flatMorph, type ErrorMessage } from "@ark/util";
import { isRoute, type Route } from "./route.js";
import { notFound } from "./respond.js";
import { createRouteFetcher } from "./createRouteFetcher.js";

// TODO: add way to specify strongly typed route errors

export type Api = {
  // TODO: top-level types/scope
  // TODO: are nested definitions more pain than they're worth?
  readonly [k in string]: Route<any, any, any> | Api;
};

export function defineApi<const api extends Api>(api: api): api {
  return api;
}

// TODO
export type validateApi<api> = api extends Api ? api : Api;

export type createApiClient<api extends Api> = api extends Api
  ? {
      readonly [k in keyof api]: api[k] extends Route<any, any, any>
        ? createRouteFetcher<api[k]["action"]>
        : api[k] extends Api
          ? createApiClient<api[k]>
          : never;
    }
  : ErrorMessage<"Invalid API. Did you validate it first?">;

export function createApiClient<api extends Api>(
  api: validateApi<api>
): createApiClient<api> {
  return flatMorph(api as Api, (k, v) => [
    k,
    isRoute(v) ? createRouteFetcher(v) : createApiClient(v),
  ]) as never;
}

export type createApi<api> = api extends Api
  ? {
      readonly api: api;
      // TODO: make strongly typed
      readonly routes: readonly Route<any, any, any>[];
      // TODO: decide how to handle 404 so this can fall through to other handlers
      readonly handler: (req: Request) => Promise<Response>;
      readonly client: createApiClient<api>;
    }
  : ErrorMessage<"Invalid API. Did you validate it first?">;

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

  const client = createApiClient(api);

  return { api, routes, handler, client } as never;
}
