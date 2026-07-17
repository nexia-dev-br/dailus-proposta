/* Catálogo — paridade com o explorador (versão cliente):
   busca, filtro por linha e categoria, faixa de preço, best-seller/promoção,
   ocultar esgotados, ordenações (relevância, mais vendidos, preço, nome, mais
   imagens) e agrupar por (categoria, linha, cor, popularidade, preço, ocasião). */
import { esc, norm } from '../ui.js';
import * as S from '../store.js';
import { grid, wireCards } from './card.js';
import * as Dai from '../dai.js';

const PRICE_BANDS = [['Até R$ 25', 0, 25], ['R$ 25 a R$ 50', 25, 50], ['R$ 50 a R$ 80', 50, 80], ['Acima de R$ 80', 80, 1e9]];
const GROUP_LABELS = { cat: 'categoria', linha: 'linha', cor: 'cor/tom', pop: 'popularidade', preco: 'faixa de preço', ocasiao: 'ocasião' };

export function renderCatalog(app, query = {}) {
  const products = S.catalog.products; // catálogo completo (inclui esgotados)

  const buckets = countBy(products, (p) => p.bucket);
  const bucketList = Object.keys(buckets).filter((b) => b && b !== 'Outros').sort((a, b) => buckets[b] - buckets[a]);
  const linhas = countBy(products, (p) => p.linha);
  const linhaList = Object.keys(linhas).filter(Boolean).sort((a, b) => linhas[b] - linhas[a]);

  const state = {
    q: query.q || '',
    linha: query.linha || '',
    bucket: query.bucket || '',
    sort: query.sort || 'relevancia',
    onSale: query.sale === '1',
    best: false,
    hideOut: false,
    maxPrice: 0,
    group: query.group || '',
  };

  const priceCap = Math.ceil(Math.max(...products.map((p) => Number(p.price))) / 10) * 10;

  // Cabeçalho compacto por padrão; o usuário expande os detalhes se quiser (preferência salva).
  const heroOpen = localStorage.getItem('dailus-cat-hero') === '1';

  app.innerHTML = `
  <div class="cat-hero wrap${heroOpen ? ' open' : ''}" id="catHero">
    <div class="cat-hero-row">
      <div class="cat-hero-head">
        <nav class="crumbs"><a href="#/">Início</a> / <span>Catálogo</span></nav>
        <h1 id="catTitle">${state.bucket ? esc(state.bucket) : 'Todos os produtos'}</h1>
      </div>
      <button type="button" class="cat-hero-toggle" id="catHeroToggle" aria-expanded="${heroOpen ? 'true' : 'false'}" aria-controls="catHeroSub" title="Mostrar/ocultar detalhes do catálogo">
        <span class="cht-tx">${heroOpen ? 'Menos' : 'Detalhes'}</span>
        <span class="cht-caret" aria-hidden="true">⌄</span>
      </button>
    </div>
    <p class="cat-hero-sub" id="catHeroSub">${products.length} produtos no catálogo Dailus · maquiagem e skincare</p>
  </div>

  <div class="cat-filter-back" id="catFilterBack" aria-hidden="true"></div>

  <div class="cat-layout wrap">
    <aside class="cat-side" id="catSide" aria-label="Filtros do catálogo">
      <div class="cat-side-mhd">
        <b>Filtros</b>
        <button type="button" class="cat-side-close" id="catFilterClose" aria-label="Fechar filtros">✕</button>
      </div>
      <div class="cat-side-body">
        <div class="fbox">
          <label class="fbox-lbl">Buscar</label>
          <div class="fsearch"><input id="catQ" type="search" placeholder="nome, cor, SKU, tag…" value="${esc(state.q)}"></div>
        </div>

        <div class="fbox">
          <label class="fbox-lbl">Linha</label>
          <div class="fchips" id="catLinhas">
            <button type="button" class="fchip ${state.linha === '' ? 'on' : ''}" data-l="">Todas</button>
            ${linhaList.map((l) => `<button type="button" class="fchip ${state.linha === l ? 'on' : ''}" data-l="${esc(l)}">${esc(l)} <span>${linhas[l]}</span></button>`).join('')}
          </div>
        </div>

        <div class="fbox">
          <label class="fbox-lbl">Categoria</label>
          <div class="fcats" id="catCats">
            <button type="button" class="fcat ${state.bucket === '' ? 'on' : ''}" data-b="">Todas <span>${products.length}</span></button>
            ${bucketList.map((b) => `<button class="fcat ${state.bucket === b ? 'on' : ''}" data-b="${esc(b)}">${esc(b)} <span>${buckets[b]}</span></button>`).join('')}
          </div>
        </div>

        <div class="fbox">
          <label class="fbox-lbl">Preço até <b id="catPriceLbl">qualquer</b></label>
          <input id="catPrice" type="range" min="0" max="${priceCap}" step="10" value="0">
        </div>

        <div class="fbox">
          <label class="fchk"><input type="checkbox" id="catBest"> Só best-sellers</label>
          <label class="fchk"><input type="checkbox" id="catSale" ${state.onSale ? 'checked' : ''}> Em promoção</label>
          <label class="fchk"><input type="checkbox" id="catHideOut"> Ocultar esgotados</label>
        </div>

        <div class="fbox cat-side-group">
          <label class="fbox-lbl">Agrupar resultados</label>
          <select id="catGroup" class="cat-side-select">
            <option value="">Não agrupar</option>
            <option value="cat">Categoria</option>
            <option value="linha">Linha</option>
            <option value="cor">Cor / tom</option>
            <option value="pop">Popularidade</option>
            <option value="preco">Faixa de preço</option>
            <option value="ocasiao">Ocasião</option>
          </select>
        </div>
      </div>
      <div class="cat-side-mft">
        <button type="button" class="btn btn-ghost" id="catFilterClear">Limpar</button>
        <button type="button" class="btn btn-primary" id="catFilterApply">Ver resultados</button>
      </div>
    </aside>

    <div class="cat-main-col">
      <div class="cat-mtoolbar">
        <button type="button" class="cat-mfilt-btn" id="catFilterOpen" aria-expanded="false" aria-controls="catSide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
          Filtros
          <span class="cat-mfilt-badge" id="catFilterBadge" hidden>0</span>
        </button>
        <label class="cat-msort">
          <span class="sr-only">Ordenar</span>
          <select id="catSort">
            <option value="relevancia">Relevância</option>
            <option value="pop">Mais vendidos</option>
            <option value="price">Menor preço</option>
            <option value="price_d">Maior preço</option>
            <option value="name">Nome A–Z</option>
            <option value="imgs">Mais imagens</option>
          </select>
        </label>
      </div>

      <div class="cat-quick-cats" id="catQuickCats">
        <button type="button" class="cat-qcat ${state.bucket === '' ? 'on' : ''}" data-b="">Todos</button>
        ${bucketList.map((b) => `<button type="button" class="cat-qcat ${state.bucket === b ? 'on' : ''}" data-b="${esc(b)}">${esc(b)}</button>`).join('')}
      </div>

      <div class="cat-active" id="catActiveChips" hidden></div>

      <section class="cat-main">
        <div class="cat-bar">
          <span class="cat-count" id="catCount"></span>
          <div class="cat-controls">
            <label class="cat-sortlbl cat-sortlbl-group">Agrupar:
              <select id="catGroupDesk">
                <option value="">Não agrupar</option>
                <option value="cat">Categoria</option>
                <option value="linha">Linha</option>
                <option value="cor">Cor / tom</option>
                <option value="pop">Popularidade</option>
                <option value="preco">Faixa de preço</option>
                <option value="ocasiao">Ocasião</option>
              </select>
            </label>
            <label class="cat-sortlbl cat-sortlbl-sort">Ordenar:
              <select id="catSortDesk">
                <option value="relevancia">Relevância</option>
                <option value="pop">Mais vendidos</option>
                <option value="price">Menor preço</option>
                <option value="price_d">Maior preço</option>
                <option value="name">Nome A–Z</option>
                <option value="imgs">Mais imagens</option>
              </select>
            </label>
          </div>
        </div>
        <div id="catGrid"></div>
      </section>
    </div>
  </div>`;

  const gridEl = document.getElementById('catGrid');
  const countEl = document.getElementById('catCount');
  const sideEl = document.getElementById('catSide');
  const backEl = document.getElementById('catFilterBack');
  const badgeEl = document.getElementById('catFilterBadge');
  const chipsEl = document.getElementById('catActiveChips');
  const sortMobile = document.getElementById('catSort');
  const sortDesk = document.getElementById('catSortDesk');
  const groupMobile = document.getElementById('catGroup');
  const groupDesk = document.getElementById('catGroupDesk');

  sortMobile.value = state.sort;
  sortDesk.value = state.sort;
  groupMobile.value = state.group;
  groupDesk.value = state.group;

  function syncSort(v) {
    state.sort = v;
    sortMobile.value = v;
    sortDesk.value = v;
  }
  function syncGroup(v) {
    state.group = v;
    groupMobile.value = v;
    groupDesk.value = v;
  }

  function activeFilterCount() {
    let n = 0;
    if (state.q.trim()) n++;
    if (state.linha) n++;
    if (state.bucket) n++;
    if (state.maxPrice) n++;
    if (state.best) n++;
    if (state.onSale) n++;
    if (state.hideOut) n++;
    if (state.group) n++;
    return n;
  }

  function renderActiveChips() {
    const chips = [];
    if (state.q.trim()) chips.push({ k: 'q', label: `"${state.q.trim()}"` });
    if (state.linha) chips.push({ k: 'linha', label: state.linha });
    if (state.bucket) chips.push({ k: 'bucket', label: state.bucket });
    if (state.maxPrice) chips.push({ k: 'price', label: 'Até R$ ' + state.maxPrice });
    if (state.best) chips.push({ k: 'best', label: 'Best-sellers' });
    if (state.onSale) chips.push({ k: 'sale', label: 'Promoção' });
    if (state.hideOut) chips.push({ k: 'hideOut', label: 'Sem esgotados' });
    if (state.group) chips.push({ k: 'group', label: 'Agrupar: ' + GROUP_LABELS[state.group] });

    if (!chips.length) {
      chipsEl.hidden = true;
      chipsEl.innerHTML = '';
      return;
    }
    chipsEl.hidden = false;
    chipsEl.innerHTML = chips.map((c) =>
      `<button type="button" class="cat-achip" data-rm="${c.k}">${esc(c.label)} <span aria-hidden="true">✕</span></button>`
    ).join('') + `<button type="button" class="cat-achip cat-achip-clear" data-rm="all">Limpar tudo</button>`;
  }

  function updateFilterBadge() {
    const n = activeFilterCount();
    badgeEl.hidden = n === 0;
    badgeEl.textContent = String(n);
  }

  function openCatFilters() {
    sideEl.classList.add('open');
    backEl.classList.add('open');
    backEl.setAttribute('aria-hidden', 'false');
    document.getElementById('catFilterOpen').setAttribute('aria-expanded', 'true');
    document.body.classList.add('cat-filters-open');
  }
  function closeCatFilters() {
    sideEl.classList.remove('open');
    backEl.classList.remove('open');
    backEl.setAttribute('aria-hidden', 'true');
    document.getElementById('catFilterOpen').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('cat-filters-open');
  }

  function clearFilters() {
    state.q = '';
    state.linha = '';
    state.bucket = '';
    state.maxPrice = 0;
    state.best = false;
    state.onSale = false;
    state.hideOut = false;
    state.group = '';
    document.getElementById('catQ').value = '';
    document.getElementById('catPrice').value = '0';
    document.getElementById('catPriceLbl').textContent = 'qualquer';
    document.getElementById('catBest').checked = false;
    document.getElementById('catSale').checked = false;
    document.getElementById('catHideOut').checked = false;
    [...document.getElementById('catLinhas').children].forEach((c, i) => c.classList.toggle('on', i === 0));
    [...document.getElementById('catCats').children].forEach((c, i) => c.classList.toggle('on', i === 0));
    document.querySelectorAll('.cat-qcat').forEach((c, i) => c.classList.toggle('on', i === 0));
    document.getElementById('catTitle').textContent = 'Todos os produtos';
    syncGroup('');
    apply();
  }

  function match(p) {
    if (state.linha && p.linha !== state.linha) return false;
    if (state.bucket && p.bucket !== state.bucket) return false;
    if (state.best && !S.bestRank(p)) return false;
    if (state.onSale && !S.listPrice(p)) return false;
    if (state.hideOut && p.available === false) return false;
    if (state.maxPrice && Number(p.price) > state.maxPrice) return false;
    if (state.q) {
      const hay = norm([p.title, p.categoria, p.linha, (p.skus || []).join(' '), (p.eans || []).join(' '), (p.tags || []).join(' '), (p.variacoes || []).join(' ')].join(' '));
      if (!hay.includes(norm(state.q))) return false;
    }
    return true;
  }

  function apply() {
    let list = sortList(products.filter(match), state.sort);
    countEl.innerHTML = `<b>${list.length}</b> ${list.length === 1 ? 'produto' : 'produtos'}${state.group ? ' · agrupado por ' + GROUP_LABELS[state.group] : ''}`;
    const heroSub = document.querySelector('.cat-hero-sub');
    if (heroSub) {
      heroSub.textContent = state.bucket
        ? `${list.length} produto${list.length === 1 ? '' : 's'} em ${state.bucket}`
        : `${products.length} produtos no catálogo Dailus · maquiagem e skincare`;
    }
    gridEl.innerHTML = state.group ? groupedHtml(list, state.group) : grid(list);
    wireCards(gridEl);
    updateFilterBadge();
    renderActiveChips();
  }

  // wiring
  const heroEl = document.getElementById('catHero');
  const heroToggle = document.getElementById('catHeroToggle');
  heroToggle.onclick = () => {
    const open = heroEl.classList.toggle('open');
    heroToggle.setAttribute('aria-expanded', String(open));
    heroToggle.querySelector('.cht-tx').textContent = open ? 'Menos' : 'Detalhes';
    localStorage.setItem('dailus-cat-hero', open ? '1' : '0');
  };

  let t;
  document.getElementById('catQ').oninput = (e) => { clearTimeout(t); const v = e.target.value; t = setTimeout(() => { state.q = v; apply(); }, 140); };
  sortMobile.onchange = (e) => { syncSort(e.target.value); apply(); };
  sortDesk.onchange = (e) => { syncSort(e.target.value); apply(); };
  groupMobile.onchange = (e) => { syncGroup(e.target.value); apply(); };
  groupDesk.onchange = (e) => { syncGroup(e.target.value); apply(); };
  document.getElementById('catFilterOpen').onclick = openCatFilters;
  document.getElementById('catFilterClose').onclick = closeCatFilters;
  document.getElementById('catFilterApply').onclick = closeCatFilters;
  backEl.onclick = closeCatFilters;
  document.getElementById('catFilterClear').onclick = () => { clearFilters(); closeCatFilters(); };
  chipsEl.onclick = (e) => {
    const b = e.target.closest('[data-rm]'); if (!b) return;
    const k = b.getAttribute('data-rm');
    if (k === 'all') { clearFilters(); return; }
    if (k === 'q') { state.q = ''; document.getElementById('catQ').value = ''; }
    else if (k === 'linha') {
      state.linha = '';
      [...document.getElementById('catLinhas').children].forEach((c, i) => c.classList.toggle('on', i === 0));
    } else if (k === 'bucket') {
      state.bucket = '';
      [...document.getElementById('catCats').children].forEach((c, i) => c.classList.toggle('on', i === 0));
      document.querySelectorAll('.cat-qcat').forEach((c, i) => c.classList.toggle('on', i === 0));
      document.getElementById('catTitle').textContent = 'Todos os produtos';
    } else if (k === 'price') {
      state.maxPrice = 0;
      document.getElementById('catPrice').value = '0';
      document.getElementById('catPriceLbl').textContent = 'qualquer';
    } else if (k === 'best') { state.best = false; document.getElementById('catBest').checked = false; }
    else if (k === 'sale') { state.onSale = false; document.getElementById('catSale').checked = false; }
    else if (k === 'hideOut') { state.hideOut = false; document.getElementById('catHideOut').checked = false; }
    else if (k === 'group') { syncGroup(''); }
    apply();
  };
  document.getElementById('catQuickCats').onclick = (e) => {
    const b = e.target.closest('.cat-qcat'); if (!b) return;
    state.bucket = b.getAttribute('data-b');
    [...e.currentTarget.children].forEach((c) => c.classList.toggle('on', c === b));
    [...document.getElementById('catCats').children].forEach((c) => c.classList.toggle('on', c.getAttribute('data-b') === state.bucket));
    document.getElementById('catTitle').textContent = state.bucket || 'Todos os produtos';
    apply();
  };
  document.getElementById('catBest').onchange = (e) => { state.best = e.target.checked; apply(); };
  document.getElementById('catSale').onchange = (e) => { state.onSale = e.target.checked; apply(); };
  document.getElementById('catHideOut').onchange = (e) => { state.hideOut = e.target.checked; apply(); };
  document.getElementById('catPrice').oninput = (e) => {
    state.maxPrice = Number(e.target.value);
    document.getElementById('catPriceLbl').textContent = state.maxPrice ? 'R$ ' + state.maxPrice : 'qualquer';
    apply();
  };
  document.getElementById('catCats').onclick = (e) => {
    const b = e.target.closest('.fcat'); if (!b) return;
    state.bucket = b.getAttribute('data-b');
    [...e.currentTarget.children].forEach((c) => c.classList.toggle('on', c === b));
    document.querySelectorAll('.cat-qcat').forEach((c) => c.classList.toggle('on', c.getAttribute('data-b') === state.bucket));
    document.getElementById('catTitle').textContent = state.bucket || 'Todos os produtos';
    apply();
  };
  document.getElementById('catLinhas').onclick = (e) => {
    const b = e.target.closest('.fchip'); if (!b) return;
    state.linha = b.getAttribute('data-l');
    [...e.currentTarget.children].forEach((c) => c.classList.toggle('on', c === b));
    apply();
  };

  apply();
}

