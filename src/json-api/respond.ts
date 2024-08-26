import type { Json } from "@ark/util";

// TODO: constrain status codes
export function ok(body?: Json | null, res?: ResponseInit): Response {
  return new Response(body != null ? JSON.stringify(body) : null, {
    status: 200,
    ...res,
    headers: {
      ...res?.headers,
      "Content-Type": "application/json",
    },
  });
}

// TODO: constrain status codes
export function error(body?: Error | null, res?: ResponseInit): Response {
  // TODO: check for specific errors
  // TODO: expose stack trace in dev?
  return new Response(
    body != null
      ? JSON.stringify({
          error: body.message,
        })
      : null,
    {
      status: 500,
      ...res,
      headers: {
        ...res?.headers,
        "Content-Type": "application/json",
      },
    }
  );
}

// TODO: constrain status codes
export function redirect(to: string | URL, res?: ResponseInit): Response {
  return new Response(null, {
    status: 307,
    ...res,
    headers: {
      ...res?.headers,
      Location: to instanceof URL ? to.toString() : to,
    },
  });
}

export function notFound(
  body: Error = new Error("Not found."),
  res?: ResponseInit
): Response {
  return error(body, { ...res, status: 404 });
}
