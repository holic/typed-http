import { expect, test } from "vitest";
import { type } from "arktype";
import { createHttpAction } from "../arktype/http.js";
import { createRoute } from "./route.js";
import { serializeRequest, serializeResponse } from "../../test/serialize.js";

test("route", async () => {
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
        createdAt: new Date(2000, 1),
      };
    },
  });

  const route = createRoute({
    method: "GET",
    route: "/users/:id",
    action: getUser,
  });

  const req = new Request(`http://api/users/1n`);
  expect(await serializeRequest(req)).toMatchInlineSnapshot(
    `"GET http://api/users/1n HTTP/1.1"`
  );

  const res = await route(req);
  expect(await serializeResponse(res)).toMatchInlineSnapshot(`
    "HTTP/1.1 200 
    content-type: application/json

    {
      "id": "1n",
      "username": "alice",
      "createdAt": "2000-02-01T00:00:00.000Z"
    }"
  `);
});

test("route pass-through", async () => {
  const route = createRoute({
    method: "GET",
    route: "/users/:id",
    action: createHttpAction({
      input: { id: "string" },
      output: { id: "string" },
      async execute({ input }) {
        return { id: input.id };
      },
    }),
  });

  const req = new Request(`http://api/users`);
  expect(await serializeRequest(req)).toMatchInlineSnapshot(
    `"GET http://api/users HTTP/1.1"`
  );

  const res = await route(req);
  expect(await serializeResponse(res)).toMatchInlineSnapshot(`null`);
});
