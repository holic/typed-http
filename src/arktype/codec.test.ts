import { test } from "vitest";
import { attest } from "@ark/attest";
import { createCodec } from "./codec.js";
import { isCodec } from "../types/codec.js";

test("createCodec", () => {
  const codec = createCodec({
    encode: ["bigint", "=>", (v: bigint) => `${v.toString()}n`],
    decode: [/^\d+n$/, "=>", (v: string) => BigInt(v.slice(0, -1))],
  });

  attest(isCodec(codec)).snap(true).type.toString.snap("boolean");

  attest(codec.encode(100n)).snap("100n").type.toString.snap("string");
  attest(codec.decode("100n")).snap("100n").type.toString.snap("bigint");

  attest(codec.encoded.accepts(100n)).snap(true).type.toString.snap("boolean");
  attest(codec.encoded.from(100n)).snap("100n").type.toString.snap("string");

  attest(codec.decoded.accepts("100n"))
    .snap(true)
    .type.toString.snap("boolean");
  attest(codec.decoded.from("100n")).snap("100n").type.toString.snap("bigint");
});

test("encode validation", () => {
  const codec = createCodec({
    encode: ["bigint", "=>", (v: bigint) => `${v.toString()}n`],
    decode: [/^\d+n$/, "=>", (v: string) => BigInt(v.slice(0, -1))],
  });

  attest(() =>
    // @ts-expect-error
    codec.encode("100")
  )
    .throws.snap("AggregateError: must be a bigint (was a string)")
    .type.errors.snap(
      "Argument of type 'string' is not assignable to parameter of type 'bigint'."
    );

  attest(() =>
    // @ts-expect-error
    codec.encode(100)
  )
    .throws.snap("AggregateError: must be a bigint (was a number)")
    .type.errors.snap(
      "Argument of type 'number' is not assignable to parameter of type 'bigint'."
    );
});

test("decode validation", () => {
  const codec = createCodec({
    encode: ["bigint", "=>", (v: bigint) => `${v.toString()}n`],
    decode: [/^\d+n$/, "=>", (v: string) => BigInt(v.slice(0, -1))],
  });

  attest(() => codec.decode("100")).throws.snap(
    'AggregateError: must be matched by ^\\d+n$ (was "100")'
  );

  attest(() =>
    // @ts-expect-error
    codec.decode(100)
  )
    .throws.snap("AggregateError: must be a string (was a number)")
    .type.errors.snap(
      "Argument of type 'number' is not assignable to parameter of type 'string'."
    );
});

test("invalid codec", () => {
  attest(() =>
    // @ts-expect-error
    createCodec({})
  )
    .throws("Type definitions must be strings or objects (was undefined)")
    .type.errors("Codec is missing `encode` type.");

  attest(() =>
    // @ts-expect-error
    createCodec({ encode: "string" })
  )
    .throws("Type definitions must be strings or objects (was undefined)")
    .type.errors("Codec is missing `decode` type.");

  attest(() =>
    // @ts-expect-error
    createCodec({ decode: "string" })
  )
    .throws("Type definitions must be strings or objects (was undefined)")
    .type.errors("Codec is missing `encode` type.");

  // TODO: improve type error
  // TODO: add runtime error
  attest(() =>
    // @ts-expect-error
    createCodec({ encode: "string", decode: "string", invalid: true })
  ).type.errors.snap(`Type 'string' is not assignable to type 'never'.
Type 'string' is not assignable to type 'never'.
Type 'boolean' is not assignable to type 'never'.`);
});

test("bidirectional", () => {
  // TODO: add runtime error
  attest(() =>
    // @ts-expect-error
    createCodec({ encode: "string.date.parse", decode: "string.email" })
  ).type.errors(
    "Codec `decode` input type (string) should match `encode` output type (Date)."
  );
});

test.todo("scope", () => {});
