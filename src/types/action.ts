import { noSuggest } from "@ark/util";
import type { Codec } from "./codec.js";

const brand = noSuggest("Action");
type brand = typeof brand;

export type Action<
  input extends Codec<any, any>,
  output extends Codec<any, any>,
  executeInput = input extends Codec<any, infer decoded> ? decoded : never,
  executeOutput = output extends Codec<any, infer decoded> ? decoded : void,
> = {
  [brand]: undefined;
  input?: input;
  output?: output;
  execute(args: { input: executeInput }): Promise<executeOutput>;
};

export type isAction<t> = t extends Action<any, any> ? true : false;
// TODO: should I use never or unknown in place of any in generic?
export function isAction(t: unknown): t is Action<any, any> {
  return typeof t === "object" && t !== null && brand in t;
}

// assumes validated action
export type defineAction<action> = action & { [brand]: undefined };

export function defineAction<const action>(
  // TODO: validate
  action: action
): defineAction<action> {
  return { ...action, [brand]: undefined };
}
