// Porta JS de bootService (ddns_router/backend/sdk/index.ts).
async function request(baseUrl, token, path, init = {}) {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body;
}

/** ensure na pasta, aplica variáveis em memória e devolve host/porta. Não grava segredo. */
export async function bootService({ name, directory, kind, baseUrl, token }) {
  baseUrl = baseUrl ?? process.env.ROUTER_URL;
  token = token ?? process.env.ROUTER_TOKEN;
  if (!baseUrl || !token) throw new Error('Defina ROUTER_URL e ROUTER_TOKEN');
  const cfg = await request(baseUrl, token, '/api/services/ensure', {
    method: 'POST',
    body: JSON.stringify({ name, directory, kind }),
  });
  const env = await request(baseUrl, token, `/api/services/${encodeURIComponent(name)}/env`);
  for (const [k, v] of Object.entries(env.vars ?? {})) process.env[k] = v;
  return cfg;
}
