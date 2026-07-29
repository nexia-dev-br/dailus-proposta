/* =====================================================================
   NEXIFY × DAILUS · PLATAFORMA DE INFLUENCIADORAS — deck loader + interações
   - Mesmo motor de apresentação do ../../proposta-dailus/proposta/.
   - Cada slide é um arquivo em ./slides/*.html (um slide por arquivo).
   - Para adicionar/remover/reordenar: edite a lista SLIDES abaixo.
   - Requer servir via HTTP (usa fetch): `npm run plataforma`.
   - Modo apresentação: tecla P · setas ← → · M abre miniaturas · F tela cheia.
   ===================================================================== */
(function(){
  'use strict';

  var SLIDES = [
    '01-capa',
    '02-principio',
    '03-superficies',
    '04-wire-web-landing',
    '05-wire-mobile-home',
    '06-wire-mobile-carteira',
    '07-wire-mobile-campanha',
    '08-wire-mobile-vitrine',
    '09-wire-admin-dashboard',
    '10-wire-admin-regras',
    '11-wire-admin-fechamento',
    '12-jornadas-abertura',
    '13-jornada-1-aquisicao',
    '14-jornada-2-semana',
    '15-jornada-3-campanha',
    '16-jornada-4-dinheiro',
    '17-jornada-5-vitrine',
    '18-jornada-6-mes-do-admin',
    '19-para-cada-um',
    '20-arq-negocio',
    '21-arq-componentes',
    '22-arq-pilha',
    '23-arq-desenho',
    '24-arq-deploy',
    '25-arq-fluxo',
    '26-arq-dados',
    '27-arq-seguranca',
    '28-arq-escala',
    '29-ondas',
    '30-custo-real',
    '31-premissas',
    '32-mapa',
    '33-visao-consumidor',
    '34-wire-consumidora',
    '35-cta',
    '36-footer'
  ];

  /* ---------------------------------------------------------------
     TRILHA PRINCIPAL x APROFUNDAMENTOS
     No modo apresentação as setas percorrem só a trilha principal.
     Os slides abaixo saem da linha reta e viram ramos, alcançáveis
     pelo slide-mapa (32) ou pelas miniaturas. Dentro de um ramo a
     seta anda de tela em tela e, no fim, volta para o mapa.
     Rolando a página ou no PDF nada é pulado — a ordem é a natural.
     Para mover um slide entre trilha e ramo: só editar este objeto.
     --------------------------------------------------------------- */
  var HUB = '32-mapa';
  var DEEP = {
    '04-wire-web-landing'   : 'telas',
    '06-wire-mobile-carteira': 'telas',
    '07-wire-mobile-campanha': 'telas',
    '08-wire-mobile-vitrine' : 'telas',
    '10-wire-admin-regras'   : 'telas',
    '14-jornada-2-semana'    : 'jornadas',
    '15-jornada-3-campanha'  : 'jornadas',
    '17-jornada-5-vitrine'   : 'jornadas',
    '18-jornada-6-mes-do-admin': 'jornadas',
    '21-arq-componentes'     : 'arquitetura',
    '22-arq-pilha'           : 'arquitetura',
    '24-arq-deploy'          : 'arquitetura',
    '26-arq-dados'           : 'arquitetura',
    '27-arq-seguranca'       : 'arquitetura',
    '28-arq-escala'          : 'arquitetura',
    '33-visao-consumidor'    : 'segundo projeto',
    '34-wire-consumidora'    : 'segundo projeto'
  };

  var deck = document.getElementById('deck');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var SLIDE_EL = {};   /* nome do arquivo → elemento do slide */

  /* O live-server injeta seu script de auto-reload antes de CADA </svg> do
     arquivo servido (é o suporte dele a arquivos .svg). Nos slides que têm
     diagrama ou ícone em SVG isso cai no meio do markup e destrói o resto
     do fragmento. Só acontece em desenvolvimento — no Pages e no build do
     PDF (python -m http.server) não existe injeção. Removemos aqui.
     Nenhum slide contém <script> legítimo, então tirar todo bloco de script
     é seguro e cobre qualquer variação do injetor. */
  function clean(html){
    return html
      .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
      .replace(/<!--\s*Code injected by live-server\s*-->/gi, '');
  }

  function loadSlides(){
    return Promise.all(SLIDES.map(function(name){
      return fetch('slides/' + name + '.html', {cache:'no-cache'})
        .then(function(r){ if(!r.ok) throw new Error(r.status+' '+name); return r.text(); })
        .then(function(html){ return {name:name, html:clean(html)}; })
        .catch(function(err){
          return {name:name, html:'<div class="slide-error">Falha ao carregar slide <b>'+name+'</b> ('+err.message+'). Sirva a pasta via HTTP: <span class="mono">npm run plataforma</span></div>'};
        });
    })).then(function(parts){
      /* Cada slide é parseado ISOLADO, não concatenado numa string única.
         Motivo: o live-server injeta seu script de auto-reload dentro do
         primeiro <svg> de cada fragmento; num innerHTML concatenado esse
         script entra em conteúdo estrangeiro (SVG) e engole o slide
         seguinte inteiro. Isolando o parse, um fragmento nunca contamina
         o outro — e de quebra o deck fica imune a qualquer tag mal fechada
         em um slide. Os <script> injetados pelo servidor são removidos. */
      deck.innerHTML = '';
      parts.forEach(function(p){
        var tpl = document.createElement('template');
        tpl.innerHTML = p.html;
        Array.prototype.forEach.call(tpl.content.querySelectorAll('script'), function(s){
          s.parentNode.removeChild(s);
        });
        /* guarda o elemento do slide antes de mover o fragmento */
        SLIDE_EL[p.name] = tpl.content.firstElementChild || null;
        deck.appendChild(tpl.content);
      });
      decorateDeep();
    });
  }

  /* Marca cada slide de ramo com a etiqueta e o atalho de volta ao mapa.
     Feito em código para não repetir o mesmo bloco em dezessete arquivos —
     mover um slide entre trilha e ramo continua sendo uma linha no DEEP. */
  function decorateDeep(){
    var hubEl = SLIDE_EL[HUB];
    var hubId = hubEl ? hubEl.id : '';
    Object.keys(DEEP).forEach(function(name){
      var el = SLIDE_EL[name];
      if(!el) return;
      var host = el.querySelector('.section-head') || el.querySelector('.wrap');
      if(!host) return;
      var bar = document.createElement('div');
      bar.className = 'deepbar';
      bar.innerHTML = '<span class="dp-tag">aprofundamento · ' + DEEP[name] + '</span>' +
        (hubId ? '<a class="dp-back" href="#' + hubId + '">voltar ao mapa</a>' : '');
      host.insertBefore(bar, host.firstChild);
    });
  }

  /* ---- Menu (drawer responsivo) ---- */
  function initNav(){
    var nav=document.getElementById('nav');
    var toggle=document.getElementById('navToggle');
    var menu=document.getElementById('navMenu');
    if(!nav||!toggle||!menu) return;
    var back=document.createElement('div'); back.className='nav-menu-back'; back.id='navMenuBack';
    document.body.appendChild(back);
    function open(){ menu.classList.add('open'); back.classList.add('on'); toggle.classList.add('open');
      nav.classList.add('menu-open'); toggle.setAttribute('aria-expanded','true'); document.body.classList.add('nav-open'); }
    function close(){ menu.classList.remove('open'); back.classList.remove('on'); toggle.classList.remove('open');
      nav.classList.remove('menu-open'); toggle.setAttribute('aria-expanded','false'); document.body.classList.remove('nav-open'); }
    toggle.addEventListener('click', function(){ menu.classList.contains('open')?close():open(); });
    back.addEventListener('click', close);
    menu.addEventListener('click', function(e){ if(e.target.closest('a')) close(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && menu.classList.contains('open')) close(); });
  }

  /* ---- números que contam ---- */
  function fmt(v,dec,sep){
    var s=(dec>0? v.toFixed(dec) : String(Math.round(v)));
    var p=s.split('.');
    p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep||'.');
    return p.join(',');
  }
  function render(el,val){
    var dec=parseInt(el.getAttribute('data-dec')||'0',10);
    var pre=el.getAttribute('data-pre')||'', suf=el.getAttribute('data-suf')||'';
    el.textContent=pre+fmt(val,dec,el.getAttribute('data-sep')||'.')+suf;
  }
  function countUp(el){
    var target=parseFloat(el.getAttribute('data-count'));
    if(isNaN(target))return;
    if(reduce){render(el,target);return;}
    var dur=1300, start=null;
    function step(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/dur,1);
      render(el, target*(1-Math.pow(1-p,3)));
      if(p<1)requestAnimationFrame(step); else render(el,target);
    }
    requestAnimationFrame(step);
  }

  /* ---- anotações de wireframe: passar o mouse na nota destaca a região da tela ---- */
  function initWireLinks(){
    document.querySelectorAll('[data-wtarget]').forEach(function(note){
      var scope = note.closest('section, header, footer') || document;
      var sel = note.getAttribute('data-wtarget');
      var targets = Array.prototype.slice.call(scope.querySelectorAll(sel));
      if(!targets.length) return;
      note.classList.add('wn-live');
      function on(){ note.classList.add('on'); targets.forEach(function(t){ t.classList.add('wr-hl'); }); }
      function off(){ note.classList.remove('on'); targets.forEach(function(t){ t.classList.remove('wr-hl'); }); }
      note.addEventListener('mouseenter', on);
      note.addEventListener('mouseleave', off);
      note.addEventListener('focusin', on);
      note.addEventListener('focusout', off);
      note.setAttribute('tabindex','0');
      note.addEventListener('click', function(){ note.classList.contains('on')?off():on(); });
    });
  }

  function initDeck(){
    initNav();

    /* ---- progresso + nav ---- */
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
    }
    document.addEventListener('scroll',onScroll,{passive:true}); onScroll();

    /* ---- reveal ---- */
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('[data-r]').forEach(function(el){io.observe(el);});

    /* ---- barras ---- */
    var bo=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); bo.unobserve(e.target);} });
    },{threshold:.4});
    document.querySelectorAll('.bar').forEach(function(el){bo.observe(el);});

    /* ---- contadores ---- */
    var cio=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ countUp(e.target); cio.unobserve(e.target);} });
    },{threshold:.5});
    document.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el);});

    initWireLinks();

    /* ---- deep-link ---- */
    if(location.hash && location.hash!=='#present'){
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

    initSlideshow(revealAll);
  }

  function initSlideshow(revealAll){
    var slides = Array.prototype.slice.call(deck.children).filter(function(el){return el.nodeType===1;});
    if(!slides.length) return;
    var total = slides.length, idx = 0, active = false;

    /* ---- índices da trilha principal e dos ramos ---- */
    var groupOfIdx = {};      /* índice → nome do ramo */
    var groupIdx = {};        /* nome do ramo → [índices, em ordem] */
    var flow = [];            /* índices da trilha principal */
    var hubIdx = -1;
    Object.keys(DEEP).forEach(function(name){
      var el = SLIDE_EL[name]; if(!el) return;
      var i = slides.indexOf(el); if(i < 0) return;
      groupOfIdx[i] = DEEP[name];
      (groupIdx[DEEP[name]] = groupIdx[DEEP[name]] || []).push(i);
    });
    Object.keys(groupIdx).forEach(function(g){ groupIdx[g].sort(function(a,b){return a-b;}); });
    if(SLIDE_EL[HUB]) hubIdx = slides.indexOf(SLIDE_EL[HUB]);
    slides.forEach(function(el,i){ if(!(i in groupOfIdx)) flow.push(i); });
    function isDeep(i){ return (i in groupOfIdx); }

    function labelFor(el){
      var a=el.querySelector('.act-no'); if(a) return a.textContent.trim();
      if(el.tagName==='HEADER') return 'Capa';
      if(el.classList.contains('band')) return 'Faixa';
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
      '<button data-act="hub" class="tohub" title="Voltar ao mapa (H)" hidden>↩ mapa</button>'+
      '<button data-act="nav" title="Navegador de slides (M)">▤</button>'+
      '<button data-act="full" title="Tela cheia (F)">⛶</button>'+
      '<button data-act="exit" title="Sair (Esc)">✕</button>';
    var prog=document.createElement('div'); prog.className='showprog'; prog.innerHTML='<i></i>';
    var tag=document.createElement('div'); tag.className='showtag';
    document.body.appendChild(bar); document.body.appendChild(prog); document.body.appendChild(tag);
    var countEl=bar.querySelector('.count b'), progI=prog.querySelector('i');

    /* ---- Navegador de slides (miniaturas redimensionáveis, estilo PowerPoint) ---- */
    var panel=document.createElement('aside'); panel.className='slidenav';
    panel.setAttribute('aria-label','Navegador de slides');
    panel.innerHTML=
      '<div class="slidenav-grip" title="Arraste para redimensionar"></div>'+
      '<div class="slidenav-head"><span class="sn-title">Slides</span>'+
        '<button class="sn-x" data-act="nav" aria-label="Fechar navegador">×</button></div>'+
      '<div class="slidenav-list" id="slidenavList"></div>';
    document.body.appendChild(panel);
    var navList=panel.querySelector('.slidenav-list');
    var navItems=[], navBuilt=false;

    var NAV_KEY='plataforma-shownav-w';
    var savedW=parseInt(localStorage.getItem(NAV_KEY)||'',10);
    if(savedW>=180 && savedW<=520){ document.documentElement.style.setProperty('--shownav-w', savedW+'px'); }

    function buildThumbs(){
      if(navBuilt) return; navBuilt=true;
      navItems=[];
      slides.forEach(function(sl,i){
        var item=document.createElement('button'); item.className='slidenav-item';
        item.setAttribute('aria-label','Ir para o slide '+(i+1));
        var frame=document.createElement('div'); frame.className='thumb-frame';
        var scale=document.createElement('div'); scale.className='thumb-scale';
        /* clone do slide para servir de miniatura; troca vídeos por poster p/ não pesar */
        var clone=sl.cloneNode(true);
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(function(n){ n.removeAttribute('id'); });
        /* garante conteúdo visível na miniatura (ignora animações de reveal) */
        clone.querySelectorAll('[data-r],.bar').forEach(function(n){ n.classList.add('in'); });
        clone.querySelectorAll('video').forEach(function(v){
          var im=document.createElement('img'); im.src=v.getAttribute('poster')||''; im.alt='';
          im.style.cssText=v.style.cssText+';width:100%;height:100%;object-fit:cover';
          v.parentNode.replaceChild(im, v);
        });
        clone.style.cssText='display:flex;flex-direction:column;justify-content:safe center;overflow:hidden';
        scale.appendChild(clone);
        frame.appendChild(scale);
        var num=document.createElement('span'); num.className='sn-num'; num.textContent=(i+1);
        var lab=document.createElement('span'); lab.className='sn-lab'; lab.textContent=labelFor(sl);
        item.appendChild(num); item.appendChild(frame); item.appendChild(lab);
        item.addEventListener('click', function(){ go(i); });
        navList.appendChild(item);
        navItems.push({item:item, frame:frame, scale:scale, clone:clone});
      });
      updateThumbs();
    }

    function updateThumbs(){
      if(!navBuilt) return;
      var vw=window.innerWidth, vh=window.innerHeight;
      navItems.forEach(function(t){
        var fw=t.frame.clientWidth; if(!fw) return;
        var s=fw/vw;
        t.clone.style.width=vw+'px'; t.clone.style.height=vh+'px';
        t.scale.style.transform='scale('+s+')';
        t.frame.style.height=(vh*s)+'px';
      });
    }

    function updateNavActive(){
      if(!navBuilt) return;
      navItems.forEach(function(t,i){ t.item.classList.toggle('on', i===idx); });
      var cur=navItems[idx]; if(cur){ cur.item.scrollIntoView({block:'nearest'}); }
    }

    function openNav(){
      buildThumbs();
      document.body.classList.add('shownav');
      bar.querySelector('[data-act=nav]').classList.add('on');
      requestAnimationFrame(function(){ updateThumbs(); updateNavActive(); });
    }
    function closeNav(){
      document.body.classList.remove('shownav');
      bar.querySelector('[data-act=nav]').classList.remove('on');
    }
    function toggleNav(){ document.body.classList.contains('shownav')?closeNav():openNav(); }

    /* redimensionar o painel arrastando a alça (como no PowerPoint) */
    var grip=panel.querySelector('.slidenav-grip');
    grip.addEventListener('pointerdown', function(e){
      e.preventDefault();
      document.body.classList.add('snav-resizing');
      grip.setPointerCapture(e.pointerId);
      function move(ev){
        var w=Math.max(180, Math.min(520, window.innerWidth-ev.clientX));
        document.documentElement.style.setProperty('--shownav-w', w+'px');
        updateThumbs();
      }
      function up(ev){
        document.body.classList.remove('snav-resizing');
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', up);
        var w=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--shownav-w'),10);
        if(w) localStorage.setItem(NAV_KEY, w);
        updateThumbs();
      }
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', up);
    });

    window.addEventListener('resize', function(){ if(active) updateThumbs(); });

    /* ---- auto-hide: controles + painel somem quando ocioso e voltam no movimento ---- */
    var idleTimer=null, IDLE_MS=2600;
    function poke(){
      if(!active) return;
      document.body.classList.remove('nav-idle');
      clearTimeout(idleTimer);
      idleTimer=setTimeout(function(){ if(active) document.body.classList.add('nav-idle'); }, IDLE_MS);
    }
    ['pointermove','pointerdown','wheel','touchstart','keydown'].forEach(function(ev){
      document.addEventListener(ev, poke, {passive:true});
    });

    function update(){
      /* usa a largura útil (--slide-w) para caber o painel de miniaturas quando aberto */
      deck.style.transform='translateX(calc(var(--slide-w) * '+(-idx)+'))';
      /* O contador fala da trilha, não do arquivo: na trilha principal mostra
         a posição entre os slides da trilha; dentro de um ramo, a posição no
         ramo. Quem apresenta precisa saber quanto falta do caminho que está
         percorrendo — não quantos arquivos existem na pasta. */
      var g = groupOfIdx[idx];
      if(g){
        var arr = groupIdx[g];
        countEl.textContent = '↳ ' + (arr.indexOf(idx)+1);
        bar.querySelector('.count').lastChild.nodeValue = ' / ' + arr.length + ' · ' + g;
        if(hubIdx >= 0 && flow.length > 1) progI.style.width=(flow.indexOf(hubIdx)/(flow.length-1)*100)+'%';
      } else {
        var f = flow.indexOf(idx);
        countEl.textContent = (f+1);
        bar.querySelector('.count').lastChild.nodeValue = ' / ' + flow.length;
        progI.style.width=(flow.length>1?(f/(flow.length-1)*100):100)+'%';
      }
      tag.textContent=labelFor(slides[idx]);
      document.body.classList.toggle('in-deep', !!g);
      bar.querySelector('[data-act=prev]').disabled=(idx===0);
      bar.querySelector('[data-act=first]').disabled=(idx===0);
      bar.querySelector('[data-act=next]').disabled=(idx===total-1);
      bar.querySelector('[data-act=last]').disabled=(idx===total-1);
      /* atalho de volta ao mapa, visível só dentro de um ramo */
      bar.querySelector('[data-act=hub]').hidden = !g || hubIdx < 0;
      slides[idx].scrollTop=0;
      updateNavActive();
    }
    function go(n){ idx=Math.max(0,Math.min(total-1,n)); update(); }

    /* Navegação com trilha: na trilha principal as setas pulam os ramos.
       Dentro de um ramo elas andam pelo ramo e, ao esgotá-lo, voltam ao mapa. */
    function step(dir){
      var g = groupOfIdx[idx];
      if(g){
        var arr = groupIdx[g], pos = arr.indexOf(idx) + dir;
        if(pos >= 0 && pos < arr.length) return go(arr[pos]);
        return go(hubIdx >= 0 ? hubIdx : idx);   /* fim do ramo → mapa */
      }
      var n = idx + dir;
      while(n > 0 && n < total-1 && isDeep(n)) n += dir;
      if(isDeep(n)) return;                       /* nada de trilha nessa direção */
      go(n);
    }
    function next(){ step(1); }
    function prev(){ step(-1); }

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
      openNav();          /* painel de miniaturas aberto por default */
      document.addEventListener('keydown', onKey);
      poke();             /* inicia o ciclo de auto-hide dos controles */
    }
    function exit(){
      if(!active) return; active=false;
      closeNav();
      clearTimeout(idleTimer);
      document.body.classList.remove('mode-show','nav-idle');
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
        case 'Escape': e.preventDefault(); if(document.body.classList.contains('shownav')) closeNav(); else exit(); break;
        case 'f': case 'F': e.preventDefault(); toggleFull(); break;
        case 'm': case 'M': e.preventDefault(); toggleNav(); break;
        case 'h': case 'H': if(hubIdx>=0){ e.preventDefault(); go(hubIdx); } break;
      }
    }

    bar.addEventListener('click', function(e){
      var b=e.target.closest('button'); if(!b) return;
      var a=b.getAttribute('data-act');
      if(a==='next') next(); else if(a==='prev') prev();
      else if(a==='first') go(0); else if(a==='last') go(total-1);
      else if(a==='full') toggleFull(); else if(a==='exit') exit();
      else if(a==='nav') toggleNav();
      else if(a==='hub' && hubIdx>=0) go(hubIdx);
    });

    /* Links internos viram salto de slide quando a apresentação está ativa —
       é o que faz os botões do mapa e o "voltar ao mapa" funcionarem sem sair
       do modo apresentação. Fora dele, o navegador rola a página normalmente. */
    deck.addEventListener('click', function(e){
      if(!active) return;
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if(!a) return;
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if(!t) return;
      var i = slides.indexOf(t);
      if(i < 0) i = slides.indexOf(t.closest('section, header, footer'));
      if(i < 0) return;
      e.preventDefault();
      go(i);
    });
    panel.addEventListener('click', function(e){
      if(e.target.closest('[data-act=nav]')) closeNav();
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
