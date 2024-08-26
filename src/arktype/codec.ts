import type { ErrorMessage, typeToString } from "@ark/util";
import {
  scope,
  type inferScope,
  type validateScope,
  type validateTypeRoot,
} from "arktype";
import { defineCodec, type Codec } from "../types/codec.js";
import { defineShape } from "../types/shape.js";
import type { distillIn, distillOut, validate } from "./utils.js";

// TODO: check if this works with `unknown`?
export type expectedCodec = { encode: any; decode: any; scope?: any };

type validateCodecShape<
  codec,
  $ = "scope" extends keyof codec ? inferScope<codec["scope"]> : {},
> = {
  [k in keyof codec]: k extends "scope"
    ? validateScope<codec[k]>
    : k extends "encode"
      ? validateTypeRoot<codec[k], $>
      : k extends "decode"
        ? validateTypeRoot<codec[k], $>
        : ErrorMessage<"Codec should only have `encode`, `decode`, and optional `scope` keys.">;
};

// assumes valid codec
export type validateBidirectional<
  codec,
  $ = "scope" extends keyof codec ? inferScope<codec["scope"]> : {},
> = "encode" extends keyof codec
  ? "decode" extends keyof codec
    ? distillIn<codec["encode"], $> extends distillOut<codec["decode"], $>
      ? distillIn<codec["decode"], $> extends distillOut<codec["encode"], $>
        ? codec
        : ErrorMessage<`Codec \`decode\` input type (${typeToString<distillIn<codec["decode"], $>>}) should match \`encode\` output type (${typeToString<distillOut<codec["encode"], $>>}).`>
      : ErrorMessage<`Codec \`encode\` input type (${typeToString<distillIn<codec["encode"], $>>}) should match \`decode\` output type (${typeToString<distillOut<codec["encode"], $>>}).`>
    : ErrorMessage<"Codec is missing `decode` type.">
  : ErrorMessage<"Codec is missing `encode` type.">;

export type validateCodec<codec> = validate<
  codec,
  [validateCodecShape<codec>, validateBidirectional<codec>]
>;

export type createCodec<
  codec,
  $ = "scope" extends keyof codec ? inferScope<codec["scope"]> : {},
> = codec extends expectedCodec
  ? Codec<distillOut<codec["encode"], $>, distillOut<codec["decode"], $>>
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
