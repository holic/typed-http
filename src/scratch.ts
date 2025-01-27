/*

const { api, handler, client } = createApi()
  .types({
    id: {
      encode: ["number.integer", "=>", (v: number) => String(v)],
      decode: "string.integer.parse",
    },
  })
  .routes(({ get }) => ({
    user: {
      list: get("/users")
        .output([{ id: "number", username: "string" }, "[]"])
        .execute(async () => records),
      byId: get("/users/:id")
        .input({ id: "id" })
        .output({ user: [{ id: "number", username: "string" }, "|", "null"] })
        .execute(async ({ id }) => ({
          user: records.find((record) => record.id === id) ?? null,
        })),
    },
  }));

*/

/*

const listUsers = createAction()
  .output([{ id: "number", username: "string" }, "[]"])
  .execute(() => records);

const userById = createAction()
  .types({
    id: {
      encode: ["number.integer", "=>", (v: number) => String(v)],
      decode: "string.integer.parse",
    },
  })
  .input({ id: "id" })
  .output({
    user: [
      {
        id: "number",
        username: "string",
      },
      "|",
      "null",
    ],
  })
  .execute(({ id }) => ({
    user: records.find((record) => record.id === id) ?? null,
  }));

const { api, handler, client } = createApi({
  user: {
    list: get("/users", listUsers),
    byId: get("/users/:id", userById),
  },
});

*/
