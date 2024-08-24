import { test } from "vitest";
import { attest } from "@ark/attest";
import { scope, type } from "arktype";
import { createCodecs } from "./codecs.js";

const codecs = createCodecs({
  date: {
    encode: ["Date", "=>", (v: Date) => v.toISOString()],
    decode: type("string")
      .pipe((v) => new Date(v))
      .narrow((v, ctx) =>
        isNaN(v.getTime()) ? ctx.mustBe("a valid date time string") : true
      ),
  },
  id: {
    encode: ["bigint", "=>", (v: bigint) => `${v.toString()}n`],
    decode: [/^\d+n$/, "=>", (s: string) => BigInt(s.slice(0, -1))],
  },
});

const filters = {
  posts: {
    "id?": "id",
    "createdAt?": "date",
  },
} as const;

const encoders = scope({ ...codecs.encode, ...filters }).export();
const decoders = scope({ ...codecs.decode, ...filters }).export();

test("encode", () => {
  attest(encoders.posts.from({ createdAt: new Date(2000, 0) }))
    .snap({ createdAt: "2000-01-01T00:00:00.000Z" })
    .type.toString.snap("{ id?: string; createdAt?: string }");

  attest(encoders.posts.from({ id: 1000n }))
    .snap({ id: "1000n" })
    .type.toString.snap("{ id?: string; createdAt?: string }");
});

test("decode", () => {
  attest(decoders.posts.from({ createdAt: "2000-01-01" }))
    .snap({ createdAt: "Sat Jan 01 2000" })
    .type.toString.snap("{ id?: bigint; createdAt?: Date }");

  attest(() => decoders.posts.from({ createdAt: "wrong" })).throws.snap(
    "AggregateError: createdAt must be a valid date time string (was Invalid Date, undefined NaN, NaN)"
  );

  attest(decoders.posts.from({ id: "1000n" }))
    .snap({ id: "1000n" })
    .type.toString.snap("{ id?: bigint; createdAt?: Date }");

  attest(() => decoders.posts.from({ id: "wrong" })).throws.snap(
    'AggregateError: id must be matched by ^\\d+n$ (was "wrong")'
  );
});
