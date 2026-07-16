# 06 · Soluções com tecnologia para a jornada da Dailus

> Catálogo de oportunidades organizado por **objetivo de negócio**, com cada solução ancorada em **evidência real** que coletamos (catálogo Shopify, redes sociais, transcrições da Babi/@dailus, Reclame Aqui e mercado).
> Complementa os pacotes de [`03-proposta-para-dailus.md`](03-proposta-para-dailus.md) — aqui a leitura é por **resultado**, não por produto.
> Uso interno / confidencial.

---

## Como ler
Cada frente responde a um objetivo declarado: **vender mais · proximidade · comunicação · margem · vínculo**. Para cada solução: *o que descobrimos → o que a tecnologia faz → módulo Nexia → pacote onde vive*.

---

## 1. Vender mais 🛒

| Solução | O que descobrimos (evidência) | O que a tecnologia faz | Módulo / pacote |
|---|---|---|---|
| **Beauty advisor por ocasião/tom/cor** | A Babi já comunica em "**produto × ocasião**" (Reel `Dagc4xzvKIN`: "dormi mal → Bye Bye Olheira", "encontro → Body Splash cereja"); catálogo com **12 tons de base** e dezenas de cores = alto atrito de escolha. | Recomendação conversacional que pergunta contexto e devolve o SKU certo + **add-to-cart** (deep-link Shopify). | `connector-shopify` + tools beleza · **Beauty** |
| **Captura de demanda pós-live 24/7** | TikTok concentra intenção nas **lives** (picos de 250K+ views) que **somem quando a live acaba**; SAC só 9h–18h. | Bot responde "ainda tá na promo?", reserva/《add-to-cart》 e reengaja quem chegou fora da janela. | `conversation` + `connector-shopify` · **Beauty/Recompra** |
| **Vitrine conversacional de lançamentos** | 2026 = **20 anos**, "ano de muitos lançamentos"; a marca ancora coleção em tendência (Pinterest Predicts, "Elevated Basics"). | A "Dai" apresenta a coleção nova, monta kit e sugere a cor do momento. | tools beleza · **Beauty** |

**Benchmark:** Boticário **+46% conversão / +7,4% ticket** com consultora IA (no app — a Dailus pode ser first-mover disso no WhatsApp).

---

## 2. Proximidade com o público 💬

| Solução | O que descobrimos | O que a tecnologia faz | Módulo / pacote |
|---|---|---|---|
| **"Dai" 24/7 com a voz da Babi** | Corpus real de voz (26 Reels @babidadailus): calorosa, diminutivos, "gente", orgulho da marca. A voz **é de uma decisora** (Barbara). | PromptOps com o tom da marca + guardrails; a assistente soa Dailus, não um bot genérico. | `prompt`/PromptOps · **Care/Beauty** |
| **Quizzes e conteúdo interativo** | A marca já faz "**caixinha de perguntas**" e "qual sua fragrância preferida" (Reels `DZ3BEszv1ts`, `DayYvt3Px1m`). | "Qual seu tom?", "qual fragrância combina?" — capta lead, engaja e alimenta recomendação. | `conversation` + `campaign` · **Beauty** |
| **Estar onde os 2,9M já estão** | WhatsApp já é link priorizado no Linktree; **sem chat no site**; TikTok/IG geram demanda que fica sem resposta. | Presença sempre ligada no canal de maior alcance, puxando IG/TikTok para a conversa. | `webhook`/`messaging` · **Care** |

---

## 3. Melhorar comunicação 📣

| Solução | O que descobrimos | O que a tecnologia faz | Módulo / pacote |
|---|---|---|---|
| **SAC 24/7 (rastreio, política, defeito)** | Reclame Aqui: temas de **rastreio/entrega** e **fora de horário**; atendimento humano só 9h–18h. | Resposta instantânea de pedido/rastreio (Shopify), políticas por FAQ e **foto de defeito** (Vision) → protocolo. | `conversation`, `faq`, `file-upload` · **Care** |
| **Memória viva da marca (base de conhecimento)** | Reels de **fundação** (Dailus = "bonito em lituano"), **qualidade** (testes de estabilidade) e **logística 99,7%**. | O bot conta a história, explica qualidade e entrega — comunicação consistente e orgulhosa 24/7. | `faq`/PromptOps · **Care** |
| **Agendamento/confirmação de ativações** | Beauty Fair 2025: **atrito público** no agendamento de visita ao stand (RA 08–09/set). | Agendamento, confirmação e lembrete por WhatsApp; gestão de fila/senha; resposta padronizada. | `campaign`/`alert` · **Ativações/Eventos** |
| **Comunicação proativa de status** | Base de mensuração já existe (Meta Pixel + GTM); Shopify com webhooks. | Avisa mudança de status/rastreio sem o cliente perguntar. | webhook Shopify · **Care (fase 2)** |

