import type { conform } from "@ark/util";
import type { Shape } from "./shape.js";

export const _isCodec = Symbol("isCodec");
export type _isCodec = typeof _isCodec;

export type Codec<encoded, decoded> = {
  encoded: Shape<encoded>;
  decoded: Shape<decoded>;
  encode<const value>(value: conform<value, decoded>): encoded | Error;
  decode<const value>(value: conform<value, encoded>): decoded | Error;
};

export type isCodec<t> = t extends Codec<any, any> ? true : false;
export function isCodec(t: unknown): t is Codec<unknown, unknown> {
  return typeof t === "object" && t !== null && _isCodec in t;
}
