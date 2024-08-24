import type { conform } from "@ark/util";
import type { Codec } from "./codec.js";

export type Action<input, output> = {
  input: Codec<any, input>;
  output: Codec<any, output>;
  execute<const value>(value: conform<value, input>): Promise<output | Error>;
};
