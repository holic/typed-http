import { vi, expect, test, suite, afterEach } from "vitest";
import { createHttpAction as action } from "../arktype/http.js";
import { get } from "./route.js";
import { createApi } from "./api.js";
import { serializeRequest, serializeResponse } from "../../test/serialize.js";
import { beforeEach } from "vitest";

const records = [{ id: 1, username: "bob" }];

const { api, handler, client } = createApi({
  user: {
    list: get(
      "/users",
      action({
        output: [{ id: "number", username: "string" }, "[]"],
        async execute() {
          return records;
        },
      })
    ),
    byId: get(
      "/users/:id",
      action({
        types: {
          id: {
            encode: ["number.integer", "=>", (v: number) => String(v)],
            decode: "string.integer.parse",
          },
        },
        input: {
          id: "id",
        },
        output: [
          {
            id: "number",
            username: "string",
          },
          "|",
          "null",
        ],
        // TODO: should this 404?
        async execute({ id }) {
          return records.find((record) => record.id === id) ?? null;
        },
      })
    ),
  },
});

beforeEach(() => {
  global.fetch = vi.fn<typeof fetch>((url, opts) => {
    if (typeof url === "string" && url.startsWith("http://mock/")) {
      return handler(new Request(url, opts));
    }
    throw new Error(`Attempted to fetch an unmocked URL: ${url}`);
  });
});

afterEach(() => {
  vi.clearAllMocks();
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

  // TODO: improve this response type
  test("get non-existent user", async () => {
    const req = new Request(`http://api/users/999`);
    expect(await serializeRequest(req)).toMatchInlineSnapshot(
      `"GET http://api/users/999 HTTP/1.1"`
    );

    const res = await handler(req);
    expect(await serializeResponse(res)).toMatchInlineSnapshot(
      `"HTTP/1.1 200"`
    );
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

suite("client", () => {
  test("fetch users", async () => {
    // global.fetch = vi.fn<typeof fetch>((url, opts) => {
    //   if (typeof url === "string" && url.startsWith("http://mock/")) {
    //     return handler(new Request(url, opts));
    //   }
    //   throw new Error(`Attempted to fetch an unmocked URL: ${url}`);
    // });

    // fetchMocker.enableMocks();
    // fetchMocker.mockOnceIf("http://mock/users", api.user.list.handler);

    const output = await client.user.list({ baseUrl: "http://mock" });
    expect(output).toMatchInlineSnapshot(`
      [
        {
          "id": 1,
          "username": "bob",
        },
      ]
    `);
  });

  test("fetch user", async () => {
    const output = await client.user.byId(
      { id: 1 },
      { baseUrl: "http://mock" }
    );
    expect(output).toMatchInlineSnapshot(`
      {
        "id": 1,
        "username": "bob",
      }
    `);
  });
});
