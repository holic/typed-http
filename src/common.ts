export type inner<items> =
  items extends ReadonlyArray<infer t>
    ? t
    : items extends Set<infer t>
      ? t
      : never;

export function has<const t>(
  items: ReadonlyArray<t> | Set<t>,
  item: unknown
): item is t {
  if (Array.isArray(items)) {
    return items.includes(item as never);
  } else if (items instanceof Set) {
    return items.has(item as never);
  }
  throw new Error("Unknown items type.");
}