function sortList(list, sort) {
  const arr = list.slice();
  const rank = (p) => S.bestRank(p) || 9999;
  const comps = (p) => (p.retailers && p.retailers.length) || 0;
  if (sort === 'price') arr.sort((a, b) => a.price - b.price);
  else if (sort === 'price_d') arr.sort((a, b) => b.price - a.price);
  else if (sort === 'name') arr.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  else if (sort === 'imgs') arr.sort((a, b) => (b.n_imagens || 0) - (a.n_imagens || 0));
  else if (sort === 'pop') arr.sort((a, b) => (rank(a) - rank(b)) || (S.popScore(b) - S.popScore(a)));
  else arr.sort((a, b) => (comps(b) - comps(a)) || ((b.n_imagens || 0) - (a.n_imagens || 0))); // relevância
  return arr;
}

/* ---------- agrupamento (como as clientes pensam maquiagem) ---------- */
function groupKeys(p, how) {
  if (how === 'cat') return [p.bucket || 'Outros'];
  if (how === 'linha') return [p.linha || 'Sem linha'];
  if (how === 'cor') { const t = Dai.toneOf(p); return [t ? ('Tom ' + t.charAt(0).toUpperCase() + t.slice(1)) : 'Sem cor específica']; }
  if (how === 'pop') { const pp = p.popularidade; return [pp && pp.tier ? ('Popularidade ' + pp.tier) : 'Popularidade Padrão']; }
  if (how === 'preco') { const v = Number(p.price); const b = PRICE_BANDS.find((x) => v >= x[1] && v < x[2]); return [b ? b[0] : 'Sem preço']; }
  if (how === 'ocasiao') { const occ = Dai.occasionsFor(p); return occ.length ? occ : []; }
  return ['Todos'];
}

