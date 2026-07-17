# Nexify × Dailus — Proposta + Loja demo (GitHub Pages)

Site estático publicado no GitHub Pages para a Dailus navegar no material construído pela Nexify.

## O que está incluído

- **Loja / e-commerce demo** — `frontend/` (ponto de entrada: `index.html` na raiz redireciona para `frontend/index.html`).
- **Proposta / apresentação** — `proposta-dailus/proposta/index.html`
- **Explorador de catálogo** — `proposta-dailus/proposta/explorer.html`
- **Vitrine (showcase)** — `proposta-dailus/proposta/showcase.html`

## Dados

Só foram incluídos os arquivos de mídia realmente referenciados pelo `catalog.json` e pelos slides
(imagens de produto, imagens de concorrentes usadas no explorer e os vídeos usados no bloco da Babi).
Raw de scraping, CSVs, `node_modules`, `backend/` e o PDF do dossiê **não** vão para o Pages.

## Acesso restrito

O GitHub Pages não suporta Basic Auth, então há um **gate de senha no front** (inline nas páginas de entrada).
Não é segurança forte (o hash está no código-fonte), apenas bloqueia acesso casual.

- Senha atual: `dailus2026`
- Para trocar: gere `printf 'NOVA_SENHA' | shasum -a 256` e substitua o hash `H=...` nas 4 páginas de entrada.

## Deploy

Publicação automática via GitHub Actions (`.github/workflows/deploy.yml`) a cada push na `main`.
Em Settings → Pages, a origem deve estar como **GitHub Actions**.
