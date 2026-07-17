/* Detalhe de produto — galeria, variações, compra, comparativo, relacionados */
import { asset } from '../config.js';
import { ICON } from '../icons.js';
import { money, img, esc, toast, openCart } from '../ui.js';
import * as S from '../store.js';
import { getProduct } from '../store.js';
import { rail, wireCards, productCard } from './card.js';
import * as Dai from '../dai.js';

const SITE_LABEL = { epoca: 'Época Cosméticos', paguemenos: 'Pague Menos' };

export function renderProduct(app, handle) {
  const p = getProduct(handle);
  if (!p) {
    app.innerHTML = `<div class="wrap page-404"><h1>Produto indisponível</h1>
      <a class="btn btn-primary" href="#/catalogo">Ver catálogo</a></div>`;
    return;
  }

  const list = S.listPrice(p);
  const off = list ? Math.round((1 - p.price / list) * 100) : 0;
  const out = p.available === false;
  const retailerImgs = (p.retailers || []).flatMap((r) => r.images || []);
  const imgs = [...(p.images || []), ...retailerImgs].slice(0, 12);
  const variants = (p.variacoes || []).filter((v) => v && v !== 'Default Title');
  const rank = S.bestRank(p);
  const pop = p.popularidade;
  const rating = (4.5 + (S.popScore(p) % 5) / 10).toFixed(1);
  const reviews = 12 + (S.popScore(p) * 3) % 380;

  // comparativo de preço (dados reais dos varejistas)
  const comps = (p.retailers || []).filter((r) => r.preco);
  const cheapestComp = comps.length ? Math.min(...comps.map((r) => r.preco)) : null;
  const weWin = cheapestComp != null && p.price <= cheapestComp;

  // motor de recomendação da Dai (venda consultiva)
  const alsoBought = Dai.alsoBought(p, 8);
  const goesWith = Dai.goesWith(p, 6);
  const sibs = Dai.siblings(p, 8);

  app.innerHTML = `
  <div class="wrap">
    <nav class="crumbs pdp-crumbs">
      <a href="#/">Início</a> / <a href="#/catalogo?bucket=${encodeURIComponent(p.bucket || '')}">${esc(p.bucket || 'Catálogo')}</a> / <span>${esc(p.title)}</span>
    </nav>
  </div>

  <section class="wrap pdp">
    <div class="pdp-gallery">
      <div class="pdp-thumbs" id="pdpThumbs">
        ${imgs.map((s, i) => `<button class="pdp-thumb ${i === 0 ? 'on' : ''}" data-i="${i}">${img(s, 'pdp-thumb-img')}</button>`).join('')}
      </div>
      <div class="pdp-main" id="pdpMain">
        ${off > 0 ? `<span class="pdp-off">-${off}%</span>` : ''}
        ${img(imgs[0], 'pdp-main-img')}
      </div>
    </div>

    <div class="pdp-info">
      <span class="pdp-line">${esc(p.linha || 'DAILUS')}</span>
      <h1 class="pdp-title">${esc(p.title)}</h1>
      <div class="pdp-meta">
        <span class="pdp-stars">${'★'.repeat(Math.round(rating))}<span class="dim">${'★'.repeat(5 - Math.round(rating))}</span> ${rating} <a href="#pdpReviews">(${reviews} avaliações)</a></span>
        ${rank ? `<span class="pdp-rank">#${rank} mais vendido</span>` : ''}
      </div>

      <div class="pdp-pricebox">
        ${list ? `<span class="pdp-was">${money(list)}</span>` : ''}
        <div class="pdp-now">${money(p.price)}</div>
        <span class="pdp-inst">em até <b>6x de ${money(p.price / 6)}</b> sem juros · <b>${money(p.price * 0.9)}</b> no Pix</span>
      </div>

      ${variants.length ? `<div class="pdp-variants">
        <label class="pdp-vlbl">Escolha: <b id="pdpVsel">${esc(variants[0])}</b></label>
        <div class="pdp-vlist" id="pdpVars">
          ${variants.map((v, i) => `<button class="pdp-var ${i === 0 ? 'on' : ''}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}
        </div>
      </div>` : ''}

      ${out ? `<div class="pdp-out">😔 Produto esgotado no momento. Fale com a Dai que ela sugere alternativas parecidas.</div>` : `
      <div class="pdp-buy">
        <div class="pdp-qty">
          <button data-q="dec">−</button><span id="pdpQty">1</span><button data-q="inc">+</button>
        </div>
        <button class="btn btn-primary pdp-add" id="pdpAdd">Adicionar à sacola</button>
      </div>
      <button class="btn btn-dark btn-block pdp-buynow" id="pdpBuy">Comprar agora</button>`}

      <ul class="pdp-perks">
        <li><span class="perk-ic">${ICON.truck}</span>Frete grátis acima de R$ 150</li>
        <li><span class="perk-ic">${ICON.lock}</span>Pagamento seguro (Pix ou cartão)</li>
        <li><span class="perk-ic">${ICON.returns}</span>7 dias para troca ou devolução</li>
      </ul>

      ${pop ? `<div class="pdp-pop">
        <div class="pdp-pop-hd"><b>Popularidade</b><span class="pdp-pop-pill t-${pop.tier === 'Alta' ? 'alta' : (pop.tier === 'Média' ? 'media' : 'padrao')}">${esc(pop.tier || '—')}</span><span class="pdp-pop-score">${pop.score || 0}/100</span></div>
        <div class="pdp-pop-bar t-${pop.tier === 'Alta' ? 'alta' : (pop.tier === 'Média' ? 'media' : 'padrao')}"><i style="width:${pop.score || 0}%"></i></div>
        ${(() => {
          const flags = [];
          if (pop.bestseller_rank) flags.push(`<span class="pf best"><span class="pf-ic">${ICON.flame}</span>#${pop.bestseller_rank} mais vendido</span>`);
          if (pop.queridinho) flags.push(`<span class="pf queri"><span class="pf-ic">${ICON.heart}</span>queridinho da marca</span>`);
          if (comps.length) flags.push(`<span class="pf reach">também no varejo: ${comps.map((r) => esc(SITE_LABEL[r.site] || r.site)).join(' · ')}</span>`);
          return flags.length ? `<div class="pdp-pop-flags">${flags.join('')}</div>` : '';
        })()}
      </div>` : ''}

      ${comps.length ? `<div class="pdp-compare ${weWin ? 'win' : ''}">
        <b>${weWin ? `<span class="cmp-ic">${ICON.check}</span>Melhor preço é aqui na Dailus` : 'Comparativo de preço entre lojas'}</b>
        <table>
          <tr class="us"><td>Dailus (oficial)</td><td>${money(p.price)}</td></tr>
          ${comps.map((r) => `<tr><td>${esc(SITE_LABEL[r.site] || r.site)}</td><td>${money(r.preco)}${r.delta_pct ? ` <span class="dim">(+${r.delta_pct}%)</span>` : ''}</td></tr>`).join('')}
        </table>
      </div>` : ''}
    </div>
  </section>

  <section class="wrap pdp-desc">
    <h2>Sobre o produto</h2>
    <p>${esc(p.descricao || 'Produto Dailus.')}</p>
    ${(p.tags || []).length ? `<div class="pdp-tags">${p.tags.map((t) => `<span>#${esc(t)}</span>`).join('')}</div>` : ''}
  </section>

  <div id="pdpReviews"></div>

  <div class="pdp-recnote wrap">💡 Recomendações de <b>venda consultiva</b> da Dai — geradas por IA a partir de linha, tom/aroma, coleções e popularidade reais. <b>Simulação ilustrativa.</b></div>
  <div id="pdpAlso"></div>
  <div id="pdpGoes"></div>
  <div id="pdpSibs"></div>
  <section class="rail" id="pdpRegion"></section>`;

  // galeria
  const mainImg = () => document.querySelector('#pdpMain .pdp-main-img');
  document.getElementById('pdpThumbs').onclick = (e) => {
    const b = e.target.closest('.pdp-thumb'); if (!b) return;
    const i = +b.dataset.i;
    const m = mainImg(); if (m) m.src = asset(imgs[i]);
    [...e.currentTarget.children].forEach((c) => c.classList.toggle('on', c === b));
  };

  // variações
  let variant = variants[0] || null;
  const varsEl = document.getElementById('pdpVars');
  if (varsEl) varsEl.onclick = (e) => {
    const b = e.target.closest('.pdp-var'); if (!b) return;
    variant = b.getAttribute('data-v');
    document.getElementById('pdpVsel').textContent = variant;
    [...varsEl.children].forEach((c) => c.classList.toggle('on', c === b));
  };

  // quantidade + compra (apenas quando disponível)
  let qty = 1;
  if (!out) {
    const qEl = document.getElementById('pdpQty');
    document.querySelector('.pdp-qty').onclick = (e) => {
      const a = e.target.getAttribute('data-q'); if (!a) return;
      qty = a === 'inc' ? qty + 1 : Math.max(1, qty - 1);
      qEl.textContent = qty;
    };
    const add = () => { S.addToCart(p, variant, qty); toast('✓ <b>' + esc(p.title) + '</b> na sacola'); };
    document.getElementById('pdpAdd').onclick = () => { add(); openCart(); };
    document.getElementById('pdpBuy').onclick = () => { add(); location.hash = '#/checkout'; };
  }

  // recomendações
  document.getElementById('pdpAlso').innerHTML = rail('Quem levou este, levou também', alsoBought, null, ICON.heart);
  document.getElementById('pdpGoes').innerHTML = goesWith.length ? `
    <section class="rail">
      <div class="wrap rail-head"><h2><span class="rail-ic">${ICON.sparkles}</span>Combina com este — monte o look</h2>
        <button class="btn btn-primary rail-look" id="pdpAddLook">Adicionar o look à sacola →</button></div>
      <div class="wrap"><div class="rail-track">${goesWith.map(productCard).join('')}</div></div>
    </section>` : '';
  document.getElementById('pdpSibs').innerHTML = sibs.length > 1 ? rail('Outras cores e tons desta linha', sibs, null, ICON.palette) : '';

  // "na sua região também levam" (simulação) com seletor
  const regionEl = document.getElementById('pdpRegion');
  const renderRegion = (reg) => {
    regionEl.innerHTML = `
      <div class="wrap rail-head">
        <h2><span class="rail-ic">${ICON.pin}</span>Na sua região também levam
          <select id="pdpRegionSel" class="pdp-regionsel">${Dai.REGIONS.map(([k, l]) => `<option value="${k}"${k === reg ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>
          <span class="pdp-simtag">simulação</span>
        </h2>
      </div>
      <div class="wrap"><div class="rail-track">${Dai.regionPicks(p, reg, 6).map(productCard).join('')}</div></div>`;
    regionEl.querySelector('#pdpRegionSel').onchange = (e) => { renderRegion(e.target.value); wireCards(regionEl); };
    wireCards(regionEl);
  };
  renderRegion('sp');

  const addLook = document.getElementById('pdpAddLook');
  if (addLook) addLook.onclick = () => {
    goesWith.slice(0, 4).forEach((q) => S.addToCart(q, null, 1));
    toast('✨ Look adicionado à sacola!');
    openCart();
  };

  wireCards(app);
}
