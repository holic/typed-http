import { flatMorph } from "@ark/util";

/**
 * Serializable data compatible with `URLSearchParams`.
 */
export type InputParams = {
  [param: string]: string | string[];
};

export function toInputParams(params: URLSearchParams): InputParams {
  const values: Record<string, string[]> = {};
  for (const [name, value] of params.entries()) {
    values[name] ??= [];
    values[name].push(value);
  }
  return flatMorph(values, (name, values) => [
    name,
    values.length === 1 ? values[0]! : values,
  ]);
}
