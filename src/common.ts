export type freeze<input> = {
  readonly [key in keyof input]: input[key];
} & unknown;

// TODO: skip types that can't be mapped, like functions
export type deepFreeze<input> = {
  readonly [key in keyof input]: deepFreeze<input[key]>;
} & unknown;

export type inner<items> = items extends ReadonlyArray<infer t>
  ? t
  : items extends Array<infer t>
  ? t
  : items extends Set<infer t>
  ? t
  : never;

export function has<t>(
  items: ReadonlyArray<t> | Array<t> | Set<t>,
  item: unknown
): item is t {
  if (Array.isArray(items)) {
    return items.includes(item as never);
  } else if (items instanceof Set) {
    return items.has(item as never);
  }
  throw new Error("Unknown items type.");
}
