import { ArkErrors, type } from "arktype";
import type { inferAction } from "./action.js";
import { has, type inner } from "./common.js";
import { toInputParams } from "./types/inputParams.js";

// TODO: add support for ArkErrors
export class RequestHandlerError extends Error {}

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

function getMethod(
  _method: string
): inner<typeof methods> | RequestHandlerError {
  const method = _method.toUpperCase();
  if (!has(methods, method)) {
    return new RequestHandlerError(`Request method "${method}" not supported.`);
  }
  return method;
}

export function createRequestHandler<input, output>(opts: {
  action: inferAction<input, output>;
}): (req: Request) => Promise<Response | RequestHandlerError> {
  return async function handler(req: Request) {
    const res = new Response();

    const method = getMethod(req.method);
    if (method instanceof RequestHandlerError) return method;

    const input = (() => {
      if (!opts.action.input) return;
      // TODO: should we avoid doing this on every request?
      // TODO: return type instance as action input instead of the definition
      const parseInput = type(opts.action.input);

      if (method === "GET") {
        const url = new URL(req.url);
        // TODO: figure out how to get parseInput to validate params type
        const input = parseInput(toInputParams(url.searchParams));
        if (input instanceof ArkErrors) {
          // TODO: wrap ArkErrors to display the nicely here
          return new RequestHandlerError(
            "Query parameters did not match expected input."
          );
        }
        return input;
      }

      // TODO: parse body as form data
      // TODO: parse body as json
    })();

    // TODO: figure out how we can get proper types without casting
    const output = await opts.action.execute({ input });
    return res;
  };
}
