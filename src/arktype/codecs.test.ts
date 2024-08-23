import { test } from "vitest";
import { attest } from "@ark/attest";
import { scope } from "arktype";
import { createCodecs } from "./codecs.js";

const codecs = createCodecs({
  date: {
    encode: ["Date", "=>", (v: Date) => v.toISOString()],
    decode: ["string", "=>", (v: string) => new Date(v)],
  },
  id: {
    encode: ["bigint", "=>", (v: bigint) => `${v.toString()}n`],
    decode: ["string", "=>", (v: string) => BigInt(v.replace(/n$/, ""))],
  },
});

const filters = {
  posts: {
    "id?": "id",
    "createdAt?": "date",
  },
} as const;

test("encode", () => {
  const encoders = scope({ ...codecs.encode, ...filters }).export();

  attest(encoders.posts.from({ createdAt: new Date(2000, 0) }))
    .snap({ createdAt: "2000-01-01T00:00:00.000Z" })
    .type.toString.snap("{ id?: string; createdAt?: string }");

  attest(encoders.posts.from({ id: 1000n }))
    .snap({ id: "1000n" })
    .type.toString.snap("{ id?: string; createdAt?: string }");
});

test("decode", () => {
  const decoders = scope({ ...codecs.decode, ...filters }).export();

  attest(decoders.posts.from({ createdAt: "2000-01-01" }))
    .snap({ createdAt: "Sat Jan 01 2000" })
    .type.toString.snap("{ id?: bigint; createdAt?: Date }");

  attest(decoders.posts.from({ id: "1000n" }))
    .snap({ id: "1000n" })
    .type.toString.snap("{ id?: bigint; createdAt?: Date }");
});
