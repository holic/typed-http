export const _isShape = Symbol("isShape");
export type _isShape = typeof _isShape;

export type Shape<shape> = {
  [_isShape]: true;
  accepts(value: unknown): value is shape;
  from(value: unknown): shape | Error;
};

export type innerShape<t> = t extends Shape<infer shape> ? shape : never;

export type isShape<t> = t extends Shape<any> ? true : false;
export function isShape(t: unknown): t is Shape<unknown> {
  return typeof t === "object" && t !== null && _isShape in t;
}
