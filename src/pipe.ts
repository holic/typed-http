import type { conform } from "@ark/util";
import type { inferAmbient, Type, validateAmbient } from "arktype";

export type Shape<shape> = {
  shape: shape;
  is(value: unknown): value is shape;
  validate(value: unknown): shape | Error;
};

export type Pipe<input, output, pipeOutput = output | Error> = {
  input: Shape<input>;
  output: Shape<output>;
  pipe<const value>(value: conform<value, input>): pipeOutput;
};

// turn arktype def into pipe
type inferArktypePipe<def, t = inferAmbient<def>> = Pipe<
  Type<t>["inferIn"],
  Type<t>["infer"]
>;

export type Action<
  input extends Pipe<any, any>,
  output extends Pipe<any, any>
> = {
  input: input;
  output: output;
  pipe<const value>(
    value: conform<value, input["input"]["shape"]>
  ): Promise<output["output"]["shape"] | Error>;
};

// turn arktype input/output defs into an action
type inferArktypeAction<inputDef, outputDef> = Action<
  inferArktypePipe<inputDef>,
  inferArktypePipe<outputDef>
>;

function createShape<def>(def: validateAmbient<def>): inferArktypePipe<def> {
  return {} as never;
}

function createAction<inputDef, outputDef>(
  inputDef: validateAmbient<inputDef>,
  outputDef: validateAmbient<outputDef>
): inferArktypeAction<inputDef, outputDef> {
  return {} as never;
}

const listUsers = createAction(
  {
    "limit?": ["string", "=>", (str) => parseInt(str)],
  },
  [
    {
      id: "number",
      username: "string",
    },
    "[]",
  ]
);

listUsers.pipe({ limit: "1" });
