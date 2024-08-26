import { test } from "vitest";
import { type } from "arktype";
import { attest } from "@ark/attest";
import type { satisfy } from "@ark/util";
import type { Action } from "../types/action.js";
import type { Codec } from "../types/codec.js";
import { createAction } from "./action.js";

test("action", () => {
  const getUser = createAction({
    input: {
      id: "integer",
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

  attest<satisfy<Action<Codec<{ id: number }, any>, any>, typeof getUser>>;
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
) => { id: number }`);

  attest(getUser.input.decode).type.toString.snap(`<const value>(
  value: conform<value, { id: number }>
) => { id: number }`);

  attest(getUser.output.encode).type.toString.snap(`<const value>(
  value: conform<value, { id: number; username: string }>
) => { id: number; username: string }`);

  attest(getUser.output.decode).type.toString.snap(`<const value>(
  value: conform<value, { id: number; username: string }>
) => { id: number; username: string }`);
});

test("action codecs are bidirectional", () => {
  const getUser = createAction({
    input: {
      id: "integer",
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

test.todo("not bidirectional", () => {});

test.todo("invalid keys", () => {});

test("execute return type error", () => {
  attest(() =>
    createAction({
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
    "Type '() => Promise<void>' is not assignable to type 'expectedExecute<{ readonly types: { readonly date: { readonly encode: readonly [\"Date\", \"=>\", (v: Date) => string]; readonly decode: Type<(In: string) => Out<Date>, {}>; }; readonly id: { readonly encode: readonly [\"bigint\", \"=>\", (v: bigint) => string]; readonly decode: readonly [...]; }; }; readonly input: { ...; ...'.Type 'Promise<void>' is not assignable to type 'Promise<{ id: bigint; username: string; }>'.Type 'void' is not assignable to type '{ id: bigint; username: string; }'."
  );
});
