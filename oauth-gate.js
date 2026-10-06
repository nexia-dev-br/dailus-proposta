// Portão de login Nexify (OAuth code + PKCE) na frente do site estático.
// Sessões ficam em memória: reiniciar o processo pede login de novo (SSO silencioso se o Router ainda tem a conta).
import { createHash, randomBytes } from 'node:crypto';

const COOKIE = 'nx_gate';
const FLOW = 'nx_flow';
const CHECK_EVERY_MS = 60_000;

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const cookie = (name, value, maxAge) =>
  `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

export function createGate({ clientId, publicUrl, routerUrl }) {
  const router = routerUrl.replace(/\/$/, '');
  const base = publicUrl.replace(/\/$/, '');
  const redirectUri = `${base}/oauth/callback`;
  const sessions = new Map(); // sid -> { access, refresh, email, checkedAt }
  const flows = new Map(); // state -> { verifier, returnTo, at }

  async function tokenCall(body) {
    const res = await fetch(`${router}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `token HTTP ${res.status}`);
    return data;
  }

  async function introspect(token, path) {
    const res = await fetch(`${router}/oauth/introspect`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ token, use: { surface: 'page', path } }),
    });
    return res.json().catch(() => ({ active: false }));
  }

  const hasAccess = (info) =>
    info?.active === true &&
    info.aud === clientId &&
    ((info.service_roles?.[clientId]?.length ?? 0) > 0 || (info.roles ?? []).includes('admin'));

  function startLogin(req, res, path) {
    for (const [k, v] of flows) if (Date.now() - v.at > 10 * 60_000) flows.delete(k);
    const state = b64url(randomBytes(16));
    const verifier = b64url(randomBytes(32));
    const challenge = b64url(createHash('sha256').update(verifier).digest());
    flows.set(state, { verifier, returnTo: path.startsWith('/') && !path.startsWith('//') ? path : '/', at: Date.now() });
    const q = new URLSearchParams({
      client_id: clientId, state, redirect_uri: redirectUri, code_challenge: challenge, code_challenge_method: 'S256',
    });
    res.writeHead(302, {
      location: `${router}/oauth/authorize?${q}`,
      'set-cookie': cookie(FLOW, state, 600),
      'cache-control': 'no-store',
    });
    res.end();
  }

  function deny(res, email) {
    res.writeHead(403, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sem acesso</title>
<body style="font-family:system-ui;max-width:32rem;margin:15vh auto;padding:0 1rem">
<h1>Sem acesso</h1><p>A conta ${email ? `<b>${String(email).replace(/[<>&"]/g, '')}</b>` : ''} não tem acesso a este app.</p>
<p><a href="${router}/oauth/authorize?client_id=${encodeURIComponent(clientId)}&prompt=select_account&redirect_uri=${encodeURIComponent(redirectUri)}">Entrar com outra conta</a> · <a href="/logout">Sair</a></p></body>`);
  }

  /** Retorna true se a requisição já foi respondida pelo portão. */
  return async function gate(req, res, path) {
    const cookies = parseCookies(req.headers.cookie);

    if (path === '/oauth/callback') {
      const url = new URL(req.url, base);
      const state = url.searchParams.get('state') || '';
      const flow = flows.get(state);
      const error = url.searchParams.get('error');
      if (!flow || cookies[FLOW] !== state) {
        // Fluxo perdido (reinício, aba antiga ou "entrar com outra conta"): começa de novo.
        if (url.searchParams.get('code') || error) return startLogin(req, res, '/'), true;
        res.writeHead(400).end('state inválido');
        return true;
      }
      flows.delete(state);
      if (error) { deny(res, null); return true; }
      try {
        const tokens = await tokenCall({
          grant_type: 'authorization_code',
          code: url.searchParams.get('code'),
          code_verifier: flow.verifier,
          redirect_uri: redirectUri,
        });
        const info = await introspect(tokens.access_token, flow.returnTo);
        if (!hasAccess(info)) { deny(res, info?.email ?? tokens.user?.email); return true; }
        const sid = b64url(randomBytes(24));
        sessions.set(sid, { access: tokens.access_token, refresh: tokens.refresh_token, email: info.email, checkedAt: Date.now() });
        res.writeHead(302, {
          location: flow.returnTo,
          'set-cookie': [cookie(COOKIE, sid, 30 * 24 * 3600), cookie(FLOW, '', 0)],
          'cache-control': 'no-store',
        });
        res.end();
      } catch (err) {
        console.error('[oauth] callback falhou:', err.message);
        res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' }).end('Falha no login. Tente de novo.');
      }
      return true;
    }

    if (path === '/logout') {
      const s = sessions.get(cookies[COOKIE]);
      sessions.delete(cookies[COOKIE]);
      if (s?.refresh) {
        fetch(`${router}/oauth/revoke`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ client_id: clientId, token: s.refresh }),
        }).catch(() => {});
      }
      const q = new URLSearchParams({ client_id: clientId, post_logout_redirect_uri: `${base}/` });
      res.writeHead(302, { location: `${router}/oauth/logout?${q}`, 'set-cookie': cookie(COOKIE, '', 0), 'cache-control': 'no-store' });
      res.end();
      return true;
    }

    const sid = cookies[COOKIE];
    const s = sid && sessions.get(sid);
    if (!s) { startLogin(req, res, path); return true; }

    if (Date.now() - s.checkedAt > CHECK_EVERY_MS) {
      let info = await introspect(s.access, path);
      if (!info.active && s.refresh) {
        try {
          const t = await tokenCall({ grant_type: 'refresh_token', refresh_token: s.refresh });
          s.access = t.access_token;
          s.refresh = t.refresh_token ?? s.refresh;
          info = await introspect(s.access, path);
        } catch { /* cai no login abaixo */ }
      }
      if (!hasAccess(info)) { sessions.delete(sid); startLogin(req, res, path); return true; }
      s.checkedAt = Date.now();
    }
    return false;
  };
}
