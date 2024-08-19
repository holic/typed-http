import { defineQuery } from "./http.js";

const user = {
  username: "string",
  "displayName?": "string",
} as const;

const listUsers = defineQuery({
  output: [user, "[]"],
  async query() {
    return [{ username: "alice" }];
  },
});

listUsers();

const getUser = defineQuery({
  input: {
    username: "string",
  },
  output: user,
  async query({ input }) {
    return { username: "alice" };
  },
});
