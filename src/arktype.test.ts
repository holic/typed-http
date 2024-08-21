import { describe, expect, it } from "vitest";
import { type } from "arktype";
import { attest } from "@ark/attest";

describe("type", () => {
  const params = type({ limit: ["string", "=>", (str) => parseInt(str)] });

  it("allows", () => {
    attest(params.allows({})).snap(false);
    attest(params.in.allows({})).snap(false);
    attest(params.out.allows({})).snap(false);

    attest(params.allows({ limit: "1" })).snap(true);
    attest(params.in.allows({ limit: "1" })).snap(true);
    attest(params.out.allows({ limit: "1" })).snap(true);

    attest(params.allows({ limit: 1 })).snap(false);
    attest(params.in.allows({ limit: 1 })).snap(false);
    attest(params.out.allows({ limit: 1 })).snap(true);
  });

  it("traverses", () => {
    attest(params.traverse({})).instanceOf(type.errors);
    attest(params.traverse({ limit: "1" })).snap({ limit: 1 });
    attest(params.traverse({ limit: 1 })).instanceOf(type.errors);

    attest(params.in.traverse({})).instanceOf(type.errors);
    attest(params.in.traverse({ limit: "1" })).snap({ limit: "1" });
    attest(params.in.traverse({ limit: 1 })).instanceOf(type.errors);

    attest(params.out.traverse({})).instanceOf(type.errors);
    attest(params.out.traverse({ limit: "1" })).snap({ limit: "1" });
    attest(params.out.traverse({ limit: 1 })).snap({ limit: 1 });
  });
});
