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

  app.innerHTML = `
  <div class="cat-hero wrap">
    <nav class="crumbs"><a href="#/">Início</a> / <span>Catálogo</span></nav>
    <h1 id="catTitle">${state.bucket ? esc(state.bucket) : 'Todos os produtos'}</h1>
    <p>${products.length} produtos no catálogo Dailus · maquiagem e skincare</p>
  </div>

  <div class="cat-layout wrap">
    <aside class="cat-side">
      <div class="fbox">
        <label class="fbox-lbl">Buscar</label>
        <div class="fsearch"><input id="catQ" type="search" placeholder="nome, cor, SKU, tag…" value="${esc(state.q)}"></div>
      </div>

      <div class="fbox">
        <label class="fbox-lbl">Linha</label>
        <div class="fchips" id="catLinhas">
          <button class="fchip ${state.linha === '' ? 'on' : ''}" data-l="">Todas</button>
          ${linhaList.map((l) => `<button class="fchip ${state.linha === l ? 'on' : ''}" data-l="${esc(l)}">${esc(l)} <span>${linhas[l]}</span></button>`).join('')}
        </div>
      </div>

      <div class="fbox">
        <label class="fbox-lbl">Categoria</label>
        <div class="fcats" id="catCats">
          <button class="fcat ${state.bucket === '' ? 'on' : ''}" data-b="">Todas <span>${products.length}</span></button>
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
    </aside>

    <section class="cat-main">
      <div class="cat-bar">
        <span class="cat-count" id="catCount"></span>
        <div class="cat-controls">
          <label class="cat-sortlbl">Agrupar:
            <select id="catGroup">
              <option value="">Não agrupar</option>
              <option value="cat">Categoria</option>
              <option value="linha">Linha</option>
              <option value="cor">Cor / tom</option>
              <option value="pop">Popularidade</option>
              <option value="preco">Faixa de preço</option>
              <option value="ocasiao">Ocasião</option>
            </select>
          </label>
          <label class="cat-sortlbl">Ordenar:
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
      </div>
      <div id="catGrid"></div>
    </section>
  </div>`;

  const gridEl = document.getElementById('catGrid');
  const countEl = document.getElementById('catCount');
  document.getElementById('catSort').value = state.sort;
  document.getElementById('catGroup').value = state.group;

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
    gridEl.innerHTML = state.group ? groupedHtml(list, state.group) : grid(list);
    wireCards(gridEl);
  }

  // wiring
  let t;
  document.getElementById('catQ').oninput = (e) => { clearTimeout(t); const v = e.target.value; t = setTimeout(() => { state.q = v; apply(); }, 140); };
  document.getElementById('catSort').onchange = (e) => { state.sort = e.target.value; apply(); };
  document.getElementById('catGroup').onchange = (e) => { state.group = e.target.value; apply(); };
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
