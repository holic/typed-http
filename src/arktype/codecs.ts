import { type validateAmbient } from "arktype";
import { flatMorph, type ErrorMessage } from "@ark/util";

// TODO: check if this works with `unknown`?
export type expectedCodec = { encode: any; decode: any };
export type expectedCodecs = { [k: string]: expectedCodec };

// TODO: ensure no extraneous keys, helps with typos
// TODO: validate bidirectional (encode.infer = decode.inferIn, decode.infer = encode.inferIn)
export type validateCodec<codec> = keyof expectedCodec extends keyof codec
  ? validateAmbient<codec>
  : ErrorMessage<"A codec must have `encode` and `decode` type definitions.">;

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
} & unknown;

export function flattenCodecs<const op, const codecs>(
  op: "encode" | "decode",
  codecs: validateCodecs<codecs>
): flattenCodecs<op, codecs> {
  return flatMorph(codecs as never, (k, v) => [
    `#${k}`,
    v[op as never],
  ]) as never;
}

export function createCodecs<const codecs>(codecs: validateCodecs<codecs>): {
  readonly encode: flattenCodecs<"encode", codecs>;
  readonly decode: flattenCodecs<"decode", codecs>;
} {
  return {
    encode: flattenCodecs("encode", codecs) as never,
    decode: flattenCodecs("decode", codecs) as never,
  };
}
