import type { Type, inferTypeRoot } from "arktype";

// TODO: does arktype have a util we can import instead?
export type distillIn<def, $> = Type<inferTypeRoot<def, $>, $>["inferIn"];
export type distillOut<def, $> = Type<inferTypeRoot<def, $>, $>["infer"];

export type validate<
  base,
  validations extends unknown[],
> = validations extends [infer current, ...infer rest]
  ? current extends base
    ? validate<base, rest>
    : current
  : base;
