export type deepFreeze<input> = {
  readonly [key in keyof input]: deepFreeze<input[key]>;
} & unknown;
