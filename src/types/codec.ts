import { noSuggest, type conform } from "@ark/util";

const brand = noSuggest("Codec");
type brand = typeof brand;

export type Codec<encoded, decoded> = {
  [brand]: true;
  encode<const value>(value: conform<value, decoded>): encoded | Error;
  decode<const value>(value: conform<value, encoded>): decoded | Error;
};

export type isCodec<t> = t extends Codec<any, any> ? true : false;
// TODO: should I use never or unknown in place of any in generic?
export function isCodec(t: unknown): t is Codec<any, any> {
  return typeof t === "object" && t !== null && brand in t;
}
