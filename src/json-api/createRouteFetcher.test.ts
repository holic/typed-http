import { vi, expect, test } from "vitest";
import createFetchMock from "vitest-fetch-mock";
import { createHttpAction } from "../arktype/http.js";
import { createRouteFetcher } from "./createRouteFetcher.js";

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();
fetchMocker.dontMock();

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
  const fetcher = createRouteFetcher(
    {
      method: "GET",
      path: "/date",
      action: getDate,
    },
    { baseUrl: "http://mock" }
  );

  fetchMocker.mockOnceIf("http://mock/date", async (req) => {
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await getDate.execute()),
    };
  });

  const output = await fetcher();

  expect(output).toMatchInlineSnapshot(`
    {
      "date": "2000-02-01T00:00:00.000Z",
    }
  `);
});
