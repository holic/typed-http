export type Shape<shape> = {
  accepts(value: unknown): value is shape;
  from(value: unknown): shape | Error;
};

export type innerShape<t> = t extends Shape<infer shape> ? shape : never;
