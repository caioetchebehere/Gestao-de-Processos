import { list, put } from '@vercel/blob';

/** Prefixo customizado na Vercel: GESTAO_BLOB → GESTAO_BLOB_READ_WRITE_TOKEN */
const BLOB_TOKEN =
  process.env.GESTAO_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

const PATHNAME = 'gestao-novos-processos/estado-app.json';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

function missingTokenResponse() {
  return Response.json(
    {
      error: 'missing_blob_token',
      message:
        'Configure GESTAO_BLOB_READ_WRITE_TOKEN (prefixo GESTAO_BLOB ao ligar o Blob) ou BLOB_READ_WRITE_TOKEN.'
    },
    { status: 503, headers: JSON_HEADERS }
  );
}

/** Formato Web API (GET/PUT) exigido pela Vercel em projetos estáticos; o antigo (req, res) devolve NOT_FOUND. */
export async function GET() {
  const token = BLOB_TOKEN;
  if (!token) return missingTokenResponse();

  try {
    const { blobs } = await list({ prefix: 'gestao-novos-processos/', token });
    const blob = blobs.find((b) => b.pathname === PATHNAME);
    if (!blob) {
      return new Response(null, { status: 404 });
    }
    const r = await fetch(blob.url);
    if (!r.ok) {
      return Response.json(
        { error: 'blob_fetch_failed', status: r.status },
        { status: 502, headers: JSON_HEADERS }
      );
    }
    const text = await r.text();
    return new Response(text, { status: 200, headers: JSON_HEADERS });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: 'get_failed', message: e.message || String(e) },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function PUT(request) {
  const token = BLOB_TOKEN;
  if (!token) return missingTokenResponse();

  try {
    let data;
    try {
      data = await request.json();
    } catch {
      return Response.json({ error: 'invalid_json' }, { status: 400, headers: JSON_HEADERS });
    }
    if (data == null || typeof data !== 'object') {
      return Response.json({ error: 'invalid_json' }, { status: 400, headers: JSON_HEADERS });
    }
    await put(PATHNAME, JSON.stringify(data), {
      access: 'public',
      token,
      contentType: 'application/json; charset=utf-8',
      addRandomSuffix: false,
      allowOverwrite: true
    });
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: 'put_failed', message: e.message || String(e) },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
