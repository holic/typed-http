import type { Route } from "./route.js";

export type Api = {
  readonly [k in string]: Route<any, any, any> | Api;
};

export function defineApi<const api extends Api>(api: api): api {
  return api;
}
