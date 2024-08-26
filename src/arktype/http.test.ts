import { test } from "vitest";
import { type } from "arktype";
import { createHttpAction } from "../arktype/http.js";

test("action", () => {
  const getUser = createHttpAction({
    types: {
      date: {
        encode: ["Date", "=>", (v: Date) => v.toISOString()],
        decode: type("string")
          .pipe((v) => new Date(v))
          .narrow<Date>((v, ctx) =>
            isNaN(v.getTime()) ? ctx.mustBe("a valid date time string") : true
          ),
      },
      id: {
        encode: ["bigint", "=>", (v: bigint): string => `${v.toString()}n`],
        decode: [/^\d+n$/, "=>", (s: string): bigint => BigInt(s.slice(0, -1))],
      },
    },
    input: {
      id: "id",
      "createdAt?": "date",
    },
    output: {
      id: "id",
      username: "string",
      createdAt: "date",
    },
    async execute({ input }) {
      return {
        id: input.id,
        username: "alice",
        createdAt: new Date(),
      };
    },
  });
});
