import type { Json } from "@ark/util";
import type { Action } from "../types/action.js";
import type { Codec } from "../types/codec.js";
import type { InputParams } from "../types/inputParams.js";

export const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type methods = typeof methods;

export type Method = methods[number];

export type RoutePath = `/${string}`;

export type RouteAction = Action<
  Codec<InputParams, unknown>,
  Codec<Json, unknown>
>;

export type RouteHandler = (req: Request) => Promise<Response | null>;
