import { attest } from "@ark/attest";
import { describe, it } from "vitest";
import { type ArktypeAction } from "./arktype.js";
import type { conform, satisfy } from "@ark/util";
import type { Action } from "./types/action.js";

describe.skip("createHttpAction", () => {
  // it("returns an action", () => {
  //   const listUsers = createHttpAction({
  //     input: {
  //       "limit?": ["string", "=>", (str) => parseInt(str)],
  //     },
  //     output: [
  //       {
  //         id: "number",
  //         username: "string",
  //       },
  //       "[]",
  //     ],
  //     async execute(input) {
  //       return [];
  //     },
  //   });
  //   listUsers.execute({ limit: "1" });
  //   attest<satisfy<Action<any, any>, ArktypeAction<any, any>>>;
  // });
});
