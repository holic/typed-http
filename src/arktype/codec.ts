import type { ErrorMessage, typeToString } from "@ark/util";
import { scope, type inferScope, type validateScope, type type } from "arktype";
import { defineCodec, type Codec } from "../types/codec.js";
import { defineShape } from "../types/shape.js";

// TODO: check if this works with `unknown`?
export type expectedCodec = { encode: any; decode: any; scope?: any };

type validateCodecShape<
  codec,
  $ = "scope" extends keyof codec ? inferScope<codec["scope"]> : {},
> = {
  [k in keyof codec]: k extends "scope"
    ? validateScope<codec[k]>
    : k extends "encode"
      ? type.validate<codec[k], $>
      : k extends "decode"
        ? type.validate<codec[k], $>
        : ErrorMessage<"Codec should only have `encode`, `decode`, and optional `scope` keys.">;
};

// assumes valid codec
export type validateBidirectional<
  codec,
  $ = "scope" extends keyof codec ? inferScope<codec["scope"]> : {},
> = "encode" extends keyof codec
  ? "decode" extends keyof codec
    ? type.infer.In<codec["encode"], $> extends type.infer.Out<
        codec["decode"],
        $
      >
      ? type.infer.In<codec["decode"], $> extends type.infer.Out<
          codec["encode"],
          $
        >
        ? codec
        : ErrorMessage<`Codec \`decode\` input type (${typeToString<type.infer.In<codec["decode"], $>>}) should match \`encode\` output type (${typeToString<type.infer.Out<codec["encode"], $>>}).`>
      : ErrorMessage<`Codec \`encode\` input type (${typeToString<type.infer.In<codec["encode"], $>>}) should match \`decode\` output type (${typeToString<type.infer.Out<codec["encode"], $>>}).`>
    : ErrorMessage<"Codec is missing `decode` type.">
  : ErrorMessage<"Codec is missing `encode` type.">;

export type validateCodec<codec> = validateCodecShape<codec> &
  validateBidirectional<codec>;

export type createCodec<
  codec,
  $ = "scope" extends keyof codec ? inferScope<codec["scope"]> : {},
> = codec extends expectedCodec
  ? Codec<
      type.infer.Out<codec["encode"], $>,
      type.infer.Out<codec["decode"], $>
    >
  : ErrorMessage<"Invalid codec. Did you validate it first?">;

export function createCodec<const codec>(
  _codec: validateCodec<codec> & validateBidirectional<codec>
): createCodec<codec> {
  const codec = _codec as never as expectedCodec;
  const $ = scope(codec.scope ?? {});

  const encode = $.type(codec.encode);
  const decode = $.type(codec.decode);

  const encoded = defineShape({
    accepts: encode.allows,
    from: (v) => encode.from(v),
  });
  const decoded = defineShape({
    accepts: decode.allows,
    from: (v) => decode.from(v),
  });

  return defineCodec({
    encoded,
    decoded,
    encode: encoded.from,
    decode: decoded.from,
  }) as never;
}
