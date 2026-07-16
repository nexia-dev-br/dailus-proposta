(function(){
  'use strict';
  var PFX = '../../';                 // imagens são relativas à raiz do repo
  var SCENE_MS = 8000;                // duração de cada paleta
  var FOCUS_MS = 2600;               // troca do produto em destaque

  var el = function(id){ return document.getElementById(id); };
  var esc = function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); };
  var norm = function(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); };
  var money = function(v){ return v==null?'':('R$ '+Number(v).toFixed(2).replace('.',',')); };
  var img = function(p){ return p && p.images && p.images[0] ? PFX+p.images[0] : ''; };

  // ---- paletas: cor do gradiente + palavras-chave de tom para casar produtos ----
  var PALETTES = [
    { k:'nudes',    name:'Nudes & Roses',        tag:'O aconchego que combina com qualquer pele, do café com leite ao rosé.', colors:['#E9B7AE','#D98A94','#8A5560'], tones:['nude','rose','rosé','pessego','caramelo','cappuccino','latte','mocha','bege','avela','amendoa','chai'] },
    { k:'vermelhos',name:'Vermelhos & Cerejas',  tag:'A cor que entra na sala antes de você. Clássico que nunca sai de moda.',  colors:['#FF3B6B','#E4004B','#8A1538'], tones:['vermelho','cereja','rubi','ruby','scarlet','carmim'] },
    { k:'vinhos',   name:'Vinhos & Amoras',      tag:'Profundo, elegante, inesquecível. Para quem gosta de marcar presença.',   colors:['#9C2A52','#5A1730','#2A0E20'], tones:['vinho','marsala','amora','uva','bordo','berinjela','ameixa'] },
    { k:'corais',   name:'Rosas & Corais',       tag:'Energia que ilumina o dia, o toque de cor da cara da Dailus.',           colors:['#FF6FA5','#FF808B','#FF4D6D'], tones:['pink','coral','melancia','goiaba','flamingo','fucsia'] },
    { k:'doces',    name:'Chocolates & Doces',   tag:'Sweet Skin: tons gostosos de dar vontade de provar.',                     colors:['#B07A52','#7A4A2E','#3E241B'], tones:['chocolate','choco','marrom','cookie','baunilha','brigadeiro','bombom','red velvet','pistache','morango','doce de leite','caramelo'] },
    { k:'metais',   name:'Metálicos & Glitter',  tag:'Top Chrome e glitter: brilho de outro planeta.',                          colors:['#E7C766','#B08A3C','#6C5A8A'], tones:['bronze','holo','glitter','cromado','chrome','metal','gold','dourado','prata','holografic'] },
    { k:'dark',     name:'Pretos & Dark',        tag:'Ousadia em estado puro. O básico que é sempre statement.',                colors:['#3A2530','#160C11','#000000'], tones:['preto','black','onix','grafite','carvao'] }
  ];
  var TONES = []; PALETTES.forEach(function(p){ p.tones.forEach(function(t){ TONES.push({t:norm(t),k:p.k}); }); });

  function paletteFor(p){
    var t = norm(p.title);
    for(var i=0;i<TONES.length;i++){ if(t.indexOf(TONES[i].t)>=0) return TONES[i].k; }
    return null;
  }

  var PRODUCTS = [], SCENES = [], BY = {};
  var mode='cores', cur=0, playing=true, timer=null, focusTimer=null, prevNode=null, mouseR=null;

  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var x=a[i];a[i]=a[j];a[j]=x;} return a; }

  fetch('data/catalog.json').then(function(r){return r.json();}).then(function(d){
    var raw = (d.products||d).filter(function(p){ return p.images && p.images.length && p.available!==false; });
    PRODUCTS = raw;
    PALETTES.forEach(function(p){ BY[p.k]=[]; });
    var pool=[];
    raw.forEach(function(p){ var k=paletteFor(p); if(k){ BY[k].push(p);} else { pool.push(p);} });

    // paleta "A Coleção" = queridinhas/best-sellers + resto, garante cena rica
    var best = raw.filter(function(p){ return (p.popularidade&&(p.popularidade.queridinho||p.popularidade.bestseller_rank)); });
    var colecao = best.concat(pool);
    var seen={}; colecao=colecao.filter(function(p){ if(seen[p.id])return false; seen[p.id]=true; return true; });
    BY.colecao = colecao;
    PALETTES.push({ k:'colecao', name:'A Coleção', tag:'As queridinhas que o Brasil já ama, o coração do catálogo Dailus.', colors:['#E4004B','#FF808B','#1A0E12'], tones:[] });

    // ordena cada paleta pela popularidade (mais populares primeiro) e monta cenas
    PALETTES.forEach(function(p){
      var it=(BY[p.k]||[]).slice().sort(function(a,b){ return (b.popularidade&&b.popularidade.score||0)-(a.popularidade&&a.popularidade.score||0); });
      if(it.length>=4){ p.items=it; SCENES.push(p); }
    });

    el('loading') && el('loading').remove();
    el('hud').hidden=false;
    buildDots(); buildPaletteGrid();
    show(0);
    play();
    wire();
  }).catch(function(e){ el('loading').textContent='não consegui carregar o catálogo.'; console.error(e); });

  // ---------- render de cena ----------
  function setBg(s){
    document.documentElement.style.setProperty('--c1', s.colors[0]);
    document.documentElement.style.setProperty('--c2', s.colors[1]);
    document.documentElement.style.setProperty('--c3', s.colors[2]);
  }

  function buildScene(s, idx){
    var items = s.items;
    var thumbs = items.slice(0, 7);
    var d = document.createElement('div'); d.className='scene';
    d.innerHTML =
      '<div class="scene-copy">'+
        '<div class="s-kicker">Paleta '+(idx+1)+' / '+SCENES.length+'</div>'+
        '<h2 class="s-title">'+esc(s.name)+'</h2>'+
        '<div class="s-swatches">'+s.colors.map(function(c){return '<span style="background:'+c+'"></span>';}).join('')+'</div>'+
        '<p class="s-tag">'+esc(s.tag)+'</p>'+
        '<div class="s-count">'+items.length+' produtos nesta paleta</div>'+
        '<div class="s-focus"><div class="s-fname"></div><div class="s-fprice"></div></div>'+
      '</div>'+
      '<div class="scene-stage">'+
        '<div class="hero-wrap" data-depth="18"><img class="hero-img" alt=""></div>'+
        thumbs.map(function(p,i){ return '<div class="orb o'+i+'" data-depth="'+(26+i*6)+'"><img loading="lazy" src="'+img(p)+'" alt=""></div>'; }).join('')+
      '</div>';
    return d;
  }

  function startFocus(node, items, ms){
    var order = shuffle(items.slice(0, Math.min(12, items.length)));
    var i=0;
    var heroImg = node.querySelector('.hero-img');
    var fname = node.querySelector('.s-fname');
    var fprice = node.querySelector('.s-fprice');
    function tick(){
      var p = order[i % order.length]; i++;
      heroImg.classList.add('swap'); fname.style.opacity=0; fprice.style.opacity=0;
      setTimeout(function(){
        heroImg.src = img(p);
        fname.textContent = p.title;
        fprice.textContent = money(p.price) + (p.linha && p.linha!=='DAILUS' ? '  ·  '+p.linha : '');
        heroImg.classList.remove('swap'); fname.style.opacity=1; fprice.style.opacity=1;
      }, 380);
    }
    tick();
    clearInterval(focusTimer);
    focusTimer = setInterval(tick, ms || FOCUS_MS);
  }

  function show(i){
    cur = (i + SCENES.length) % SCENES.length;
    var s = SCENES[cur];
    var node = buildScene(s, cur);
    el('stage').appendChild(node);
    void node.offsetWidth; // força reflow p/ a transição de opacity funcionar sem depender de rAF (aba em 2º plano)
    node.classList.add('on');
    node.querySelectorAll('.orb').forEach(function(o){ o.classList.add('floaty'); });
    if(prevNode){ var p=prevNode; p.classList.remove('on'); setTimeout(function(){ p.remove(); }, 950); }
    prevNode = node;
    setBg(s);
    startFocus(node, s.items, mode==='catalogo'?1500:FOCUS_MS);
    updateDots();
    runProgress();
  }

  // ---------- progress + autoplay ----------
  function runProgress(){
    var bar = el('progress').firstElementChild;
    bar.classList.remove('run'); bar.style.width='0';
    if(!playing || mode==='catalogo') { bar.style.width = mode==='catalogo'?'100%':'0'; return; }
    void bar.offsetWidth;
    bar.classList.add('run'); bar.style.transitionDuration = SCENE_MS+'ms'; bar.style.width='100%';
  }
  function schedule(){
    clearTimeout(timer);
    if(!playing) return;
    if(mode==='catalogo') return; // catálogo fica em loop de foco, não troca de cena
    timer = setTimeout(function(){ show(cur+1); }, SCENE_MS);
  }
  function play(){ playing=true; el('play').textContent='⏸'; runProgress(); schedule(); }
  function pause(){ playing=false; el('play').textContent='▶'; clearTimeout(timer); var b=el('progress').firstElementChild; b.classList.remove('run'); }

  // re-agenda sempre que uma cena entra
  var _show = show;
  show = function(i){ _show(i); schedule(); };

  // ---------- dots ----------
  function buildDots(){
    var w=el('dots'); w.innerHTML='';
    SCENES.forEach(function(s,i){ var d=document.createElement('i'); d.title=s.name; d.onclick=function(){ setMode('cores'); show(i); }; w.appendChild(d); });
  }
  function updateDots(){ var ch=el('dots').children; for(var i=0;i<ch.length;i++) ch[i].classList.toggle('on', i===cur && mode!=='catalogo'); }

  // ---------- palette grid ----------
  function buildPaletteGrid(){
    var w=el('palettes'); w.innerHTML='';
    SCENES.forEach(function(s,i){
      var c=document.createElement('div'); c.className='pcard';
      c.style.setProperty('background','linear-gradient(135deg,'+s.colors[0]+','+s.colors[2]+')');
      c.innerHTML='<div class="pc-sw">'+s.colors.map(function(x){return '<span style="background:'+x+'"></span>';}).join('')+'</div>'+
                  '<h3>'+esc(s.name)+'</h3><small>'+s.items.length+' produtos</small>';
      c.onclick=function(){ setMode('cores'); w.hidden=true; show(i); };
      w.appendChild(c);
    });
  }

  // ---------- modes ----------
  function setMode(m){
    mode=m;
    [].forEach.call(el('modes').children, function(b){ b.classList.toggle('on', b.dataset.mode===m); });
    el('palettes').hidden = m!=='paleta';
    if(m==='paleta'){ pause(); return; }
    if(m==='catalogo'){
      // cena única: A Coleção, foco rápido tipo passarela, sem troca de cena
      var idx = SCENES.findIndex(function(s){return s.k==='colecao';});
      play(); show(idx<0?0:idx);
      return;
    }
    play(); show(cur);
  }

  // ---------- parallax (move o cluster inteiro; preserva o float de cada produto) ----------
  function parallax(e){
    if(!prevNode) return;
    var dx=(e.clientX/innerWidth-.5), dy=(e.clientY/innerHeight-.5);
    var st=prevNode.querySelector('.scene-stage');
    var cp=prevNode.querySelector('.scene-copy');
    if(st) st.style.transform='translate('+(dx*26)+'px,'+(dy*26)+'px)';
    if(cp) cp.style.transform='translate('+(dx*-12)+'px,'+(dy*-12)+'px)';
  }

  // ---------- wire ----------
  function wire(){
    el('prev').onclick=function(){ setMode('cores'); show(cur-1); };
    el('next').onclick=function(){ setMode('cores'); show(cur+1); };
    el('play').onclick=function(){ playing?pause():play(); };
    [].forEach.call(el('modes').children, function(b){ b.onclick=function(){ setMode(b.dataset.mode); }; });
    document.addEventListener('keydown', function(e){
      if(e.key==='ArrowRight'){ setMode('cores'); show(cur+1); }
      else if(e.key==='ArrowLeft'){ setMode('cores'); show(cur-1); }
      else if(e.key===' '){ e.preventDefault(); playing?pause():play(); }
      else if(e.key==='Escape'){ el('palettes').hidden=true; if(mode==='paleta') setMode('cores'); }
    });
    var st=el('stage');
    st.addEventListener('mousemove', function(e){ cancelAnimationFrame(mouseR); mouseR=requestAnimationFrame(function(){ parallax(e); }); });
    // pausa ao esconder a aba
    document.addEventListener('visibilitychange', function(){ if(document.hidden) pause(); });
  }
})();