---

## 4. Melhorar margem 📈

| Solução | O que descobrimos | O que a tecnologia faz | Módulo / pacote |
|---|---|---|---|
| **Converter e reter no D2C (margem melhor)** | No cruzamento de 126 produtos, a Época costuma estar **mais barata** que o site (mediana ~−10%; até ~−35% em promoção) — o varejo desconta e puxa a cliente pra fora. | A "Dai" fecha no canal oficial pela **experiência** (consultoria/kit/conveniência), protegendo a margem do D2C vs. perder a venda pro varejo. | tools beleza + `campaign` · **Beauty/Recompra** |
| **Recompra assistida (LTV sem novo CAC)** | Cadência de recompra: esmalte/Sweet Skin **30–45 dias**, base 60–90. | Lembrete na hora certa, com a cor/fragrância certa — receita incremental de baixo custo. | `campaign`/`segment` · **Recompra** |
| **Cross-sell / upsell contextual** | Kit "Mais Vendidos" e **Lip Combo** revelam a cesta campeã (batom → lápis → gloss). | Sugestão contextual que eleva o ticket com base em afinidade real. | tools beleza · **Beauty** |
| **Custo de IA sob controle** | Padrão Nexia: **fast-path determinístico** para intents simples; começar por Meta *service* (mais barato). | Resolve rastreio/política **sem LLM**, reservando IA para a conversa consultiva. | classificação/roteador · transversal |
| **Controladoria assistida** | Operação madura (QC, FEFO, B2B/B2C) — dor de back-office existe. | OCR de NF/boletos + classificação + webhook Power BI (reusa motor ProsperIA). | `file-upload`/OCR · **Insights** |

---

## 5. Criar vínculo com clientes 💖

| Solução | O que descobrimos | O que a tecnologia faz | Módulo / pacote |
|---|---|---|---|
| **Relacionamento personalizado** | Base fiel, colecionismo de esmaltes, recompra recorrente. | Recompra, aniversário e datas com mensagem personalizada (histórico + preferências). | `campaign`/`segment` · **Recompra** |
| **Pós-venda que acolhe (protege RA1000)** | Reputação **8,9/10**; risco é escala/horário, não qualidade. | Fluxo empático de defeito/atraso com **handoff humano** — protege a nota enquanto o volume cresce. | `conversation`/`feedback` · **Care** |
| **Memória de preferências** | A marca fala de "meu tom", "minha fragrância", "meu Lip Combo de todo dia". | A "Dai" lembra tom de pele, cores e rotina do cliente — atendimento que reconhece a pessoa. | perfil/CRM conversacional · **Beauty** |
| **Comunidade e creators** | Evento de **afiliadas** no TikTok; **cupom por creator**; #DailusSquad/#DailusLover. | Ops de creators (briefing, cupom rastreável, comissão) + captura de leads em evento. | `campaign` + creator ops · **Creators** |

---

## 6. Visão consolidada (mapa objetivo → pacote)

| Objetivo | Entrega principal | Pacote |
|---|---|---|
| Vender mais | Beauty advisor + captura pós-live | **Beauty** |
| Proximidade | "Dai" 24/7 com a voz da marca + quizzes | **Care + Beauty** |
| Comunicação | SAC 24/7 + memória da marca + agendamento | **Care + Ativações** |
| Margem | Converter no D2C + recompra + fast-path | **Beauty + Recompra** |
| Vínculo | Personalização + pós-venda + creators | **Recompra + Creators** |

> **Fio condutor:** tudo roda sobre a plataforma Nexia (multi-tenant, ~70% pronta). O único componente novo crítico é o `connector-shopify`. A entrada é o **Care** (dor universal, ROI rápido); o resto escala a partir dele.
