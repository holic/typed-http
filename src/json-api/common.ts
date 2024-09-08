export const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type methods = typeof methods;

export type Method = methods[number];
