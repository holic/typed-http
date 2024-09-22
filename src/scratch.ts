/*

router({
  user: {
    byId: route.get("/users/:id")
      .in({
        id: "id",
        "createdAt?": "date",
      })
      .out({
        id: "id",
        username: "string",
        createdAt: "date",
      })
      .execute(async ({ input }) => {
        return {
          id: input.id,
          username: "alice",
          createdAt: new Date(2000, 1),
        };
      }),
  },
});

route
  .get("/users/:id")
  .in({
    id: "id",
    "createdAt?": "date",
  })
  .out({
    id: "id",
    username: "string",
    createdAt: "date",
  })
  .execute(async ({ input }) => {
    return {
      id: input.id,
      username: "alice",
      createdAt: new Date(2000, 1),
    };
  });

createRoute({
  method: "GET",
  route: "/users/:id",
  action: createHttpAction({
    input: {
      id: "id",
      "createdAt?": "date",
    },
    output: {
      id: "id",
      username: "string",
      createdAt: "date",
    },
    async execute({ input }) {
      return {
        id: input.id,
        username: "alice",
        createdAt: new Date(2000, 1),
      };
    },
  }),
});

createRoute("GET", "/users/:id", createHttpAction({
  input: {
    id: "id",
    "createdAt?": "date",
  },
  output: {
    id: "id",
    username: "string",
    createdAt: "date",
  },
  async execute({ input }) {
    return {
      id: input.id,
      username: "alice",
      createdAt: new Date(2000, 1),
    };
  },
}));

*/
