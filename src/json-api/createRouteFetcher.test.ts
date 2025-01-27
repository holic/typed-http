import { vi, expect, test } from "vitest";
import { createHttpAction } from "../arktype/http.js";
import { createRouteFetcher } from "./createRouteFetcher.js";
import { createRouteHandler } from "./createRouteHandler.js";
import { beforeEach } from "vitest";

const getDate = createHttpAction({
  output: {
    date: "string.date",
  },
  async execute() {
    return {
      date: new Date(2000, 1).toISOString(),
    };
  },
});

test("route", async () => {
  const route = { method: "GET", path: "/date", action: getDate } as const;

  global.fetch = vi.fn<typeof fetch>(async (url, opts) => {
    if (typeof url === "string" && url === "http://mock/date") {
      const res = await createRouteHandler(route)(new Request(url, opts));
      if (res === null) throw new Error("Route handler did not match.");
      return res;
    }
    throw new Error(`Attempted to fetch an unmocked URL: ${url}`);
  });

  // fetchMocker.enableMocks();
  // fetchMocker.mockOnceIf("http://mock/date", createRouteHandler(route));

  const fetcher = createRouteFetcher(route, { baseUrl: "http://mock" });

  const output = await fetcher();

  expect(output).toMatchInlineSnapshot(`
    {
      "date": "2000-02-01T00:00:00.000Z",
    }
  `);
});
