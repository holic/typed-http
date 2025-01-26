const brand = Symbol("Shape");
type brand = typeof brand;

export type Shape<shape> = {
  readonly [brand]: true;
  readonly accepts: (value: unknown) => value is shape;
  readonly from: (value: unknown) => shape;
};

export type isShape<t> = t extends Shape<any> ? true : false;
// TODO: should I use never or unknown in place of any in generic?
export function isShape(t: unknown): t is Shape<any> {
  return typeof t === "object" && t !== null && brand in t;
}

// TODO: validate
export function defineShape<const shape extends Omit<Shape<any>, brand>>(
  shape: shape
): shape & { [brand]: true } {
  return { ...shape, [brand]: true };
}
