import { Redis } from '@upstash/redis';

const CHAVE = 'gestao-novos-processos:estado';

/**
 * GET: devolve o JSON guardado (ou null).
 * PUT: grava o corpo JSON (objeto com processos, processoAtualId, versao).
 *
 * Configure Redis na Vercel: Marketplace → Redis (Upstash) → Connect ao projeto.
 * As variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN são injetadas automaticamente.
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(503).json({
      error: 'storage_unavailable',
      message: 'Redis (Upstash) não configurado no projeto Vercel.'
    });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });

  try {
    if (req.method === 'GET') {
      const data = await redis.get(CHAVE);
      return res.status(200).json(data ?? null);
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || 'null') : req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'invalid_body' });
      }
      await redis.set(CHAVE, body);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    return res.status(503).json({
      error: 'storage_unavailable',
      message: err && err.message ? String(err.message) : 'unknown'
    });
  }
}
