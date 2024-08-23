// const user = define({
//   username: "string",
//   "displayName?": "string",
// });

// const listUsers = defineAction({
//   input: {
//     "something?": "string[]",
//     "limit?": ["string", "=>", (str) => parseInt(str)],
//   },
//   output: [user, "[]"],
//   async execute({ input }) {
//     return [{ username: "alice" }];
//   },
// });

// const getUser = defineAction({
//   input: {
//     username: "string",
//   },
//   output: user,
//   async execute({ input }) {
//     return { username: input.username };
//   },
// });

// const getUser = action()
//   .in({ username: "string" })
//   .out(user)
//   .do(async ({ username }) => {
//     return { username };
//   });

// type validatePath<path> = path extends `/${string}`
//   ? path
//   : ErrorMessage<"Path must start with a `/`.">;

// const router = {
//   get<path, query>(
//     path: validatePath<path>,
//     name: string,
//     query: query
//   ): void {},
// };

// router.get("/users/:username", "getUser", getUser);
