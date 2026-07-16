# 01 · Inteligência Dailus

> Tudo que aprendemos sobre a Dailus, cruzando o **deal briefing de campo** com a **extração real do catálogo** (Shopify `products.json`, 15/07/2026).
> Uso interno / confidencial.

---

## 1. Resumo (TL;DR)

A **Dailus** é uma marca de cosméticos **D2C** com ~2,9M de seguidores no Instagram, e-commerce em **Shopify**, **375 produtos ativos** (forte em esmaltes e batons), reputação **Reclame Aqui excelente (~8,9/10)** e um stack de conversão já robusto (provador virtual Widde, recuperação de carrinho cart-bot, reviews Judge.me).

**A lacuna:** a Dailus já compra tecnologia de conversão, mas **não tem a camada conversacional** — o WhatsApp da persona "Dai" atende só **9h–18h (seg–sex)** e **não há nenhum chat/atendimento no site**. É exatamente onde a Nexia é forte e onde Widde/cart-bot **não competem**. Somos **complementares**, não substitutos.

**Tese de entrada:** Pacote **Care** (SAC 24/7 no WhatsApp) → upsell **Beauty** (consultora de beleza IA) + **Recompra** conversacional.

---

## 2. Perfil confirmado

| Atributo | Dado |
|---|---|
| Razão social | ALPI Comércio de Cosméticos e Formação em Beleza Ltda |
| CNPJ | 00.848.052/0003-84 |
| Sede | Rua Tamaindé, 400 — Vila Nova Manchester, São Paulo/SP |
| Segmento | Cosméticos D2C (maquiagem, skincare, esmaltes, fragrâncias corporais) |
| Posicionamento | Vegana & cruelty-free (PETA), custo-benefício, Gen Z / TikTok |
| Alcance | ~2,9M seguidores no Instagram |
| Marcas irmãs | **Sweet Skin** (@sweetskinbr, linha Ice Cream) e **Fortilon** (@oficialfortilon, tratamento de unhas) |
| E-commerce | **Shopify** (handle `r2zcps-rb.myshopify.com`; tema custom "Dailus-theme-MASTER") |
| Bio digital | Linktree (linktr.ee/dailus), desde jan/2021 |
| Creators | #DailusSquad, banco de talentos "Trabalhe com a Dailus", ativações Beauty Fair 2025, "Casa Dailus" no TikTok |

### Canais de atendimento atuais (estado do SAC)
- **E-mail:** sac@dailus.com.br
- **Telefone:** 0800 227 3333
- **WhatsApp:** (11) 97144-3628 (persona "Dai")
- **Horário:** SEGUNDA A SEXTA, 9h–18h (exceto feriados) — **SEM 24/7, SEM chat no site**
- O WhatsApp já é link priorizado no Linktree ("Fale com a gente no WhatsApp"), servindo os 2,9M seguidores.

> Confirmado no site institucional (extração): SAC `sac@dailus.com.br`, `0800 227 3333`, WhatsApp `(11) 97144-3628`, Instagram `@dailusoficial`. Páginas: Quem somos, Fale com a gente, Ajuda e suporte, Trabalhe com a Dailus.

### Presença social por canal (IG · TikTok · Facebook)

> Extração pública dos perfis em 15/07/2026. Detalhe e datasets: [`../analise/instagram/ANALISE_INSTAGRAM.md`](../analise/instagram/ANALISE_INSTAGRAM.md), [`../analise/tiktok/ANALISE_TIKTOK.md`](../analise/tiktok/ANALISE_TIKTOK.md), [`../analise/facebook/ANALISE_FACEBOOK.md`](../analise/facebook/ANALISE_FACEBOOK.md).

