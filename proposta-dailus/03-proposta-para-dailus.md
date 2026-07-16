# 03 · Proposta para a Dailus

> O que a Nexify constrói para a Dailus, como, quanto e em quanto tempo.
> Reprecificado para **Shopify**. Uso interno / confidencial.

---

## 1. A tese em uma frase

> A "Dai" já conversa com quem chega — **mas só das 9h às 18h**, e sem acesso a pedido, rastreio ou catálogo. A Dailus já investiu em provador (Widde) e recuperação de carrinho (cart-bot); **falta a camada que atende 24/7 e vende conversando.** O Boticário fez +46% de conversão; a Natura resolve +190% de suporte no WhatsApp. Queremos provar num piloto de 30 dias a **Dai 24/7 conectada ao Shopify**.

**Entrada recomendada:** Pacote **Care** (dor universal, ROI rápido, menor dependência de catálogo IA) → upsell **Beauty** + **Recompra**.

---

## 2. Pacotes de oferta

### PACOTE CARE — SAC inteligente 24/7 · *(entrada recomendada)*
"Dai" 24/7 no WhatsApp resolvendo tier-1:
- **Rastreio** de pedido (Shopify Orders/Fulfillment) — resposta instantânea 24/7
- **Políticas** de troca / arrependimento / entrega / pagamento (FAQ)
- **Foto de defeito** (Vision) → abertura de protocolo
- **Status de pagamento** (Mercado Pago)
- **Handoff humano** com histórico + **CSAT** pós-atendimento

- **Módulos prontos:** `conversation`, `file-upload`, `feedback`, `diagnostics`, `faq`, `alert`.
- **KPIs:** −30% tickets tier-1; resposta < 2 min; cobertura fora do horário; **manter a nota 8,9**.
- **Investimento ref.:** setup **R$ 20–35k** + **R$ 2,4–4k/mês** + custo Meta.
- **Stakeholder:** Customer Service / E-commerce · **comprador econômico: Diego Kilpp (CFO/COO)** — pitch de ROI/eficiência (ver `01-inteligencia-dailus.md` §11).

### PACOTE BEAUTY — consultora de beleza IA · *(upsell)*
- Recomendação consultiva + **add-to-cart** (deep-link Shopify)
- Rotinas: "skincare minimalista", "look festa", "presente até R$ 60"
- Upsell contextual (batom Cappuccino → gloss harmonizado)
- Usa sinal de reviews **Judge.me** por SKU

- **Argumento:** resultado Boticário (**+46% / +7,4%**), porém no WhatsApp. Posicionamento vs. Widde: **"Widde mostra, Nexia aconselha e fecha."**
- **KPIs:** +20–40% conversão em sessões assistidas; +5–10% ticket médio.
- **Investimento ref.:** setup **R$ 25–40k** + **R$ 3–5k/mês** (opção performance sobre GMV).
- **Stakeholder:** Marketing & Innovation — **Carolina Bertelli** + **Barbara Maffeis Rossi** (2ª geração / Dir. Marketing & P&D, a "Babi" cuja voz alimenta a "Dai").

### PACOTE RECOMPRA — campanhas conversacionais · *(paralelo, baixo esforço)*
Segmentos + campanhas WhatsApp para lançamentos (Sweet Skin, Top Chrome, Fix Tudo): pós-compra, aniversário, reposição.
- **Diferença vs. cart-bot:** recompra **conversacional e segmentada por comportamento**, não só carrinho abandonado.
- **Investimento ref.:** **R$ 1,5–4k/mês** + custo de disparo.

### PACOTE CREATORS — ops #DailusSquad · *(fase 2)*
Bot para creators: briefing, prazos, upload de conteúdo, status de comissão, FAQ de contrato + workflow de aprovação. (Domínio creator ops a construir.)
- **Investimento ref.:** setup R$ 15–25k + R$ 1,5–2,5k/mês. **Stakeholder:** Marketing + Controladoria.

### PACOTE INSIGHTS — controladoria assistida · *(fase 2, trilha separada)*
Classificação automática de lançamentos + OCR de NF/boletos + webhook Power BI (reusa o motor da ProsperIA).
- **Investimento ref.:** R$ 3–8k/mês + volume. **Stakeholder:** diretoria adm-financeira — **Diego Kilpp (CFO/COO)** (fala controladoria/dados; André de Felipe a validar).

