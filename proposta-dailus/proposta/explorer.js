/* =====================================================================
   Explorador de Catálogo — Nexia × Dailus
   Busca por nome/SKU/EAN/tag, filtros por linha e categoria, comparativo
   de preço entre os sites explorados e TODAS as imagens encontradas.
   Requer servir via HTTP (usa fetch). Caminhos de imagem: prefixo ../../
   ===================================================================== */
(function(){
  'use strict';
  var PFX = '../../';                    // catalog.json guarda paths a partir da raiz do repo
  var SITE = {epoca:'Época Cosméticos', paguemenos:'Pague Menos'};
  var money = function(v){ return v==null? '—' : 'R$ '+Number(v).toFixed(2).replace('.',','); };
  var el = function(id){ return document.getElementById(id); };
  var norm = function(s){ return (s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); };
  var imgSrc = function(s){ return /^https?:/.test(s||'')? s : PFX+s; };  // local (prefixa) ou URL remota

  var DATA=null, PRODUCTS=[], COMPETITORS=[], ALL=[];
  var state={q:'',linha:'',cat:'',cmp:false,avail:false,best:false,rel:false,mode:'dailus',sort:'pop',group:'',brief:null,collapse:true};

  fetch('data/catalog.json',{cache:'no-cache'})
    .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(d){ DATA=d; PRODUCTS=d.products||[]; COMPETITORS=d.competitors||[]; boot(); })
    .catch(function(e){
      el('grid').innerHTML='<div class="empty">Falha ao carregar o catálogo ('+e.message+
        ').<br>Sirva a pasta via HTTP: <b>python3 -m http.server</b></div>';
    });

  // helpers de campo (unificam Dailus e concorrente)
  var isComp=function(p){ return p.kind==='comp'; };
  var pName =function(p){ return isComp(p)? p.produto : p.title; };
  var pBrand=function(p){ return (isComp(p)? p.marca : (p.linha||'DAILUS')).toUpperCase(); };
  var pBucket=function(p){ return p.bucket||'Outros'; };
  var pImgs =function(p){ return p.images||[]; };
  var pPop  =function(p){ return p.popularidade||null; };
  var hasCompare=function(p){ return isComp(p)? Object.keys(p.sites||{}).length>1 : !!(p.retailers&&p.retailers.length); };
  var pAvail=function(p){ return isComp(p)? p.price!=null : !!p.available; };

  function boot(){
    PRODUCTS.forEach(function(p){ p.kind='dailus'; });
    COMPETITORS.forEach(function(c){ c.kind='comp'; });
    ALL=PRODUCTS.concat(COMPETITORS);
    renderKPIs(); renderFacets(); wire(); apply();
    renderCart();
    llmProbe();
    el('cartfab').addEventListener('click',openCart);
    el('cartback').addEventListener('click',closeCart);
  }

  function pool(){
    if(state.mode==='comp') return COMPETITORS;
    if(state.mode==='all')  return ALL;
    return PRODUCTS;
  }

  function renderKPIs(){
    var s=DATA.summary;
    var compTotal = Object.keys(s.varejistas).reduce(function(a,k){return a+(s.varejistas[k].marcas.length);},0);
    var marcasSet={};
    Object.keys(s.varejistas).forEach(function(k){ s.varejistas[k].marcas.forEach(function(m){marcasSet[m[0]]=1;}); });
    // produtos Dailus únicos com comparativo (evita dupla contagem de quem casa em 2 sites)
    var comComparativo=(DATA.products||[]).filter(function(p){return p.retailers&&p.retailers.length;}).length;
    el('kpis').innerHTML=[
      kpi(s.produtos,'produtos Dailus catalogados',true),
      kpi(s.imagens_dailus.toLocaleString('pt-BR'),'imagens do catálogo oficial'),
      kpi(s.bestsellers,'best-sellers da loja (ranqueados)',true),
      kpi((s.competidores?s.competidores.total:0).toLocaleString('pt-BR'),'produtos de concorrentes mapeados'),
      kpi((s.competidores?s.competidores.relacionados:0).toLocaleString('pt-BR'),'concorrentes na categoria da Dailus'),
      kpi(Object.keys(marcasSet).length,'marcas de beleza mapeadas'),
      kpi(comComparativo,'Dailus com comparativo de preço')
    ].join('');
  }
  function kpi(b,s,acc){ return '<div class="kpi'+(acc?' accent':'')+'"><b>'+b+'</b><span>'+s+'</span></div>'; }

  function renderFacets(){
    var src=pool();
    // marcas/linhas do pool atual
    var lm={};
    src.forEach(function(p){ var k=pBrand(p); lm[k]=(lm[k]||0)+1; });
    var linhas=Object.keys(lm).sort(function(a,b){return lm[b]-lm[a];});
    if(state.linha && !lm[state.linha]) state.linha='';
    var lab=state.mode==='dailus'?'Todas as linhas':'Todas as marcas';
    var html='<div class="chip'+(state.linha===''?' on':'')+'" data-linha="">'+lab+'</div>';
    linhas.forEach(function(k){ html+='<div class="chip'+(state.linha===k?' on':'')+'" data-linha="'+esc(k)+'">'+esc(k)+'<span class="n">'+lm[k]+'</span></div>'; });
    el('linhas').innerHTML=html;

    // categorias (buckets) do pool atual
    var cm={};
    src.forEach(function(p){ var b=pBucket(p); if(b) cm[b]=(cm[b]||0)+1; });
    if(state.cat && !cm[state.cat]) state.cat='';
    var cats=Object.keys(cm).sort(function(a,b){return cm[b]-cm[a];});
    var opt='<option value="">Todas as categorias ('+src.length+')</option>';
    cats.forEach(function(c){ opt+='<option value="'+esc(c)+'"'+(state.cat===c?' selected':'')+'>'+esc(c)+' ('+cm[c]+')</option>'; });
    el('cat').innerHTML=opt;
  }

  function wire(){
    var t;
    el('q').addEventListener('input',function(e){ clearTimeout(t); var v=e.target.value; t=setTimeout(function(){state.q=v;apply();},140); });
    el('cat').addEventListener('change',function(e){ state.cat=e.target.value; apply(); });
    el('sort').addEventListener('change',function(e){ state.sort=e.target.value; apply(); });
    el('collapse').addEventListener('click',function(){ state.collapse=!state.collapse; this.classList.toggle('on',state.collapse); apply(); });
    el('best').addEventListener('click',function(){ state.best=!state.best; this.classList.toggle('on',state.best); apply(); });
    el('cmp').addEventListener('click',function(){ state.cmp=!state.cmp; this.classList.toggle('on',state.cmp); apply(); });
    el('avail').addEventListener('click',function(){ state.avail=!state.avail; this.classList.toggle('on',state.avail); apply(); });
    el('rel').addEventListener('click',function(){ state.rel=!state.rel; this.classList.toggle('on',state.rel); apply(); });
    el('modeseg').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b)return;
      state.mode=b.getAttribute('data-mode');
      [].forEach.call(this.children,function(x){ x.classList.toggle('on', x===b); });
      state.linha=''; state.cat=''; if(state.mode==='comp'){ state.best=false; el('best').classList.remove('on'); }
      syncControls(); renderFacets(); apply();
    });
    el('linhas').addEventListener('click',function(e){ var c=e.target.closest('.chip'); if(!c)return;
      state.linha=c.getAttribute('data-linha'); renderFacets(); apply(); });
    el('overlay').addEventListener('click',function(e){ if(e.target===this) closeModal(); });
    el('groupby').addEventListener('change',function(e){ state.group=e.target.value; apply(); });
    el('advOpen').addEventListener('click',openAdvisor);
    el('advOverlay').addEventListener('click',function(e){ if(e.target===this) closeAdvisor(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ closeModal(); closeAdvisor(); } });
    syncControls();
  }

  // mostra/esconde toggles conforme o modo
  function syncControls(){
    var m=state.mode;
    el('best').hidden  = (m!=='dailus');   // popularidade só para Dailus
    el('collapse').hidden = (m==='comp');  // agrupamento de cor só p/ Dailus
    el('avail').hidden = (m==='comp');
    el('rel').hidden   = (m==='dailus');   // relação só faz sentido com concorrentes
  }

  function match(p){
    if(state.linha && pBrand(p)!==state.linha) return false;
    if(state.cat && pBucket(p)!==state.cat) return false;
    if(state.cmp && !hasCompare(p)) return false;
    if(state.avail && !pAvail(p)) return false;
    if(state.best && !(pPop(p)&&pPop(p).bestseller_rank)) return false;
    if(state.rel && isComp(p) && !p.dailus_rel) return false;
    if(state.q){
      var q=norm(state.q), hay;
      if(isComp(p)) hay=norm([p.produto,p.marca,p.categoria,(p.eans||[]).join(' ')].join(' '));
      else hay=norm([p.title,p.categoria,p.linha,(p.skus||[]).join(' '),(p.eans||[]).join(' '),(p.tags||[]).join(' '),(p.variacoes||[]).join(' ')].join(' '));
      if(hay.indexOf(q)<0) return false;
    }
    return true;
  }

  function apply(){
    state.brief=null;                 // sair da curadoria da Dai ao mexer nos filtros
    var list=pool().filter(match);
    var s=state.sort;
    list.sort(function(a,b){
      if(s==='price')  return ((a.price==null?1e9:a.price))-((b.price==null?1e9:b.price));
      if(s==='price_d')return ((b.price==null?-1:b.price))-((a.price==null?-1:a.price));
      if(s==='name')   return pName(a).localeCompare(pName(b));
      if(s==='imgs')   return (b.n_imagens||0)-(a.n_imagens||0);
      if(s==='pop'){
        // Dailus (com popularidade) primeiro; best-sellers ranqueados na ordem da loja
        if(isComp(a)!==isComp(b)) return isComp(a)?1:-1;
        var ka=pPop(a)||{}, kb=pPop(b)||{};
        var rka=ka.bestseller_rank||9999, rkb=kb.bestseller_rank||9999;
        if(rka!==rkb) return rka-rkb;
        return (kb.score||0)-(ka.score||0);
      }
      // relevância: Dailus primeiro; relacionados antes; depois com comparativo e mais imagens
      if(isComp(a)!==isComp(b)) return isComp(a)?1:-1;
      if(isComp(a)&&(a.dailus_rel!==b.dailus_rel)) return a.dailus_rel?-1:1;
      var ca=hasCompare(a)?1:0, cb=hasCompare(b)?1:0;
      if(cb!==ca) return cb-ca;
      return (b.n_imagens||0)-(a.n_imagens||0);
    });
    render(list);
  }

  function cardHtml(p){ var idx=ALL.indexOf(p); return isComp(p)? compCard(p,idx) : dailusCard(p,idx); }
  function wireGrid(){
    var g=el('grid');
    g.onclick=function(e){
      var see=e.target.closest('[data-see]');
      if(see){ e.stopPropagation(); var sp=ALL[+see.getAttribute('data-see')]; if(sp) openModal(sp); return; }
      var add=e.target.closest('[data-add]');
      if(add){ e.stopPropagation(); cartAdd(ALL[+add.getAttribute('data-add')]); pulse(add); return; }
      var c=e.target.closest('.card'); if(!c)return;
      var p=ALL[+c.getAttribute('data-i')]; if(!p)return;
      isComp(p)? openCompModal(p) : openModal(p); };
  }

  /* ---------- agrupar variações que diferem só na cor/tom ----------
     A Dailus nomeia como "Produto – Cor" (ou base "…D.1 - Claro"). Reduzimos a
     família a 1 card e mostramos "N cores/tons"; a cor exata é escolhida no detalhe. */
  var VARIANTS=new Map();                 // representante -> [membros] (recalculado a cada render)
  function variantKey(p){
    var parts=norm(pName(p)).split(/\s[–—-]\s|:/);
    if(parts.length>1) parts.pop();                    // remove só o último segmento (a cor)
    var t=parts.join(' ');
    t=t.replace(/\bd\.?\s?\d{1,2}\b/g,'');             // tira código de tom de base (D.1, D 10)
    t=t.replace(/\b(cor|tom|n[oº]?)\s*\d{1,3}\b/g,'');
    t=t.replace(/[-–—(]\s*$/,'').replace(/\s+/g,' ').trim();
    return t+'|'+(p.linha||'')+'|'+(p.bucket||'');
  }
  function variantWord(p){ return p.bucket==='Base e rosto' ? 'tons' : 'cores'; }
  function variantLabel(p){                 // nome curto da cor/tom para o seletor
    var t=pName(p), parts=t.split(/\s[–—-]\s|:/), tail=parts.length>1?parts[parts.length-1].trim():'';
    var sh=t.match(/\bD\.?\s?\d{1,2}\b/i);
    if(sh) return tail?sh[0]+' · '+tail:sh[0];
    return tail || t;
  }
  function familyOf(p){
    if(isComp(p)) return [p];
    var k=variantKey(p);
    return PRODUCTS.filter(function(q){ return !isComp(q) && variantKey(q)===k; });
  }
  function collapseList(list){
    var fam={}, order=[];
    list.forEach(function(p){
      if(isComp(p)){ order.push({rep:p,members:[p]}); return; }   // concorrente nunca agrupa
      var k=variantKey(p);
      if(!fam[k]){ fam[k]={rep:p,members:[]}; order.push(fam[k]); }
      fam[k].members.push(p);
    });
    return order.map(function(g){
      if(g.members.length>1){
        var rep=g.members.slice().sort(function(a,b){
          var av=(b.available!==false)-(a.available!==false); if(av)return av;
          var sc=score(b)-score(a); if(sc)return sc;
          return (b.n_imagens||0)-(a.n_imagens||0);
        })[0];
        VARIANTS.set(rep,g.members);
        return rep;
      }
      return g.rep;
    });
  }

  function render(list){
    var filtered=(state.q||state.linha||state.cat||state.cmp||state.avail||state.best||state.rel);
    var raw=list.length;
    var useCollapse = state.collapse && state.mode!=='comp' && state.group!=='cor';
    VARIANTS=new Map();
    if(useCollapse) list=collapseList(list);
    var collapsedInfo = (useCollapse && list.length<raw) ? ' · <b>'+list.length+'</b> famílias (cores agrupadas)' : '';
    el('count').innerHTML='<b>'+raw+'</b> produto'+(raw===1?'':'s')+
      (state.mode==='comp'?' · concorrentes':(state.mode==='all'?' · Dailus + concorrentes':''))+
      (filtered?' · filtrado':'')+
      (state.group?' · agrupado por '+GROUP_LAB[state.group]:'')+
      collapsedInfo;
    if(!list.length){ el('grid').innerHTML='<div class="empty">Nenhum produto encontrado. Ajuste a busca ou os filtros.</div>'; return; }
    if(state.group){ el('grid').innerHTML=groupedHtml(list); wireGrid(); return; }
    el('grid').innerHTML=list.map(cardHtml).join('');
    wireGrid();
  }

  /* ---------- agrupamento (como as clientes pensam maquiagem) ---------- */
  var GROUP_LAB={campanha:'campanha ativa',cat:'categoria',linha:'linha',cor:'cor/tom',pop:'popularidade',preco:'faixa de preço',ocasiao:'ocasião'};
  var PRICE_BANDS=[['Até R$ 25',0,25],['R$ 25 a R$ 50',25,50],['R$ 50 a R$ 80',50,80],['Acima de R$ 80',80,1e9]];
  function groupKeys(p,how){
    if(how==='campanha'){ var c=campaignOf(p); return [c? (c.emoji+' '+c.name) : 'Fora de campanha']; }
    if(how==='cat')   return [pBucket(p)];
    if(how==='linha') return [pBrand(p)];
    if(how==='cor'){ var t=toneOf(p); return [t?('Tom '+t.charAt(0).toUpperCase()+t.slice(1)):'Sem cor específica']; }
    if(how==='pop'){ var pop=pPop(p); return [pop&&pop.tier?('Popularidade '+pop.tier):'Popularidade Padrão']; }
    if(how==='preco'){ var v=p.price==null?-1:p.price; var b=PRICE_BANDS.filter(function(x){return v>=x[1]&&v<x[2];})[0]; return [b?b[0]:'Sem preço']; }
    if(how==='ocasiao'){ return OCC.filter(function(o){return occScore(p,o)>=3;}).map(function(o){return o.emoji+' '+o.lab;}); }
    return ['Todos'];
  }
  function groupedHtml(list){
    var order=[], map={};
    list.forEach(function(p){
      groupKeys(p,state.group).forEach(function(k){
        if(!map[k]){ map[k]=[]; order.push(k); }
        map[k].push(p);
      });
    });
    // ordenação amigável das seções
    if(state.group==='preco') order=PRICE_BANDS.map(function(x){return x[0];}).filter(function(k){return map[k];});
    else if(state.group==='campanha') order=CAMPAIGNS.map(function(c){return c.emoji+' '+c.name;}).concat(['Fora de campanha']).filter(function(k){return map[k];});
    else if(state.group==='pop') order=['Popularidade Alta','Popularidade Média','Popularidade Padrão'].filter(function(k){return map[k];});
    else if(state.group==='ocasiao') order=OCC.map(function(o){return o.emoji+' '+o.lab;}).filter(function(k){return map[k];});
    else order.sort(function(a,b){return map[b].length-map[a].length;});
    return order.map(function(k){
      var items=map[k]; if(state.group==='ocasiao') items=items.slice(0,12);
      return '<section class="grp"><div class="grphd"><h3>'+esc(k)+'</h3><span>'+map[k].length+' produto'+(map[k].length===1?'':'s')+'</span></div>'+
        '<div class="grprow">'+items.map(cardHtml).join('')+'</div></section>';
    }).join('');
  }

  function dailusCard(p,idx){
    var img=p.images&&p.images[0]?PFX+p.images[0]:'';
    var pop=p.popularidade||{};
    var badges='';
    var vars=VARIANTS.get(p);
    if(vars&&vars.length>1) badges+='<span class="tag vars">🎨 '+vars.length+' '+variantWord(p)+'</span>';
    var camp=campaignOf(p);
    if(camp) badges+='<span class="tag camp" title="'+esc(camp.claims.slice(0,3).join(' · '))+'">'+camp.emoji+' em campanha</span>';
    if(pop.bestseller_rank) badges+='<span class="tag best">🔥 #'+pop.bestseller_rank+' mais vendido</span>';
    else if(pop.queridinho) badges+='<span class="tag queri">💗 queridinho</span>';
    if(p.retailers&&p.retailers.length) badges+='<span class="tag cmp">comparativo · '+p.retailers.length+'</span>';
    if(!p.available) badges+='<span class="tag out">esgotado</span>';
    var tierCls=pop.tier==='Alta'?'alta':(pop.tier==='Média'?'media':'padrao');
    return '<article class="card" data-i="'+idx+'">'+
      '<div class="thumb">'+(img?'<img loading="lazy" src="'+img+'" alt="">':'')+
        '<div class="badges">'+badges+'</div></div>'+
      '<div class="body">'+
        '<div class="line">'+(p.linha||'')+'</div>'+
        '<h3>'+esc(p.title)+'</h3>'+
        '<div class="cat">'+(p.categoria||'')+'</div>'+
        '<div class="popmeter t-'+tierCls+'" title="Popularidade '+(pop.tier||'—')+'"><i style="width:'+(pop.score||0)+'%"></i></div>'+
        '<div class="foot"><span class="price">'+money(p.price)+'</span>'+
          '<span class="imgs">'+(p.n_imagens||0)+' 📷</span></div>'+
        (p.skus&&p.skus.length?'<div class="sku">SKU '+p.skus.join(' · ')+'</div>':'')+
        (vars&&vars.length>1
          ? '<button class="addbtn see" data-see="'+idx+'">🎨 Ver '+vars.length+' '+variantWord(p)+'</button>'
          : (p.available!==false?'<button class="addbtn" data-add="'+idx+'">＋ sacola</button>':''))+
      '</div></article>';
  }

  function compCard(p,idx){
    var img=p.images&&p.images[0]?imgSrc(p.images[0]):'';
    var nsites=Object.keys(p.sites||{}).length;
    var badges='<span class="tag rival">'+esc(p.marca||'concorrente')+'</span>';
    if(p.dailus_rel) badges+='<span class="tag relc">rival · '+esc(p.bucket)+'</span>';
    if(nsites>1) badges+='<span class="tag cmp">2 sites</span>';
    return '<article class="card comp" data-i="'+idx+'">'+
      '<div class="thumb">'+(img?'<img loading="lazy" src="'+img+'" alt="">':'')+
        '<div class="badges">'+badges+'</div></div>'+
      '<div class="body">'+
        '<div class="line rival">'+esc(p.marca||'')+'</div>'+
        '<h3>'+esc(p.produto||'')+'</h3>'+
        '<div class="cat">'+esc(p.categoria||p.bucket||'')+'</div>'+
        '<div class="foot"><span class="price">'+money(p.price)+'</span>'+
          '<span class="imgs">'+(p.n_imagens||0)+' 📷</span></div>'+
      '</div></article>';
  }

  /* ---------- modal ---------- */
  function openModal(p){
    // galeria: agrupa imagens por fonte
    var groups=[{lab:'Dailus · site oficial',pill:'oficial',imgs:(p.images||[])}];
    (p.retailers||[]).forEach(function(r){
      if(r.images&&r.images.length) groups.push({lab:SITE[r.site]||r.site,pill:r.site,imgs:r.images});
    });
    var allImgs=[]; groups.forEach(function(g){ g.imgs.forEach(function(x){allImgs.push(x);}); });
    var main=allImgs[0]?PFX+allImgs[0]:'';

    var thumbsHtml=groups.filter(function(g){return g.imgs.length;}).map(function(g){
      return '<div class="thumbs-group"><div class="lab">'+esc(g.lab)+
        ' <span class="pill">'+g.imgs.length+' img</span></div><div class="thumbs">'+
        g.imgs.map(function(x){ return '<img loading="lazy" src="'+PFX+x+'" data-full="'+PFX+x+'" alt="">'; }).join('')+
        '</div></div>';
    }).join('');

    // comparativo
    var rows='<tr><td class="site official">Dailus · oficial</td><td class="official">'+money(p.price)+
      '</td><td>'+(p.compare_at?money(p.compare_at):'—')+'</td><td>—</td>'+
      '<td>'+(p.url?'<a class="storelink" target="_blank" rel="noopener" href="'+p.url+'">abrir ↗</a>':'—')+'</td></tr>';
    (p.retailers||[]).forEach(function(r){
      var d=r.delta_pct;
      var dh = d==null?'—':'<span class="delta '+(d>0?'up':'down')+'">'+(d>0?'+':'')+d+'%</span>';
      rows+='<tr><td class="site">'+(SITE[r.site]||r.site)+'</td><td>'+money(r.preco)+
        '</td><td>'+(r.preco_lista&&r.preco_lista!==r.preco?money(r.preco_lista):'—')+'</td><td>'+dh+'</td>'+
        '<td>'+(r.url?'<a class="storelink" target="_blank" rel="noopener" href="'+r.url+'">abrir ↗</a>':'<span class="nolink">—</span>')+'</td></tr>';
    });
    var cmpBlock = (p.retailers&&p.retailers.length)
      ? '<table class="ct"><tr><th>Site</th><th>Preço</th><th>De</th><th>Δ vs oficial</th><th>Link</th></tr>'+rows+'</table>'
      : '<div class="none">Este produto não foi localizado nos varejistas coletados (Época/Pague Menos). Ele existe no catálogo oficial da Dailus com '+(p.n_imagens||0)+' imagens.</div>';

    var popHtml=popBlock(p);

    var fam=familyOf(p);
    var variantsHtml = fam.length>1
      ? '<div class="variants"><h4>'+(p.bucket==='Base e rosto'?'Escolha o tom':'Escolha a cor')+' <span>'+fam.length+' '+variantWord(p)+'</span></h4>'+
        '<div class="vchips">'+fam.map(function(m){ var im=m.images&&m.images[0]?PFX+m.images[0]:'';
          return '<button class="vchip'+(m===p?' on':'')+(m.available===false?' out':'')+'" data-var="'+ALL.indexOf(m)+'" title="'+esc(pName(m))+(m.available===false?' · esgotado':'')+'">'+
            (im?'<img loading="lazy" src="'+im+'" alt="">':'')+'<span>'+esc(variantLabel(m))+'</span></button>';
        }).join('')+'</div></div>'
      : '';

    var kv='';
    if(p.skus&&p.skus.length) kv+='<dt>SKU</dt><dd>'+p.skus.join(' · ')+'</dd>';
    if(p.eans&&p.eans.length) kv+='<dt>EAN</dt><dd>'+p.eans.join(' · ')+'</dd>';
    if(p.categoria) kv+='<dt>Categoria</dt><dd>'+esc(p.categoria)+'</dd>';
    if(p.variacoes&&p.variacoes.length) kv+='<dt>Variações</dt><dd>'+esc(p.variacoes.join(', '))+'</dd>';

    el('modalBody').innerHTML=
      '<div class="mhead"><div></div><button class="close" id="mclose" aria-label="Fechar">×</button></div>'+
      '<div class="mgrid">'+
        '<div class="gallery"><div class="main"><img id="mainImg" src="'+main+'" alt=""></div>'+thumbsHtml+'</div>'+
        '<div class="info">'+
          '<div class="line">'+(p.linha||'')+'</div>'+
          '<h2>'+esc(p.title)+'</h2>'+
          '<div class="pricerow"><span class="pnow">'+money(p.price)+'</span>'+
            (p.compare_at?'<span class="pcmp">'+money(p.compare_at)+'</span>':'')+
            (!p.available?'<span class="tag out">esgotado</span>':'')+'</div>'+
          (p.available!==false?'<button class="btn-add" id="modaladd">＋ Adicionar à sacola</button>':'')+
          variantsHtml+
          popHtml+
          (kv?'<dl class="kv">'+kv+'</dl>':'')+
          (p.tags&&p.tags.length?'<div class="pillrow">'+p.tags.map(function(t){return '<span>#'+esc(t)+'</span>';}).join('')+'</div>':'')+
          '<div class="cmp"><h4>Comparativo entre os sites explorados</h4>'+cmpBlock+'</div>'+
          (p.descricao?'<div class="desc">'+esc(p.descricao)+'</div>':'')+
          (p.url?'<a class="storelink" target="_blank" rel="noopener" href="'+p.url+'">Ver na loja oficial ↗</a>':'')+
        '</div>'+
      '</div>'+
      recsHtml(p);

    var mb=el('modalBody');
    mb.querySelector('#mclose').onclick=closeModal;
    var madd=mb.querySelector('#modaladd'); if(madd) madd.onclick=function(){ cartAdd(p); pulse(this); };
    mb.querySelectorAll('[data-var]').forEach(function(b){ b.onclick=function(){ var q=ALL[+this.getAttribute('data-var')]; if(q) openModal(q); }; });
    var mainImg=el('mainImg');
    mb.querySelectorAll('.thumbs img').forEach(function(im,i){
      if(i===0) im.classList.add('sel');
      im.onclick=function(){ mainImg.src=this.getAttribute('data-full');
        mb.querySelectorAll('.thumbs img').forEach(function(x){x.classList.remove('sel');}); this.classList.add('sel'); };
    });
    var recsEl=mb.querySelector('.recs'); if(recsEl) wireRecs(recsEl,p);
    el('overlay').classList.add('on'); document.body.style.overflow='hidden';
  }
  function closeModal(){ el('overlay').classList.remove('on'); document.body.style.overflow=''; }

  /* ---------- modal do concorrente (imagens em P&B) ---------- */
  function openCompModal(p){
    var imgs=p.images||[];
    var main=imgs[0]?imgSrc(imgs[0]):'';
    var thumbs=imgs.length? '<div class="thumbs-group"><div class="lab">Imagens coletadas <span class="pill">'+imgs.length+' img</span></div>'+
      '<div class="thumbs gray">'+imgs.map(function(x){ return '<img loading="lazy" src="'+imgSrc(x)+'" data-full="'+imgSrc(x)+'" alt="">'; }).join('')+'</div></div>' : '';

    var rows='';
    Object.keys(p.sites||{}).forEach(function(site){
      var s=p.sites[site];
      rows+='<tr><td class="site">'+(SITE[site]||site)+'</td><td>'+money(s.preco)+
        '</td><td>'+(s.preco_lista&&s.preco_lista!==s.preco?money(s.preco_lista):'—')+'</td>'+
        '<td>'+(s.url?'<a class="storelink" target="_blank" rel="noopener" href="'+s.url+'">abrir ↗</a>':'—')+'</td></tr>';
    });
    var cmpBlock='<table class="ct"><tr><th>Site</th><th>Preço</th><th>De</th><th>Link</th></tr>'+rows+'</table>';

    var relHtml = p.dailus_rel
      ? '<div class="relbox on">Concorre com a Dailus em <b>'+esc(p.bucket)+'</b>: categoria que a Dailus também vende.</div>'
      : '<div class="relbox">Categoria <b>'+esc(p.bucket||p.categoria_macro||'—')+'</b>: fora do portfólio atual da Dailus (oportunidade de expansão).</div>';

    var kv='';
    if(p.categoria) kv+='<dt>Categoria</dt><dd>'+esc(p.categoria)+'</dd>';
    if(p.eans&&p.eans.length) kv+='<dt>EAN</dt><dd>'+p.eans.join(' · ')+'</dd>';

    el('modalBody').innerHTML=
      '<div class="mhead"><div class="rival-badge">Concorrente</div><button class="close" id="mclose" aria-label="Fechar">×</button></div>'+
      '<div class="mgrid">'+
        '<div class="gallery"><div class="main"><img id="mainImg" class="gray" src="'+main+'" alt=""></div>'+thumbs+'</div>'+
        '<div class="info">'+
          '<div class="line rival">'+esc(p.marca||'')+'</div>'+
          '<h2>'+esc(p.produto||'')+'</h2>'+
          '<div class="pricerow"><span class="pnow">'+money(p.price)+'</span></div>'+
          relHtml+
          (kv?'<dl class="kv">'+kv+'</dl>':'')+
          '<div class="cmp"><h4>Preço nos sites explorados</h4>'+cmpBlock+'</div>'+
        '</div>'+
      '</div>';

    var mb=el('modalBody');
    mb.querySelector('#mclose').onclick=closeModal;
    var mainImg=el('mainImg');
    mb.querySelectorAll('.thumbs img').forEach(function(im,i){
      if(i===0) im.classList.add('sel');
      im.onclick=function(){ mainImg.src=this.getAttribute('data-full');
        mb.querySelectorAll('.thumbs img').forEach(function(x){x.classList.remove('sel');}); this.classList.add('sel'); };
    });
    el('overlay').classList.add('on'); document.body.style.overflow='hidden';
  }

  /* ---------- bloco de popularidade (sinais reais) ---------- */
  function popBlock(p){
    var pop=p.popularidade; if(!pop) return '';
    var tierCls=pop.tier==='Alta'?'alta':(pop.tier==='Média'?'media':'padrao');
    var flags='';
    if(pop.bestseller_rank) flags+='<span class="pf best">🔥 #'+pop.bestseller_rank+' na lista "Mais Vendidos" da loja</span>';
    if(pop.queridinho)      flags+='<span class="pf queri">💗 Queridinho da marca</span>';
    var rs=(p.retailers||[]).map(function(r){return SITE[r.site]||r.site;});
    if(rs.length) flags+='<span class="pf reach">Também no varejo: '+rs.join(' · ')+'</span>';
    if(pop.n_vitrines) flags+='<span class="pf">Em '+pop.n_vitrines+' vitrine'+(pop.n_vitrines===1?'':'s')+' da loja</span>';
    var vit = (pop.vitrines&&pop.vitrines.length)
      ? '<div class="popvit">'+pop.vitrines.map(function(v){return '<span>'+esc(v)+'</span>';}).join('')+'</div>' : '';
    return '<div class="pop">'+
      '<div class="poptop"><h4>Popularidade</h4><span class="pill '+tierCls+'">'+(pop.tier||'—')+'</span>'+
        '<span class="popscore">'+(pop.score||0)+'/100</span></div>'+
      '<div class="popbar t-'+tierCls+'"><i style="width:'+(pop.score||0)+'%"></i></div>'+
      (flags?'<div class="popflags">'+flags+'</div>':'')+
      vit+
      '<div class="popsrc">Sinais reais: curadoria de best-sellers/queridinhos da própria loja, vitrines de merchandising e distribuição nos varejistas explorados.</div>'+
    '</div>';
  }

  /* =====================================================================
     PROVADOR GUIADO DA "DAI" — a cliente descreve a ocasião, o tom de pele,
     a idade, o estilo e a imagem que quer passar; a Dai monta o look e filtra
     os produtos. Curadoria por regras sobre dados reais (categoria, tom/aroma
     no nome, acabamento, popularidade). Simulação ilustrativa.
     ===================================================================== */
  var OCC=[
    {k:'dia',lab:'Dia a dia',emoji:'☀️',tones:['nude','rose','pessego','caramelo'],kw:['bruma','bb','cc','protetor','gloss','lip oil'],
      dai:'Pro dia a dia a pegada é leve e natural: pele fresquinha, um toque de cor e pronto 💛'},
    {k:'trabalho',lab:'Trabalho / reunião',emoji:'💼',tones:['nude','rose','marrom','caramelo'],kw:['matte','po','base','corretivo','sobrancelha'],
      dai:'No trabalho, elegância discreta: pele uniforme, boca nude e sobrancelha alinhada ✨'},
    {k:'balada',lab:'Balada / night',emoji:'🌙',tones:['vinho','cereja','vermelho','marsala','amora','preto'],kw:['matte','glitter','iluminador','delineador','12h','longa'],glam:2,
      dai:'Balada pede impacto que dura a noite toda: olhos marcados, boca poderosa e muito glow 🔥'},
    {k:'formatura',lab:'Baile de formatura',emoji:'🎓',tones:['nude','rose','vinho','marsala','cereja'],kw:['iluminador','cilios','12h','longa','cobertura','matte','glitter'],glam:2,
      dai:'Formatura é O dia: make de longa duração, olhar de diva e uma boca que fica linda nas fotos 💖'},
    {k:'casamento',lab:'Casamento (convidada)',emoji:'💍',tones:['nude','rose','pessego','marsala'],kw:['iluminador','prova','longa','12h','cilios'],glam:1,
      dai:'Convidada de casamento: sofisticada e à prova de emoção, nada de borrar na hora do buquê 🥹'},
    {k:'junina',lab:'Festa junina / peão',emoji:'🤠',tones:['morango','cereja','coral','pink','vermelho'],kw:['blush','gloss','glitter','esmalte'],colorful:2,
      dai:'Arraiá é cor e alegria: bochecha rosada, boquinha vermelha e brilho pra dançar quadrilha 🌽'},
    {k:'halloween',lab:'Halloween',emoji:'🎃',tones:['preto','vermelho','vinho','marrom','uva'],kw:['delineador','preto','matte','esmalte','sombra','glitter'],dark:2,
      dai:'Halloween é hora de ousar: preto, vermelho sangue e um delineado afiado pra assustar (de linda) 🖤'},
    {k:'encontro',lab:'Encontro / date',emoji:'💘',tones:['rose','cereja','pink','pessego'],kw:['gloss','blush','iluminador','lip oil'],
      dai:'Date pede aquele glow de quem tá feliz: blush, boca molhadinha e um brilho no olhar 😍'},
    {k:'praia',lab:'Praia / ar livre',emoji:'🏖️',tones:['coral','pessego','morango','nude'],kw:['bruma','prova','protetor','gloss','fluido'],colorful:1,
      dai:'Sol e mar: make à prova d’água, pele leve e um toque coral que combina com bronzeado 🌊'},
    {k:'reveillon',lab:'Réveillon',emoji:'🥂',tones:['bronze','holo','glitter','nude','pink'],kw:['glitter','iluminador','chrome','dourado','gold','metal'],glam:2,
      dai:'Réveillon é brilho: dourado, glitter e muito glow pra virar o ano cintilando ✨'},
    {k:'ensaio',lab:'Ensaio de fotos',emoji:'📸',tones:['nude','rose','marrom','caramelo'],kw:['cobertura','matte','po','contorno','iluminador','cilios'],glam:1,
      dai:'Ensaio pede pele impecável: alta cobertura, contorno e pó pra segurar sob a luz 📷'}
  ];
  var STYLES=[
    {k:'natural',lab:'Natural / clean',tones:['nude','rose','pessego'],kw:['bruma','bb','gloss','lip oil'],glam:-1},
    {k:'glam',lab:'Glam / poderosa',tones:['vinho','vermelho','cereja','marsala'],kw:['iluminador','glitter','matte','delineador','cilios'],glam:2},
    {k:'colorida',lab:'Colorida / divertida',tones:['pink','coral','morango','uva','melancia','holo'],kw:['glitter','esmalte','sombra'],colorful:2},
    {k:'dark',lab:'Dark / editorial',tones:['preto','vinho','marrom','uva'],kw:['delineador','matte','preto','sombra'],dark:2},
    {k:'romantica',lab:'Romântica / delicada',tones:['rose','pessego','nude','cereja'],kw:['gloss','blush','iluminador']}
  ];
  var IMAGES=[
    {k:'poderosa',lab:'Poderosa',tones:['vermelho','vinho','marsala'],kw:['matte','delineador','iluminador'],glam:1},
    {k:'natural',lab:'Natural',tones:['nude','rose'],kw:['bruma','gloss'],glam:-1},
    {k:'divertida',lab:'Divertida',tones:['pink','coral','morango'],kw:['glitter','esmalte'],colorful:1},
    {k:'elegante',lab:'Elegante',tones:['nude','marsala','rose'],kw:['matte','iluminador']},
    {k:'sexy',lab:'Sexy',tones:['cereja','vermelho','vinho'],kw:['gloss','iluminador']},
    {k:'fofa',lab:'Fofa / romântica',tones:['rose','pessego','pink'],kw:['gloss','blush']},
    {k:'ousada',lab:'Ousada',tones:['preto','uva','holo','glitter'],kw:['delineador','glitter']}
  ];
  var SKIN=[
    {k:'muito-clara',lab:'Muito clara',bases:['d1','d2','claro','marfim','porcelana']},
    {k:'clara',lab:'Clara',bases:['d2','d3','d4','claro','bege']},
    {k:'media',lab:'Média',bases:['d5','d6','d7','medio','bege']},
    {k:'morena',lab:'Morena',bases:['d8','d9','d10','moreno','caramelo','chocolate']},
    {k:'negra',lab:'Negra / retinta',bases:['d10','d11','d12','escuro','chocolate','cacau']}
  ];
  var AGES=[{k:'t1',lab:'Até 20'},{k:'t2',lab:'20–30'},{k:'t3',lab:'30–45'},{k:'t4',lab:'45+'}];
  var DARK_T=['preto','vinho','marrom','uva','marsala'], FUN_T=['pink','coral','morango','uva','melancia','holo','vermelho','cereja'];

  function finishHas(p,kw){ return norm(pName(p)+' '+((p.tags||[]).join(' '))).indexOf(norm(kw))>=0; }
  function toneIn(t,list){ if(!t)return false; var n=norm(t); return list.some(function(x){return norm(x)===n;}); }

  function occScore(p,o){
    if(isComp(p)) return 0;
    var s=0, t=toneOf(p);
    if(toneIn(t,o.tones)) s+=3;
    for(var i=0;i<o.kw.length;i++){ if(finishHas(p,o.kw[i])) s+=1.2; }
    var pop=pPop(p); if(pop) s+=(pop.score||0)/60;
    return s;
  }
  function scoreBrief(p,b){
    if(isComp(p) || p.available===false) return -1;
    var tones=[], kws={}, glam=0,dark=0,colorful=0;
    [b.occ,b.style,b.image].forEach(function(m){ if(!m)return;
      (m.tones||[]).forEach(function(t){tones.push(t);});
      (m.kw||[]).forEach(function(k){kws[k]=1;});
      glam+=m.glam||0; dark+=m.dark||0; colorful+=m.colorful||0;
    });
    var s=0, t=toneOf(p);
    if(toneIn(t,tones)) s+=3;
    Object.keys(kws).forEach(function(k){ if(finishHas(p,k)) s+=1.2; });
    if(glam>0 && (finishHas(p,'iluminador')||finishHas(p,'glitter')||finishHas(p,'cilios')||finishHas(p,'delineador')||finishHas(p,'matte'))) s+=1.1*Math.min(glam,2);
    if(dark>0 && toneIn(t,DARK_T)) s+=1.5*Math.min(dark,2);
    if(colorful>0 && toneIn(t,FUN_T)) s+=1.3*Math.min(colorful,2);
    if(b.age==='t1' && (finishHas(p,'gloss')||finishHas(p,'glitter'))) s+=0.6;
    if(b.age==='t4' && finishHas(p,'matte')) s+=0.6;
    var pop=pPop(p); if(pop) s+=(pop.score||0)/50;
    return s;
  }
  function baseMatchesSkin(p,skin){
    if(!skin) return true;
    var t=norm(pName(p));
    return skin.bases.some(function(k){ return t.indexOf(norm(k))>=0; });
  }
  function reasonFor(p,b){
    var t=toneOf(p), bits=[], want=[];
    [b.occ,b.style,b.image].forEach(function(m){(m&&m.tones||[]).forEach(function(x){want.push(x);});});
    if(toneIn(t,want)) bits.push('tom '+t);
    if(finishHas(p,'12h')||finishHas(p,'longa')||finishHas(p,'prova')) bits.push('longa duração');
    else if(finishHas(p,'iluminador')||finishHas(p,'glitter')) bits.push('dá aquele glow');
    else if(finishHas(p,'matte')) bits.push('acabamento matte');
    var pop=pPop(p); if(pop&&pop.bestseller_rank) bits.push('best-seller #'+pop.bestseller_rank);
    return bits.slice(0,2).join(' · ') || 'combina com o que você descreveu';
  }
  function buildLook(b){
    var roles=[
      {bucket:'Base e rosto',role:'Rosto',n:1,base:true},
      {bucket:'Olhos',role:'Olhos',n:1},
      {bucket:'Sobrancelha',role:'Sobrancelha',n:1},
      {bucket:'Blush e bronzer',role:'Bochecha',n:1},
      {bucket:'Lábios',role:'Boca',n:1},
      {bucket:'Esmaltes e unhas',role:'Unhas',n:1}
    ];
    if(b.occ && ['praia','reveillon','encontro'].indexOf(b.occ.k)>=0) roles.push({bucket:'Corpo e fragrância',role:'Corpo & aroma',n:1});
    var used={};
    return roles.map(function(r){
      var cand=PRODUCTS.filter(function(p){return p.bucket===r.bucket && p.available!==false && !used[p.handle];});
      if(r.base){ var m=cand.filter(function(p){return baseMatchesSkin(p,b.skin);}); if(m.length) cand=m; }
      cand=cand.map(function(p){return {p:p,s:scoreBrief(p,b)};}).sort(function(a,c){return c.s-a.s;});
      var picks=cand.slice(0,r.n).map(function(x){return x.p;});
      picks.forEach(function(p){used[p.handle]=1;});
      return {role:r.role,items:picks};
    }).filter(function(g){return g.items.length;});
  }

  /* ---------- provador da Dai · agora é um CHAT (LLM + catálogo inline) ----------
     Reusa o mesmo motor do chat da sacola (chatParse/chatPick/llmReply +
     fallback). Os chips de atalho apenas compõem a frase no input. */
  var advChatMode=false;
  function advChatOpen(){ return advChatMode && el('advOverlay') && el('advOverlay').classList.contains('on'); }
  function advQuickChips(){
    var occ=['balada','casamento','encontro','trabalho','formatura','praia']
      .map(function(k){ return pickBy(OCC,k); }).filter(Boolean)
      .map(function(o){ return '<button class="qz" type="button" data-send="'+esc(o.lab)+'">'+o.emoji+' '+esc(o.lab.split(' /')[0])+'</button>'; }).join('');
    var st=[['glam','Glam'],['natural','Natural'],['colorida','Colorida'],['dark','Dark']]
      .map(function(s){ return '<button class="qz" type="button" data-send="estilo '+s[0]+'">✨ '+s[1]+'</button>'; }).join('');
    var to=['vermelho','nude','vinho','coral']
      .map(function(t){ return '<button class="qz" type="button" data-send="tom '+t+'">🎨 '+t+'</button>'; }).join('');
    return occ+st+to;
  }
  function renderAdvisorChat(){
    chatGreet();
    el('advBody').innerHTML=
      '<button class="adv-x" id="advClose" aria-label="Fechar">×</button>'+
      '<div class="adv-hd"><div class="adv-avatar">💄</div><div><h2>Oi! Sou a Dai ✨</h2>'+
        '<p>Me conta a ocasião e o clima que você quer 💕 Eu converso, monto seu look e já trago os produtos do catálogo.</p></div></div>'+
      '<div class="advchat">'+
        '<div class="chatthread advchat-thread" id="advthread">'+CHAT.map(chatMsgHtml).join('')+'</div>'+
        '<div class="advquickwrap"><span class="advquickhint">Toque pra montar sua frase</span>'+
          '<div class="chatquick advquick" id="advquick">'+advQuickChips()+'</div></div>'+
        '<form class="chatform advchat-form" id="advform"><input id="advinput" type="text" autocomplete="off" '+
          'placeholder="Fala com a Dai… ex: make pra balada, estilo glam, tom vinho"><button type="submit" aria-label="Enviar">➤</button></form>'+
      '</div>'+
      '<div class="adv-note" style="margin-top:12px">Conversa e curadoria ilustrativas, a partir do catálogo real da Dailus'+(LLM.on?' + IA local (Ollama).':'.')+'</div>';
    var body=el('advBody');
    body.querySelector('#advClose').onclick=closeAdvisor;
    var form=el('advform'); if(form) form.onsubmit=function(e){ e.preventDefault(); daiSend(el('advinput').value); };
    var quick=el('advquick'); if(quick) quick.onclick=function(e){ var b=e.target.closest('.qz'); if(!b) return;
      var add=b.getAttribute('data-send'); CHAT_INPUT=(CHAT_INPUT?CHAT_INPUT.trim()+', ':'')+add;
      var inp=el('advinput'); if(inp){ inp.value=CHAT_INPUT; inp.focus(); } };
    var inp=el('advinput'); if(inp){ inp.value=CHAT_INPUT; inp.oninput=function(){ CHAT_INPUT=this.value; }; }
    body.onclick=function(e){
      var add=e.target.closest('[data-add]');
      if(add){ e.stopPropagation(); var p=ALL[+add.getAttribute('data-add')];
        if(p){ var it=CART.filter(function(x){return x.p===p;})[0]; if(it)it.qty++; else CART.push({p:p,qty:1}); renderCart(); pulse(add); } return; }
      var op=e.target.closest('[data-open]'); if(op){ var q=ALL[+op.getAttribute('data-open')]; if(q) (isComp(q)?openCompModal:openModal)(q); }
    };
    var th=el('advthread'); if(th) th.scrollTop=th.scrollHeight;
  }
  function openAdvisor(){
    advChatMode=true;
    renderAdvisorChat();
    el('advOverlay').classList.add('on'); document.body.style.overflow='hidden';
    if(!LLM.on && !LLM.checking) llmProbe();
    setTimeout(function(){ var i=el('advinput'); if(i) i.focus(); }, 60);
  }
  function closeAdvisor(){ advChatMode=false; el('advOverlay').classList.remove('on'); if(!el('overlay').classList.contains('on')) document.body.style.overflow=''; }
  function pickBy(arr,k){ return arr.filter(function(o){return o.k===k;})[0]; }
  function submitAdvisor(sel){
    var brief={
      occ: pickBy(OCC, sel.occ) || OCC[0],
      style: pickBy(STYLES, sel.style),
      image: pickBy(IMAGES, sel.image),
      skin: pickBy(SKIN, sel.skin),
      age: sel.age
    };
    closeAdvisor();
    if(state.mode!=='dailus'){ state.mode='dailus';
      [].forEach.call(el('modeseg').children,function(x){x.classList.toggle('on',x.getAttribute('data-mode')==='dailus');});
      syncControls(); renderFacets();
    }
    state.brief=brief;
    renderCurated();
  }
  function curCard(p,b){
    var idx=ALL.indexOf(p);
    var reason='<div class="cur-reason">💡 '+esc(reasonFor(p,b))+'</div>';
    return dailusCard(p,idx).replace('<div class="foot">', reason+'<div class="foot">');
  }
  function renderCurated(){
    var b=state.brief; if(!b){ apply(); return; }
    var look=buildLook(b);
    var summary=[ b.occ&&(b.occ.emoji+' '+b.occ.lab), b.skin&&('pele '+b.skin.lab.toLowerCase()),
      b.style&&b.style.lab, b.image&&('imagem '+b.image.lab.toLowerCase()) ].filter(Boolean);
    el('count').innerHTML='<b>Curadoria da Dai</b> · '+esc(summary.join(' · '));
    var lookProducts=[]; look.forEach(function(g){ g.items.forEach(function(p){lookProducts.push(p);}); });
    var total=lookProducts.reduce(function(a,p){return a+(p.price||0);},0);
    var daimsg=(b.occ&&b.occ.dai)||'Montei um look do seu jeitinho 💕';
    var html='<div class="cur-banner">'+
      '<div class="cur-avatar">💄</div>'+
      '<div class="cur-txt"><div class="cur-chips">'+summary.map(function(s){return '<span>'+esc(s)+'</span>';}).join('')+'</div>'+
        '<p class="cur-dai">'+daimsg+'</p></div>'+
      '<div class="cur-acts">'+
        (lookProducts.length?'<button class="cur-add" id="curAdd">Adicionar look à sacola · '+money(total)+'</button>':'')+
        '<button class="cur-again" id="curAgain">Refazer</button>'+
        '<button class="cur-clear" id="curClear">Ver catálogo</button></div></div>';
    if(!look.length) html+='<div class="empty">Não consegui montar dessa vez, tenta outra combinação 💕</div>';
    else html+=look.map(function(g){
      return '<section class="grp cur-role"><div class="grphd"><h3>'+esc(g.role)+'</h3></div>'+
        '<div class="grprow">'+g.items.map(function(p){return curCard(p,b);}).join('')+'</div></section>';
    }).join('');
    el('grid').innerHTML=html; wireGrid();
    if(el('curAdd')) el('curAdd').onclick=function(){ lookProducts.forEach(cartAdd); openCart(); };
    if(el('curAgain')) el('curAgain').onclick=openAdvisor;
    if(el('curClear')) el('curClear').onclick=function(){ apply(); };
  }

  function esc(s){ return (s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  /* =====================================================================
     MOTOR DE RECOMENDAÇÃO + SACOLA (demonstração — vender consultando)
     Lógica derivada de dados reais: linha, categoria/bucket, tom/aroma no
     nome, popularidade, coleções da loja e preço. Sem dados de pedido reais
     → rotulado como "simulação" na tela.
     ===================================================================== */
  var TONES=['red velvet','baunilha','pistache','cookies','cookie','cappuccino','caramelo','chocolate','choco',
    'morango','cereja','amora','uva','melancia','limão','limao','menta','mocha','latte','bombom','brigadeiro',
    'nude','rosé','rose','marsala','rubi','vinho','vermelho','pink','coral','pêssego','pessego','bronze','holo','glitter','preto','marrom'];
  var COMPLEMENT={
    'Lábios':['Lábios','Base e rosto','Blush e bronzer'],
    'Base e rosto':['Base e rosto','Blush e bronzer','Olhos'],
    'Blush e bronzer':['Base e rosto','Blush e bronzer','Lábios'],
    'Olhos':['Olhos','Sobrancelha','Lábios'],
    'Sobrancelha':['Sobrancelha','Olhos'],
    'Esmaltes e unhas':['Esmaltes e unhas'],
    'Corpo e fragrância':['Corpo e fragrância'],
    'Outros':['Base e rosto','Lábios']
  };
  var REGIONS=[['sp','São Paulo'],['rj','Rio de Janeiro'],['sul','Sul'],['ne','Nordeste'],['no','Norte / C.-Oeste'],['mg','Minas Gerais']];
  var FREE=99;                       // limite ilustrativo de frete grátis
  var KITOFF=0.10;                   // desconto simulado de kit (3+ itens)
  var CART=[];                       // [{p, qty}]
  var cartTab='chat';                // aba ativa do drawer: 'chat' | 'sacola'

  /* ---------- chat da Dai (conversa + Ollama opcional) ---------- */
  var CHAT=[];                       // [{who:'me'|'dai', txt, raw, prods:[], parsed, typing, done}]
  var CHAT_INPUT='';
  var LLM={ on:false, checking:false, endpoint:'http://localhost:11434', model:null };
  var CHAT_EX=['Esmalte pra balada com vestido rosa','Batom vermelho de longa duração',
    'Base pra pele oleosa no calor','Look natural pro dia a dia','Make de formatura poderosa','Presente até R$60'];

  // categorias faladas -> bucket do catálogo
  var CHAT_CAT=[
    ['Esmaltes e unhas',['esmalte','unha','manicure','nail']],
    ['Lábios',['batom','baton','gloss','labial','labio','boca','lip','brilho labial']],
    ['Base e rosto',['base','corretivo','primer','bb cream','cc cream','po facial','po solto','po compacto','pele oleosa','pele seca']],
    ['Blush e bronzer',['blush','bronzer','iluminador','contorno','bronzeador','rubor']],
    ['Olhos',['sombra','delineador','rimel','mascara de cilios','cilios','olho','olhos','paleta de sombra']],
    ['Sobrancelha',['sobrancelha','henna','soap brow']],
    ['Corpo e fragrância',['perfume','body splash','hidratante','sabonete','corpo','aroma','cheiro','fragrancia','creme']]
  ];
  // cores faladas -> tons do catálogo
  var CHAT_COLOR=[
    [['rose','pink'],['rosa','rose','rosinha']],
    [['pink'],['pink','magenta']],
    [['vermelho','cereja'],['vermelho','vermelha','red','cereja']],
    [['vinho','marsala','amora'],['vinho','bordo','marsala','amora','ameixa']],
    [['nude','caramelo'],['nude','bege','neutro','amendoado']],
    [['preto'],['preto','preta','black']],
    [['marrom','chocolate','caramelo'],['marrom','chocolate','cafe','caramelo','terroso']],
    [['coral','pessego'],['coral','laranja','pessego','salmao']],
    [['uva'],['roxo','lilas','uva','lavanda']],
    [['bronze','glitter','holo'],['dourado','gold','glitter','metalico','cromado','holografico','brilho intenso']]
  ];
  // ocasiões faladas -> chave da lista OCC (provador guiado)
  var CHAT_OCC={ noite:'balada',night:'balada',balada:'balada',festa:'balada',boate:'balada',show:'balada',
    formatura:'formatura',baile:'formatura',casamento:'casamento',madrinha:'casamento',convidada:'casamento',noiva:'casamento',
    trabalho:'trabalho',reuniao:'trabalho',escritorio:'trabalho',entrevista:'trabalho',
    dia:'dia',faculdade:'dia',aula:'dia',passeio:'dia',
    date:'encontro',encontro:'encontro',romantico:'encontro',crush:'encontro',jantar:'encontro',
    praia:'praia',piscina:'praia',verao:'praia',viagem:'praia',
    reveillon:'reveillon',ano:'reveillon',virada:'reveillon',
    halloween:'halloween',fantasia:'halloween',
    junina:'junina',arraia:'junina','festa junina':'junina',
    foto:'ensaio',fotos:'ensaio',ensaio:'ensaio' };

  /* ---------- CAMPANHAS ATIVAS (capturadas dos banners da home 15/07/2026) ----------
     Cada campanha liga o criativo/argumentos oficiais da Dailus aos produtos reais
     do catálogo e define a "relação de produtos" (combo/look da campanha). Isso
     alimenta: badge no catálogo, agrupamento, "combina com" e as falas da Dai. */
  var CAMPAIGNS=[
    { k:'top-chrome', name:'Top Chrome', emoji:'🌌', color:'#3a3f6b',
      banner:'data/site/banners/DESK-TOP-CHROME.png',
      claims:['efeito pó cromado','4 top coats hipnotizantes','brilho intenso','longa duração','sem complicação','vegano'],
      match:{title:/top chrome|cromad/i, tags:['top-chrome']},
      pair:{buckets:['Esmaltes e unhas'], kw:['base aliada','preparacao','aliada','top coat','top glass','finaliza']},
      pitch:'O efeito pó cromado é o hit do momento 🌌 e rende muito mais com uma base preparadora embaixo e um top coat selando o brilho.' },
    { k:'ultima-chamada', name:'Última Chamada', emoji:'✈️', color:'#8a123f',
      banner:'data/site/banners/DESK-ULTIMA-CHAMADA-01_1.png',
      claims:['coleção de esmaltes 2025','tema viagem','brilho intenso','longa duração'],
      match:{title:/ultima chamada|última chamada/i, tags:['ultima-chamada']},
      pair:{buckets:['Esmaltes e unhas'], kw:['base aliada','aliada','preparacao','top coat','top glass']},
      pitch:'A coleção Última Chamada é tema viagem ✈️ Leva 2 ou 3 cores da temporada, uma base preparadora e um top coat pra durar a viagem inteira.' },
    { k:'sweet-skin', name:'Sweet Skin Ice Cream', emoji:'🍨', color:'#a9742f',
      banner:'data/site/banners/DESK-SWEET-SKIN-NOVOS-SABORES.gif',
      claims:['novos sabores de sorvete','banho premium','vegano & cruelty-free','sundae de cereja · creme de baunilha · torta de limão'],
      match:{title:/sweet skin|ice cream|body splash|gelato|esfoliante crocante/i, tags:['sweet skin','sweet skin gelateria']},
      pair:{buckets:['Corpo e fragrância'], kw:['sabonete','gelato','body splash','esfoliante']},
      pitch:'Sweet Skin é ritual de sorvete pro banho 🍨 O pulo do gato é fechar o mesmo aroma: sabonete esfoliante + gelato hidratante + body splash.' },
    { k:'batom-matte', name:'Batom Líquido Matte 12H', emoji:'💋', color:'#8a1538',
      banner:'data/site/banners/DESK-BATOM-LIQUIDO-NOVAS-CORES.gif',
      claims:['matte 12h','tons suculentos','fixação blindada','não transfere','alta pigmentação','novas cores'],
      match:{title:/batom l[ií]quido|liquido matte|matte 12h/i, tags:['batom-liquido']},
      pair:{buckets:['Lábios'], kw:['gloss','lip','contorno','delineador labial','brilho']},
      pitch:'O Matte 12h não transfere e dura o dia todo 💋 contorna o lábio antes; se quiser um brilho no centro, um gloss por cima dá volume sem tirar a fixação.' },
    { k:'fix-tudo', name:'Fix Tudo · sobrancelha & blindagem', emoji:'🛡️', color:'#c0396a',
      banner:'data/site/banners/DESK-GEL-FIX-TUDO.png',
      claims:['sobrancelhas blindadas até o fim do dia','fixação extrema','efeito brow lamination','blindagem + bruma'],
      match:{title:/fix tudo|blindagem/i, tags:['gel-sobrancelha','blindagem']},
      pair:{buckets:['Sobrancelha','Base e rosto'], kw:['sobrancelha','lapiseira','soap brow','quarteto','bruma']},
      pitch:'Fix Tudo dá efeito brow lamination que segura o dia todo 🛡️ combina com a lapiseira/quarteto pra preencher e a bruma pra blindar a make inteira.' },
    { k:'quarteto-sobrancelha', name:'Quarteto Sobrancelha', emoji:'🎯', color:'#b0556a',
      banner:'data/site/banners/DESKTOP-QUARTETO-SOBRANCELHA.png',
      claims:['acabamento natural','preenche e ilumina','alta pigmentação'],
      match:{title:/quarteto/i, tags:[]},
      pair:{buckets:['Sobrancelha'], kw:['gel','fix tudo','soap brow','lapiseira']},
      pitch:'O Quarteto preenche e ilumina com acabamento natural 🎯 sela com o Gel Fix Tudo e a sobrancelha fica perfeita até a noite.' },
    { k:'po-translucido', name:'Pó Translúcido', emoji:'🤍', color:'#9c6b74',
      banner:'data/site/banners/DESKTOP-PO-TRANSLUCIDO.png',
      claims:['fixa a maquiagem','acabamento natural','controla o brilho'],
      match:{title:/transl[uú]cido|po solto|pó solto|po ultrafino|pó ultrafino/i, tags:[]},
      pair:{buckets:['Base e rosto'], kw:['base','cover fix','corretivo','bruma']},
      pitch:'O pó translúcido fixa a base e controla o brilho da zona T 🤍 dupla certa com a Cover Fix e a bruma finalizadora.' }
  ];
  var CAMP_KW={ 'top chrome':'top-chrome','cromad':'top-chrome','pó cromado':'top-chrome',
    'ultima chamada':'ultima-chamada','última chamada':'ultima-chamada',
    'sweet skin':'sweet-skin','ice cream':'sweet-skin','body splash':'sweet-skin','gelato':'sweet-skin','sorvete':'sweet-skin',
    'batom liquido':'batom-matte','batom líquido':'batom-matte','matte 12h':'batom-matte','matte 12':'batom-matte',
    'fix tudo':'fix-tudo','blindagem':'fix-tudo','brow lamination':'fix-tudo',
    'quarteto':'quarteto-sobrancelha','sobrancelha':'quarteto-sobrancelha',
    'po translucido':'po-translucido','pó translúcido':'po-translucido','translucido':'po-translucido' };

  function campById(k){ for(var i=0;i<CAMPAIGNS.length;i++) if(CAMPAIGNS[i].k===k) return CAMPAIGNS[i]; return null; }
  function campaignOf(p){
    if(!p || isComp(p)) return null;
    var tags=(p.tags||[]).map(norm);
    for(var i=0;i<CAMPAIGNS.length;i++){ var c=CAMPAIGNS[i];
      if(c.match.title && c.match.title.test(pName(p))) return c;
      if(c.match.tags && c.match.tags.some(function(tg){return tags.indexOf(norm(tg))>=0;})) return c;
    }
    return null;
  }
  function campaignPicks(c,n){
    return PRODUCTS.filter(function(p){ return p.available!==false && campaignOf(p)===c; })
      .sort(function(a,b){ return score(b)-score(a); }).slice(0, n||6);
  }
  function campaignCombo(c,anchor,n){        // "relação de produtos" da campanha
    n=n||3;
    var pool=PRODUCTS.filter(function(p){
      if(p.available===false) return false;
      if(anchor && root(p.title)===root(anchor.title)) return false;
      return (c.pair.buckets||[]).indexOf(p.bucket)>=0;
    });
    return pool.map(function(p){
      var s=score(p)/40;
      if((c.pair.kw||[]).some(function(k){return norm(p.title).indexOf(norm(k))>=0;})) s+=5;
      if(anchor && toneOf(p) && toneOf(p)===toneOf(anchor)) s+=3;   // ex.: Sweet Skin no mesmo aroma
      if(campaignOf(p)===c) s+=1;
      return {p:p,s:s};
    }).sort(function(a,b){return b.s-a.s;}).slice(0,n).map(function(x){return x.p;});
  }

  function score(p){ return (p.popularidade&&p.popularidade.score)||0; }
  function ptitle(p){ return isComp(p)?p.produto:p.title; }
  function toneOf(p){ var t=norm(ptitle(p)+' '+((p.tags||[]).join(' '))); for(var i=0;i<TONES.length;i++){ if(t.indexOf(norm(TONES[i]))>=0) return TONES[i]; } return null; }
  function root(t){ return norm((t||'').split(/\s[–—-]\s|:/)[0]); }   // "Batom – Cherry" -> "batom"
  function hashStr(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
  function avail(p){ return p.available!==false; }

  function alsoBought(p,n){
    var base=root(p.title), tb=toneOf(p), comp=COMPLEMENT[p.bucket]||[];
    var vp=(p.popularidade&&p.popularidade.vitrines)||[];
    return PRODUCTS.filter(function(q){return q!==p && avail(q);}).map(function(q){
      var s=0;
      if(q.linha&&p.linha&&norm(q.linha)===norm(p.linha)) s+=2;
      var vq=(q.popularidade&&q.popularidade.vitrines)||[];
      var shared=vp.filter(function(x){return vq.indexOf(x)>=0;}).length; s+=Math.min(shared,3)*2;
      if(comp.indexOf(q.bucket)>=0) s+=2;
      if(tb&&toneOf(q)===tb) s+=2;
      s+=score(q)/40;
      if(p.price&&q.price){ var r=q.price/p.price; if(r>=0.4&&r<=2.5) s+=1; }
      if(root(q.title)===base) s-=3;                 // variação da mesma linha não conta aqui
      return {q:q,s:s};
    }).sort(function(a,b){return b.s-a.s;}).slice(0,n).map(function(x){return x.q;});
  }

  function goesWith(p,n){
    var camp=campaignOf(p);                    // relação ancorada na campanha ativa
    if(camp){ var combo=campaignCombo(camp,p,n); if(combo.length>=Math.min(n,2)) return combo; }
    var tb=toneOf(p);
    var comp=(COMPLEMENT[p.bucket]||[]).filter(function(b){return b!==p.bucket;});
    var pool=PRODUCTS.filter(function(q){return q!==p&&avail(q)&&comp.indexOf(q.bucket)>=0;});
    if(pool.length<n){ // esmalte/corpo: complementa na própria categoria (combo/trio)
      pool=pool.concat(PRODUCTS.filter(function(q){return q!==p&&avail(q)&&q.bucket===p.bucket&&root(q.title)!==root(p.title);}));
    }
    var seen={};
    return pool.map(function(q){
      var s=0; if(tb&&toneOf(q)===tb) s+=4; s+=score(q)/30;
      if(q.popularidade&&q.popularidade.bestseller_rank) s+=1.5;
      return {q:q,s:s};
    }).sort(function(a,b){return b.s-a.s;}).filter(function(x){ if(seen[x.q.handle])return false; seen[x.q.handle]=1; return true; })
      .slice(0,n).map(function(x){return x.q;});
  }

  function siblings(p,n){
    var base=root(p.title);
    return PRODUCTS.filter(function(q){return q!==p&&root(q.title)===base;}).slice(0,n);
  }

  function regionPicks(p,region,n){
    var pool=alsoBought(p,16);
    pool.sort(function(a,b){ return (hashStr(region+a.handle)%1000)-(hashStr(region+b.handle)%1000); });
    return pool.slice(0,n);
  }

  /* ---------- sacola ---------- */
  function inCart(p){ return CART.some(function(x){return x.p===p;}); }
  function cartQty(){ return CART.reduce(function(a,x){return a+x.qty;},0); }
  function cartSub(){ return CART.reduce(function(a,x){return a+(x.p.price||0)*x.qty;},0); }
  function cartAdd(p){ if(!p)return;
    var wasOpen=el('cartdrawer').classList.contains('on');
    var it=CART.filter(function(x){return x.p===p;})[0]; if(it)it.qty++; else CART.push({p:p,qty:1});
    if(!wasOpen) cartTab='sacola';                 // veio de um produto: mostra a sacola
    renderCart(true);
    if(wasOpen && cartTab!=='sacola') bumpCartTab(); // já estava conversando: só avisa na aba
  }
  function cartDel(p){ CART=CART.filter(function(x){return x.p!==p;}); renderCart(); }
  function pick(pred){ return PRODUCTS.filter(function(q){return avail(q)&&!inCart(q)&&q.price&&pred(q);})
      .sort(function(a,b){return score(b)-score(a);})[0]; }
  function hasKw(kw){ return CART.some(function(x){return norm(x.p.title).indexOf(kw)>=0;}); }
  function firstBucket(b){ return CART.map(function(x){return x.p;}).filter(function(p){return p.bucket===b;})[0]; }

  function daiTips(){
    var tips=[], sub=cartSub(), qty=cartQty();
    if(!qty){ tips.push({txt:'Oi! Sou a <b>Dai</b> 💕 Me conta o que você procura ou toca em <b>＋ sacola</b> num produto que eu monto o look e cuido do frete pra você.'}); return tips; }
    // frete grátis
    if(sub<FREE){
      var falta=FREE-sub;
      var filler=pick(function(q){return q.price>=falta&&q.price<=falta+35;}) || pick(function(q){return q.price>=falta*0.6;});
      tips.push({txt:'Faltam <b>'+money(falta)+'</b> pro <b>frete grátis</b>. '+(filler?'Bora de <b>'+esc(filler.title)+'</b> ('+money(filler.price)+')? Fecha o frete e ainda leva uma queridinha ✨':'Adiciona mais um itenzinho que a gente chega lá 😉'), p:filler});
    } else {
      tips.push({txt:'Aeee, <b>frete grátis desbloqueado</b>! 🎉 Seu look tá lindo.'});
    }
    // batom sem gloss/lip
    var batom=firstBucket('Lábios');
    if(batom && !hasKw('gloss') && !hasKw('lip oil') && !hasKw('brilho')){
      var tb=toneOf(batom);
      var g=pick(function(q){return q.bucket==='Lábios'&&/gloss|lip oil|brilho|gloss labial/.test(norm(q.title))&&(!tb||toneOf(q)===tb||true);});
      if(g) tips.push({txt:'Selar o <b>'+esc(batom.title)+'</b> com o <b>'+esc(g.title)+'</b> deixa a cor mais intensa e com aquele brilho de vitrine 💋', p:g});
    }
    // base sem pó facial
    var hasBase=CART.some(function(x){return norm(x.p.title).indexOf('base')>=0;});
    var hasPo=CART.some(function(x){return x.p.bucket==='Base e rosto' && /\bpo (solto|compacto|transl|facial|ultrafino)/.test(norm(x.p.title));});
    if(hasBase && !hasPo){
      var po=pick(function(q){return q.bucket==='Base e rosto' && /\bpo (solto|compacto|transl|facial|ultrafino)/.test(norm(q.title));});
      if(po) tips.push({txt:'Pra sua base durar o dia todo, fixa com o <b>'+esc(po.title)+'</b>, combo que as clientes amam.', p:po});
    }
    // esmalte sem top coat
    if(firstBucket('Esmaltes e unhas') && !hasKw('top coat')){
      var tc=pick(function(q){return norm(q.title).indexOf('top coat')>=0;});
      if(tc) tips.push({txt:'Um <b>'+esc(tc.title)+'</b> por cima e a unha dura muito mais (e brilha mais 💅).', p:tc});
    }
    // sweet skin trio
    var ss=CART.map(function(x){return x.p;}).filter(function(p){return norm(p.linha).indexOf('sweet skin')>=0;})[0];
    if(ss){
      var tb2=toneOf(ss);
      var trio=pick(function(q){return norm(q.linha).indexOf('sweet skin')>=0&&(tb2?toneOf(q)===tb2:true);});
      if(trio) tips.push({txt:'Fecha o ritual Sweet Skin: <b>'+esc(trio.title)+'</b> no mesmo aroma: sabonete + gelato + body splash é o combo perfeito 🍰', p:trio});
    }
    // kit desconto
    if(qty>=3) tips.push({txt:'Você montou um kit com <b>'+qty+' itens</b> → apliquei <b>10% OFF simulado</b> nesse combo 🛍️'});
    return tips;
  }

  function miniCard(p){
    var img=p.images&&p.images[0]?PFX+p.images[0]:'';
    var i=ALL.indexOf(p);
    return '<div class="reccard" data-open="'+i+'">'+
      '<div class="rthumb">'+(img?'<img loading="lazy" src="'+img+'" alt="">':'')+'</div>'+
      '<div class="rb"><div class="rn">'+esc(p.title)+'</div>'+
        '<div class="rf"><span class="rp">'+money(p.price)+'</span>'+
          '<button class="miniadd" data-add="'+i+'" title="Adicionar à sacola">＋</button></div></div></div>';
  }
  function recRow(list){ return '<div class="recrow">'+list.map(miniCard).join('')+'</div>'; }

  function recsHtml(p){
    var also=alsoBought(p,4), goes=goesWith(p,4), sib=siblings(p,6), reg=regionPicks(p,'sp',4);
    var h='<div class="recs"><div class="recnote">💡 Demonstração de <b>venda consultiva</b>: sugestões geradas por IA a partir de linha, tom/aroma, coleções e popularidade reais. <b>Simulação ilustrativa.</b></div>';
    if(also.length) h+='<div class="recgrp"><h4>💗 Quem levou este, levou também</h4>'+recRow(also)+'</div>';
    if(goes.length) h+='<div class="recgrp"><h4>✨ Combina com <span class="simtag">montar o look</span></h4>'+recRow(goes)+
      '<button class="btn-look" data-look="'+ALL.indexOf(p)+'">Adicionar o look completo à sacola →</button></div>';
    if(sib.length>1) h+='<div class="recgrp"><h4>🎨 Outras cores/tons desta linha</h4>'+recRow(sib)+'</div>';
    h+='<div class="recgrp region"><h4>📍 Na sua região também levam '+
        '<select id="regionsel">'+REGIONS.map(function(r){return '<option value="'+r[0]+'">'+r[1]+'</option>';}).join('')+'</select>'+
        '<span class="simtag">simulação</span></h4><div id="regionrow">'+recRow(reg)+'</div></div>';
    h+='</div>';
    return h;
  }

  // liga cliques dentro de um container de recomendações/modal
  function wireRecs(container, p){
    container.addEventListener('click',function(e){
      var add=e.target.closest('[data-add]'); if(add){ e.stopPropagation(); cartAdd(ALL[+add.getAttribute('data-add')]); pulse(add); return; }
      var look=e.target.closest('[data-look]'); if(look){ e.stopPropagation(); goesWith(ALL[+look.getAttribute('data-look')],4).forEach(cartAdd); return; }
      var op=e.target.closest('[data-open]'); if(op){ var q=ALL[+op.getAttribute('data-open')]; if(q) (isComp(q)?openCompModal:openModal)(q); }
    });
    var sel=container.querySelector('#regionsel');
    if(sel) sel.addEventListener('change',function(){ container.querySelector('#regionrow').innerHTML=recRow(regionPicks(p,this.value,4)); });
  }
  function pulse(btnEl){ btnEl.classList.add('added'); setTimeout(function(){btnEl.classList.remove('added');},600); }

  /* ---------- interpretação da conversa (NLU por regras, offline) ---------- */
  function chatParse(text){
    var t=norm(text);
    var buckets=[]; CHAT_CAT.forEach(function(c){ if(c[1].some(function(k){return t.indexOf(norm(k))>=0;})) buckets.push(c[0]); });
    var tones=[]; CHAT_COLOR.forEach(function(c){ if(c[1].some(function(k){return t.indexOf(norm(k))>=0;})) c[0].forEach(function(x){ if(tones.indexOf(x)<0) tones.push(x); }); });
    var occ=null; Object.keys(CHAT_OCC).some(function(k){ if(t.indexOf(norm(k))>=0){ occ=pickBy(OCC,CHAT_OCC[k]); return !!occ; } return false; });
    var style=null; STYLES.forEach(function(s){ var w=norm(s.lab.split(/[\s/]/)[0]); if(w.length>3 && t.indexOf(w)>=0) style=s; });
    var mp=t.match(/(?:ate|maximo|no maximo|de|por)\s*r?\$?\s*(\d{1,4})/); var maxp=mp?+mp[1]:null;
    var gift=/presente|presentear|kit|para dar/.test(t);
    var campaign=null; Object.keys(CAMP_KW).some(function(k){ if(t.indexOf(norm(k))>=0){ campaign=campById(CAMP_KW[k]); return !!campaign; } return false; });
    return {text:text, buckets:buckets, tones:tones, occ:occ, style:style, maxp:maxp, gift:gift, campaign:campaign};
  }

  function chatPick(parsed,n){
    n=n||4;
    var b={occ:parsed.occ, style:parsed.style, image:null, skin:null, age:null};
    var scored=PRODUCTS.filter(function(p){
      return p.available!==false && !isComp(p) && p.price && (!parsed.maxp || p.price<=parsed.maxp);
    }).map(function(p){
      var s=scoreBrief(p,b);
      if(parsed.buckets.length) s += parsed.buckets.indexOf(p.bucket)>=0 ? 4 : -2.5;
      if(parsed.tones.length){ var tp=toneOf(p); if(tp && parsed.tones.indexOf(tp)>=0) s+=4; }
      if(parsed.campaign && campaignOf(p)===parsed.campaign) s+=8;   // prioriza a campanha citada
      if(parsed.gift && pPop(p) && (pPop(p).queridinho||pPop(p).bestseller_rank)) s+=2;
      s+=score(p)/80;
      return {p:p,s:s};
    }).sort(function(a,c){return c.s-a.s;});
    var seen={}, out=[];
    for(var i=0;i<scored.length && out.length<n;i++){ var r=root(scored[i].p.title); if(seen[r])continue; seen[r]=1; out.push(scored[i].p); }
    return out;
  }

  function chatWhy(p,parsed){
    var bits=[], tp=toneOf(p);
    if(parsed && parsed.tones.length && tp && parsed.tones.indexOf(tp)>=0) bits.push('tom '+tp);
    else if(tp) bits.push(tp);
    if(finishHas(p,'12h')||finishHas(p,'longa')||finishHas(p,'prova')) bits.push('longa duração');
    else if(finishHas(p,'matte')) bits.push('matte');
    else if(finishHas(p,'gloss')||finishHas(p,'iluminador')||finishHas(p,'glitter')) bits.push('glow');
    var pop=pPop(p); if(pop&&pop.bestseller_rank) bits.push('best-seller');
    return bits.slice(0,2).join(' · ');
  }

  function chatBeautyTip(prods){
    var b=prods[0]; if(!b) return '';
    switch(b.bucket){
      case 'Lábios': return '💡 Dica: contorna o lábio com lápis antes do batom, dura mais e não escorre.';
      case 'Esmaltes e unhas': return '💡 Dica: base + 2 camadas finas + top coat = esmalte que não lasca fácil.';
      case 'Base e rosto': return '💡 Dica: fixa a base com pó translúcido na zona T pra segurar o dia todo.';
      case 'Olhos': return '💡 Dica: um primer nos olhos deixa a sombra mais viva e sem vincar.';
      case 'Blush e bronzer': return '💡 Dica: sorri e aplica o blush no ponto alto da bochecha pra um ar saudável.';
      case 'Corpo e fragrância': return '💡 Dica: passa o hidratante com a pele ainda úmida, fixa o aroma por mais tempo.';
      default: return '';
    }
  }

  function chatFallback(parsed,prods){
    if(!prods.length) return 'Hmm, não achei nada certeiro pra isso 🤔 Me diz a categoria (batom, esmalte, base…) e a cor ou ocasião que eu encontro pra você 💕';
    var intro = parsed.campaign ? parsed.campaign.pitch : (parsed.occ ? parsed.occ.dai : 'Separei umas queridinhas que combinam com o que você pediu 💕');
    var tip = parsed.campaign ? '' : chatBeautyTip(prods);
    return intro + (tip ? '<br><br>'+tip : '') + '<br><br>Toca no <b>＋</b> que eu já jogo na sacola e cuido do frete pra você ✨';
  }

  /* ---------- Ollama local (opcional) ---------- */
  function updateLlmBadge(){
    var b=el('chatllm'); if(!b) return;
    b.innerHTML='<span class="dot'+(LLM.on?' on':'')+'"></span>'+
      (LLM.on ? 'Dai IA · Ollama ('+esc(LLM.model)+')' : 'Dai · modo local (regras)');
  }
  function llmProbe(){
    if(LLM.checking) return; LLM.checking=true;
    var to=setTimeout(function(){ LLM.on=false; LLM.checking=false; updateLlmBadge(); }, 2500);
    fetch(LLM.endpoint+'/api/tags',{cache:'no-cache'}).then(function(r){ return r.ok?r.json():null; })
      .then(function(d){
        clearTimeout(to);
        var names=(d&&d.models||[]).map(function(m){return m.name;}).filter(function(nm){
          var n=nm.toLowerCase();                       // fora: embeddings e modelos de visão (não fazem chat de texto aqui)
          return n.indexOf('embed')<0 && n.indexOf('vision')<0 && n.indexOf('llava')<0 && n.indexOf('mllama')<0;
        });
        if(names.length){
          // preferência: modelos mais leves primeiro (menos RAM/CPU → resposta mais rápida)
          var pref=['gemma3','phi3','llama3.2','qwen2.5','llama3.1','gemma2','llama3','qwen2','mistral','gemma'], chosen=null;
          pref.some(function(pf){ var f=names.filter(function(nm){return nm.toLowerCase().indexOf(pf)>=0;})[0]; if(f){chosen=f;return true;} return false; });
          LLM.model=chosen||names[0]; LLM.on=true; llmWarm();
        } else LLM.on=false;
      }).catch(function(){ clearTimeout(to); LLM.on=false; })
      .then(function(){ LLM.checking=false; updateLlmBadge(); });
  }
  function stripHtml(s){ return (s||'').replace(/<[^>]+>/g,''); }
  function llmWarm(){   // pré-carrega o modelo pra 1ª resposta não pegar cold start
    if(!LLM.model) return;
    fetch(LLM.endpoint+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:LLM.model,messages:[{role:'user',content:'oi'}],stream:false,options:{num_predict:1}})}).catch(function(){});
  }

  /* ---- cache de respostas (memória + localStorage) ----
     Inferência do Ollama em CPU é lenta; cachear o mesmo prompt deixa
     perguntas repetidas instantâneas no demo. */
  var LLM_CACHE_KEY='dai_llm_cache_v1', LLM_CACHE_MAX=120;
  var llmCache=(function(){ try{ return JSON.parse(localStorage.getItem(LLM_CACHE_KEY))||{}; }catch(e){ return {}; } })();
  function cacheKey(model,msgs){ return model+'|'+JSON.stringify(msgs); }
  function cacheGet(k){ return Object.prototype.hasOwnProperty.call(llmCache,k)?llmCache[k]:null; }
  function cacheSet(k,v){
    llmCache[k]=v;
    var keys=Object.keys(llmCache);
    if(keys.length>LLM_CACHE_MAX) delete llmCache[keys[0]];
    try{ localStorage.setItem(LLM_CACHE_KEY, JSON.stringify(llmCache)); }catch(e){ /* quota cheia: ignora */ }
  }

  function llmReply(parsed,prods,history,cb){
    var sys='Você é a "Dai", consultora de beleza da Dailus (cosméticos brasileiros, veganos e cruelty-free). '+
      'Fale como uma amiga próxima: calorosa, animada, gen-z brasileira, frases curtas, no máximo 2-3 emojis. '+
      'Você ajuda a escolher maquiagem e dá 1 dica de beleza prática. REGRAS: só comente os produtos da LISTA fornecida '+
      '(não invente outros nem preços); seja breve (até ~60 palavras); termine incentivando a tocar em "+" pra adicionar na sacola.';
    var ctx = prods.length
      ? 'Produtos disponíveis pra esta pergunta (use só estes nomes):\n'+prods.map(function(p){return '- '+p.title+' — R$ '+p.price+' ('+(p.linha||'Dailus')+' · '+p.bucket+')';}).join('\n')
      : 'Nenhum produto casou exatamente; peça mais detalhes (categoria/cor/ocasião).';
    if(parsed.campaign){ ctx = 'Campanha ativa da Dailus: '+parsed.campaign.name+'. Argumentos oficiais do banner (use-os): '+
      parsed.campaign.claims.join('; ')+'.\n'+ctx; }
    var msgs=[{role:'system',content:sys}];
    (history||[]).slice(-6).forEach(function(m){ if(m.txt||m.raw) msgs.push({role:m.who==='me'?'user':'assistant', content:m.raw||stripHtml(m.txt)}); });
    msgs.push({role:'user', content:parsed.text+'\n\n['+ctx+']'});

    var key=cacheKey(LLM.model,msgs), hit=cacheGet(key);
    if(hit!=null){ cb(hit); return; }

    fetch(LLM.endpoint+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:LLM.model, messages:msgs, stream:false, options:{temperature:0.7}})})
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(d){ var c=d&&d.message&&d.message.content; var out=c? esc(c.trim()).replace(/\n/g,'<br>') : null; if(out!=null) cacheSet(key,out); cb(out); })
      .catch(function(){ cb(null); });
  }

  /* ---------- fluxo de envio ---------- */
  // A Dai vive em 2 lugares (sacola + provador) e compartilham o mesmo CHAT.
  function refreshChat(){ renderCart(); if(advChatOpen()) renderAdvisorChat(); }
  function focusChatInput(){ var i=advChatOpen()?el('advinput'):el('chatinput'); if(i) i.focus(); }
  function chatGreet(){
    if(CHAT.length) return;
    CHAT.push({who:'dai',done:true,prods:[],
      txt:'Oi! Sou a <b>Dai</b> 💕 Me conta pra onde você vai ou o que procura, tipo <i>"esmalte pra balada com vestido rosa"</i>, que eu monto seu look e ainda solto umas dicas ✨',
      raw:'Oi! Sou a Dai. Me conta a ocasião ou o produto que você procura.'});
  }
  function daiSend(text){
    text=(text||'').trim(); if(!text) return;
    CHAT.push({who:'me', txt:esc(text), raw:text, prods:[]});
    var parsed=chatParse(text);
    var prods=chatPick(parsed,4);
    var msg={who:'dai', txt:'', raw:'', prods:prods, parsed:parsed, typing:true, done:false};
    CHAT.push(msg);
    CHAT_INPUT='';
    refreshChat(); focusChatInput();
    function finish(t){
      if(msg.done) return; msg.done=true; msg.typing=false;
      var out = t || chatFallback(parsed,prods);
      msg.txt=out; msg.raw=stripHtml(out);
      refreshChat();
    }
    if(LLM.on){
      llmReply(parsed, prods, CHAT.slice(0,-1), function(t){ finish(t); });
      setTimeout(function(){ finish(null); }, 40000);
    } else {
      setTimeout(function(){ finish(null); }, 320);
    }
  }

  function chatProdCard(p,parsed){
    var idx=ALL.indexOf(p), im=p.images&&p.images[0]?PFX+p.images[0]:'', why=chatWhy(p,parsed);
    return '<div class="cpcard" data-open="'+idx+'"><div class="cpthumb">'+(im?'<img loading="lazy" src="'+im+'" alt="">':'')+'</div>'+
      '<div class="cpb"><div class="cpn">'+esc(p.title)+'</div>'+(why?'<div class="cpwhy">'+esc(why)+'</div>':'')+
      '<div class="cpf"><span class="cpp">'+money(p.price)+'</span>'+
        '<button class="miniadd" data-add="'+idx+'" title="Adicionar à sacola">＋</button></div></div></div>';
  }
  function chatMsgHtml(m){
    var body = m.typing ? '<span class="typing"><span></span><span></span><span></span></span>' : m.txt;
    var prods = (m.prods&&m.prods.length && !m.typing) ? '<div class="chatprod">'+m.prods.map(function(p){return chatProdCard(p,m.parsed);}).join('')+'</div>' : '';
    return '<div class="msg '+m.who+'"><div class="who">'+(m.who==='me'?'Você':'Dai 💄')+'</div>'+
      '<div class="bubble">'+body+'</div>'+prods+'</div>';
  }

  /* ---------- render da sacola ---------- */
  function renderCart(open){
    el('cartcount').textContent=cartQty();
    el('cartcount').style.display=cartQty()?'grid':'none';
    var sub=cartSub(), qty=cartQty();
    var off = qty>=3? sub*KITOFF : 0;
    var total=sub-off;
    var pct=Math.min(100,Math.round(sub/FREE*100));
    var items = CART.length? CART.map(function(x){
      var img=x.p.images&&x.p.images[0]?PFX+x.p.images[0]:'';
      return '<div class="ci"><div class="cithumb">'+(img?'<img src="'+img+'" alt="">':'')+'</div>'+
        '<div class="cib"><div class="cin">'+esc(x.p.title)+'</div>'+
          '<div class="cimeta">'+(x.p.linha||'')+' · '+money(x.p.price)+(x.qty>1?' × '+x.qty:'')+'</div></div>'+
        '<button class="cidel" data-del="'+ALL.indexOf(x.p)+'" title="Remover">×</button></div>';
    }).join('') : '<div class="ciempty">Sua sacola está vazia. Toque em <b>＋ sacola</b> num produto, a Dai monta o resto 💕</div>';

    if(!CHAT.length) chatGreet();
    var chatHtml=CHAT.map(chatMsgHtml).join('');

    var cartPanel = CART.length
      ? '<div class="freebar"><div class="fbtop">'+(sub>=FREE?'<b>🎉 Frete grátis desbloqueado!</b>':'Faltam <b>'+money(FREE-sub)+'</b> pro frete grátis')+'</div>'+
          '<div class="fbtrack"><i style="width:'+pct+'%"></i></div></div>'+
        '<div class="citems"><div class="cihd">Na sacola · '+qty+' '+(qty>1?'itens':'item')+'</div>'+items+'</div>'+
        '<div class="ctfoot">'+
          '<div class="ctline"><span>Subtotal</span><b>'+money(sub)+'</b></div>'+
          (off?'<div class="ctline off"><span>Kit 3+ itens (−10% simulado)</span><b>−'+money(off)+'</b></div>':'')+
          '<div class="ctline total"><span>Total</span><b>'+money(total)+'</b></div>'+
          '<button class="btn-checkout" id="ctcheckout">Finalizar (demonstração)</button>'+
          '<div class="ctdisc">Simulação a partir do catálogo real da Dailus.</div>'+
        '</div>'
      : '<div class="citems"><div class="ciempty"><div class="ciempty-ic">🛍️</div>'+
          '<b>Sua sacola está vazia</b><span>Peça uma sugestão pra Dai ou toque em <b>＋ sacola</b> num produto.</span>'+
          '<button class="ciempty-btn" id="ctgochat">Conversar com a Dai 💬</button></div></div>';

    el('cartdrawer').innerHTML=
      '<div class="cthead"><div class="cthd-l"><div class="ctavatar">💄</div>'+
        '<div><div class="ctt">Dai · sua consultora <span class="simtag">simulação</span></div>'+
        '<div class="cts">Converse, peça sugestões e monte sua sacola</div></div></div>'+
        '<button class="ctx" id="ctclose" aria-label="Fechar">×</button></div>'+
      '<div class="cttabs" role="tablist">'+
        '<button class="cttab" id="tabChat" role="tab"><span>💬 Conversar</span></button>'+
        '<button class="cttab" id="tabCart" role="tab"><span>🛍️ Sacola</span>'+(qty?'<span class="tb">'+qty+'</span>':'')+'</button>'+
      '</div>'+
      '<div class="ctbody">'+
        '<section class="ctpanel panel-chat">'+
          '<div class="chatllm" id="chatllm"></div>'+
          '<div class="chatthread" id="chatthread">'+chatHtml+'</div>'+
          '<div class="chatquick" id="chatquick">'+CHAT_EX.map(function(x){return '<button class="qz" type="button">'+esc(x)+'</button>';}).join('')+'</div>'+
          '<form class="chatform" id="chatform"><input id="chatinput" type="text" autocomplete="off" '+
            'placeholder="Fala com a Dai… ex: batom pra formatura"><button type="submit" aria-label="Enviar">➤</button></form>'+
        '</section>'+
        '<section class="ctpanel panel-cart">'+cartPanel+'</section>'+
      '</div>';

    updateLlmBadge();
    var d=el('cartdrawer');
    d.setAttribute('data-tab',cartTab);
    d.querySelector('#tabChat').classList.toggle('on',cartTab==='chat');
    d.querySelector('#tabCart').classList.toggle('on',cartTab==='sacola');
    d.querySelector('#tabChat').onclick=function(){ setCartTab('chat'); };
    d.querySelector('#tabCart').onclick=function(){ setCartTab('sacola'); };
    d.querySelector('#ctclose').onclick=closeCart;
    var gc=d.querySelector('#ctgochat'); if(gc) gc.onclick=function(){ setCartTab('chat'); };
    var ck=d.querySelector('#ctcheckout'); if(ck) ck.onclick=function(){ this.textContent='É só um exemplo 😉 Mas o motor é real.'; };

    var thread=el('chatthread'); if(thread) thread.scrollTop=thread.scrollHeight;
    var input=el('chatinput'); if(input){ input.value=CHAT_INPUT; input.oninput=function(){ CHAT_INPUT=this.value; }; }
    var form=el('chatform'); if(form) form.onsubmit=function(e){ e.preventDefault(); daiSend(el('chatinput').value); };
    var quick=el('chatquick'); if(quick) quick.onclick=function(e){ var b=e.target.closest('.qz'); if(b) daiSend(b.textContent); };

    d.onclick=function(e){
      var del=e.target.closest('[data-del]'); if(del){ cartDel(ALL[+del.getAttribute('data-del')]); return; }
      var add=e.target.closest('[data-add]'); if(add){ e.stopPropagation(); cartAdd(ALL[+add.getAttribute('data-add')]); pulse(add); return; }
      var op=e.target.closest('[data-open]'); if(op){ var q=ALL[+op.getAttribute('data-open')]; if(q) (isComp(q)?openCompModal:openModal)(q); }
    };
    if(open) openCart();
  }
  function setCartTab(t){
    cartTab=t;
    var d=el('cartdrawer'); if(!d) return;
    d.setAttribute('data-tab',t);
    var tc=d.querySelector('#tabChat'), ts=d.querySelector('#tabCart');
    if(tc) tc.classList.toggle('on',t==='chat');
    if(ts) ts.classList.toggle('on',t==='sacola');
    if(t==='chat'){ var th=el('chatthread'); if(th) th.scrollTop=th.scrollHeight;
      var i=el('chatinput'); if(i) setTimeout(function(){i.focus();},50); }
  }
  function bumpCartTab(){ var t=el('cartdrawer'); if(!t) return; t=t.querySelector('#tabCart');
    if(t){ t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump'); } }
  function openCart(){ el('cartdrawer').classList.add('on'); el('cartback').classList.add('on'); }
  function closeCart(){ el('cartdrawer').classList.remove('on'); el('cartback').classList.remove('on'); }

})();
