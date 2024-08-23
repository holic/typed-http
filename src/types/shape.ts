const brand = Symbol("isShape");

export type Shape<shape> = {
  readonly [brand]: undefined;
  readonly accepts: (value: unknown) => value is shape;
  readonly from: (value: unknown) => shape | Error;
};

export type innerShape<t> = t extends Shape<infer shape> ? shape : never;

export type isShape<t> = t extends Shape<any> ? true : false;
// TODO: should I use never or unknown in place of any in generic?
export function isShape(t: unknown): t is Shape<any> {
  return typeof t === "object" && t !== null && brand in t;
}