### PACOTE ATIVAÇÕES / EVENTOS — agendamento e fila em feiras · *(add-on sazonal)*
Motor de **agendamento de visita ao stand, confirmação e lembrete por WhatsApp, gestão de fila/senha e resposta padronizada** — resolve o atrito público visto na **Beauty Fair 2025** (reclamações de agendamento no Reclame Aqui). Captura leads no evento e alimenta recompra pós-feira. Reusa `campaign`, `alert`, `conversation`. **Stakeholder:** Marketing/Eventos.

### Multi-tenant sob 1 contrato
Dailus + **Sweet Skin** + **Fortilon** operam como tenants isolados na mesma plataforma — sem custo de infra duplicado.

---

## 3. Mapeamento: necessidade Dailus → módulo Nexia

| Necessidade Dailus | Módulo Nexia | Já existe | Falta construir |
|---|---|---|---|
| Bot WhatsApp multi-tenant | `webhook`, `conversation`, `messaging` | ✅ | branding "Dai", prompts beauty |
| Campanhas / segmentos | `campaign`, `segment` | ✅ | integração clientes Shopify |
| FAQ dinâmico | `faq` | ✅ | conteúdo de políticas Dailus |
| Handoff humano | `conversation` admin | ✅ | fila SAC Dailus |
| CSAT | `feedback` | ✅ | trigger pós-SAC |
| OCR de documentos | `file-upload` | ✅ | fluxo foto de defeito |
| Diagnósticos ops | `diagnostics` | ✅ | dashboard SAC Dailus |
| Alertas proativos | `alert` | ✅ | triggers e-commerce (recompra) |
| PromptOps | `prompt` | ✅ | família de prompts beauty/SAC |
| Catálogo/recomendação | — | ❌ | **connector-shopify** + tools beleza |
| Rastreio de pedido | — | ❌ | Shopify Orders/Fulfillment |
| Intent router (Care/Beauty/Creators) | `conversation` parcial | ⚠️ | router por intent |

---

## 4. Spec técnica — `connector-shopify` (único componente novo crítico)

Adapter único que conecta a Nexia ao Shopify da Dailus, no padrão dos connectors existentes (retry + circuit breaker + timeout explícito).

### 4.1 Autenticação
- **Admin API** (pedido/cliente): token de **custom app** Shopify (header `X-Shopify-Access-Token`). Escopos mínimos: `read_products`, `read_orders`, `read_fulfillments`, `read_customers`, `read_inventory` (read-only no MVP).
- **Storefront API** (catálogo/carrinho): Storefront access token (GraphQL) para deep-link de carrinho.
- Tokens no cofre de Settings (`is_secret`) da Nexia, nunca no front. **Não** usamos credenciais em chat.

### 4.2 Recursos usados
- **Catálogo** (já validado no `products.json`): `id, title, handle, body_html, vendor, product_type, tags, variants[], images[], options[]`; variante com `sku, price, compare_at_price, available, option1-3`. ⇒ suficiente para recomendação e disponibilidade.
- **Pedido/rastreio** (Admin API): `GET /admin/api/orders/{id}.json` e `/orders.json?email=`; `fulfillments` com `tracking_number, tracking_url, tracking_company, shipment_status`.
- **Cliente** (Admin API): `customers/search.json?query=` — resolve cliente pelo telefone do WhatsApp.
- **Carrinho** (deep-link): `/cart/{variant_id}:{qty}` para add-to-cart via link.

### 4.3 Tools conversacionais a criar (camada beleza/commerce)
`consultar_pedido` · `rastrear_entrega` · `recomendar_produto(tipo_pele, ocasiao, categoria, faixa_preco, vegano)` · `buscar_produto` · `comparar_produtos` · `sugerir_tom_base` · `sugerir_cor(esmalte,batom)` · `montar_rotina` · `add_to_cart` · `politica(troca|arrependimento|entrega|pagamento)` · `abrir_protocolo_defeito(foto)` · `handoff_humano`.

