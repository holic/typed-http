import { expect, test } from "vitest";
import { createHttpAction as action } from "./arktype/http.js";
import { get } from "./route.js";
import { defineApi } from "./api.js";

test("api", async () => {
  const api = defineApi({
    user: {
      byId: get(
        "/users/:id",
        action({
          input: {
            id: "string",
          },
          output: {
            id: "string",
            username: "string",
          },
          async execute({ input: { id } }) {
            return { id, username: "bob" };
          },
        })
      ),
    },
  });
});

// test("api", async () => {
//   const api = defineApi({
//     user: {
//       byId: get("/users/:id")
//         .params({ id: "string" })
//         .body({
//           id: "string",
//           username: "string",
//         })
//         .serve(async ({ input: { id } }) => {
//           return { id, username: "bob" };
//         }),
//     },
//   });
// });
