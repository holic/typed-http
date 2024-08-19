import { define } from "arktype";
import { defineQuery } from "./http.js";
import type { ErrorMessage } from "@ark/util";

const user = define({
  username: "string",
  "displayName?": "string",
});

const listUsers = defineQuery({
  input: {
    "something?": "string[]",
    "limit?": ["string", "=>", (str) => parseInt(str)],
  },
  output: [user, "[]"],
  async query({ input }) {
    return [{ username: "alice" }];
  },
});

const getUser = defineQuery({
  input: {
    username: "string",
  },
  output: user,
  async query({ input }) {
    return { username: "alice" };
  },
});

type validatePath<path> = path extends `/${string}`
  ? path
  : ErrorMessage<"Path must start with a `/`.">;

const router = {
  get<path, query>(
    path: validatePath<path>,
    name: string,
    query: query
  ): void {},
};

router.get("/users/:username", "getUser", getUser);
