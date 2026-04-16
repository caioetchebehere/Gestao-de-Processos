'use strict';

// Vercel KV (Upstash Redis) — REST API, no npm package needed.
// Environment variables added automatically when you connect a KV store in the
// Vercel dashboard (Storage → Create Database → KV):
//   KV_REST_API_URL
//   KV_REST_API_TOKEN

const CLIENT_ID_RE = /^[a-f0-9]{32}$/;
const KEY_PREFIX    = 'gp:';
const TTL_SECONDS   = 365 * 24 * 60 * 60; // 1 year

function clientKey(id) {
  return KEY_PREFIX + id;
}

async function kvGet(key) {
  const { KV_REST_API_URL: base, KV_REST_API_TOKEN: token } = process.env;
  const res = await fetch(`${base}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('KV GET ' + res.status);
  const { result } = await res.json();
  return result != null ? JSON.parse(result) : null;
}

async function kvSet(key, value) {
  const { KV_REST_API_URL: base, KV_REST_API_TOKEN: token } = process.env;
  const res = await fetch(`${base}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([
      ['SET', key, JSON.stringify(value), 'EX', TTL_SECONDS]
    ])
  });
  if (!res.ok) throw new Error('KV SET ' + res.status);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return res.status(503).json({ error: 'Serviço de armazenamento não configurado. Conecte um banco KV no painel do Vercel.' });
  }

  // ── GET /api/data?clientId=<uuid> ──────────────────────────────────────────
  if (req.method === 'GET') {
    const { clientId } = req.query;
    if (!clientId || !CLIENT_ID_RE.test(clientId)) {
      return res.status(400).json({ error: 'clientId inválido.' });
    }
    try {
      const data = await kvGet(clientKey(clientId));
      return res.status(200).json({ data });
    } catch (e) {
      console.error('GET error:', e.message);
      return res.status(500).json({ error: 'Erro ao carregar dados.' });
    }
  }

  // ── POST /api/data  { clientId, state } ────────────────────────────────────
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {
        return res.status(400).json({ error: 'JSON inválido.' });
      }
    }
    const { clientId, state } = body || {};
    if (!clientId || !CLIENT_ID_RE.test(clientId)) {
      return res.status(400).json({ error: 'clientId inválido.' });
    }
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      return res.status(400).json({ error: 'state inválido.' });
    }
    try {
      await kvSet(clientKey(clientId), state);
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('POST error:', e.message);
      return res.status(500).json({ error: 'Erro ao salvar dados.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Método não permitido.' });
};
