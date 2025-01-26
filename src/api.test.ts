import { expect, test } from "vitest";
import { createHttpAction as action } from "./arktype/http.js";
import { get } from "./route.js";
import { defineApi } from "./api.js";
import { serializeRequest, serializeResponse } from "../test/serialize.js";

const api = defineApi({
  user: {
    byId: get(
      "/users/:id",
      action({
        input: {
          id: "string.integer",
        },
        output: {
          id: "number",
          username: "string",
        },
        async execute({ input: { id } }) {
          return { id: Number(id), username: "bob" };
        },
      })
    ),
  },
});

test("get user", async () => {
  const req = new Request(`http://api/users/1`);
  expect(await serializeRequest(req)).toMatchInlineSnapshot(
    `"GET http://api/users/1 HTTP/1.1"`
  );

  const res = await api.user.byId.handler(req);
  expect(await serializeResponse(res)).toMatchInlineSnapshot(`
    "HTTP/1.1 200 
    content-type: application/json

    {
      "id": 1,
      "username": "bob"
    }"
  `);
});

test("get user", async () => {
  const req = new Request(`http://api/users/invalid`);
  expect(await serializeRequest(req)).toMatchInlineSnapshot(
    `"GET http://api/users/invalid HTTP/1.1"`
  );

  const res = await api.user.byId.handler(req);
  expect(await serializeResponse(res)).toMatchInlineSnapshot(`
    "HTTP/1.1 400 
    content-type: application/json

    {
      "error": "Could not decode request input params.\\n\\nAggregateError: id must be a well-formed integer string (was \\"invalid\\")"
    }"
  `);
});
