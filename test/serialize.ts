export async function serializeRequest(req: Request) {
  return `${req.method} ${req.url} HTTP/1.1\n${Array.from(req.headers)
    .map(([name, value]) => `${name}: ${value}\n`)
    .join("")}\n${await req.text()}`.trim();
}

export async function serializeResponse(res: Response | null) {
  if (!res) return null;
  return `HTTP/1.1 ${res.status} ${res.statusText}\n${Array.from(res.headers)
    .map(([name, value]) => `${name}: ${value}\n`)
    .join("")}\n${await res.text()}`.trim();
}
