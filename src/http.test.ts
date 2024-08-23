import { attest } from "@ark/attest";
import { describe, it } from "vitest";
import type { conform, satisfy } from "@ark/util";
import { createHttpAction } from "./http.js";

// describe.skip("createHttpAction", () => {
//   it("returns an action", () => {
//     const listUsers = createHttpAction({
//       input: {
//         "limit?": ["string", "=>", (str) => parseInt(str)],
//       },
//       output: [
//         {
//           id: "number",
//           username: "string",
//         },
//         "[]",
//       ],
//       async execute(input) {
//         return [];
//       },
//     });
//     listUsers.execute({ limit: 1 });
//     attest<satisfy<Action<any, any>, ArktypeAction<any, any>>>;
//   });
// });

/*

Param type:
  input: InputParams
  output: morphed params (e.g. string value casts to number)

Result type:
  input: Json
  output: Json (same, no morphs for now, so just acts as a validator)



route(req, res)
  paramsOutput = Param.from(req.params)
  resultOutput = Result.from(action.execute(paramsOutput))
  res = JSON.stringify(resultOutput)


// already in params input shape
doFetch(paramsInput)
  Params.from(paramsInput) // validate
  res = fetch(url, { params: paramsInput })
  resultOutput = Result.from(JSON.parse(res))


// using params output shape (ideal)
doFetch(paramsOutput)
  // stuck, no way to either:
  // - validate at runtime that output is valid
  // - convert output back to input (reverse morph)
  res = fetch(url, { params: ?? })
  resultOutput = Result.from(JSON.parse(res))

*/
