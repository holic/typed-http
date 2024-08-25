import { test } from "vitest";
import { type } from "arktype";
import { createAction, defineAction } from "./action.js";
import { attest } from "@ark/attest";
import type { Action } from "../types/action.js";
import type { satisfy } from "@ark/util";
import type { Codec } from "../types/codec.js";

test("action", () => {
  const getUser = createAction({
    input: {
      id: ["string", "=>", (s: string) => parseInt(s)],
    },
    output: {
      id: "integer",
      username: "string",
    },
    async execute({ input }) {
      return {
        id: input.id,
        username: "alice",
      };
    },
  });

  attest<satisfy<Action<any, any>, typeof getUser>>;

  attest<satisfy<Action<Codec<{ id: string }, any>, any>, typeof getUser>>;
  attest<satisfy<Action<Codec<any, { id: number }>, any>, typeof getUser>>;

  attest<
    satisfy<
      Action<any, Codec<{ id: number; username: string }, any>>,
      typeof getUser
    >
  >;
  attest<
    satisfy<
      Action<any, Codec<any, { id: number; username: string }>>,
      typeof getUser
    >
  >;

  attest(getUser.input.encode).type.toString.snap(`<const value>(
  value: conform<value, { id: number }>
) => Error | { id: string }`);

  attest(getUser.input.decode).type.toString.snap(`<const value>(
  value: conform<value, { id: string }>
) => Error | { id: number }`);

  attest(getUser.output.encode).type.toString.snap(`<const value>(
  value: conform<value, { id: number; username: string }>
) => Error | { id: number; username: string }`);

  attest(getUser.output.decode).type.toString.snap(`<const value>(
  value: conform<value, { id: number; username: string }>
) => Error | { id: number; username: string }`);
});

test("action codecs are bidirectional", () => {
  const getUser = createAction({
    input: {
      id: ["string", "=>", (s: string) => parseInt(s)],
    },
    output: {
      id: "integer",
      username: "string",
    },
    async execute({ input }) {
      return {
        id: input.id,
        username: "alice",
      };
    },
  });

  type getUser = typeof getUser;

  type input = getUser["input"];
  attest<
    Parameters<input["encode"]>[0],
    Exclude<ReturnType<input["decode"]>, Error>
  >;
  attest<
    Parameters<input["decode"]>[0],
    Exclude<ReturnType<input["encode"]>, Error>
  >;

  type output = getUser["output"];
  attest<
    Parameters<output["encode"]>[0],
    Exclude<ReturnType<output["decode"]>, Error>
  >;
  attest<
    Parameters<output["decode"]>[0],
    Exclude<ReturnType<output["encode"]>, Error>
  >;

  // TODO: test runtime
});

test("execute return type error", () => {
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
