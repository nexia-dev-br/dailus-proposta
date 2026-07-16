# Proposta Nexify × Dailus

Pacote de inteligência e proposta comercial para levar a **camada conversacional da Nexia** (IA 24/7 no WhatsApp: SAC, venda consultiva e pós-venda) para a **Dailus** — marca de cosméticos D2C em Shopify.

> Uso interno / confidencial · Última atualização: 15/07/2026
> Empresa: **Nexify** (nexify.ink) · Produto: **Nexia Platform** (Nexify Message Broker) · 1º tenant em produção: **JoIA / ProsperIA**

## Conteúdo desta pasta

| Arquivo | O que é |
|---|---|
| [`01-inteligencia-dailus.md`](01-inteligencia-dailus.md) | Tudo que aprendemos sobre a Dailus: empresa, catálogo real (extração do site), stack de e-commerce, reputação, políticas e **gaps** que a Nexia resolve. |
| [`02-o-que-temos-nexia.md`](02-o-que-temos-nexia.md) | O que já temos pronto no Prosperia/Nexia: plataforma, módulos reutilizáveis, tools, arquitetura e prova de produção. |
| [`03-proposta-para-dailus.md`](03-proposta-para-dailus.md) | O que podemos propor: pacotes (Care, Beauty, Recompra, Creators, Insights), `connector-shopify`, pricing, roadmap MVP, roteiro de discovery e respostas a objeções. |
| [`04-voz-da-marca-babi.md`](04-voz-da-marca-babi.md) | **Guia de voz da marca** extraído do conteúdo real da @babidadailus (transcrições + legendas): tom, vocabulário, bordões e exemplos de mensagens da "Dai" para o PromptOps. |
| [`05-abordagem-diego-kilpp.md`](05-abordagem-diego-kilpp.md) | **One-pager de abordagem** ao comprador econômico (CFO/COO Diego Kilpp): tese em linguagem de CFO, ROI, quick win dos 90 dias e a relação quente/insider (Diego é co-fundador da Nexify). |
| [`06-solucoes-tecnologia.md`](06-solucoes-tecnologia.md) | **Catálogo de soluções por objetivo** (vender mais · proximidade · comunicação · margem · vínculo): cada solução ancorada numa evidência real coletada, mapeada ao módulo Nexia e ao pacote. |
| [`proposta/`](proposta/) | **Apresentação visual completa** (modular): `index.html` (shell) + `styles.css` + `app.js` + **um arquivo por slide** em `proposta/slides/`. Dailus → Nexify → produto Nexia → voz da marca → o que construiríamos para a Dailus. |
| [`proposta/explorer.html`](proposta/explorer.html) | **Explorador de catálogo** (interativo): busca por nome/SKU/EAN/linha/categoria, **comparativo de preço** entre os sites explorados (Época + Pague Menos) e **todas as imagens** de cada produto em cada site. Dados em `proposta/data/catalog.json`, gerados por `backend/build_explorer.py`. |

## Como usar

1. **Abra a apresentação:** sirva a pasta via HTTP e acesse `proposta/index.html`.
   ```bash
   python3 -m http.server 8802   # na raiz do projeto (daillus)
   # http://127.0.0.1:8802/proposta-dailus/proposta/index.html
   ```
   > A apresentação carrega os slides via `fetch`, então precisa de um servidor (abrir por `file://` não funciona).
2. **Aprofunde nos documentos:** os `.md` sustentam cada afirmação da apresentação com dados e detalhamento técnico/comercial.
3. **Antes da reunião:** revise o roteiro de discovery em `03-proposta-para-dailus.md` (§ Discovery) e a mensagem de abordagem.

## Editar a apresentação (estrutura modular)

Para facilitar manutenção e edição concorrente, cada slide é um arquivo isolado:

- `proposta/slides/NN-nome.html` — **um slide por arquivo** (edite o conteúdo aqui).
- `proposta/app.js` — a lista `SLIDES` define a **ordem** dos slides (adicionar/remover/reordenar = editar essa lista + o arquivo).
- `proposta/styles.css` — todos os estilos compartilhados.
- `proposta/index.html` — só o "shell" (nav + container + imports).

Slides atuais: `01-hero` · `02-band` · `03-dailus` · `04-profundidade` · `05-reputacao` · `06-grupo` · `07-nexify` · `08-produto` · `09-voz` · `09b-solucoes` · `10-proposta` · `11-decisores` · `12-cta` · `13-footer`.

## Fontes dos dados

- **Catálogo Dailus:** extração direta das APIs públicas do Shopify (`products.json`, `collections.json`) em 15/07/2026 — ver `../data/` e `../analise/ANALISE.md` (375 produtos, 107 coleções, 1.620 imagens).
- **Empresa/stack/reputação:** deal briefing de campo (site, Instagram, Linktree, Reclame Aqui, apps detectados no storefront).
- **Nexia/Prosperia:** `../../prosperia/docs/oportunidades-mercado-nexia.md` e o repositório `../../prosperia`.
- **Nexify:** `../../site_nexify/index.html`.
