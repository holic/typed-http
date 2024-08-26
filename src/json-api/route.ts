import type { Json } from "@ark/util";
import { has } from "../common.js";
import { toInputParams, type InputParams } from "../types/inputParams.js";
import type { Action } from "../types/action.js";
import type { Codec } from "../types/codec.js";
import * as respond from "./respond.js";

export const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

export function createRequestHandler({
  action,
}: {
  action: Action<Codec<InputParams, unknown>, Codec<Json, unknown>>;
}): (req: Request) => Promise<Response> {
  return async function handler(req: Request) {
    const method = req.method.toUpperCase();
    if (!has(methods, method)) {
      // TODO: return/throw instead so outer handler can manage this?
      return respond.error(new Error("Method not implemented."), {
        status: 501,
      });
    }

    const inputParams = async (): Promise<InputParams> => {
      switch (method) {
        case "GET":
        case "DELETE": {
          const url = new URL(req.url);
          return toInputParams(url.searchParams);
        }
        case "POST":
        case "PUT":
        case "PATCH": {
          if (!req.body) return {};

          // TODO: enforce Content-Type: multipart/form-data or application/x-www-form-urlencoded"
          // TODO: support multipart
          const chunks = req.body.pipeThrough(new TextDecoderStream()).values();
          let body = "";
          for await (const chunk of chunks) {
            body += chunk;
          }

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