| Canal | Perfil | Alcance | Papel | Leitura para o deal |
|---|---|---|---|---|
| **Instagram** | @dailusoficial | ~2,9M seguidores | Branding + influencer marketing (#DailusSquad, cupom por creator) | Onde os 2,9M "já estão" — base do WhatsApp via Linktree |
| **TikTok** | @dailusoficial | 709,2K seg · 5,3M curtidas | **Live commerce / TikTok Shop** — venda em tempo real | Canal mais ativo e engajado; lives recorrentes com desconto/sorteio (picos de 250K+ views). Demanda "quente", porém limitada à janela da live |
| **Facebook** | /Dailus | 3,9M seguidores | Espelho dos Reels do IG | Canal dormente (0,3–2,5K views/reel apesar dos 3,9M). Presença, não performance |

**Pilares de conteúdo (comuns aos 3 canais):** Fix Tudo (make blindada / gel de sobrancelha com "brow lamination"), Sweet Skin Ice Cream (fragrância gourmand), Batom Líquido / lip combos, Última Chamada (esmaltes), esmaltes/unhas (Top Chrome/Glass), eventos (Beauty Show) e sazonais (Copa/Brasil).

**Recrutamento de creators ativo:** campanha **#DailusLover** ("Quer se tornar um influenciador da DAILUS") — coerente com o #DailusSquad e os cupons por creator.

**Profundidade da coleta (data · autor · fala · tela):** baixamos e enriquecemos os vídeos das 3 redes no mesmo padrão — **transcrição com timestamps (Whisper) + OCR do texto na tela + data de publicação + autor/creators marcados**. Volume: **IG 46 posts** (39 @babidadailus + 7 @dailus; 33 vídeos transcritos, 20 com fala), **TikTok 70 vídeos** (46 com fala, 52 com OCR), **Facebook 11 reels** (11 com OCR, 4 com fala). Datasets: `../data/social/*/transcripts/_manifest.json`.

**Antes × depois da mudança de gestão (corte mai/2026):** quase **todo o conteúdo capturado é pós-transição** — as grades públicas só expõem posts recentes. Splits: IG @babidadailus **0 antes / 39 depois** (mai–jul/2026), TikTok **6 antes / 64 depois**, Facebook **1 antes / 10 depois**. Os poucos itens pré-mudança são tematicamente idênticos aos de depois (Sweet Skin, lip combo, chamada de live) — **sem ruptura de tom visível** no recorte disponível. Um comparativo histórico profundo exigiria dados internos da marca.

> **Insight para a Nexia:** o TikTok já concentra **intenção de compra quente** (lives + TikTok Shop), mas depende do horário da live; o SAC "Dai" atende só 9h–18h. Fora dessas janelas, a demanda gerada nas redes fica **sem resposta**. A conversa 24/7 no WhatsApp captura, converte e retém essa demanda — inclusive puxando o público de TikTok/IG para o canal onde a Nexia opera.

---

## 3. Catálogo — dados REAIS da extração (não estimados)

> Fonte: `products.json` da loja, extração direta em 15/07/2026. Ver `../analise/ANALISE.md`, `../analise/catalogo.csv` e `../data/products/*.json`.

### Números-chave
| Métrica | Valor |
|---|---|
| **Produtos ativos** | **375** |
| Coleções / categorias | 107 |
| Variantes (SKUs) | 375 |
| Produtos disponíveis (em estoque) | **362 (96%)** |
| Imagens no catálogo | **1.620** |
| Preço mínimo | **R$ 6,47** |
| Preço mediano | **R$ 33,92** |
| Preço médio | R$ 40,73 |
| Preço máximo | **R$ 183,60** (kit) |

### Marcas / vendors (contagem real)
| Marca | Produtos |
|---|---|
| DAILUS (principal: maquiagem + esmaltes) | ~348 (307 + 41 grafias) |
| SWEET SKIN (corporal / fragrância — Ice Cream) | 17 |
| FORTILON (tratamento de unhas) | 10 |

### Categorias por volume de SKU (top real)
| Categoria | Produtos |
|---|---|
| **Esmaltes** | **133** (maior categoria — Dailus é forte em unhas; inclui Top Chrome) |
| Brilhos labiais | 24 |
| Batons | 23 |
| Bases faciais | 23 |
| Blushes e bronzers | 18 |
| Pó facial | 17 |
| BODY CARE (Sweet Skin) | 15 |
| Maquiagem para o rosto | 14 |
| Mãos e unhas / bases e corretivos | 11 cada |
| Lápis sobrancelha, sombras, rímel, delineadores, séruns… | cauda longa |

### Distribuição de preço (variantes)
| Faixa (R$) | Qtde |
|---|---|
| 0–20 | 137 |
| 20–30 | 23 |
| 30–40 | 50 |
| 40–50 | 61 |
| 50–70 | 67 |
| 70–100 | 23 |
| 100+ | 14 |

### Coleções mais relevantes (top real)
Todos os produtos (362), **Use o cupom DAI15 (15% OFF)** (223), Unhas (155), Esmalte (136), Pele (72), Esmalte Cremoso (68), **Kits** (61), Lábios (47), Makes com 20% OFF (38), Promoções (35), Kits Make (26), Olhos e Sobrancelha (25), Base (23), Sweet Skin (23), **Mais Vendidos** (22), Pele Blindada (20).

### Produtos-âncora (exemplos reais com preço)
- Kit Novas Cores de Batom Líquido Matte 12H — **R$ 183,60** (item mais caro)
- Kit Trio Sweet Skin Ice Cream (Baunilha/Cereja/Pistache) — R$ 159,70
- Blush em Stick Pêssego + Contorno em Stick Caramelo — R$ 104,50
- Pó Solto Ultrafino — R$ 54,90
- Base Líquida Ultra Cobertura (D2 Claro) — R$ 49,90
- Gloss Labial Morango do Amor — R$ 25,42
- Esmalte Good Vibezinha — R$ 11,99 · Esmalte Última Chamada — R$ 14,99

> **Insight comercial:** catálogo grande e com muita variação (12 tons de base, dezenas de cores de esmalte/batom) = **alto atrito de escolha** no menu tradicional. É exatamente o cenário em que a **recomendação conversacional** ("qual tom de base para minha pele?", "qual cor de esmalte combina?") gera conversão — mesmo mecanismo do +46% do Boticário.

---

## 4. Inteligência técnica do e-commerce (o que o site revela)

| Tecnologia detectada | Papel | Leitura para o deal |
|---|---|---|
| **Shopify** | Plataforma (não VTEX!) | API Storefront + Admin abertas ⇒ **integração mais barata/rápida** |
| **Widde** (widde.io + cdn-tryon) | Video/Live Commerce + **provador virtual** (try-on IA) | **NÃO concorre** — resolve "ver/experimentar", não a conversa consultiva nem pós-venda |
| **cart-bot.net** | Recuperação de carrinho abandonado | Concorre **parcialmente** no Pacote Recompra |
| **Judge.me** | Avaliações/reviews por produto | Fonte de sentimento por SKU útil para tools de recomendação |
| **Mercado Pago** | Gateway de pagamento | Integrável ao SAC (status de pagamento) |
| **Meta Pixel + GTM** | Mensuração | Base já existe ⇒ facilita **provar ROI** do bot |
| **Shopify MCP / webmcp** ativo | Superfície nativa p/ agentes de IA | Reforça o **timing** |
| **Chat/atendimento no site** | **NENHUM** widget (sem Zendesk, Gorgias, Tawk, Intercom, JivoChat) | Atendimento 100% offsite e horário comercial ⇒ **DOR CLARA E NÃO RESOLVIDA** |

> **Leitura de deal:** a Dailus compra tecnologia de conversão sem aversão a investir. O buraco no mapa é a **conversa 24/7**. Isso reduz o risco de venda: não precisamos evangelizar "por que tecnologia", só "por que a camada conversacional agora".

### O mapa do stack de conversão da Dailus
```
VER / EXPERIMENTAR   →  Widde (provador virtual)        ✅ tem
RECUPERAR CARRINHO   →  cart-bot                         ✅ tem
AVALIAR / PROVA SOCIAL → Judge.me                        ✅ tem
PAGAR                →  Mercado Pago                     ✅ tem
──────────────────────────────────────────────────────────────
CONVERSAR 24/7 (SAC + venda consultiva + pós-venda)      ❌ LACUNA  ← Nexia
```

---

## 5. Reputação (Reclame Aqui) e problemas que o bot resolve

Reputação **MÁXIMA** (nota média ~8,9/10 nos últimos 6 meses; atendimento avaliado como "ÓTIMO"; a empresa responde e resolve).

> **Reenquadramento importante:** a Dailus **não é** caso de "resgate de reputação". O atendimento humano funciona. O risco é de **ESCALA e HORÁRIO**. Pitch correto = **"proteger e escalar uma reputação já excelente"** enquanto o volume cresce e sem depender só do horário comercial.

| Tema recorrente de reclamação | Como a Nexia ataca |
|---|---|
| Rastreio / prazo de entrega ("cadê meu pedido") | Tool de consulta de pedido via Shopify Orders/Fulfillment, resposta instantânea 24/7 |
| Defeito/qualidade de produto | Fluxo de coleta de foto (Vision/OCR) + abertura de protocolo + política de troca (30 dias) |
| Falta de suporte fora do horário (canal só 9h–18h) | Bot 24/7 resolve tier-1 e faz handoff humano com histórico no horário comercial |
| Arrependimento | Fluxo automatizado CDC 7 dias (regras já mapeadas) |

---

## 6. Políticas da Dailus (base de conhecimento do bot de SAC)

- **Pagamento:** cartão (Visa, Master, Amex, Elo, Diners) e **PIX**; até **6x sem juros** (parcela mínima R$ 25); prazo de entrega conta após aprovação do pagamento; sistema pode cancelar por limite/inconsistência.
- **Entrega:** seg a sáb, transportadora ou Correios; prazo varia por CEP/pagamento/produto; conta após confirmação do pagamento; precisa ser maior de 18 para receber; acompanhar em "Página de Rastreamento" ou e-mail.
- **Arrependimento:** 7 dias corridos após recebimento; produto sem uso, lacrado, embalagem original, com nota fiscal.
- **Troca:** só por **DEFEITO**, até 30 dias corridos; **NÃO** troca por outro produto.

---

## 7. Concorrentes (mesmo gap conversacional)

| Marca | Plataforma | Stack conversão | Chat no site | Reclame Aqui |
|---|---|---|---|---|
| **Dailus** | Shopify | Widde + cart-bot + Judge.me | ❌ SEM | ~8,9 |
| Océane | VTEX | Widde + Skeepers | ❌ SEM | mesmo gap |
| Vult | custom/headless | inflr (influencer mkt) | ❌ SEM | mesmo gap |
| Bruna Tavares | site próprio/headless (premium) | — | — | ticket mais alto (~R$55–70) |

**Padrão do setor:** o provador virtual (Widde) está virando padrão entre indies de beleza; **mas a camada de atendimento/venda conversacional 24/7 continua sendo lacuna geral**. A Dailus pode ser **first-mover** de beauty advisor conversacional no WhatsApp entre as indies — e virar case replicável (Océane, Vult, Bruna Tavares, Boca Rosa, Salon Line, Simple Organic…).

### Benchmark competitivo de preço (scan VTEX — dados reais)

> Extração direta das APIs VTEX de **Época Cosméticos** (6.797 produtos · 14.502 SKUs · 18 marcas de maquiagem) e **Pague Menos** (2.168 SKUs · 13 marcas) em 15/07/2026. Datasets: `../data/mercado/epoca/` e `../data/mercado/paguemenos/`.

**Posicionamento por preço (mediana por marca na Época, R$):**

| Marca | Mediana | Faixa (perfil) |
|---|---:|---|
| Ruby Rose | 23,99 | Custo-benefício |
| Vult | 29,90 | Custo-benefício |
| **Dailus** | **33,24** | **Custo-benefício (289 prod · 650 SKUs)** |
| Tracta | 31,10 | Custo-benefício |
| Quem disse, Berenice? | 43,90 | Intermediário |
| Catharine Hill | 54,90 | Intermediário |
| Océane | 55,09 | Intermediário |
| Mari Maria | 58,90 | Creator premium |
| Vizzela | 59,90 | Intermediário |
| Payot | 63,90 | Intermediário/dermo |
| Boca Rosa | 68,88 | Creator premium |
| Bruna Tavares | 73,50 | Creator premium |
| Franciny Ehlke | 80,90 | Creator premium |

**Leitura:** a Dailus está firmemente no **pelotão custo-benefício** (com Ruby Rose e Vult), bem abaixo das marcas de creator (Bruna Tavares, Franciny, Boca Rosa, Mari Maria). Preço não é o campo de batalha — **experiência, recomendação e conversa** são o que diferencia.

**Dispersão de preço cross-canal (site Dailus × Época — 126 produtos casados):**
- No varejo (Época) a Dailus costuma estar **mais barata** que no próprio site: em **114 dos 126** produtos casados o preço na Época é menor (delta mediano **~−10% na etiqueta**, chegando a **~−35% em promoção**).
- **Implicação:** a cliente que sai do site para "pesquisar preço" tende a **fechar no varejo**. O D2C tem **margem melhor para a marca**, mas hoje **não tem quem aconselhe e feche** — a "Dai" retém a venda no canal próprio convertendo pela **experiência** (consultoria, kit, conveniência, recompra), não por desconto.

### Benchmark de preço (varejo multimarca — Época Cosméticos)

> Extração da Época (VTEX) em 15/07/2026: 18 marcas, 6.797 produtos, 14.502 SKUs. Detalhe: [`../analise/mercado-precos/epoca-cosmeticos.md`](../analise/mercado-precos/epoca-cosmeticos.md).

- **Posicionamento:** Dailus é **tier acessível — 8º de 18 marcas** (mediana R$ 33,24), colada em Vult, Tracta e Ruby Rose e **~50% mais barata** que as marcas de influencer (Mari Maria R$ 58,9; Boca Rosa R$ 68,9; Bruna Tavares R$ 73,5; Franciny R$ 80,9).
- **Custo-benefício real** onde entrega valor bem abaixo do médio: **face** (R$ 37,9 vs R$ 61,6 do mercado), **sobrancelhas** (R$ 33,1 vs R$ 45,9 — e ela é nº 1 em volume) e **kits** (R$ 60,6 vs R$ 97,7).
- **Zona de disputa:** **lábios e olhos** — preço no centro do mercado; vencer por **atributo** (fórmula/duração), não por desconto. Reforça o valor do **Pacote Beauty** (recomendação consultiva que argumenta atributo, não preço).
- **Conflito de canal a monitorar:** no cruzamento de 126 produtos, a Época em geral está **mais barata** que o site oficial (o varejo desconta forte e puxa a cliente pra fora do D2C). → argumento para a **Dai** dar motivo de fechar no oficial (**consultoria, kit, brinde, conveniência, recompra**) e para campanhas de **Recompra** trazerem tráfego ao site próprio, onde a **margem é melhor pra marca**.

### Benchmarks de resultado (grandes players, validados)
- **Grupo Boticário** (set/2025, AWS Bedrock, IA no app): **+46% conversão**, **+7,4% ticket médio**. WhatsApp segue como gap deles.
- **Natura + Sinch** (WhatsApp): **+190% de capacidade de suporte** com resolução autônoma.

---

## 8. Contatos e agenda de descoberta (para blindar o deal)

**Mapa de compra atualizado (transição 2026 — ver §11):**
- **Comprador econômico (novo):** **Diego Kilpp** — CFO/COO (Finanças, Operações, Supply Chain), perfil "AI & Data-Driven" / turnaround.
- **Patrocinadoras de marca/experiência:** **Barbara Maffeis Rossi** (2ª geração da família, Dir. Marketing & P&D — é a "Babi"/@babidadailus) e **Carolina Bertelli** (Marketing & Innovation, segue).
- **Validação da tese:** **Fernando Rossi** (sócio; defende atendimento 24h desde 2019).
- **Falta:** dono direto de Customer Service / E-commerce (comprador operacional do Care); situação de André de Felipe.

**Pendências de discovery:**
- Confirmar se o número da "Dai" já roda em BSP/automação ou é 100% manual.
- Confirmar plano Shopify (é Shopify Plus?) e quem administra a loja.
- Mapear se o cart-bot atua em WhatsApp ou só e-mail/push.
- Dimensionar dor: volume mensal de atendimentos; proporção rastreio vs. defeito; frequência de lançamentos.

> Detalhamento da proposta, pacotes, `connector-shopify`, pricing e roteiro de discovery completo em [`03-proposta-para-dailus.md`](03-proposta-para-dailus.md).

---

## 9. Dossiê corporativo (história, porte e crescimento)

> Fontes públicas: Exame (2020), VEJA SP (2019), Brazil Beauty News (2023/2025), Econodata/Serasa/CNPJ, LinkedIn. A Dailus não divulga receita fechada — os números abaixo são **marcos públicos**.

### Linha do tempo
| Ano | Marco |
|---|---|
| **2006** | Marca Dailus criada (origem: fábrica familiar de esmaltes no Tatuapé/SP; CNPJ matriz Alpi ativo desde 06/10/1995) |
| **2019** | Rebranding com foco em diversidade/inclusão; forte presença em farmácias/drogarias |
| **2021** | Cria **Dailus Feat** (collabs — ex.: Luísa Sonza, GKay) |
| **2023** | Vira **Grupo Dailus**; lança **Dailus Lab** (clean beauty, genderless, vegana); estreia em skincare (collab Mentos) |
| **2024** | **Sweet Skin** entra no portfólio regular (limpeza, tratamento, proteção solar) |
| **2025** | Sweet Skin ganha **bodycare** (Ice Cream — Cookies & Cream, Pistache, Morango); ano com resultados positivos |
| **2026** | **Dailus completa 20 anos** — ano de muitos lançamentos. Marcas irmãs: Sweet Skin e Fortilon. **Operação também em Portugal** |

### Números públicos (marcos)
- **2019:** ação em drogarias gerou **+30% de faturamento**; ~20% da produção em SP capital, 50% no estado.
- **2020 (Exame):** vendia **23 milhões de esmaltes/ano**; +17% no ano anterior; +8% no 1º tri de 2020.
- **2023 (BBN):** comercializa **+25 milhões de produtos/ano**.
- **2025:** skincare/bodycare (Sweet Skin) conquistou rapidamente espaço relevante no portfólio.
- **Ranking Econodata:** entre as **~10 maiores distribuidoras de cosméticos de SP** por faturamento estimado.
- **Capital social (matriz):** ~**R$ 5,3 milhões**. Porte médio/grande, empresa familiar.
- **Alcance:** Instagram ~2,9M · LinkedIn ~89 mil · catálogo online 375 SKUs.
- **Contexto de mercado:** Brasil é o **3º maior mercado de beleza do mundo** (~R$ 173 bi em 2024); "beauty dessert" global ~**US$ 34 bi** em 2025 (tendência que a Dailus surfa com a Sweet Skin Ice Cream).

---

## 10. Pessoas-chave e estrutura (mapa de stakeholders)

> Empresa familiar (família Maffeis/Rossi). Fontes: LinkedIn, Econodata/CNPJ, VEJA SP.
> ⚠️ **Atualização importante:** o mapa de decisores mudou em 2026 (transição de liderança). Leia a **§11** — ela atualiza os cargos e o comprador econômico. Esta seção mantém a estrutura societária e o histórico.

### Sócios / donos
- **Fernando Rossi** — sócio-proprietário (Dailus Color). Historicamente **porta-voz e defensor do atendimento digital**: já em 2019 (VEJA SP) contratou empresa para **atendimento 24h** de clientes na internet ("temos de estar abertos a ouvir o consumidor"). **Gancho de pitch forte:** a liderança já acredita em atendimento 24h.
- **Família Maffeis** (sócios/administradores via CNPJ): Alessandra Camozzi Maffeis, Barbara Maffeis Rossi, Claudia Maffeis Barbieri, Pedro Maffeis Barbieri.

### Diretoria / decisores operacionais
- **Carolina Bertelli** — Diretora de Marketing e Desenvolvimento de Produto. Porta-voz oficial nas matérias recentes (2023–2025). **Decisora-chave dos Pacotes Beauty e Recompra.** Fala em experiência, textura, histórias e propósito (DNA divertido, disruptivo, diferente).
- **André de Felipe** — Diretor de Operações Administrativas-Financeiro (MBA USP/Esalq). **Decisor dos Pacotes Insights (controladoria) e potencialmente Care (operação).**

### Estrutura jurídica
- **Matriz:** Alpi Distribuidora de Cosméticos Ltda (fantasia Dailus) — CNPJ 00.848.052/0001-12 (desde 1995).
- **Filial e-commerce:** ALPI Comércio de Cosméticos e Formação em Beleza Ltda — CNPJ 00.848.052/0003-84 (loja online / Rua Tamaindé, 400).
- Múltiplas filiais (0002, 0003, 0004) — distribuição capilar.

### Insights de abordagem
1. **Fernando Rossi** já compra a tese de atendimento digital 24h desde 2019 — usar como **validação interna**.
2. **Carolina Bertelli** é a decisora para **Beauty/Recompra** (foco em experiência e nos lançamentos dos 20 anos).
3. **Timing perfeito:** 2026 = 20 anos + ano de muitos lançamentos — a "Dai 24/7" + beauty advisor entra como parte da **celebração/experiência**.
4. Família valoriza raízes e proximidade com o consumidor — enquadrar a IA como **amplificar a voz da marca**, não substituir humanos.
5. **Porta B2B:** LinkedIn do grupo (~89k) para social selling com Carolina e André. **Pendência:** localizar o dono direto de CS/E-commerce (comprador do Care).

---

## 11. Nova gestão / transição de liderança 2026 (LinkedIn)

> Fontes: LinkedIn (perfis e posts de Diego Kilpp e Barbara Maffeis Rossi), Instagram @babidadailus, Brazil Beauty News (nov/2025), AdNews/ADGROUP, Promoview.
> **Esta seção atualiza os cargos e o mapa de compra da §10.**

### 11.1 Quem está administrando a empresa agora
- **Diego Kilpp — CFO/COO** (Diretor Financeiro, Administrativo, Operações e Supply Chain).
  - Headline LinkedIn: *"CFO | COO | Strategic Finance & Operations | P&L, FP&A, S&OP | Growth, Turnaround & Transformation | Varejo, Tecnologia, FMCG & Marketplace | **AI & Data-Driven**"*. +4,2k seguidores, base em SP.
  - Perfil: +20 anos em finanças/estratégia/operações (varejo, tecnologia, FMCG, marketplace). Perfil de **turnaround/transformação** e explicitamente **AI & Data-Driven**.
  - **Entrada recente:** em post de ~2 semanas afirma "há pouco mais de 60 dias iniciei uma nova jornada na Dailus" → assumiu por volta de **meados de 2026**. Citou a Beauty Show como um dos primeiros grandes eventos.
- **Barbara Maffeis Rossi — 2ª geração da família fundadora** (sócia; sobrenome Maffeis/Rossi).
  - LinkedIn: "Gerente de Projetos". Instagram (**@babidadailus**): *"Diretora de Marketing e P&D | Preservando a essência que nos trouxe até aqui. Construindo o futuro que ainda vamos alcançar"* — linguagem clássica de **sucessão geracional**.
  - Atuação visível: lidera/participa de lançamentos (coleção Última Chamada ancorada em **Pinterest Predicts 2026** — postura data-driven), representou a Dailus no "Líderes de Perfumaria" (Beauty Fair Co.) falando em **expansão para novos nichos/categorias**, conduz ações de cultura interna.
  - **É a "Babi" cujo tom analisamos** para a voz da "Dai" (ver [`04-voz-da-marca-babi.md`](04-voz-da-marca-babi.md)) — ou seja, **a voz que clonamos é a de uma decisora**.

### 11.2 Leitura da transição
- **Diego Kilpp** assume o escopo Finanças/Adm/Operações/Supply Chain — que antes mapeamos sob **André de Felipe**. Leitura: executivo sênior de mercado para **profissionalizar e escalar** (turnaround), ocupando/consolidando operações e finanças.
- **Barbara Maffeis Rossi** entra como **2ª geração** com protagonismo em Marketing/P&D/Projetos. **NÃO substitui Carolina Bertelli** — Carolina segue como **Marketing & Innovation Director** (confirmado no LinkedIn e citada na Brazil Beauty News de 04/nov/2025). Movimento = **"família + gestão profissional" convivendo**, não troca.
- **Sinal de time novo vindo junto:** Diego e Barbara compartilham passagem pela empresa **Yandeh** (Barbara: jan/2023–nov/2025). Forte indício de um **novo time executivo montado em conjunto**, com mandato de transformação.

### 11.3 O que a empresa busca (tese do movimento)
1. **Profissionalização e escala** (CFO/COO sênior de varejo/FMCG: P&L, FP&A, S&OP).
2. **Transformação digital + IA/dados** (headline "AI & Data-Driven"; Barbara ancora lançamento no Pinterest Predicts; a marca já tem a assistente "DAI" desde 2021). **Ambiente muito receptivo a IA conversacional.**
3. **Expansão de portfólio/categorias** (Sweet Skin, Fortilon, Dailus Lab) → mais SKUs e jornadas = mais recompra assistida, cross-sell e suporte escalável.
4. **Sucessão + futuro** (2ª geração) às vésperas dos **20 anos (2026)** — momento simbólico para iniciativas estruturantes.

### 11.4 Impacto na abordagem comercial (a favor da Nexia)
- 🔑 **Relação quente / insider (CONFIRMADO):** **Diego Kilpp é co-fundador/COO da Nexify** e agora ocupa o CFO/COO da Dailus. É o **caminho de entrada mais forte possível** — um champion interno que já conhece a plataforma, a tese conversacional e o time. Usar para: **warm intro**, acesso direto ao comprador econômico, encurtar o ciclo de venda e dar credibilidade técnica imediata. **Tratar com transparência** (relação declarada / arm's-length) para manter o processo de compra limpo. Ver one-pager de abordagem: [`05-abordagem-diego-kilpp.md`](05-abordagem-diego-kilpp.md).
- **Comprador econômico = Diego Kilpp.** Pitch financeiro/operacional: redução de custo de atendimento, aumento de recompra/LTV, payback, casos de ROI (Boticário +46%, Natura +190%). Executivo em "primeiros 90 dias" busca **quick wins com ROI claro**.
- **Patrocinadoras de marca/experiência = Barbara + Carolina.** Pitch de experiência da consumidora, humanização (a própria "DAI"), personalização e creators.
- **Janela rara:** CFO/COO com mandato de transformação + AI-driven + 20 anos = timing ideal para projeto estruturante de IA conversacional.
- **Gancho de credibilidade:** a Dailus **já acredita** em assistente virtual (DAI desde 2021) e marketing conversacional (Carolina participou de painel sobre o tema). Posicionar a Nexia como a **evolução da DAI**: de avatar/atendimento para um **motor de IA que vende, faz recompra, resolve SAC e integra ao Shopify**.

### 11.5 Pendências / a validar
- Confirmar título formal e data exata de entrada de Diego Kilpp (CFO? COO? ambos) e organograma (quem reporta a quem).
- Confirmar cargo formal de Barbara (Instagram: Dir. Mkt/P&D; LinkedIn: Gerente de Projetos) e a divisão de escopo com Carolina.
- Confirmar situação de **André de Felipe** (saiu? mudou de área?) e de Fernando Rossi.
- Mapear se **mais executivos vieram da Yandeh** ("mapa do novo time").
- ✅ **Confirmado (interno):** Diego Kilpp é **a mesma pessoa** — co-fundador/COO da Nexify e CFO/COO da Dailus (relação quente/insider). **A validar com ele:** formato da abordagem (warm intro vs. processo formal) e eventual disclosure de conflito de interesse para blindar a governança da compra. **Não expor a conexão em material entregue ao cliente** sem alinhamento prévio.

---

## 12. Feiras, eventos e notícias 2025

> Fontes: IDV News, ABC da Comunicação, GKPB, All Sensez, Abisa, Brazil Beauty News, Reclame Aqui.

### 12.1 Presença em feiras (2025)
- **Beauty Show 2025** (jun/2025): novidades — esmaltes perfumados, gloss labial, primer fixador. Canal profissional/salão.
- **Beauty Fair 2025** (06–09/set, Expo Center Norte–SP): conceito **"Dailus Gelateria"** com **dois estandes** — **Negócios/B2B** (I-65) para parceiros e **Varejo/B2C** (J115) aberto ao público. → A Dailus **já separa operação comercial de operação de consumidor** (ajuda a posicionar a Nexia nas duas frentes).

### 12.2 Lançamentos 2025
- **Sweet Skin Ice Cream** (linha corporal, destaque do ano): 3 produtos (Sabonete Esfoliante, Gelato Hidratante, Body Splash), 3 fragrâncias (Morango ao Leite, Cookies&Cream, Mousse de Pistache); vegana/cruelty-free.
- **Fortilon:** +5 produtos (cuidados intensivos mãos/pés/pernas). **Top Glass** (top coat efeito gel). Coleções de esmalte **Última Chamada** e **Sunset 2025**.
- Narrativa (Brazil Beauty News 04/nov/2025): movimento estratégico para **cuidado corporal/skincare** e preparo para os **20 anos (2026)**.

### 12.3 Gancho comercial: atrito de agendamento em evento
- **Reclame Aqui (08–09/set/2025):** reclamações sobre o **agendamento de visitação ao stand** na Beauty Fair — relatos de "constrangimento" e informação incorreta no stand.
- **Leitura Nexia:** caso concreto do que a Nexia resolve — **agendamento automatizado, confirmação e lembrete por WhatsApp, gestão de fila/senha e resposta padronizada** (evitando informação incorreta da equipe). O mesmo motor atende **recompra, SAC e ativações** o ano todo.

### 12.4 Creators citados no estande (base p/ módulo Creators/UGC)
Karen Bachini, Evelyn Thalia (@cenourinha_oficial), Karol Resende, Thais Braz, Lua Andrade, Ju Leme, Amanda Mituyama, Carla Ramalho (@notrabalho), Angelica Silva, Cris Wraase.
→ Volume alto de ativação com creators reforça o **Pacote Creators/UGC**: captura de leads no evento via WhatsApp, cupom/brinde rastreável por influenciador e mensuração de conversão pós-evento.
