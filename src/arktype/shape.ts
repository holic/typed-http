import {
  type,
  type inferAmbient,
  type Type,
  type validateAmbient,
} from "arktype";
import type { includesMorphs } from "arktype/internal/ast.ts";
import { _isShape, type Shape } from "../types/shape.js";
import type { ErrorMessage } from "@ark/util";

export type validateDef<def> =
  includesMorphs<inferAmbient<def>> extends false
    ? def
    : ErrorMessage<"Type def must be pure and contain no morphs.">;

export type createShape<def> = Shape<Type<inferAmbient<def>>["infer"]>;

export function createShape<const def>(
  def: validateAmbient<def> & validateDef<def>
): createShape<def> & { readonly t: Type<inferAmbient<def>> } {
  const t = type(def as any);
  return {
    // TODO: move symbol tag to some generic `createShape` helper?
    [_isShape]: true,
    t: t as never,
    accepts: t.allows,
    from(input) {
      const output = t(input);
      return output instanceof type.errors
        ? new AggregateError(output)
        : output;
    },
  };
}
