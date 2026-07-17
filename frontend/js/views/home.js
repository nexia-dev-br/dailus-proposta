/* Home — hero de campanhas, categorias, mais vendidos, ofertas, marca */
import { asset, BANNERS_DIR, LIFESTYLE_DIR, BRAND_DIR, CAMPAIGNS, CATEGORY_NAV } from '../config.js';
import { ICON } from '../icons.js';
import { esc } from '../ui.js';
import * as S from '../store.js';
import { rail, wireCards } from './card.js';

export function renderHome(app) {
  const heroCampaigns = CAMPAIGNS.slice(0, 4);
  const best = S.bestSellers(12);
  const sale = S.onSale(12);
  const summary = S.catalog.summary || {};

  app.innerHTML = `
  <section class="hero">
    <div class="hero-slides" id="heroSlides">
      ${heroCampaigns.map((c, i) => `
        <a class="hero-slide ${i === 0 ? 'on' : ''}" href="#/campanha/${c.id}" data-i="${i}" style="--accent:${c.accent}">
          <img src="${esc(asset(BANNERS_DIR + c.banner))}" alt="${esc(c.title)}">
          <div class="hero-cap">
            <span class="hero-tag">${esc(c.tag)}</span>
            <h1>${esc(c.title)}</h1>
            <p>${esc(c.subtitle)}</p>
            <span class="btn btn-primary">Ver campanha →</span>
          </div>
        </a>`).join('')}
    </div>
    <div class="hero-dots" id="heroDots">
      ${heroCampaigns.map((_, i) => `<button class="${i === 0 ? 'on' : ''}" data-i="${i}" aria-label="slide ${i + 1}"></button>`).join('')}
    </div>
  </section>

  <div class="trust wrap">
    <div><b><span class="trust-ic">${ICON.truck}</span>Frete grátis</b><span>acima de R$ 150</span></div>
    <div><b><span class="trust-ic">${ICON.card}</span>Até 6x sem juros</b><span>no cartão</span></div>
    <div><b><span class="trust-ic">${ICON.lock}</span>Compra segura</b><span>Pix e cartão</span></div>
    <div><b><span class="trust-ic">${ICON.returns}</span>Troca fácil</b><span>7 dias</span></div>
  </div>

  <section class="cat-nav wrap">
    ${CATEGORY_NAV.map((c) => `
      <a class="cat-pill" href="#/catalogo?bucket=${encodeURIComponent(c.bucket)}">
        <span class="cat-ic">${c.icon}</span><span>${esc(c.label)}</span>
      </a>`).join('')}
  </section>

  <section class="dai-cta wrap" id="daiCta">
    <div class="dai-cta-ic">${ICON.wand}</div>
    <div class="dai-cta-txt">
      <b>Não sabe por onde começar?</b>
      <span>Conta pra Dai a ocasião, seu tom de pele e o estilo — ela monta o look completo e separa os produtos pra você.</span>
    </div>
    <button class="btn btn-dark" id="daiCtaBtn">Deixa a Dai me ajudar →</button>
  </section>

  <div id="railBest"></div>

  <section class="camp-strip wrap">
    ${CAMPAIGNS.slice(1, 4).map((c) => `
      <a class="camp-card" href="#/campanha/${c.id}" style="--accent:${c.accent}">
        <img src="${esc(asset(BANNERS_DIR + c.banner))}" alt="${esc(c.title)}">
        <div class="camp-info"><span>${esc(c.tag)}</span><b>${esc(c.title)}</b></div>
      </a>`).join('')}
  </section>

  <div id="railSale"></div>

  <section class="brand-story">
    <div class="wrap brand-grid">
      <div class="brand-media">
        <img src="${esc(asset(BRAND_DIR + 'foto-missao-site-novo.png'))}" alt="Missão Dailus">
      </div>
      <div class="brand-txt">
        <img class="brand-logo" src="${esc(asset(BRAND_DIR + 'logo_da_dailus.png'))}" alt="Dailus">
        <h2>Beleza de verdade, pra vida real</h2>
        <p>A Dailus nasceu para descomplicar a maquiagem: cor, cuidado e atitude em produtos que
        acompanham o ritmo de cada brasileira. Fórmulas testadas, tons democráticos e preço justo.</p>
        <div class="brand-kpis">
          <div><b>${summary.produtos || '375'}+</b><span>produtos no catálogo</span></div>
          <div><b>${summary.bestsellers || '22'}</b><span>best-sellers ranqueados</span></div>
          <div><b>4,8★</b><span>avaliação média</span></div>
        </div>
        <a class="btn btn-dark" href="#/catalogo">Explorar o catálogo</a>
      </div>
    </div>
  </section>

  <section class="lifestyle">
    ${['800X915-CHERRY-01.jpg', '800x915_HOLO_ROSE_01.webp', '800X915-GEL-FIX-02.jpg', '800X915-TOP-GLASS-02.jpg']
      .map((f) => `<img src="${esc(asset(LIFESTYLE_DIR + f))}" alt="" loading="lazy">`).join('')}
  </section>`;

  document.getElementById('railBest').innerHTML = rail('Os mais vendidos', best, '#/catalogo?sort=pop', ICON.star);
  document.getElementById('railSale').innerHTML = rail('Ofertas Última Chamada', sale, '#/campanha/ultima-chamada', ICON.flame);
  wireCards(app);
  document.getElementById('daiCtaBtn').onclick = () => window.dispatchEvent(new Event('dai:advisor'));
  initHero();
}

function initHero() {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('#heroDots button')];
  if (slides.length < 2) return;
  let i = 0, timer;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  };
  dots.forEach((d) => d.onclick = () => { show(+d.dataset.i); restart(); });
  const restart = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), 5000); };
  restart();
}
