/* Card de produto — mesmo modelo validado do catálogo (explorer)
   Comportamento: clique no card abre o produto; "＋ sacola" adiciona ao carrinho. */
import { money, img, esc, toast, openCart, go } from '../ui.js';
import { ICON } from '../icons.js';
import * as S from '../store.js';
import { getProduct } from '../store.js';

export function productCard(p) {
  const pop = p.popularidade || {};
  const rank = pop.bestseller_rank || S.bestRank(p);
  const list = S.listPrice(p);
  const off = list ? Math.round((1 - p.price / list) * 100) : 0;
  const nimg = (p.images && p.images.length) || p.n_imagens || 0;

  let badges = '';
  if (rank) badges += `<span class="tag best"><span class="tag-ic">${ICON.flame}</span>#${rank} mais vendido</span>`;
  else if (pop.queridinho || pop.tier === 'Alta') badges += `<span class="tag queri"><span class="tag-ic">${ICON.heart}</span>queridinho</span>`;
  if (off > 0) badges += `<span class="tag off">-${off}%</span>`;
  if (p.available === false) badges += `<span class="tag out">esgotado</span>`;

  const tierCls = pop.tier === 'Alta' ? 'alta' : (pop.tier === 'Média' ? 'media' : 'padrao');
  const out = p.available === false;

  return `
  <article class="card${out ? ' out' : ''}" data-handle="${esc(p.handle)}">
    <div class="thumb">${img(p.images?.[0], '')}<div class="badges">${badges}</div></div>
    <div class="body">
      <div class="line">${esc(p.linha || '')}</div>
      <h3>${esc(p.title)}</h3>
      <div class="cat">${esc(p.categoria || p.bucket || '')}</div>
      <div class="popmeter t-${tierCls}" title="Popularidade ${esc(pop.tier || '—')}"><i style="width:${pop.score || 0}%"></i></div>
      <div class="foot">
        <span class="price">${money(p.price)}${list ? ` <s class="was">${money(list)}</s>` : ''}</span>
        <span class="imgs">${nimg}<span class="imgs-ic">${ICON.camera}</span></span>
      </div>
      ${out
        ? '<button class="addbtn out" disabled>esgotado</button>'
        : `<button class="addbtn" data-add="${esc(p.handle)}">＋ sacola</button>`}
    </div>
  </article>`;
}

// liga o comportamento dos cards de um container já renderizado
export function wireCards(container) {
  container.querySelectorAll('.card[data-handle]').forEach((c) => {
    c.onclick = (e) => {
      if (e.target.closest('[data-add]')) return; // botão da sacola tem ação própria
      go('#/produto/' + c.getAttribute('data-handle'));
    };
  });
  container.querySelectorAll('[data-add]').forEach((b) => {
    b.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const p = getProduct(b.getAttribute('data-add'));
      if (!p) return;
      S.addToCart(p, null, 1);
      b.classList.add('added');
      setTimeout(() => b.classList.remove('added'), 600);
      toast('✓ <b>' + esc(p.title) + '</b> na sacola');
      openCart();
    };
  });
}

export function grid(products) {
  if (!products.length) return `<div class="empty-grid">Nenhum produto encontrado.</div>`;
  return `<div class="pc-grid">${products.map(productCard).join('')}</div>`;
}

// carrossel horizontal (home / relacionados)
export function rail(title, products, seeAll, icon) {
  if (!products.length) return '';
  return `
  <section class="rail">
    <div class="wrap rail-head">
      <h2>${icon ? `<span class="rail-ic">${icon}</span>` : ''}${esc(title)}</h2>
      ${seeAll ? `<a class="rail-see" href="${esc(seeAll)}">Ver todos →</a>` : ''}
    </div>
    <div class="wrap"><div class="rail-track">${products.map(productCard).join('')}</div></div>
  </section>`;
}
