const { put, head } = require('@vercel/blob');

const BLOB_PATH = 'gestao-processos/dados.json';

function enviarJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const blobInfo = await head(BLOB_PATH);
      const resp = await fetch(blobInfo.url, { cache: 'no-store' });
      if (!resp.ok) {
        return enviarJson(res, 500, { error: 'Falha ao ler blob.' });
      }
      const data = await resp.json();
      return enviarJson(res, 200, data);
    } catch (error) {
      if (error && error.name === 'BlobNotFoundError') {
        return enviarJson(res, 404, { error: 'Dados ainda nao inicializados.' });
      }
      return enviarJson(res, 500, { error: 'Erro ao buscar dados no Vercel Blob.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || typeof body !== 'object') {
        return enviarJson(res, 400, { error: 'Payload invalido.' });
      }
      await put(BLOB_PATH, JSON.stringify(body), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json'
      });
      return enviarJson(res, 200, { ok: true });
    } catch (error) {
      return enviarJson(res, 500, { error: 'Erro ao gravar dados no Vercel Blob.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return enviarJson(res, 405, { error: 'Metodo nao permitido.' });
};
