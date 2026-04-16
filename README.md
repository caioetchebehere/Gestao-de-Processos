# Gerenciamento de Processos

Aplicacao web estatica para cadastro e acompanhamento de processos e etapas, com visualizacao em tabela e grafico.

## Funcionalidades

- Criacao e edicao de processos.
- Cadastro, edicao e exclusao de etapas.
- Status por etapa.
- Grafico de evolucao do processo.
- Exportacao e importacao de dados em JSON.
- Persistencia local no navegador (`localStorage`).

## Estrutura do projeto

- `index.html`: estrutura da interface.
- `styles.css`: estilos da aplicacao.
- `app.js`: logica da aplicacao.
- `vercel.json`: configuracao de deploy na Vercel.

## Como executar localmente

Como o projeto e estatico, basta abrir o `index.html` no navegador.

Opcionalmente, voce pode rodar um servidor local simples:

```bash
python -m http.server 8000
```

Depois acesse: `http://localhost:8000`

## Deploy na Vercel

1. Suba o projeto para um repositorio GitHub/GitLab/Bitbucket (opcional, mas recomendado).
2. No painel da Vercel, clique em **Add New Project**.
3. Importe o repositorio (ou use deploy por pasta, se preferir).
4. Em configuracao do projeto:
   - Framework Preset: `Other`
   - Build Command: vazio
   - Output Directory: vazio
5. Clique em **Deploy**.

O arquivo `vercel.json` ja esta configurado para:

- URLs limpas (`cleanUrls`).
- Sem barra final (`trailingSlash: false`).
- Cache otimizado para arquivos estaticos.

## Observacoes

- Os dados ficam salvos no navegador do usuario (`localStorage`).
- Limpar dados do navegador pode remover os processos salvos localmente.
