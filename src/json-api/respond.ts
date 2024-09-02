import type { Json } from "@ark/util";

// TODO: fill in status text?

export function empty(res?: ResponseInit): Response {
  return new Response(null, res);
}

export function json(body: Json, res?: ResponseInit): Response {
  return new Response(body != null ? JSON.stringify(body, null, 2) : null, {
    ...res,
    headers: {
      ...res?.headers,
      "Content-Type": "application/json",
    },
  });
}

export function ok(body?: Json | null, res?: ResponseInit): Response {
  return body == null ? empty(res) : json(body, res);
}

export function error(body?: Error | null, res?: ResponseInit): Response {
  // TODO: create specific errors subclasses for different status codes?
  // TODO: expose stack trace in dev?
  const resInit = { status: 500, ...res };
  return body == null ? empty(resInit) : json({ error: body.message }, resInit);
}

export function redirect(to: string | URL, res?: ResponseInit): Response {
  return empty({
    status: 307,
    ...res,
    headers: {
      ...res?.headers,
      Location: to instanceof URL ? to.toString() : to,
    },
  });
}

export function redirectPermanently(
  to: string | URL,
  res?: ResponseInit
): Response {
  return redirect(to, {
    status: 308,
    ...res,
  });
}

export function notFound(
  body: Error = new Error("Not found."),
  res?: ResponseInit
): Response {
  return error(body, { status: 404, ...res });
}
