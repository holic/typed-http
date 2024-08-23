import { type validateAmbient } from "arktype";
import { flatMorph, type show } from "@ark/util";

export type expectedCodec = { encode: any; decode: any };
export type codecKeys = keyof expectedCodec;

export type validateCodec<codec> = "encode" | "decode" extends keyof codec
  ? Omit<keyof codec, "encode" | "decode"> extends never
    ? validateAmbient<codec>
    : expectedCodec
  : expectedCodec;

export type validateCodecs<codecs> = {
  [k in keyof codecs]: validateCodec<codecs[k]>;
};

export function defineCodecs<const codecs>(
  codecs: validateCodecs<codecs>
): codecs {
  return codecs as never;
}

export type flattenCodecs<op, codecs> = {
  [k in keyof codecs & string as `#${k}`]: op extends keyof codecs[k]
    ? codecs[k][op]
    : never;
};

export function flattenCodecs<const op, const codecs>(
  op: [op] extends ["encode"] | ["decode"] ? op : "encode" | "decode",
  codecs: validateCodecs<codecs>
): show<flattenCodecs<op, codecs>> {
  return flatMorph(codecs as never, (k, v) => [
    `#${k}`,
    v[op as never],
  ]) as never;
}

export function createCodecs<const codecs>(codecs: validateCodecs<codecs>): {
  readonly encode: show<flattenCodecs<"encode", codecs>>;
  readonly decode: show<flattenCodecs<"decode", codecs>>;
} {
  return {
    encode: flattenCodecs("encode", codecs) as never,
    decode: flattenCodecs("decode", codecs) as never,
  };
}