### 4.4 Sync / cron
- Sync de catálogo (`products.json`) a cada 6–12h → cache local (invalidação por `updated_at`).
- Estoque near-real-time: checagem on-demand no momento da recomendação (não sugerir esgotado).
- Webhook Shopify (`orders/updated`, `fulfillments/create`) → status proativo ao cliente (fase 2).

### 4.5 Riscos / premissas
- Depende de a Dailus gerar um **custom app** no Shopify Admin (ação do cliente — não criamos conta/credencial por eles).
- `products.json` já é público e validado; Admin API exige o token acima.
- Validar customizações de cart-bot/checkout no discovery.

---

## 5. Pricing (modelo de custo e margem)

Três componentes: **(A) Meta WhatsApp**, **(B) LLM**, **(C) SaaS/plataforma Nexia**.

### A. Meta (WhatsApp Cloud API)
Cobrança por conversa/categoria. Janela de **service** (iniciada pelo cliente) é a mais barata; **marketing** (iniciada pela marca) é a mais cara. **Regra de ouro:** começar por **SAC (service)** reduz custo Meta; campanhas (marketing) só depois de ROI provado. Ref.: ~US$ 0,05–0,08/conversa de marketing BR; service muito menor.

### B. LLM (GPT-4o-mini)
Centavos por conversa típica de SAC; conversa consultiva de beleza custa mais (mais tokens + tools), ainda assim tipicamente **< R$ 0,20–0,50/conversa**. Alavancas: *fast-path* determinístico para intents simples, cache de catálogo, classificação por confiança.

### C. SaaS / plataforma Nexia (nossa receita)
| Item | Valor de referência |
|---|---|
| Setup Care | R$ 20–35k |
| Setup Beauty | R$ 25–40k |
| Setup Care+Beauty (combo) | R$ 35–55k |
| MRR Care | R$ 2,4–4k/mês |
| MRR Beauty | R$ 3–5k/mês |
| MRR Recompra | R$ 1,5–4k/mês |
| Add-on Creators | R$ 1,5–2,5k/mês |
| Add-on Insights | R$ 3–8k/mês |
| Alternativa Beauty | performance sobre GMV incremental (via UTM/pixel) |

### Exemplo ilustrativo (substituir por dados reais do discovery)
Premissa: 8.000 conversas/mês de SAC (service) + 2.000 consultivas (beauty).
- Custo Meta (majoritariamente service): baixo (~centenas de R$).
- Custo LLM: ~R$ 1.000–2.500/mês (com fast-path).
- Preço ao cliente (Care+Beauty): setup ~R$ 45k + MRR ~R$ 6–8k.

**Falta para fechar pricing:** volume mensal real por tipo; % resolvível por fast-path; tabela Meta vigente; câmbio USD/BRL.

---

## 6. Roadmap MVP (Care + Beauty)

~**8–12 semanas** (2 devs + 1 PM), assumindo acesso às APIs Shopify.

| Fase | Semanas | Entrega |
|---|---|---|
| Diagnóstico + arquitetura | 1–2 | ADRs, contrato do `connector-shopify`, ingestão de políticas |
| `connector-shopify` (catálogo + pedidos) | 2–5 | rastreio, busca de produto, cache de catálogo |
| Care em produção (piloto) | 4–7 | SAC 24/7: rastreio, políticas, foto de defeito, handoff, CSAT |
| Beauty (tools de recomendação) | 6–10 | recomendar/ sugerir tom/cor, add-to-cart, upsell |
| Hardening + observabilidade | 10–12 | dashboards, load test, runbook, pós-mortem do piloto |

---

## 7. Deal brainer — objeções e respostas

