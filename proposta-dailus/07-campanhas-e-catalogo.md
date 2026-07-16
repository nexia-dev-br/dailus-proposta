# Campanhas ativas → catálogo, dicas e relação de produtos

Análise dos **criativos que estão no ar agora** na loja da Dailus (banners capturados da home em 15/07/2026, salvos em `data/site/banners/`) e como eles viram inteligência de catálogo, dicas de beleza e cross-sell dentro do explorador e da "Dai".

> Leitura de deal: a Dailus produz criativo de altíssimo nível o tempo todo. O banner chama a cliente — mas fora do horário (9h–18h) ninguém responde e o site não conecta o "quero" do banner com **o combo completo**. É aí que a conversa 24/7 + curadoria entra: transformar cada campanha em **look montado + recompra**.

## As 7 campanhas mapeadas (85 SKUs)

| Campanha | Argumentos oficiais (do banner) | SKUs no catálogo | Combo / relação de produtos |
|---|---|---|---|
| 🌌 **Top Chrome** | efeito pó cromado · 4 top coats hipnotizantes · brilho intenso · longa duração · sem complicação · vegano | 5 | Base preparadora (Base Aliada) → cor base → **Top Glass / top coat** selando o brilho |
| ✈️ **Última Chamada** | coleção de esmaltes 2025 · tema viagem · brilho intenso · longa duração | 11 | 2–3 cores da temporada + base preparadora + top coat (kit de viagem) |
| 🍨 **Sweet Skin Ice Cream** | novos sabores de sorvete · banho premium · vegano & cruelty-free (cereja, baunilha, pistache, limão…) | 34 | **Ritual por aroma**: sabonete esfoliante + gelato hidratante + body splash (mesmo sabor) |
| 💋 **Batom Líquido Matte 12H** | matte 12h · tons suculentos · fixação blindada · não transfere · alta pigmentação · novas cores | 11 | Contorno labial → batom matte → gloss por cima (brilho sem perder fixação) |
| 🛡️ **Fix Tudo (sobrancelha & blindagem)** | sobrancelhas blindadas · fixação extrema · efeito brow lamination · blindagem + bruma | 5 | Lapiseira/Quarteto (preenche) + Gel Fix Tudo (sela) + Bruma (blinda a make) |
| 🎯 **Quarteto Sobrancelha** | acabamento natural · preenche e ilumina · alta pigmentação | 2 | Quarteto + Gel Fix Tudo + Soap Brow / lapiseira |
| 🤍 **Pó Translúcido** | fixa a maquiagem · acabamento natural · controla o brilho | 17 | Base Cover Fix + Pó translúcido + Bruma finalizadora |

## Dicas de beleza por campanha (a voz da "Dai")

As dicas saem direto dos claims — a cliente sente que a marca entende o produto dela:

- **Top Chrome** → "o cromado rende muito mais com base preparadora embaixo e top coat selando o brilho".
- **Sweet Skin** → "o segredo é fechar o mesmo aroma: esfoliante + gelato + body splash".
- **Batom Matte 12H** → "não transfere e dura o dia todo; contorna antes e, se quiser, um gloss no centro dá volume sem tirar a fixação".
- **Fix Tudo** → "efeito brow lamination que segura o dia todo; combina com lapiseira pra preencher e bruma pra blindar a make".
- **Pó Translúcido** → "fixa a base e controla o brilho da zona T; dupla certa com a Cover Fix".

## Onde isso já está funcionando (explorador + Dai)

Regras codificadas em `proposta/explorer.js` (`CAMPAIGNS`) — fonte única que alimenta:

1. **Badge "🌌 em campanha"** em todo produto de campanha no catálogo (com os claims no tooltip).
2. **Agrupar: campanha ativa 🔥** — organiza o catálogo pelas campanhas em cartaz + "Fora de campanha".
3. **"Combina com" ancorado na campanha** — no detalhe do produto, a relação de produtos usa o combo da campanha (ex.: Top Chrome → Top Glass).
4. **Chat da "Dai"** — quando a cliente cita a campanha ("me mostra o Top Chrome"), a Dai prioriza os SKUs da campanha, **usa os argumentos oficiais do banner** e sugere o combo. Com Ollama local ligado, a fala é gerada por IA; sem ele, cai nas regras.

## Próximas alavancas (rápidas)

- **Cor/tom por campanha**: normalizar os tons de Última Chamada e Batom Matte para a busca por cor.
- **Kit "1 clique da campanha"**: botão que adiciona o combo inteiro da campanha na sacola.
- **Recompra por aroma (Sweet Skin)**: quem comprou 1 sabor → oferecer o ritual completo do mesmo sabor.
- **Correção de bucket**: alguns SKUs de Batom Matte estão como "Outros" no catálogo (recategorizar para "Lábios").
