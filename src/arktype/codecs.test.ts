import { expect, it, test } from "vitest";
import { define, scope, type, type validateAmbient } from "arktype";
import { flatMorph, keysOf, type ErrorMessage } from "@ark/util";
import { attest } from "@ark/attest";

type validateCodec<codec> = {
  [k in keyof codec]: k extends "encode" | "decode"
    ? validateAmbient<codec[k]>
    : never;
};

type validateCodecs<codecs> = {
  [k in keyof codecs]: keyof codecs[k] extends "encode" | "decode"
    ? validateCodec<codecs[k]>
    : { encode: any; decode: any };
};

function createCodecs<
  const codecs extends { [k: string]: { encode: any; decode: any } },
>(codecs: validateCodecs<codecs>): codecs {
  return codecs as codecs;
}

const codecs = createCodecs({
  "codec.date": {
    // TODO: figure out how to infer morph types instead of having to type args
    // TODO: figure out how to define morph output type
    encode: ["Date", "=>", (d: Date) => d.toISOString()],
    decode: ["string", "=>", (s: string) => new Date(s)],
  },
});

// const encoders = flatMorph(codecs, (key, value) => [key, value.encode]);
const encoders = {
  "codec.date": ["Date", "=>", (d: Date) => d.toISOString()],
  decode: ["string", "=>", (s: string) => new Date(s)],
} as const;
const decoders = flatMorph(codecs, (key, value) => [key, value.decode]);

// TODO: constrain
const types = {
  postsFilter: {
    from: "codec.date",
  },
} as const;

const encode = scope({
  ...encoders,
  ...types,
}).export();

const decode = scope({
  ...decoders,
  ...types,
}).export();

test("encode", () => {
  attest(
    encode.postsFilter.from({
      from: new Date(),
    })
  )
    .snap({ from: "2024-08-23T00:39:12.913Z" })
    .type.toString.snap("{ from: string }");
});

test("decode", () => {
  attest(
    decode.postsFilter.from({
      from: "2024-08-23",
    })
  )
    .snap({ from: "Fri Aug 23 2024" })
    .type.toString.snap("{ from: Date }");
});
