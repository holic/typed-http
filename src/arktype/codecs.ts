import { flatMorph } from "@ark/util";
import type { expectedCodec, validateCodec } from "./codec.js";

export type validateCodecs<codecs> = {
  [k in keyof codecs]: validateCodec<codecs[k]>;
};

export type flattenCodecs<op, codecs> = {
  [k in keyof codecs & string as `#${k}`]: op extends keyof codecs[k]
    ? codecs[k][op]
    : never;
} & unknown;

export function flattenCodecs<const op, const codecs>(
  op: "encode" | "decode",
  codecs: validateCodecs<codecs>
): flattenCodecs<op, codecs> {
  return flatMorph(
    codecs as never as { [k: string]: expectedCodec },
    (k, v) => [`#${k}`, v[op]]
  ) as never;
}
