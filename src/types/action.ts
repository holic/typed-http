import type { conform } from "@ark/util";
import type { innerShape, Shape } from "./shape.js";
import type { Codec } from "./codec.js";

export type Action<
  input extends Shape<any> | Codec<any, any>,
  output extends Shape<any> | Codec<any, any>,
  executeInput = input extends Codec<any, infer decoded>
    ? decoded
    : innerShape<input>,
  executeOutput = output extends Codec<any, infer decoded>
    ? decoded
    : innerShape<output>,
> = {
  input: input;
  output: output;
  execute<const value>(
    value: conform<value, executeInput>
  ): Promise<executeOutput | Error>;
};
