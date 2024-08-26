import { noSuggest, type conform } from "@ark/util";
import type { Shape } from "./shape.js";

const brand = noSuggest("Codec");
type brand = typeof brand;

export type Codec<encoded, decoded> = {
  [brand]: undefined;
  encoded: Shape<encoded>;
  decoded: Shape<decoded>;
  encode<const value>(value: conform<value, decoded>): encoded;
  decode<const value>(value: conform<value, encoded>): decoded;
};

export type isCodec<t> = t extends Codec<any, any> ? true : false;
// TODO: should I use never or unknown in place of any in generic?
export function isCodec(t: unknown): t is Codec<any, any> {
  return typeof t === "object" && t !== null && brand in t;
}

export function defineCodec<const codec extends Omit<Codec<any, any>, brand>>(
  codec: codec
): codec & { [brand]: undefined } {
  return { ...codec, [brand]: undefined };
}
