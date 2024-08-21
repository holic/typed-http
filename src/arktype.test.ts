import { describe, it } from "vitest";
import { attest } from "@ark/attest";
import { createShape } from "./arktype.js";

describe("createShape", () => {
  it("accepts", () => {
    const params = createShape({
      "limit?": "number",
      "sort?": "'asc' | 'desc'",
    });
    attest(params.accepts({})).snap(true);
    attest(params.accepts({ limit: 1 })).snap(true);
    attest(params.accepts({ limit: "1" })).snap(false);
    attest(params.accepts({ sort: "asc" })).snap(true);
    attest(params.accepts({ sort: "up" })).snap(false);
  });
});
