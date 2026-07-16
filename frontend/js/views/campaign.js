/* Campanha — landing gerada a partir de um banner, filtrando o catálogo real */
import { asset, BANNERS_DIR, CAMPAIGNS } from '../config.js';
import { esc, norm } from '../ui.js';
import * as S from '../store.js';
import { grid, wireCards } from './card.js';

export function renderCampaign(app, id) {
  const c = CAMPAIGNS.find((x) => x.id === id);
  if (!c) {
    app.innerHTML = `<div class="wrap page-404"><h1>Campanha não encontrada</h1>
      <a class="btn btn-primary" href="#/">Voltar</a></div>`;
    return;
  }

  const products = filterFor(c.filter);

  app.innerHTML = `
  <section class="camp-hero" style="--accent:${c.accent}">
    <img src="${esc(asset(BANNERS_DIR + c.banner))}" alt="${esc(c.title)}">
    <div class="camp-hero-cap wrap">
      <span class="camp-hero-tag">${esc(c.tag)}</span>
      <h1>${esc(c.title)}</h1>
      <p>${esc(c.subtitle)}</p>
    </div>
  </section>

  <div class="wrap camp-body">
    <nav class="crumbs"><a href="#/">Início</a> / <a href="#/">Campanhas</a> / <span>${esc(c.title)}</span></nav>
    <div class="cat-bar">
      <span class="cat-count"><b>${products.length}</b> ${products.length === 1 ? 'produto' : 'produtos'} na campanha</span>
      <a class="rail-see" href="#/catalogo">Ver catálogo completo →</a>
    </div>
    <div id="campGrid"></div>
  </div>`;

  const gridEl = document.getElementById('campGrid');
  gridEl.innerHTML = grid(products);
  wireCards(gridEl);
}

function filterFor(f) {
  let list = S.catalog.products.slice();
  if (f.onSale) list = S.onSale(60);
  if (f.linha) list = list.filter((p) => norm(p.linha).includes(norm(f.linha)));
  if (f.bucket) list = list.filter((p) => p.bucket === f.bucket);
  if (f.q) {
    const q = norm(f.q);
    list = list.filter((p) => norm([p.title, p.categoria, p.linha, (p.tags || []).join(' '), (p.variacoes || []).join(' ')].join(' ')).includes(q));
  }
  return list.sort((a, b) => S.popScore(b) - S.popScore(a));
}
