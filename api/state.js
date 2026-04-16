import { list, put } from '@vercel/blob';

const PATHNAME = 'gestao-novos-processos/estado-app.json';

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : null);
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(503).json({
      error: 'missing_blob_token',
      message: 'Defina o store Blob no projeto (Vercel: Storage > Blob > conectar) para gerar BLOB_READ_WRITE_TOKEN.'
    });
  }

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: 'gestao-novos-processos/', token });
      const blob = blobs.find((b) => b.pathname === PATHNAME);
      if (!blob) {
        return res.status(404).end();
      }
      const r = await fetch(blob.url);
      if (!r.ok) {
        return res.status(502).json({ error: 'blob_fetch_failed', status: r.status });
      }
      const text = await r.text();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).send(text);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'get_failed', message: e.message || String(e) });
    }
  }

  if (req.method === 'PUT') {
    try {
      const data = await readJsonBody(req);
      if (data == null || typeof data !== 'object') {
        return res.status(400).json({ error: 'invalid_json' });
      }
      await put(PATHNAME, JSON.stringify(data), {
        access: 'public',
        token,
        contentType: 'application/json; charset=utf-8',
        addRandomSuffix: false,
        allowOverwrite: true
      });
      return res.status(204).end();
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'put_failed', message: e.message || String(e) });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'method_not_allowed' });
}
