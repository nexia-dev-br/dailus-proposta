# 02 · O que temos no Prosperia / Nexia

> O ativo que sustenta a proposta: a **plataforma Nexia** (repositório `prosperia`, nome interno *Nexify Message Broker*), já em **produção** como **JoIA** — o assistente WhatsApp da **ProsperIA**.
> Referência completa: `../../prosperia/docs/oportunidades-mercado-nexia.md` e o repositório `../../prosperia`.

---

## 1. O que é (em uma frase)

Uma plataforma **multi-tenant** de **IA conversacional operacional** que conecta **WhatsApp + IA + painel admin** ao sistema de negócio do cliente (app financeiro, e-commerce, etc.) — provada em produção, **~70% reutilizável** entre clientes.

**Tese central:** o ativo vendável não é "um bot" — é a **camada conversacional enterprise** (IA + filas + observabilidade + integrações) validada em operação real.

### Três camadas do produto
```
CAMADA 3 — EXPERIÊNCIA (marca do cliente)
  JoIA (ProsperIA) · "Dai" beauty (futuro Dailus) · white-label
  Prompts · persona · tools de domínio · flows

CAMADA 2 — PLATAFORMA NEXIA (reutilizável ~70%)
  Multi-tenant · Conversas · Alertas · Campanhas · Classificação
  Documentos/OCR · Cron · Diagnósticos · PromptOps · Admin UI

CAMADA 1 — CONNECTORS (adaptadores por vertical)
  prosperia-api · manychat/meta · openai/gemini · (futuro: shopify)
```

---

## 2. Prova de maturidade (produção real)

| Evidência | Número |
|---|---|
| Clientes ativos (JoIA em produção) | 65+ |
| Telas de painel admin (Nexia Console) | 55 |
| Tools conversacionais (function calling) | 47 |
| Cron jobs / handlers | 25+ |
| Testes automatizados (Jest) | 1.300+ |
| Custo operacional estimado por cliente | ~R$ 1,60/dia |
| Disponibilidade do atendimento | 24/7 |

Fonte cruzada: case ProsperIA no site da Nexify (`../../site_nexify/index.html`).

---

## 3. Módulos PRONTOS e reutilizáveis para a Dailus

> "Pronto" = existe em produção hoje; para a Dailus muda a configuração/conteúdo, não o código.

| Módulo Nexia | Função | Reuso Dailus |
|---|---|---|
| `webhook` + `conversation` + `messaging` | Bot WhatsApp (motor conversacional) | ✅ rebrand persona "Dai" |
| `faq` | Base de conhecimento injetável | ✅ ingerir políticas Dailus (troca/entrega/pagamento) |
| `file-upload` + OCR/Vision/Whisper | Pipeline de documentos (foto/PDF/áudio) | ✅ foto de defeito de produto |
| `conversation` admin | Handoff humano com transcript | ✅ fila SAC Dailus |
| `feedback` | CSAT pós-atendimento | ✅ trigger pós-SAC |
| `campaign` + `segment` + `alert` | Campanhas e disparos segmentados | ✅ recompra / lançamentos |
| `diagnostics` + `system-health` | Observabilidade e painel operacional | ✅ painel SAC Dailus |
| `prompt` / PromptOps | Controle de tom de marca (Gen Z) + experimentos | ✅ família de prompts beauty/SAC |
| `multi-tenant` | Isolamento por organização | ✅ **Dailus + Sweet Skin + Fortilon sob 1 contrato** |

### Capacidades de IA já implementadas
- **47 tools conversacionais** (function calling) — no domínio financeiro hoje; a arquitetura de tools é reaproveitada para o domínio beleza/commerce.
- **Classificação em 5 camadas** (regras BR → mapa → Naive Bayes → histórico → LLM em lote) com fila de revisão por confiança e *fast-path* determinístico (sem LLM) para intents simples — reduz custo de LLM.
- **Alertas proativos** (7 tipos ativos) com idempotência por `(user, evento, período)`.
- **Pipeline de documentos** com MIME sniff, HEIC→JPEG, PDF→texto/Vision, Whisper para áudio, dedup SHA-256, matcher e reconciliação por cron (fila BullMQ, não bloqueia o webhook).

