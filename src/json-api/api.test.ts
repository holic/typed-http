import { expect, test, suite } from "vitest";
import { createHttpAction as action } from "../arktype/http.js";
import { get } from "./route.js";
import { createApi } from "./api.js";
import { serializeRequest, serializeResponse } from "../../test/serialize.js";

const { api, handler } = createApi({
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
        async execute({ id }) {
          return { id: Number(id), username: "bob" };
        },
      })
    ),
  },
});

suite("handler", () => {
  test("get user", async () => {
    const req = new Request(`http://api/users/1`);
    expect(await serializeRequest(req)).toMatchInlineSnapshot(
      `"GET http://api/users/1 HTTP/1.1"`
    );

    const res = await handler(req);
    expect(await serializeResponse(res)).toMatchInlineSnapshot(`
    "HTTP/1.1 200 
    content-type: application/json

    {
      "id": 1,
      "username": "bob"
    }"
  `);
  });

  test("invalid params", async () => {
    const req = new Request(`http://api/users/invalid`);
    expect(await serializeRequest(req)).toMatchInlineSnapshot(
      `"GET http://api/users/invalid HTTP/1.1"`
    );

    const res = await handler(req);
    expect(await serializeResponse(res)).toMatchInlineSnapshot(`
    "HTTP/1.1 400 
    content-type: application/json

    {
      "error": "Could not decode request input params.\\n\\nAggregateError: id must be a well-formed integer string (was \\"invalid\\")"
    }"
  `);
  });

  test("not found", async () => {
    const req = new Request(`http://api/nothing`);
    expect(await serializeRequest(req)).toMatchInlineSnapshot(
      `"GET http://api/nothing HTTP/1.1"`
    );

    const res = await handler(req);
    expect(await serializeResponse(res)).toMatchInlineSnapshot(`
    "HTTP/1.1 404 
    content-type: application/json

    {
      "error": "Not found."
    }"
  `);
  });
});

// suite("api", () => {
//   api.user.byId.fetch();
// });
