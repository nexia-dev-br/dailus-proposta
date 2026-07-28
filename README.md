# Nexify × Dailus — material navegável (GitHub Pages)

Site estático publicado no GitHub Pages para a Dailus navegar no material construído pela Nexify.

**Entrada:** `index.html` na raiz é um **hub** com os três materiais.

## O que está publicado

| Material | Caminho |
|---|---|
| **Hub** (entrada) | `index.html` |
| **Proposta · plataforma do programa de influenciadoras** | `proposta-plataforma-influencers/proposta/index.html` |
| **Deal briefing · a leitura da Dailus** | `proposta-dailus/proposta/index.html` |
| Explorador de catálogo | `proposta-dailus/proposta/explorer.html` |
| Vitrine (showcase) | `proposta-dailus/proposta/showcase.html` |
| **Loja / e-commerce demo** | `frontend/index.html` |

Os dois decks têm modo apresentação: tecla `P` · setas `←` `→` · `M` abre miniaturas · `F` tela cheia.

## Dados

Só foram incluídos os arquivos de mídia realmente referenciados pelo `catalog.json` e pelos slides
(imagens de produto, imagens de concorrentes usadas no explorer e os vídeos usados no bloco da Babi).
Raw de scraping, CSVs, `node_modules`, `backend/`, documentos internos (`app-comunidade/`) e os PDFs
dos dossiês **não** vão para o Pages.

O deck da plataforma de influenciadoras **não depende de `data/`** — usa apenas os próprios `assets/`.

## Este repositório é público e sem autenticação

Não há gate de senha. O conteúdo está acessível a qualquer pessoa com o link.

O que existe é apenas **dissuasão de indexação**, para o material não aparecer em busca:

- `robots.txt` na raiz com `Disallow: /`
- `<meta name="robots" content="noindex, nofollow, noarchive">` nas páginas de entrada

> **Histórico, para não repetir o erro:** este README já descreveu um "gate de senha no front"
> (senha `dailus2026`, hash inline em 4 páginas). Ele **existiu apenas nesta cópia do Pages** e foi
> apagado por um `rsync --delete` do `scripts/deploy.sh`, que espelha a origem — e a origem nunca
> teve o gate. **Qualquer proteção adicionada só aqui será silenciosamente removida no próximo deploy.**
> Se for para existir, tem que estar na origem (`dailus-projeto`) ou fora do caminho do rsync
> (ex.: Cloudflare Access na frente do domínio).

## Deploy

Não edite este repositório à mão. A publicação é feita pelo script da origem:

```bash
# no repo de origem (dailus-projeto)
npm run deploy                 # mensagem automática (timestamp)
npm run deploy -- "mensagem"   # mensagem personalizada
```

O script commita e empurra a origem, espelha as pastas navegáveis para cá com `rsync --delete`
(preservando `.github/`, `.nojekyll`, este README e o `data/`), commita e empurra — o que dispara
o GitHub Actions (`.github/workflows/deploy.yml`).

Em **Settings → Pages**, a origem deve estar como **GitHub Actions**.

**Pastas espelhadas pelo deploy** (o que estiver aqui e não na origem é removido):
`proposta-dailus/proposta/` · `proposta-plataforma-influencers/proposta/` · `frontend/`
Mais os arquivos copiados: `index.html` e `robots.txt`.
