# Turismo Hoje

Portal editorial responsivo para Cloudflare Pages, integrado ao Correio Content Hub.

## O que inclui

- Home editorial com destaques, busca, editorias e paginação progressiva.
- Página própria por matéria em `/materia/:id`, renderizada pela Pages Function com título, descrição, canonical e Open Graph no HTML inicial.
- Proxy server-side para a API do Hub; o navegador não recebe credenciais.
- Cache curto no edge e aviso de contingência no site quando o Hub estiver indisponível.

## Cloudflare Pages

Faça upload do conteúdo desta pasta pelo Wrangler a partir da raiz:

```sh
npx wrangler pages deploy public --project-name turismo-hoje --branch main
```

Para incluir as Pages Functions, rode o comando na raiz do projeto (onde está `functions/`). Associe `turismohoje.com.br` e `www.turismohoje.com.br` ao projeto. Se o Hub usar outro domínio, defina a variável `HUB_ORIGIN` nas configurações do projeto.

## Integração

O proxy usa `GET /api/v1/sites/by-domain/articles?domain=turismohoje.com.br`. As matérias e as categorias precisam estar publicadas no site Turismo Hoje dentro do Hub. O proxy de matéria usa `GET /api/v1/articles/:id`.

A criação editorial direta pelo repórter ainda precisa ser adicionada ao painel Rails do Hub. A migration desta integração cadastra o site e suas editorias; o portal lê somente matérias já publicadas.
