import type { inferAmbient, Type } from "arktype";

export type Shape<shape> = {
  is(value: unknown): value is shape;
  validate(value: unknown): shape | Error;
};

export type Pipe<input, output, pipeOutput = output | Error> = {
  input: Shape<input>;
  output: Shape<output>;
  pipe(value: input): pipeOutput;
};

// turn arktype def into pipe
type inferArktypePipe<def, t = inferAmbient<def>> = {
  input: {
    is(value: unknown): value is Type<t>["inferIn"];
    validate(value: unknown): Type<t>["inferIn"] | Error;
  };
  output: {
    is(value: unknown): value is Type<t>["infer"];
    validate(value: unknown): Type<t>["infer"] | Error;
  };
  pipe(value: Type<t>["inferIn"]): Type<t>["infer"] | Error;
};

export type Action<
  input extends Pipe<any, any>,
  output extends Pipe<any, any>
> = Pipe<input, output, Promise<output | Error>>;

// turn arktype input/output defs into an action
type inferArktypeAction<inputDef, outputDef> = Action<
  inferArktypePipe<inputDef>,
  inferArktypePipe<outputDef>
>;
