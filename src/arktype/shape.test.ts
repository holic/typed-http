import { test } from "vitest";
import { attest } from "@ark/attest";
import { createShape } from "./shape.js";
import type { _isShape } from "../types/shape.js";

test("accepts", () => {
  const params = createShape({
    "limit?": "number",
    "sort?": "'asc' | 'desc'",
  });
  attest<boolean>(params.accepts({})).snap(true);
  attest(params.accepts({ limit: 1 })).snap(true);
  attest(params.accepts({ limit: "1" })).snap(false);
  attest(params.accepts({ sort: "asc" })).snap(true);
  attest(params.accepts({ sort: "up" })).snap(false);
});

// TODO: test .from

test("instantiations", () => {
  createShape({
    "limit?": "number",
    "sort?": "'asc' | 'desc'",
  });
  attest.instantiations([8099, "instantiations"]);
});
