/* =====================================================================
   NEXIA × DAILUS — deck loader + interações
   - Cada slide é um arquivo em ./slides/*.html (um slide por arquivo).
   - Este script carrega os slides na ordem de SLIDES, injeta no #deck
     e só então inicializa animações/observadores.
   - Requer servir via HTTP (ex.: `python3 -m http.server`), pois usa fetch.
   ===================================================================== */
(function(){
  'use strict';

  // Ordem de exibição dos slides. Para adicionar/remover/reordenar um slide,
  // basta editar esta lista e o arquivo correspondente em ./slides/.
  var SLIDES = [
    '01-hero',
    '02-band',
    '03-dailus',
    '04-profundidade',
    '05-reputacao',
    '06-grupo',
    '07-nexify',
    '08-produto',
    '09-babi',
    '09-voz',
    '09b-solucoes',
    '09c-relacionamento',
    '11-decisores',
    '10-proposta',
    '12-pitch',
    '12-cta',
    '13-footer'
  ];

  // Conteúdo dos modais de "possibilidades" (cada chip do mar de possibilidades).
  // Tudo ancorado em evidência real coletada (voz da Babi, dados do catálogo, RA, feiras...).
  var POSS = {
    'quiz-tom':{obj:'Vender mais',title:'Quiz "qual seu tom?"',
      estrategia:'Um quiz de 3–4 perguntas (subtom, cobertura, ocasião) que devolve o tom exato entre as 12 bases e já joga no carrinho.',
      caso:'A cliente diz "não sei minha cor de base". A Dai pergunta pele, subtom e cobertura e responde: "Cover Fix D4 é a sua", com o corretivo que combina.',
      dailus:'Transforma o maior atrito do catálogo (12 tons) em conversão; menos troca por cor errada e menos abandono de compra.',
      cliente:'Acaba a insegurança de errar a cor comprando online: recomendação personalizada como no balcão.',
      base:'12 tons de base = alto atrito de escolha. Recomendação consultiva é o mesmo mecanismo do +46% de conversão do Boticário.'},
    'quiz-fragrancia':{obj:'Vender mais',title:'Quiz de fragrância (Sweet Skin)',
      estrategia:'Quiz de perfil olfativo (doce, frutal, gourmand) que indica o body splash/gelato ideal e monta o trio do mesmo aroma.',
      caso:'"Quero um cheirinho doce" → a Dai sugere o Ice Cream Morango ao Leite (splash + gelato + sabonete) com desconto de kit.',
      dailus:'Impulsiona a aposta de bodycare (Sweet Skin Ice Cream) e aumenta os itens por pedido.',
      cliente:'Descobre a fragrância certa sem cheirar na loja, e leva o ritual completo.',
      base:'Sweet Skin Ice Cream (3 aromas) foi destaque de 2025; tendência "beauty dessert" em alta.'},
    'ocasiao':{obj:'Vender mais',title:'Recomendação por ocasião',
      estrategia:'"Casamento", "trabalho", "balada" → a Dai monta o look de maquiagem por ocasião, do jeito que a Babi já faz em conteúdo.',
      caso:'"Vou num casamento à tarde" → base de média cobertura + batom nude + blush + fixador, tudo no carrinho.',
      dailus:'Aumenta o ticket com venda de conjunto e replica o conteúdo campeão da marca em escala.',
      cliente:'Sai com a maquiagem completa e coerente, sem ter que montar tudo sozinha.',
      base:'A Babi já produz "produto × ocasião", padrão de conteúdo que a audiência ama e que converte.'},
    'presente':{obj:'Vender mais',title:'"Presente até R$60"',
      estrategia:'Curadoria por faixa de preço e intenção ("presente", "para amiga", "até R$60") com kits prontos para presentear.',
      caso:'"Quero presentear minha irmã, até R$60" → 3 opções de kit já embaladas, com sugestão de cartão.',
      dailus:'Captura a demanda de presente (datas comemorativas) que hoje se perde na navegação do site.',
      cliente:'Resolve o presente em segundos, sem garimpar 375 produtos.',
      base:'Catálogo grande = decisão difícil. A marca já faz ações de data (Dia das Mães, Páscoa).'},
    'rotina':{obj:'Vender mais',title:'Montar rotina de skincare/bodycare',
      estrategia:'Passo a passo personalizado (limpar, tratar, hidratar, proteger) montando o kit Sweet Skin/Fortilon do perfil.',
      caso:'"Pele seca, quero cuidar do corpo" → sabonete esfoliante + gelato hidratante + splash, na ordem de uso.',
      dailus:'Educa e vende múltiplos itens de uma vez; ancora a expansão para cuidado corporal.',
      cliente:'Entende o que usar e como, com a confiança de quem falou com uma especialista.',
      base:'Expansão para skincare/bodycare: mais categorias = mais jornada que pede assistência.'},
    'addcart':{obj:'Vender mais',title:'Add-to-cart no chat',
      estrategia:'Deep-link de carrinho do Shopify: a recomendação vira compra em um toque, sem sair da conversa.',
      caso:'A Dai sugere o combo e manda "toque aqui pra finalizar" → carrinho pronto, direto no checkout.',
      dailus:'Encurta o caminho da intenção à compra; menos fricção significa mais conversão.',
      cliente:'Compra no momento do desejo, sem procurar o produto no site depois.',
      base:'A loja é Shopify, com permalink /cart nativo. A camada conversacional é justamente o que falta.'},
    'poslive':{obj:'Vender mais',title:'Captura pós-live',
      estrategia:'No fim da live, a Dai puxa quem demonstrou interesse pro WhatsApp com os produtos mostrados e o cupom da transmissão.',
      caso:'Acabou a live de lançamento → "Quer o Top Chrome que apareceu? Tá aqui 💅" para as espectadoras.',
      dailus:'Recupera a intenção que hoje evapora quando a transmissão termina.',
      cliente:'Não perde o produto que viu e quis na live.',
      base:'Lives têm pico de intenção e queda no encerramento, hoje sem retenção estruturada.'},
    'rastreio':{obj:'Comunicação',title:'Rastreio 24/7',
      estrategia:'Consulta de pedido e rastreio pelo próprio número do WhatsApp, com resposta instantânea a qualquer hora.',
      caso:'23h: "cadê meu pedido?" → a Dai puxa o status e o link dos Correios na hora.',
      dailus:'Tira o maior tema de reclamação das costas do time humano e do horário comercial.',
      cliente:'Resposta imediata, sem esperar as 9h do dia seguinte.',
      base:'Rastreio/prazo é a principal reclamação no Reclame Aqui; o SAC atende só 9h–18h.'},
    'defeito':{obj:'Comunicação',title:'Foto de defeito → protocolo',
      estrategia:'A cliente manda a foto; a visão computacional registra, abre o protocolo e aciona a política de troca (30 dias).',
      caso:'"Meu esmalte veio ressecado" + foto → protocolo aberto e próximos passos automáticos.',
      dailus:'Padroniza e agiliza a troca por defeito, com menos exposição pública.',
      cliente:'Resolve dentro da conversa, com acolhimento e sem burocracia.',
      base:'Defeito de produto é tema recorrente no RA; troca em até 30 dias já é política da marca.'},
    'troca':{obj:'Comunicação',title:'Política de troca na hora',
      estrategia:'Respostas exatas sobre troca e arrependimento (prazos e regras) tiradas da base oficial, sem depender de humano.',
      caso:'"Posso trocar?" → a Dai explica arrependimento 7 dias / defeito 30 dias, com o passo a passo.',
      dailus:'Elimina dúvida repetitiva e o risco de informação divergente entre atendentes.',
      cliente:'Informação clara e correta na hora, com segurança para comprar.',
      base:'Políticas já mapeadas; hoje há risco de resposta inconsistente fora do script.'},
    'recompra':{obj:'Melhorar margem',title:'Lembrete de recompra',
      estrategia:'No intervalo típico de consumo, a Dai avisa "sua base deve estar acabando" com recompra em 1 toque.',
      caso:'40 dias após a compra da base → "Quer repor a Cover Fix D4? Tá aqui 💛".',
      dailus:'LTV recorrente sem novo CAC, no canal próprio da marca (D2C), de melhor margem.',
      cliente:'Nunca fica na mão do produto que ama, sem precisar lembrar.',
      base:'Recompra a cada 30–45 dias; o D2C tem margem melhor pra marca (o varejo costuma descontar mais que o site).'},
    'aniversario':{obj:'Criar vínculo',title:'Aniversário da cliente',
      estrategia:'Mensagem carinhosa no aniversário com mimo/cupom e a sugestão do que ela ama.',
      caso:'"Feliz aniversário! 💗 Separei 15% no seu batom favorito", no dia dela.',
      dailus:'Venda emocional e fidelidade barata, totalmente no DNA afetivo da marca.',
      cliente:'Sente-se lembrada e especial: relacionamento, não só transação.',
      base:'DNA próximo e afetivo (voz da Babi); a data já está no cadastro.'},
    'reposicao':{obj:'Melhorar margem',title:'Alerta de reposição',
      estrategia:'Conhecendo o padrão de uso, a Dai antecipa a reposição de itens de consumo (base, esmalte favorito).',
      caso:'Cliente que compra sempre o mesmo esmalte → aviso antes de acabar.',
      dailus:'Aumenta a frequência de compra e dá previsibilidade de demanda.',
      cliente:'Comodidade: o produto chega antes de faltar.',
      base:'Itens de consumo recorrente + histórico de compra por cliente.'},
    'voltou':{obj:'Vender mais',title:'"Voltou ao estoque"',
      estrategia:'Quem quis um item esgotado entra numa fila e é avisado na hora em que ele volta.',
      caso:'Tom de base esgotado → "Voltou! Garante o seu 💫" para quem pediu.',
      dailus:'Não perde a venda do produto em falta e mede a demanda reprimida.',
      cliente:'Garante o item desejado sem ficar checando o site.',
      base:'A recomendação só sugere o disponível; coleções são repostas com frequência.'},
    'cupom-creator':{obj:'Vender mais',title:'Cupom por creator',
      estrategia:'Cada creator do #DailusSquad tem cupom rastreável distribuído pela Dai, medindo conversão por influenciadora.',
      caso:'A seguidora da creator X manda o código → desconto para ela e venda atribuída à X.',
      dailus:'Mede o ROI real por creator e escala o programa de UGC com dado.',
      cliente:'Ganha desconto e uma indicação de quem ela já confia.',
      base:'Programa #DailusSquad ativo, com roster grande de influenciadoras.'},
    'agendamento':{obj:'Comunicação',title:'Agendamento de evento',
      estrategia:'Agendamento, confirmação e lembrete de visitação/ativação por WhatsApp, com resposta padronizada.',
      caso:'Beauty Fair → "Escolha seu horário no stand", com confirmação e lembrete automáticos.',
      dailus:'Resolve exatamente o atrito público que aconteceu na feira.',
      cliente:'Horário garantido, sem constrangimento nem informação errada.',
      base:'Reclamações de agendamento e "constrangimento no stand" na Beauty Fair 2025 (RA).'},
    'fila':{obj:'Comunicação',title:'Fila/senha em feira',
      estrategia:'Gestão de fila e senha digital no stand, avisando a vez da cliente pelo WhatsApp.',
      caso:'Stand lotado → a cliente pega senha e passeia; a Dai avisa "chegou sua vez".',
      dailus:'Ativação organizada, mais gente atendida e imagem de marca cuidada.',
      cliente:'Não perde tempo em fila; experiência premium no evento.',
      base:'Dois stands na Beauty Fair (B2B/B2C); atrito operacional já relatado.'},
    'squad':{obj:'Comunicação',title:'FAQ dos #DailusSquad',
      estrategia:'Um canal que responde as creators: briefing, prazos, envio de conteúdo e status de comissão.',
      caso:'Creator: "Quando recebo minha comissão?" → resposta automática com o status.',
      dailus:'Escala a operação de creators sem sobrecarregar o time de marketing.',
      cliente:'(creators) Suporte rápido e claro, numa relação profissional.',
      base:'#DailusSquad e banco de talentos existem; a operação hoje é manual.'},
    'memoria':{obj:'Criar vínculo',title:'Memória de preferências',
      estrategia:'A Dai lembra o tom de base, as cores e as fragrâncias favoritas de cada cliente, e usa isso em toda conversa.',
      caso:'"Quero um batom novo" → "No seu tom Cappuccino saiu essa cor 😍".',
      dailus:'Personalização real que aumenta conversão e encantamento.',
      cliente:'Não precisa repetir o que já disse; sente que a marca a conhece.',
      base:'Catálogo com muitas variações; hoje não há memória entre um contato e outro.'},
    'csat':{obj:'Comunicação',title:'CSAT pós-atendimento',
      estrategia:'Pesquisa curta de satisfação ao fim do atendimento, alimentando um painel de qualidade.',
      caso:'"Resolvi sua dúvida? 😊 De 1 a 5" → nota e comentário registrados.',
      dailus:'Mede e protege a nota 8,9 conforme o volume de contatos cresce.',
      cliente:'Sente que a opinião dela importa, e vê a melhoria acontecer.',
      base:'Reputação RA 8,9 a ser protegida em escala.'},
    'handoff':{obj:'Comunicação',title:'Handoff humano',
      estrategia:'Em caso sensível, a Dai passa para o humano com todo o histórico e contexto, sem a cliente repetir nada.',
      caso:'Reclamação delicada → o atendente recebe o resumo e assume com empatia.',
      dailus:'Mantém o toque humano onde importa; a IA cuida do repetitivo.',
      cliente:'Nunca fica presa num robô; é ouvida por gente quando precisa.',
      base:'O atendimento humano da marca funciona (nota alta). A IA amplia, não substitui.'},
    'lipcombo':{obj:'Melhorar margem',title:'Cross-sell do "Lip Combo"',
      estrategia:'Ao comprar um batom, a Dai oferece o gloss/lápis do mesmo tom para fechar o look.',
      caso:'Batom Cherry no carrinho → "Sela com o gloss Cherry? Fica lindo 💋".',
      dailus:'Aumenta os itens por pedido com margem, no automático.',
      cliente:'Look completo e harmônico, sem ter que pensar na combinação.',
      base:'55+ SKUs de lábios; o pareamento por tom já está demonstrado no explorador do catálogo.'},
    'multimarca':{obj:'Melhorar margem',title:'Multi-marca (Sweet Skin + Fortilon)',
      estrategia:'Uma só Dai atende Dailus, Sweet Skin e Fortilon, fazendo cross-sell entre as marcas da casa.',
      caso:'Comprou base Dailus → "Cuida das unhas com Fortilon" / "Hidrata com Sweet Skin".',
      dailus:'Um contrato, três marcas; leva o cliente de uma marca para a outra.',
      cliente:'Descobre o portfólio inteiro da casa num só lugar.',
      base:'Grupo Dailus (Sweet Skin + Fortilon) sob a mesma operação.'},
    'ocr':{obj:'Melhorar margem',title:'OCR de NF/boletos (back-office)',
      estrategia:'Leitura automática de notas e boletos com classificação, reaproveitando um motor já validado em produção.',
      caso:'Nota de fornecedor chega → dados extraídos e lançados, sem digitação manual.',
      dailus:'Eficiência administrativa que fala a língua do novo CFO/COO (ROI e operação).',
      cliente:'(interno) Time financeiro livre do trabalho manual repetitivo.',
      base:'Nova gestão "AI & Data-Driven" (Diego Kilpp); o motor de OCR já existe e está provado.'},
    'painel':{obj:'Melhorar margem',title:'Painel de dados',
      estrategia:'Dashboard de conversas, temas, conversão assistida e satisfação: a voz da cliente virando decisão.',
      caso:'Pico de dúvidas sobre um tom → sinal direto para estoque e marketing.',
      dailus:'Decisão com dado, do jeito que a nova liderança quer trabalhar.',
      cliente:'Produtos e atendimento que melhoram com base no que ela diz.',
      base:'Cultura data-driven da nova gestão; hoje os dados de conversa estão dispersos.'},
    'historia':{obj:'Criar vínculo',title:'Contar a história da marca',
      estrategia:'A Dai sabe contar os 20 anos, o "feito por mulheres", a fábrica própria e o controle de qualidade: a alma que a Babi mostra.',
      caso:'"Por que Dailus?" → a Dai conta a origem familiar e o cuidado de produção.',
      dailus:'Diferencia por propósito, não só por preço; reforça a celebração dos 20 anos (2026).',
      cliente:'Compra uma história em que acredita e cria vínculo com a marca.',
      base:'Reels de fundação, QC e logística; 20 anos em 2026; a voz e a profundidade da Babi.'},
    'obj-vender':{obj:'Vender mais',title:'Beauty advisor + captura pós-live',
      estrategia:'Recomendação por ocasião, tom e cor com add-to-cart no WhatsApp, e um fluxo que captura quem chegou pela live e a intenção que hoje some quando ela acaba.',
      caso:'Fim da live no TikTok Shop: a Dai puxa quem comentou "quero", tira a dúvida de cor e fecha o pedido no WhatsApp, mesmo às 23h.',
      dailus:'Converte a intenção quente das lives fora da janela da transmissão e reduz o atrito das 12 cores/tons no menu tradicional.',
      cliente:'Compra aconselhada como no balcão, na hora que der, sem depender do horário da live nem do SAC.',
      base:'Lives com picos de 250K+ views, mas SAC só 9h–18h; 12 tons de base = atrito de escolha; ganhos de conversão com IA no varejo de beleza.'},
    'obj-proximidade':{obj:'Proximidade',title:'A "Dai" 24/7 com a voz da marca',
      estrategia:'Presença sempre ligada no WhatsApp (onde os 2,9M já estão), falando como a Babi, com quizzes ("qual seu tom?", "qual fragrância combina?").',
      caso:'"Não sei minha cor de base" → a Dai pergunta pele, subtom e cobertura e responde "Cover Fix é a sua", já com o corretivo que combina.',
      dailus:'Amplia a voz da marca sem custo humano proporcional e transforma seguidor em conversa 1:1 no canal próprio.',
      cliente:'Fala com a marca a qualquer hora e é reconhecida: tom caloroso e próximo, como a Babi.',
      base:'SAC só 9h–18h; corpus real de voz (@babidadailus); a marca já usa "caixinhas de pergunta".'},
    'obj-comunicacao':{obj:'Comunicação',title:'SAC 24/7 + memória viva da marca',
      estrategia:'Rastreio, políticas e defeito por foto (Vision) na hora; um bot que conta a história, a qualidade e a logística; e agendamento de ativações sem atrito.',
      caso:'"Cadê meu pedido?" às 22h → status instantâneo; "chegou lascado" → foto abre o protocolo de troca na hora.',
      dailus:'Protege a nota 8,9 do Reclame Aqui na escala e no horário e tira o tier-1 da fila humana.',
      cliente:'Resposta imediata 24/7 para rastreio, troca e dúvidas, sem esperar o horário comercial.',
      base:'Reclamações de rastreio/horário no RA; SAC 9h–18h; atrito de agendamento na Beauty Fair; Reels de fundação/QC/logística.'},
    'obj-margem':{obj:'Melhorar margem',title:'Converter no D2C + recompra assistida',
      estrategia:'A Dai fecha no site (canal próprio, de melhor margem), com fast-path que corta custo de IA, cross-sell contextual e recompra na hora certa.',
      caso:'40 dias após a base: "sua Cover Fix deve estar acabando, quer repor?", em 1 toque, sem novo anúncio.',
      dailus:'Mais LTV sem novo CAC e margem melhor que o varejo, que costuma descontar mais que o site.',
      cliente:'Nunca fica sem o produto que ama e ganha conveniência de recompra em 1 toque.',
      base:'Recompra a cada 30–45 dias; no varejo (Época) a Dailus costuma sair mais barata que no site → reter no D2C protege a margem; kits campeões mapeados.'},
    'obj-vinculo':{obj:'Criar vínculo',title:'Relacionamento que lembra e acolhe',
      estrategia:'Recompra e aniversário personalizados, pós-venda empático que protege a nota e memória de preferências (tom, fragrância), com humano sempre que precisar.',
      caso:'No aniversário: "Feliz aniversário! 💗 Separei 15% no seu batom favorito", no dia dela.',
      dailus:'Fideliza a base de 2,9M como ativo próprio (CRM), aumenta a frequência e protege a reputação RA1000.',
      cliente:'Sente-se lembrada e acolhida: a marca conhece seu tom, sua fragrância e sua história.',
      base:'Reputação RA1000 (8,9); recompra recorrente; DNA próximo e afetivo (voz da Babi); app + clube de relacionamento.'},
    'imaginar':{obj:'Um mar de possibilidades',title:'…e o que a Dailus imaginar',
      estrategia:'A tecnologia é matéria-prima. Se a Dailus sonhar, a gente constrói; esta lista é só o começo.',
      caso:'Qualquer ideia da Babi, da Carolina ou do Diego vira um fluxo funcionando em semanas.',
      dailus:'Uma parceria de construção contínua, não um produto fechado de prateleira.',
      cliente:'Experiências novas o tempo todo, no ritmo da marca.',
      base:'Plataforma ~70% reutilizável e provada em produção: conhecimento + tecnologia a favor da Dailus.'}
  };

  var deck = document.getElementById('deck');

  function loadSlides(){
    // Busca todos em paralelo, preservando a ordem na injeção.
    return Promise.all(SLIDES.map(function(name){
      return fetch('slides/' + name + '.html', {cache:'no-cache'})
        .then(function(r){ if(!r.ok) throw new Error(r.status+' '+name); return r.text(); })
        .then(function(html){ return {name:name, html:html}; })
        .catch(function(err){
          return {name:name, html:'<div class="slide-error">Falha ao carregar slide <b>'+name+'</b> ('+err.message+'). Sirva a pasta via HTTP: <span class="mono">python3 -m http.server</span></div>'};
        });
    })).then(function(parts){
      deck.innerHTML = parts.map(function(p){ return p.html; }).join('\n');
    });
  }

  /* ---- imagens sociais usadas em colagens/marquees ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var IMGB = '../../data/social/instagram/media/';
  var IG = [
    'dailus/DagEunJlDv_','dailus/DayTKdZBayq','dailus/DavHFwERmVx','dailus/Dan6x_yRk62',
    'dailus/DaiLd7QCxfJ','dailus/DadxgqRCGv2','dailus/Daa-jdUCXJo',
    'babidadailus/DZyOTXqFNdV','babidadailus/DZs7372lIPw','babidadailus/DZqX6Povc4c',
    'babidadailus/DZa5AfglJyU','babidadailus/DZGYT2AlJvv','babidadailus/DZ5FyuXFS1h',
    'babidadailus/DZ58J__vPZb','babidadailus/DZ3BEszv1ts','babidadailus/DZ0wyWiv0UP',
    'babidadailus/DYxrkSNvJoF','babidadailus/DYqG42Mv8Me','babidadailus/DYnXD6SFBll',
    'babidadailus/DYVp7quMaak','babidadailus/DY8ToabvYOm','babidadailus/DY5jx-APYXP',
    'babidadailus/DY227jTvANl','babidadailus/DY0V1LFvRFC','babidadailus/DY-A41cvPk_',
    'babidadailus/DZODjJevm20','babidadailus/DZFuIHRPvWT','babidadailus/DZDyFxXvU-6'
  ];
  function url(t){ return IMGB + t + '.jpg'; }
  function vurl(t){ return IMGB + t + '.mp4'; }

  /* slugs que possuem vídeo (.mp4) disponível */
  var VIDSET = {
    'dailus/DagEunJlDv_':1,'dailus/DayTKdZBayq':1,'dailus/DavHFwERmVx':1,'dailus/Dan6x_yRk62':1,
    'dailus/DaiLd7QCxfJ':1,'dailus/DadxgqRCGv2':1,'dailus/Daa-jdUCXJo':1,
    'babidadailus/DZqX6Povc4c':1,'babidadailus/DZ58J__vPZb':1,'babidadailus/DZ3BEszv1ts':1,
    'babidadailus/DZ0wyWiv0UP':1,'babidadailus/DYxrkSNvJoF':1,'babidadailus/DYVp7quMaak':1,
    'babidadailus/DY8ToabvYOm':1,'babidadailus/DY5jx-APYXP':1,'babidadailus/DY227jTvANl':1,
    'babidadailus/DY0V1LFvRFC':1,'babidadailus/DY-A41cvPk_':1,'babidadailus/DZODjJevm20':1,
    'babidadailus/DZFuIHRPvWT':1,'babidadailus/DZDyFxXvU-6':1
  };
  function hasVid(t){ return VIDSET[t] === 1; }

  /* toca só os vídeos visíveis para não pesar o navegador */
  var vObs = (!reduce && 'IntersectionObserver' in window) ? new IntersectionObserver(function(ents){
    ents.forEach(function(e){
      var v = e.target;
      if(e.isIntersecting){ var p = v.play(); if(p && p.catch){ p.catch(function(){}); } }
      else { v.pause(); }
    });
  }, {rootMargin:'120px'}) : null;

  /* devolve <video> (autoplay/mudo/loop) quando houver mp4, senão <img> */
  function makeMedia(t, eager){
    if(!reduce && hasVid(t)){
      var v = document.createElement('video');
      v.src = vurl(t); v.poster = url(t);
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.setAttribute('aria-hidden','true');
      v.preload = eager ? 'auto' : 'metadata';
      if(vObs){ vObs.observe(v); }
      else { var p = v.play(); if(p && p.catch){ p.catch(function(){}); } }
      return v;
    }
    var im = document.createElement('img'); im.src = url(t); im.alt = ''; im.loading = (eager ? 'eager' : 'lazy');
    return im;
  }

  function initDeck(){
    /* ---- HERO collage ---- */
    var hc = document.getElementById('heroCollage');
    if(hc){
      var need=18, i=0;
      while(hc.children.length<need){
        var t=document.createElement('div'); t.className='tile';
        var im=document.createElement('img'); im.src=url(IG[i%IG.length]); im.alt=''; im.loading=(i<6?'eager':'lazy');
        im.style.animationDelay=(-(i%9)*2.4)+'s';
        t.appendChild(im); hc.appendChild(t); i++;
      }
    }

    /* ---- Marquees ---- */
    function fillMarquee(el,list){
      if(!el)return;
      var seq=list.concat(list); /* duplicate for seamless -50% loop */
      seq.forEach(function(t){
        var d=document.createElement('div'); d.className='mtile';
        if(hasVid(t)){
          d.classList.add('mtile-reel');
          d.setAttribute('data-reel', t);
          d.setAttribute('role','button');
          d.setAttribute('tabindex','0');
          d.setAttribute('aria-label','Abrir transcrição e resumo do vídeo');
        }
        d.appendChild(makeMedia(t, false));
        el.appendChild(d);
      });
    }
    var half=Math.ceil(IG.length/2);
    fillMarquee(document.getElementById('mq1'), IG.slice(0,half+2));
    fillMarquee(document.getElementById('mq2'), IG.slice(half-2));

    /* ---- CTA bg ---- */
    var cb=document.getElementById('ctaBg');
    if(cb){ for(var c=0;c<10;c++){ var cim=document.createElement('img'); cim.src=url(IG[(c+3)%IG.length]); cim.alt=''; cim.loading='lazy'; cb.appendChild(cim);} }

    /* ---- progress + nav ---- */
    var prog=document.getElementById('prog'), nav=document.getElementById('nav'), hero=document.getElementById('top');
    function onScroll(){
      var h=document.documentElement, sc=h.scrollTop||document.body.scrollTop;
      var max=(h.scrollHeight-h.clientHeight)||1;
      if(prog) prog.style.width=(sc/max*100)+'%';
      if(nav){
        nav.classList.toggle('scrolled', sc>40);
        var hb=hero?hero.getBoundingClientRect().bottom:0;
        nav.classList.toggle('on-dark', hb>70);
      }
      /* parallax */
      if(!reduce){document.querySelectorAll('[data-par]').forEach(function(el){
        var f=parseFloat(el.getAttribute('data-par'))||0.1;
        el.style.transform='scale(1.06) translateY('+(sc*f)+'px)';
      });}
    }
    document.addEventListener('scroll',onScroll,{passive:true}); onScroll();

    /* ---- reveal ---- */
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('[data-r]').forEach(function(el){io.observe(el);});

    /* ---- bar fills ---- */
    var bio=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); bio.unobserve(e.target);} });
    },{threshold:.4});
    document.querySelectorAll('.bar').forEach(function(el){bio.observe(el);});

    /* ---- count-up ---- */
    function fmt(n,dec,sep){
      var s=n.toFixed(dec);
      var parts=s.split('.');
      if(sep){parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,sep);}
      return dec>0 ? parts[0]+','+parts[1] : parts[0];
    }
    function render(el,val){
      var dec=parseInt(el.getAttribute('data-dec')||'0',10);
      var sep=el.getAttribute('data-sep')||'';
      var pre=el.getAttribute('data-pre')||'';
      var suf=el.getAttribute('data-suf')||'';
      el.textContent=pre+fmt(val,dec,sep)+suf;
    }
    function countUp(el){
      var target=parseFloat(el.getAttribute('data-count'));
      if(isNaN(target))return;
      if(reduce){render(el,target);return;}
      var dur=1400, start=null;
      function step(ts){
        if(!start)start=ts;
        var p=Math.min((ts-start)/dur,1);
        var e=1-Math.pow(1-p,3); /* easeOutCubic */
        render(el,target*e);
        if(p<1)requestAnimationFrame(step); else render(el,target);
      }
      requestAnimationFrame(step);
    }
    var cio=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ countUp(e.target); cio.unobserve(e.target);} });
    },{threshold:.5});
    document.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el);});

    /* ---- product tilt ---- */
    if(!reduce && matchMedia('(hover:hover)').matches){
      document.querySelectorAll('.prod').forEach(function(card){
        card.addEventListener('pointermove',function(ev){
          var r=card.getBoundingClientRect();
          var x=(ev.clientX-r.left)/r.width-.5, y=(ev.clientY-r.top)/r.height-.5;
          card.style.transform='perspective(600px) rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg) translateY(-4px)';
        });
        card.addEventListener('pointerleave',function(){card.style.transform='';});
      });
    }

    /* ---- deep-link para âncora após carregar os slides ---- */
    if(location.hash){
      var target=document.getElementById(location.hash.slice(1));
      if(target){ setTimeout(function(){ target.scrollIntoView(); },60); }
    }

    /* ---- reveal-all (failsafe + modo apresentação) ---- */
    function revealAll(){
      document.querySelectorAll('[data-r]:not(.in)').forEach(function(el){el.classList.add('in');});
      document.querySelectorAll('.bar:not(.in)').forEach(function(el){el.classList.add('in');});
      document.querySelectorAll('[data-count]').forEach(function(el){
        if(el.textContent.trim()===''){var t=parseFloat(el.getAttribute('data-count'));if(!isNaN(t))render(el,t);}
      });
    }
    setTimeout(revealAll,2200);

    /* ---- modal de possibilidades ---- */
    initPossModal();

    /* ---- modal de reel (transcrição + resumo + recomendação) ---- */
    initReelModal();

    /* ---- SLIDESHOW · modo apresentação (PowerPoint) ---- */
    initSlideshow(revealAll);
  }

  function initPossModal(){
    var tags=document.getElementById('possTags');
    if(!tags) return;

    var back=document.createElement('div'); back.className='poss-back'; back.id='possBack';
    var modal=document.createElement('div'); modal.className='poss-modal'; modal.id='possModal';
    modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true');
    document.body.appendChild(back); document.body.appendChild(modal);

    function esc(s){ return (s||'').replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }

    function open(key){
      var d=POSS[key]; if(!d) return;
      modal.innerHTML=
        '<button class="pm-x" aria-label="Fechar">×</button>'+
        '<div class="pm-obj">Objetivo · '+esc(d.obj)+'</div>'+
        '<h3 class="pm-title">'+esc(d.title)+'</h3>'+
        '<div class="pm-grid">'+
          '<div class="pm-b estr"><h4>🎯 Estratégia</h4><p>'+esc(d.estrategia)+'</p></div>'+
          '<div class="pm-b caso"><h4>💡 Case de uso</h4><p>'+esc(d.caso)+'</p></div>'+
          '<div class="pm-b gd"><h4>Por que é bom para a Dailus</h4><p>'+esc(d.dailus)+'</p></div>'+
          '<div class="pm-b gc"><h4>Por que é bom para a cliente</h4><p>'+esc(d.cliente)+'</p></div>'+
        '</div>'+
        '<div class="pm-base"><span>Base real</span>'+esc(d.base)+'</div>';
      modal.querySelector('.pm-x').onclick=close;
      back.classList.add('on'); modal.classList.add('on');
    }
    function close(){ back.classList.remove('on'); modal.classList.remove('on'); }

    tags.addEventListener('click',function(e){
      var t=e.target.closest('[data-p]'); if(!t) return;
      open(t.getAttribute('data-p'));
    });
    // Cards grandes de objetivo abrem a mesma ficha detalhada.
    var sec=document.getElementById('solucoes');
    if(sec){
      sec.addEventListener('click',function(e){
        var c=e.target.closest('.card[data-p]'); if(!c) return;
        open(c.getAttribute('data-p'));
      });
      sec.addEventListener('keydown',function(e){
        if(e.key!=='Enter' && e.key!==' ') return;
        var c=e.target.closest('.card[data-p]'); if(!c) return;
        e.preventDefault(); open(c.getAttribute('data-p'));
      });
    }
    back.addEventListener('click',close);
    // Esc fecha o modal antes de qualquer atalho do slideshow (captura).
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape' && modal.classList.contains('on')){ e.stopPropagation(); e.preventDefault(); close(); }
    },true);
  }

  function initReelModal(){
    var TR_BASE = '../../data/social/instagram/transcripts/';
    var reelsData = null;
    var back = document.createElement('div'); back.className = 'reel-back'; back.id = 'reelBack';
    var modal = document.createElement('div'); modal.className = 'reel-modal'; modal.id = 'reelModal';
    modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true');
    document.body.appendChild(back); document.body.appendChild(modal);

    function esc(s){ return (s||'').replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }
    function money(v){ return 'R$ ' + Number(v).toFixed(2).replace('.', ','); }

    /* carrega o índice curado (resumos + recomendações) uma única vez */
    fetch('data/reels.json', {cache:'no-cache'})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ reelsData = j || {reels:{}, storeBase:''}; })
      .catch(function(){ reelsData = {reels:{}, storeBase:''}; });

    function close(){
      back.classList.remove('on'); modal.classList.remove('on');
      var v = modal.querySelector('video'); if(v){ try{ v.pause(); }catch(e){} }
    }

    function recCard(rec, base){
      var href = (base||'') + rec.handle;
      return '<a class="rm-rec" href="'+esc(href)+'" target="_blank" rel="noopener">'+
               '<span class="rm-rec-t">'+esc(rec.title)+'</span>'+
               '<span class="rm-rec-p">'+money(rec.price)+'</span>'+
               (rec.porque ? '<span class="rm-rec-w">'+esc(rec.porque)+'</span>' : '')+
             '</a>';
    }

    function renderBody(slug, info, transcript){
      var base = (reelsData && reelsData.storeBase) || '';
      var titulo = (info && info.titulo) || 'Conteúdo #DailusSquad';
      var fala = transcript && (transcript.transcricao||'').trim();
      var ocr = '';
      if(transcript && transcript.texto_na_tela && transcript.texto_na_tela.length){
        ocr = transcript.texto_na_tela.map(function(x){return x.texto;}).filter(Boolean).join(' · ');
      }
      var transHtml;
      if(fala){ transHtml = '<p>'+esc(fala)+'</p>'; }
      else if(ocr){ transHtml = '<p class="rm-empty">Vídeo sem narração. Texto na tela captado:</p><p>'+esc(ocr)+'</p>'; }
      else { transHtml = '<p class="rm-empty">Sem transcrição disponível para este clipe.</p>'; }

      var resumoHtml = (info && info.resumo)
        ? '<p>'+esc(info.resumo)+'</p>'
        : '<p class="rm-empty">Resumo em curadoria para este clipe.</p>';

      var recHtml = '';
      if(info && info.recomendacao && info.recomendacao.length){
        recHtml = '<div class="rm-block rm-rec-block"><h4>🛍️ A Dai recomenda</h4><div class="rm-recs">'+
                  info.recomendacao.map(function(r){return recCard(r, base);}).join('')+
                  '</div></div>';
      }

      modal.innerHTML =
        '<button class="rm-x" aria-label="Fechar">×</button>'+
        '<div class="rm-tag">A Dai assistiu este conteúdo e já reage no site</div>'+
        '<h3 class="rm-title">'+esc(titulo)+'</h3>'+
        '<div class="rm-body">'+
          '<div class="rm-video"><video src="'+esc(vurl(slug))+'" poster="'+esc(url(slug))+'" controls playsinline preload="metadata"></video></div>'+
          '<div class="rm-cols">'+
            '<div class="rm-block"><h4>✨ Resumo</h4>'+resumoHtml+'</div>'+
            recHtml+
            '<div class="rm-block rm-trans"><h4>📝 Transcrição</h4>'+transHtml+'</div>'+
          '</div>'+
        '</div>';
      modal.querySelector('.rm-x').onclick = close;
      back.classList.add('on'); modal.classList.add('on');
      modal.scrollTop = 0;
    }

    function open(slug){
      var info = reelsData && reelsData.reels ? reelsData.reels[slug] : null;
      /* estado de carregamento */
      modal.innerHTML = '<button class="rm-x" aria-label="Fechar">×</button><div class="rm-loading">Carregando transcrição…</div>';
      modal.querySelector('.rm-x').onclick = close;
      back.classList.add('on'); modal.classList.add('on');

      var parts = slug.split('/');
      var trUrl = TR_BASE + parts[0] + '/' + parts[1] + '.json';
      fetch(trUrl, {cache:'no-cache'})
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(tr){ renderBody(slug, info, tr); })
        .catch(function(){ renderBody(slug, info, null); });
    }

    /* delegação: clique/enter numa tile de vídeo do marquee abre o modal */
    document.addEventListener('click', function(e){
      var t = e.target.closest && e.target.closest('[data-reel]');
      if(!t) return;
      e.preventDefault();
      open(t.getAttribute('data-reel'));
    });
    document.addEventListener('keydown', function(e){
      if(e.key!=='Enter' && e.key!==' ' && e.key!=='Spacebar') return;
      var t = e.target && e.target.closest && e.target.closest('[data-reel]');
      if(!t) return;
      e.preventDefault();
      open(t.getAttribute('data-reel'));
    });

    back.addEventListener('click', close);
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && modal.classList.contains('on')){ e.stopPropagation(); e.preventDefault(); close(); }
    }, true);
  }

  function initSlideshow(revealAll){
    var slides = Array.prototype.slice.call(deck.children).filter(function(el){return el.nodeType===1;});
    if(!slides.length) return;
    var total = slides.length, idx = 0, active = false;

    function labelFor(el){
      var a=el.querySelector('.act-no'); if(a) return a.textContent.trim();
      if(el.tagName==='HEADER') return 'Capa';
      if(el.classList.contains('band')) return '#DailusSquad';
      if(el.tagName==='FOOTER') return 'Contato';
      var h=el.querySelector('h2,h1'); return h?h.textContent.trim().slice(0,32):'';
    }

    /* ---- UI (barra + progresso + rótulo) ---- */
    var bar=document.createElement('div'); bar.className='showbar';
    bar.innerHTML=
      '<button data-act="first" title="Início (Home)">⏮</button>'+
      '<button data-act="prev" title="Anterior (←)">‹</button>'+
      '<span class="count"><b>1</b> / '+total+'</span>'+
      '<button data-act="next" title="Próximo (→ / espaço)">›</button>'+
      '<button data-act="last" title="Fim (End)">⏭</button>'+
      '<span class="sep"></span>'+
      '<button data-act="full" title="Tela cheia (F)">⛶</button>'+
      '<button data-act="exit" title="Sair (Esc)">✕</button>';
    var prog=document.createElement('div'); prog.className='showprog'; prog.innerHTML='<i></i>';
    var tag=document.createElement('div'); tag.className='showtag';
    document.body.appendChild(bar); document.body.appendChild(prog); document.body.appendChild(tag);
    var countEl=bar.querySelector('.count b'), progI=prog.querySelector('i');

    function update(){
      deck.style.transform='translateX('+(-idx*100)+'vw)';
      countEl.textContent=(idx+1);
      progI.style.width=(total>1?(idx/(total-1)*100):100)+'%';
      tag.textContent=labelFor(slides[idx]);
      bar.querySelector('[data-act=prev]').disabled=(idx===0);
      bar.querySelector('[data-act=first]').disabled=(idx===0);
      bar.querySelector('[data-act=next]').disabled=(idx===total-1);
      bar.querySelector('[data-act=last]').disabled=(idx===total-1);
      slides[idx].scrollTop=0;
    }
    function go(n){ idx=Math.max(0,Math.min(total-1,n)); update(); }
    function next(){ go(idx+1); }
    function prev(){ go(idx-1); }

    function currentScrollSlide(){
      var mid=window.innerHeight/2, best=0, bd=1e9;
      slides.forEach(function(el,i){ var r=el.getBoundingClientRect(); var c=r.top+r.height/2; var d=Math.abs(c-mid);
        if(r.bottom>0 && r.top<window.innerHeight && d<bd){bd=d;best=i;} });
      return best;
    }

    function enter(start){
      if(active) return; active=true;
      revealAll();
      document.body.classList.add('mode-show');
      idx = (typeof start==='number') ? start : currentScrollSlide();
      deck.style.transition='none'; update(); void deck.offsetWidth; deck.style.transition='';
      document.addEventListener('keydown', onKey);
    }
    function exit(){
      if(!active) return; active=false;
      document.body.classList.remove('mode-show');
      deck.style.transform='';
      document.removeEventListener('keydown', onKey);
      if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function(){});
    }
    function toggleFull(){
      if(document.fullscreenElement){ if(document.exitFullscreen) document.exitFullscreen().catch(function(){}); }
      else { var el=document.documentElement; if(el.requestFullscreen) el.requestFullscreen().catch(function(){}); }
    }

    function onKey(e){
      if(!active) return;
      switch(e.key){
        case 'ArrowRight': case 'PageDown': case ' ': case 'Spacebar': e.preventDefault(); next(); break;
        case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
        case 'Home': e.preventDefault(); go(0); break;
        case 'End': e.preventDefault(); go(total-1); break;
        case 'Escape': e.preventDefault(); exit(); break;
        case 'f': case 'F': e.preventDefault(); toggleFull(); break;
      }
    }

    bar.addEventListener('click', function(e){
      var b=e.target.closest('button'); if(!b) return;
      var a=b.getAttribute('data-act');
      if(a==='next') next(); else if(a==='prev') prev();
      else if(a==='first') go(0); else if(a==='last') go(total-1);
      else if(a==='full') toggleFull(); else if(a==='exit') exit();
    });

    /* swipe em telas touch */
    var tx=0,ty=0;
    deck.addEventListener('touchstart',function(e){ if(!active)return; tx=e.touches[0].clientX; ty=e.touches[0].clientY; },{passive:true});
    deck.addEventListener('touchend',function(e){ if(!active)return;
      var dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
      if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)){ dx<0?next():prev(); } },{passive:true});

    /* atalho global "P" para iniciar a apresentação */
    document.addEventListener('keydown', function(e){
      if(active) return;
      var tn=(e.target&&e.target.tagName)||'';
      if((e.key==='p'||e.key==='P') && !/INPUT|TEXTAREA|SELECT/.test(tn)){ e.preventDefault(); enter(); }
    });

    var pb=document.getElementById('presentBtn');
    if(pb) pb.addEventListener('click', function(){ enter(); });

    /* abrir já em modo apresentação com #present na URL */
    if(location.hash==='#present'){ setTimeout(function(){ enter(0); },80); }
  }

  loadSlides().then(initDeck);
})();