| Objeção | Resposta |
|---|---|
| "Já temos Widde e cart-bot." | Cobrem visual e carrinho; **nenhuma conversa, atende 24/7 ou faz pós-venda.** Nexia completa o stack, não substitui. |
| "Nosso Reclame Aqui já é ótimo." | O objetivo é **proteger** a nota 8,9 conforme o volume cresce e cobrir a lacuna fora do horário. |
| "IA pode robotizar a marca." | A persona "Dai" já é da marca; **PromptOps** garante tom Gen Z + **handoff humano** imediato em casos sensíveis. |
| "Custo de mensagem Meta." | Modelado no pricing; começamos por SAC (service, mais barato) e provamos ROI antes de escalar campanhas. |
| "Integração é complexa." | Shopify tem API aberta; **único componente novo é o `connector-shopify`.** MVP 8–12 semanas. |
| "Por que não no app, como o Boticário?" | A Dailus não tem app dominante; o canal onde os 2,9M já estão é o **WhatsApp** (já no Linktree). Menor fricção, maior alcance. |
| "Já temos a assistente 'DAI'." | A Nexia é a **evolução da DAI**: de avatar/atendimento humano 9h–18h para um **motor de IA que vende, faz recompra e resolve SAC 24/7**, integrado ao Shopify. Mantém a persona; amplia a capacidade. |
| "É um bom momento para um projeto grande?" | **Sim, é a janela.** CFO/COO novo com mandato **"AI & Data-Driven"** + 2ª geração da família na marca + **20 anos**. Executivo em primeiros 90 dias busca **quick win com ROI claro** — exatamente o Pacote Care. |

**Riscos do nosso lado:** `connector-shopify` é dependência crítica de cronograma; integrar o número atual da "Dai" pode exigir migração/BSP (validar se hoje é 100% manual); posicionar Recompra como **recompra conversacional** para não parecer sobreposição ao cart-bot.

---

## 8. Roteiro comercial

**Sequência:** Discovery (45 min, Marketing + E-commerce) → POC beauty bot em sandbox com SKUs campeões → Piloto 30 dias Pacote Care → Expansão Beauty + campanhas → Case "Dailus + Nexia" (prova social para indies).

### Roteiro de discovery (45 min)
- **Abertura (5 min):** contexto Nexify + prova social JoIA (produção, uptime). Elogiar a reputação RA 8,9 e a "Dai".
- **SAC (Care):** volume mensal de contatos (WhatsApp + e-mail + 0800); divisão dos motivos; tamanho do time; quanto chega fora do horário; a "Dai" é 100% humana ou já tem BSP?
- **Vendas (Beauty):** ticket médio e conversão do site; resultado do Widde; onde perdem a venda por dúvida de tom/cor; frequência de lançamentos.
- **Stack:** plano Shopify (é Plus?); quem administra; conseguem gerar custom app; cart-bot atua no WhatsApp?; usam Meta WABA oficial / BSP?
- **Creators (fase 2):** como funciona o #DailusSquad; quantos ativos; como a comissão é apurada/paga.
- **Decisão:** confirmar o papel do **CFO/COO Diego Kilpp** (comprador econômico) e das patrocinadoras de marca (**Barbara** + **Carolina**); localizar o dono operacional de CS/E-commerce; quem aprova um piloto de 30 dias.
- **Fechamento (5 min):** propor piloto de 30 dias do Pacote Care **ou** POC beauty com 20 SKUs top. Definir próximo passo com data.

### Mensagem de abordagem (rascunho — revisar antes de enviar)
> A Dailus cresce forte no digital (Shopify, influencers, lançamentos constantes). Marcas como o Boticário já viram +46% de conversão com consultora IA; a Natura resolve 190% mais demandas de pedido no WhatsApp sem humano. Construímos a plataforma Nexia, que opera assistentes conversacionais em produção — atendimento, venda assistida, campanhas e pós-venda. Queríamos mostrar um piloto de 30 dias: a Dai 24/7 conectada ao Shopify (rastreio + dúvidas de produto). 30 minutos na próxima semana?

> **Obs.:** o disparo do contato comercial deve ser revisado e enviado por você — não enviamos contato em nome de terceiros.

---

## 9. Próximos passos internos

1. Fechar spec do `connector-shopify` (feita — § 4).
2. Montar **pricing calculator** (Meta + LLM + SaaS) com faixas de volume.
3. Montar **case anonimizado da JoIA** (volume de msgs, uptime, % resolução autônoma) como prova social não-financeira.
4. Localizar o dono de CS/E-commerce da Dailus.
5. Preparar a **apresentação** (`proposta/index.html`) para o discovery.