---

## 4. Arquitetura técnica (resumo)

| Camada | Tecnologia |
|---|---|
| Frontend | Vue 3, Vite, Tailwind, Pinia |
| Backend | Node.js, Express, Sequelize |
| Banco | PostgreSQL (fonte da verdade) |
| Cache/filas | Redis + BullMQ |
| IA | OpenAI (GPT-4o-mini, Whisper, Vision) + Gemini |
| WhatsApp | ManyChat API + Meta Cloud API (toggle de provider) |
| Segurança | JWT, bcrypt, API Key SHA-256, isolamento `tenant_id` em todas as tabelas |
| Resiliência | retry exponencial + circuit breaker + timeout explícito por integração |

**Escala horizontal:** múltiplas instâncias Node com estado sempre no banco; cron distribuído com `SELECT … FOR UPDATE SKIP LOCKED` (apenas 1 instância executa cada job). Webhook responde rápido; processamento pesado vai para fila.

**Três portas de entrada de autenticação:**
```
/admin/*          → JWT painel + tenantMiddleware
/api/v1/*         → API Key + scope + tenant do key
/webhooks/t/:slug → resolução de tenant pelo slug da URL
```

---

## 5. O que é específico da ProsperIA (não vai para a Dailus)

Para a Dailus, **não** se reaproveita o domínio financeiro (tools de finanças, connector ProsperIA, write-back de classificação financeira). O que se reaproveita é a **plataforma** (camada 2) e a **arquitetura de connectors/tools** (camadas 1 e 3).

| Fica na ProsperIA | Vai para a Dailus |
|---|---|
| `prosperia-api.client`, `prosperia-data`, `prosperia-hub`, inbound financeiro, risk score, tools financeiras | Plataforma (conversa, campanhas, alertas, docs, diagnostics, prompts, multi-tenant) + padrão de connector/tools |

> A ProsperIA permanece como **tenant #0** e primeiro connector. A Dailus entra como **tenant âncora do vertical beleza/D2C**, com `capabilities` que ligam/desligam módulos — **sem fork de código**.

---

## 6. O que FALTA construir para a Dailus (delimitado)

| Item | Descrição | Criticidade |
|---|---|---|
| **`connector-shopify`** | Adapter único: catálogo, estoque, pedidos, rastreio, clientes | 🔴 **único componente novo crítico** |
| Tools de domínio beleza | recomendar produto, sugerir tom/cor, montar rotina, add-to-cart | 🟠 alto valor de venda |
| Intent router | direciona a conversa entre SAC / vendas / creators | 🟠 |
| Deep-link de carrinho Shopify | add-to-cart via link no chat | 🟡 |

**Estimativa MVP (Care + Beauty):** ~**8–12 semanas** (2 devs + 1 PM), assumindo acesso às APIs Shopify (custom app gerado pelo cliente).

> Especificação técnica do `connector-shopify` (autenticação, endpoints, tools, sync/cron, riscos) em [`03-proposta-para-dailus.md`](03-proposta-para-dailus.md) § Spec técnica.

---

## 7. Por que a Nexify (quem entrega)

**Nexify** — *boutique de engenharia* (nexify.ink): "engenharia aplicada a problemas que ninguém resolveu antes". Não é agência, não é bodyshop. Software que **roda em produção**, com dono, SLA e rollback.

- **Cases em produção:** ProsperIA (IA conversacional/fintech), Todas Por Uma (app de segurança, iOS+Android), multinacional de tintas (logística), CBAA (automação mercado financeiro), ResumeAI, INCLUA, NexifyTerm.
- **Método:** Diagnóstico → Arquitetura (ADRs, C4) → MVP em produção (observabilidade, CI/CD) → Escala & transferência.
- **Fundadores:** Marcelo Bueno (CTO) e Diego Kilpp (COO).
- **Contato:** WhatsApp +55 11 95657-7599 · marcelo.bueno@nexify.ink · nexify.ink

Para a Dailus, isso significa: quem constrói o bot é o **mesmo time que já opera IA conversacional em produção** — o `connector-shopify` é a única peça nova, e é dependência controlada de cronograma.
