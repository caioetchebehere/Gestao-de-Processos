# Gestão de Processos

Aplicacao web estatica para cadastro e acompanhamento de processos e etapas, com visualizacao em tabela e grafico.

## Funcionalidades

- Criacao e edicao de processos.
- Cadastro, edicao e exclusao de etapas.
- Status por etapa.
- Grafico de evolucao do processo.
- Exportacao e importacao de dados em JSON.
- Persistencia remota no Vercel Blob.

## Estrutura do projeto

- `index.html`: estrutura da interface.
- `styles.css`: estilos da aplicacao.
- `app.js`: logica da aplicacao.
- `api/storage.js`: API para leitura/escrita no Vercel Blob.
- `vercel.json`: configuracao de deploy na Vercel.
- `package.json`: dependencias para funcoes serverless.

## Como executar localmente

Como agora existe API para persistencia no Vercel Blob, rode com ambiente Node/Vercel.

Se tiver Vercel CLI instalado:

```bash
vercel dev
```

Depois acesse: `http://localhost:3000`

## Deploy na Vercel

1. Suba o projeto para um repositorio GitHub/GitLab/Bitbucket (opcional, mas recomendado).
2. No painel da Vercel, clique em **Add New Project**.
3. Importe o repositorio (ou use deploy por pasta, se preferir).
4. Em configuracao do projeto:
   - Framework Preset: `Other`
   - Build Command: vazio
   - Output Directory: vazio
5. Clique em **Deploy**.

### Variaveis de ambiente (obrigatorio)

No projeto da Vercel, configure:

- `BLOB_READ_WRITE_TOKEN`: token da sua store Vercel Blob com permissao de leitura/escrita.

O arquivo `vercel.json` ja esta configurado para:

- URLs limpas (`cleanUrls`).
- Sem barra final (`trailingSlash: false`).
- Cache otimizado para arquivos estaticos.

## Observacoes

- Os dados ficam salvos no arquivo `gestao-processos/dados.json` dentro do Vercel Blob.
- Para desenvolvimento local sem Vercel CLI/API, a gravacao remota nao vai funcionar.