function groupedHtml(list, how) {
  const order = [], map = {};
  list.forEach((p) => groupKeys(p, how).forEach((k) => { if (!map[k]) { map[k] = []; order.push(k); } map[k].push(p); }));
  let keys = order;
  if (how === 'preco') keys = PRICE_BANDS.map((x) => x[0]).filter((k) => map[k]);
  else if (how === 'pop') keys = ['Popularidade Alta', 'Popularidade Média', 'Popularidade Padrão'].filter((k) => map[k]);
  else if (how === 'ocasiao') keys = Dai.OCC.map((o) => `${o.emoji} ${o.lab}`).filter((k) => map[k]);
  else keys.sort((a, b) => map[b].length - map[a].length);

  if (!keys.length) return `<div class="empty-grid">Nenhum produto encontrado.</div>`;
  return keys.map((k) => {
    const items = how === 'ocasiao' ? map[k].slice(0, 12) : map[k];
    return `<section class="cat-group">
      <div class="cat-group-hd"><h3>${esc(k)}</h3><span>${map[k].length} produto${map[k].length === 1 ? '' : 's'}</span></div>
      ${grid(items)}
    </section>`;
  }).join('');
}

function countBy(arr, fn) {
  const m = {};
  arr.forEach((x) => { const k = fn(x); if (k) m[k] = (m[k] || 0) + 1; });
  return m;
}
