import type { ErrorMessage, Json } from "@ark/util";
import {
  type,
  type inferAmbient,
  type Type,
  type validateAmbient,
} from "arktype";
import type { ArktypeAction } from "./arktype.js";
import type { InputParams } from "./inputParams.js";

export type validateInputDef<
  def,
  t = inferAmbient<def>,
> = Type<t>["inferIn"] extends InputParams
  ? def
  : ErrorMessage<"Input must be compatible with `URLSearchParams` and `FormData` with `string` keys and `string` or `string[]` values.">;

export type validateOutputDef<
  def,
  t = inferAmbient<def>,
> = Type<t>["infer"] extends Json
  ? def
  : ErrorMessage<"Output must be JSON serializable.">;

export function createHttpAction<inputDef, outputDef>(opts: {
  input: validateAmbient<inputDef> & validateInputDef<inputDef>;
  output: validateAmbient<outputDef> & validateOutputDef<outputDef>;
  execute: ArktypeAction<inputDef, outputDef>["execute"];
}): ArktypeAction<inputDef, outputDef> {
  const input = type(opts.input as never);
  // const input = type(opts.input);
  // const output = type(opts.output);
  // return {
  //   input: {
  //     input: input.
  //   },
  //   output: opts.output as outputDef,
  //   execute: opts.execute,
  // };
}