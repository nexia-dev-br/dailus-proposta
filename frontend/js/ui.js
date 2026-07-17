/* =====================================================================
   UI — helpers de DOM, formatação, header, footer, carrinho e toasts
   ===================================================================== */
import { asset, BRAND_DIR, CATEGORY_NAV } from './config.js';
import { ICON as SVGICON } from './icons.js';
import * as S from './store.js';
import { cartTips } from './dai.js';

export const money = (v) =>
  v == null ? '—' : 'R$ ' + Number(v).toFixed(2).replace('.', ',');

export const esc = (s) =>
  (s == null ? '' : String(s)).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const img = (p, cls = '') =>
  p ? `<img class="${cls}" src="${esc(asset(p))}" alt="" loading="lazy">`
    : `<div class="${cls} noimg">sem imagem</div>`;

export const norm = (s) =>
  (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const go = (hash) => { location.hash = hash; };

/* ---------------- toast ---------------- */
export function toast(msg, kind = 'ok') {
  const wrap = document.getElementById('toastWrap');
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.innerHTML = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
}

/* ---------------- header ---------------- */
const ICON = {
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
  orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.6 3.5 7v10L12 21.4 20.5 17V7L12 2.6z"/><path d="M3.7 7 12 11.4 20.3 7"/><path d="M12 11.4V21.4"/><path d="M16.2 4.7 7.8 9.2"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6.2 8h11.6l-.9 11.2a1.6 1.6 0 0 1-1.6 1.5H8.7a1.6 1.6 0 0 1-1.6-1.5L6.2 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
};

export function renderHeader() {
  const h = document.getElementById('siteHeader');
  const user = S.getUser();
  const acc = user
    ? `<a class="hd-acc" href="#/conta"><span class="hd-ic">${ICON.user}</span><span class="hd-acc-t"><small>Olá,</small><b>${esc(user.firstName)}</b></span></a>`
    : `<a class="hd-acc" href="#/login"><span class="hd-ic">${ICON.user}</span><span class="hd-acc-t"><small>Entrar</small><b>Minha conta</b></span></a>`;

  h.innerHTML = `
    <div class="hd-top wrap">
      <a class="hd-logo" href="#/" aria-label="Dailus início">
        <img src="${esc(asset(BRAND_DIR + 'logo_da_dailus.png'))}" alt="Dailus">
      </a>
      <form class="hd-search" id="hdSearch" role="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input id="hdSearchInput" type="search" placeholder="Buscar batom, base, esmalte…" autocomplete="off">
      </form>
      <div class="hd-actions">
        ${acc}
        <a class="hd-acc" href="#/pedidos"><span class="hd-ic">${ICON.orders}</span><span class="hd-acc-t"><small>Acompanhar</small><b>Pedidos</b></span></a>
        <button class="hd-cart" id="hdCart" aria-label="Abrir sacola">
          <span class="hd-ic">${ICON.bag}</span><span class="hd-cart-c" id="hdCartCount">0</span>
        </button>
      </div>
    </div>
    <nav class="hd-nav">
      <div class="wrap hd-nav-in">
        <a href="#/">Início</a>
        <a href="#/catalogo">Todos os produtos</a>
        ${CATEGORY_NAV.slice(0, 5).map((c) => `<a href="#/catalogo?bucket=${encodeURIComponent(c.bucket)}">${esc(c.label)}</a>`).join('')}
        <a class="hd-nav-dai" href="#" id="hdNavDai"><span class="hd-nav-dai-ic">${SVGICON.wand}</span>Provador da Dai</a>
        <a class="hd-nav-sale" href="#/campanha/ultima-chamada">Ofertas</a>
      </div>
    </nav>`;

  document.getElementById('hdCart').onclick = openCart;
  document.getElementById('hdNavDai').onclick = (e) => { e.preventDefault(); window.dispatchEvent(new Event('dai:advisor')); };
  document.getElementById('hdSearch').onsubmit = (e) => {
    e.preventDefault();
    const q = document.getElementById('hdSearchInput').value.trim();
    go('#/catalogo?q=' + encodeURIComponent(q));
  };
  updateCartCount();
}

export function updateCartCount() {
  const n = S.cartCount();
  const badge = document.getElementById('hdCartCount');
  if (badge) { badge.textContent = n; badge.classList.toggle('has', n > 0); }
}

/* ---------------- footer ---------------- */
export function renderFooter() {
  const f = document.getElementById('siteFooter');
  f.innerHTML = `
    <div class="wrap ftr-grid">
      <div>
        <img class="ftr-logo" src="${esc(asset(BRAND_DIR + 'logo_da_dailus.png'))}" alt="Dailus">
        <p>Maquiagem e skincare que cabem na vida real. Cor, cuidado e atitude para todas as brasileiras.</p>
      </div>
      <div><h4>Institucional</h4><a href="#/">Quem somos</a><a href="#/campanha/fix-tudo">Novidades</a><a href="#/catalogo">Catálogo</a></div>
      <div><h4>Ajuda</h4><a href="#/pedidos">Meus pedidos</a><a href="#/pedidos">Rastrear compra</a><a href="#/login">Minha conta</a></div>
      <div><h4>Atendimento</h4><p>Seg a sex, 9h às 18h<br>oi@dailus.com.br</p></div>
    </div>
    <div class="ftr-bar wrap">Demonstração construída pela <b>Nexia</b> · catálogo real Dailus · usuário e pedidos simulados · ${new Date().getFullYear()}</div>`;
}

/* ---------------- carrinho (drawer) ---------------- */
export function openCart() {
  renderCart();
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('drawerBack').classList.add('open');
}
export function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('drawerBack').classList.remove('open');
}

