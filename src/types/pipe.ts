import type { conform } from "@ark/util";
import type { Shape } from "./shape.js";

export type Pipe<input, output, pipeOutput = output | Error> = {
  input: Shape<input>;
  output: Shape<output>;
  pipe<const value>(value: conform<value, input>): pipeOutput;
};

export declare namespace Pipe {
  /**
   * Only use as a type constraint (e.g. extends), never as a value type.
   */
  export type Any = Pipe<any, any>;
}
