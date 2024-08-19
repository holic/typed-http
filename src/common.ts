export type freeze<input> = {
  readonly [key in keyof input]: input[key];
} & unknown;

// TODO: skip types that can't be mapped, like functions
export type deepFreeze<input> = {
  readonly [key in keyof input]: deepFreeze<input[key]>;
} & unknown;