export function renderCart() {
  const d = document.getElementById('cartDrawer');
  const items = S.getCart();
  const sub = S.cartSubtotal();
  const freeAt = 150;
  const missing = Math.max(0, freeAt - sub);
  const bar = Math.min(100, (sub / freeAt) * 100);

  const tips = items.length ? cartTips(items) : [];
  const tipsHtml = tips.length ? `
    <div class="cd-tips">
      <div class="cd-tips-hd"><span class="cd-tips-av">💄</span> A Dai sugere</div>
      ${tips.map((t) => `
        <div class="cd-tip">
          <p>${t.txt}</p>
          ${t.product ? `<button class="cd-tip-add" data-tip-add="${esc(t.product.handle)}">＋ ${esc(t.product.title)} · ${money(t.product.price)}</button>` : ''}
        </div>`).join('')}
    </div>` : '';

  const rows = items.length
    ? items.map((i) => `
      <div class="cd-item" data-key="${esc(i.key)}">
        ${img(i.image, 'cd-img')}
        <div class="cd-info">
          <a class="cd-title" href="#/produto/${esc(i.handle)}">${esc(i.title)}</a>
          ${i.variant ? `<span class="cd-var">${esc(i.variant)}</span>` : ''}
          <div class="cd-qty">
            <button class="qd" data-act="dec">−</button>
            <span>${i.qty}</span>
            <button class="qd" data-act="inc">+</button>
            <button class="cd-rm" data-act="rm">remover</button>
          </div>
        </div>
        <div class="cd-price">${money(i.price * i.qty)}</div>
      </div>`).join('')
    : `<div class="cd-empty"><span>🛍️</span><p>Sua sacola está vazia.</p><a class="btn btn-primary" href="#/catalogo" id="cdShop">Ver produtos</a></div>`;

  d.innerHTML = `
    <div class="cd-head"><b>Minha sacola</b><button class="cd-close" id="cdClose">✕</button></div>
    ${items.length ? `<div class="cd-ship ${missing === 0 ? 'ok' : ''}">
        ${missing === 0 ? '🎉 Você ganhou <b>frete grátis</b>!' : `Faltam <b>${money(missing)}</b> para <b>frete grátis</b>`}
        <div class="cd-bar"><i style="width:${bar}%"></i></div>
      </div>` : ''}
    <div class="cd-list">${rows}</div>
    ${tipsHtml}
    ${items.length ? `<div class="cd-foot">
        <div class="cd-sub"><span>Subtotal</span><b>${money(sub)}</b></div>
        <a class="btn btn-primary btn-block" href="#/checkout" id="cdCheckout">Finalizar compra</a>
        <a class="cd-cont" href="#/catalogo" id="cdCont">Continuar comprando</a>
      </div>` : ''}`;

  d.querySelector('#cdClose').onclick = closeCart;
  const cont = d.querySelector('#cdCont'); if (cont) cont.onclick = closeCart;
  const chk = d.querySelector('#cdCheckout'); if (chk) chk.onclick = closeCart;
  const shop = d.querySelector('#cdShop'); if (shop) shop.onclick = closeCart;

  d.querySelectorAll('[data-tip-add]').forEach((b) => {
    b.onclick = () => {
      const p = S.getProduct(b.getAttribute('data-tip-add'));
      if (p) { S.addToCart(p, null, 1); toast('✓ <b>' + esc(p.title) + '</b> na sacola'); }
    };
  });

  d.querySelectorAll('.cd-item').forEach((row) => {
    const key = row.getAttribute('data-key');
    row.querySelectorAll('[data-act]').forEach((b) => {
      b.onclick = () => {
        const act = b.getAttribute('data-act');
        const it = S.getCart().find((x) => x.key === key);
        if (act === 'inc') S.setQty(key, it.qty + 1);
        else if (act === 'dec') S.setQty(key, it.qty - 1);
        else if (act === 'rm') S.removeFromCart(key);
      };
    });
  });
}
