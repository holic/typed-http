import type { conform } from "@ark/util";
import type { innerShape } from "./shape.js";
import type { Pipe } from "./pipe.js";

export type Action<input extends Pipe.Any, output extends Pipe.Any> = {
  input: input;
  output: output;
  execute<const value>(
    value: conform<value, innerShape<input["input"]>>
  ): Promise<innerShape<output["output"]> | Error>;
};
