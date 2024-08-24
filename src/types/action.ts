import type { conform } from "@ark/util";
import type { Codec } from "./codec.js";

export type Action<
  input extends Codec<any, any>,
  output extends Codec<any, any>,
  executeInput = input extends Codec<any, infer decoded> ? decoded : never,
  executeOutput = output extends Codec<any, infer decoded> ? decoded : void,
> = {
  input: input;
  output: output;
  execute<const value>(args: {
    input: conform<value, executeInput>;
  }): Promise<executeOutput | Error>;
};
