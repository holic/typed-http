import { test } from "vitest";
import { type } from "arktype";
import { defineAction } from "./action.js";
import { attest } from "@ark/attest";

test("createAction execute return type", () => {
  attest(() =>
    defineAction({
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
          encode: ["bigint", "=>", (v: bigint) => `${v.toString()}n`],
          decode: [/^\d+n$/, "=>", (s: string) => BigInt(s.slice(0, -1))],
        },
      },
      input: {
        "createdAt?": "date",
      },
      output: {
        id: "id",
        username: "string",
      },
      // @ts-expect-error
      async execute() {},
    })
  ).type.errors.snap(
    "Type '() => Promise<void>' is not assignable to type 'validateExecute<{ readonly types: { readonly date: { readonly encode: readonly [\"Date\", \"=>\", (v: Date) => string]; readonly decode: Type<(In: string) => Out<Date>, {}>; }; readonly id: { readonly encode: readonly [\"bigint\", \"=>\", (v: bigint) => string]; readonly decode: readonly [...]; }; }; readonly input: { ...; ...'.Type 'Promise<void>' is not assignable to type 'Promise<Error | { id: bigint; username: string; }>'.Type 'void' is not assignable to type 'Error | { id: bigint; username: string; }'."
  );
});
