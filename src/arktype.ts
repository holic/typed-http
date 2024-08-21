import {
  type,
  type inferAmbient,
  type Type,
  type validateAmbient,
} from "arktype";
import type { Pipe } from "./types/pipe.js";
import type { Action } from "./types/action.js";

export type ArktypePipe<def, t = inferAmbient<def>> = Pipe<
  Type<t>["inferIn"],
  Type<t>["infer"]
>;

export type ArktypeAction<inputDef, outputDef> = Action<
  ArktypePipe<inputDef>,
  ArktypePipe<outputDef>
>;

const t = type({ limit: ["string", "=>", (str) => parseInt(str)] });

export function createPipe<def>(
  def: validateAmbient<def>
): NoInfer<ArktypePipe<def>> {
  const t = type(def);
  return {
    input: {
      accepts: t.allows,
      from(value) {
        const result = t(value);
        return result instanceof type.errors
          ? new AggregateError(result, result.message)
          : result;
      },
    },
    output: {
      accepts(value) {
        return t.allows(value);
      },
      from(value) {
        const result = t(value);
        return result instanceof type.errors
          ? new AggregateError(result, result.message)
          : result;
      },
    },
    pipe: t.from,
  };
}
