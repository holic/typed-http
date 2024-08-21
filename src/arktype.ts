import {
  type,
  type inferAmbient,
  type Type,
  type validateAmbient,
} from "arktype";
import type { includesMorphs } from "arktype/internal/ast.ts";
import { _isShape, type Shape } from "./types/shape.js";
import type { ErrorMessage } from "@ark/util";

export type createShape<def, t = inferAmbient<def>> = Shape<Type<t>["infer"]>;

export function createShape<const def, t = inferAmbient<def>>(
  def: validateAmbient<def> & includesMorphs<t> extends false
    ? def
    : ErrorMessage<"Shape types must be pure and contain no morphs.">
): createShape<def, t> {
  const t = type(def as any);
  return {
    [_isShape]: true,
    accepts: t.allows,
    from(input) {
      const output = t(input);
      return output instanceof type.errors
        ? new AggregateError(output)
        : output;
    },
  };
}
