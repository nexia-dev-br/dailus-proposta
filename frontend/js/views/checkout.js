/* Checkout — contato, endereço, frete e pagamento (simulados) -> cria pedido */
import { money, img, esc, toast, go } from '../ui.js';
import * as S from '../store.js';

const SHIPPING = [
  { id: 'pac', label: 'PAC', eta: '5 a 8 dias úteis', price: 12.9 },
  { id: 'sedex', label: 'Sedex', eta: '2 a 4 dias úteis', price: 24.9 },
  { id: 'retira', label: 'Retirar em loja', eta: 'pronto em 1 dia útil', price: 0 },
];
const FREE_FROM = 150;
const COUPONS = { DAI10: 0.10, BEMVINDA: 0.15 };

export function renderCheckout(app) {
  const items = S.getCart();
  if (!items.length) {
    app.innerHTML = `<div class="wrap page-404">
      <h1>Sua sacola está vazia</h1>
      <p>Adicione produtos para finalizar a compra.</p>
      <a class="btn btn-primary" href="#/catalogo">Ver produtos</a></div>`;
    return;
  }

  const user = S.getUser();
  const state = {
    shipping: 'sedex',
    payment: 'pix',
    coupon: null,
    discountRate: 0,
    installments: 1,
  };

  const a = user?.address || {};

  app.innerHTML = `
  <div class="wrap checkout">
    <nav class="crumbs"><a href="#/">Início</a> / <span>Checkout</span></nav>
    <h1>Finalizar compra</h1>

    <div class="ck-grid">
      <div class="ck-main">
        ${!user ? `<div class="ck-login-hint">Já é cliente? <a href="#/login">Entre</a> para preencher seus dados automaticamente.</div>` : ''}

        <section class="ck-block">
          <h2><span>1</span> Contato e entrega</h2>
          <div class="ck-fields">
            <label class="f2">Nome completo<input id="ckName" value="${esc(user?.name || '')}" placeholder="Seu nome"></label>
            <label class="f2">E-mail<input id="ckEmail" type="email" value="${esc(user?.email || '')}" placeholder="seu@email.com"></label>
            <label>CEP<input id="ckZip" value="${esc(a.zip || '')}" placeholder="00000-000"></label>
            <label>Telefone<input id="ckPhone" value="${esc(user?.phone || '')}" placeholder="(00) 00000-0000"></label>
            <label class="f2">Endereço<input id="ckStreet" value="${esc(a.street || '')}" placeholder="Rua, número, complemento"></label>
            <label>Bairro<input id="ckDistrict" value="${esc(a.district || '')}" placeholder="Bairro"></label>
            <label>Cidade<input id="ckCity" value="${esc(a.city || '')}" placeholder="Cidade"></label>
            <label class="fsm">UF<input id="ckState" value="${esc(a.state || '')}" placeholder="SP" maxlength="2"></label>
          </div>
        </section>

        <section class="ck-block">
          <h2><span>2</span> Frete</h2>
          <div class="ck-ship" id="ckShip">
            ${SHIPPING.map((s) => shipOption(s)).join('')}
          </div>
        </section>

        <section class="ck-block">
          <h2><span>3</span> Pagamento</h2>
          <div class="ck-pay" id="ckPay">
            <button class="ck-pm on" data-pm="pix"><b>Pix</b><span>10% de desconto · aprovação na hora</span></button>
            <button class="ck-pm" data-pm="card"><b>Cartão de crédito</b><span>até 6x sem juros</span></button>
            <button class="ck-pm" data-pm="boleto"><b>Boleto</b><span>vence em 2 dias úteis</span></button>
          </div>
          <div class="ck-pay-detail" id="ckPayDetail"></div>
        </section>
      </div>

      <aside class="ck-summary" id="ckSummary"></aside>
    </div>
  </div>`;

  const shipEl = document.getElementById('ckShip');
  const payEl = document.getElementById('ckPay');
  const payDetail = document.getElementById('ckPayDetail');

  function subtotal() { return S.cartSubtotal(); }
  function shipPrice() {
    const s = SHIPPING.find((x) => x.id === state.shipping);
    if (!s) return 0;
    if (s.id !== 'retira' && subtotal() >= FREE_FROM) return 0;
    return s.price;
  }
  function discount() {
    let d = subtotal() * state.discountRate;
    if (state.payment === 'pix') d += subtotal() * 0.10;
    return d;
  }
  function total() { return Math.max(0, subtotal() - discount() + shipPrice()); }

  function renderSummary() {
    const sub = subtotal(), ship = shipPrice(), disc = discount(), tot = total();
    document.getElementById('ckSummary').innerHTML = `
      <h2>Resumo</h2>
      <div class="ck-items">
        ${items.map((i) => `
          <div class="ck-item">
            ${img(i.image, 'ck-item-img')}
            <div class="ck-item-info"><b>${esc(i.title)}</b>${i.variant ? `<span>${esc(i.variant)}</span>` : ''}<span class="dim">Qtd: ${i.qty}</span></div>
            <span class="ck-item-price">${money(i.price * i.qty)}</span>
          </div>`).join('')}
      </div>
      <div class="ck-coupon">
        <input id="ckCoupon" placeholder="Cupom (ex: DAI10)" value="${esc(state.coupon || '')}">
        <button id="ckCouponBtn" class="btn btn-ghost">Aplicar</button>
      </div>
      <div class="ck-sum">
        <div class="sum-row"><span>Subtotal</span><b>${money(sub)}</b></div>
        ${disc ? `<div class="sum-row disc"><span>Descontos</span><b>- ${money(disc)}</b></div>` : ''}
        <div class="sum-row"><span>Frete</span><b>${ship ? money(ship) : 'Grátis'}</b></div>
        <div class="sum-row total"><span>Total</span><b>${money(tot)}</b></div>
        ${state.payment === 'card' ? `<div class="sum-inst">em até 6x de ${money(tot / 6)} sem juros</div>` : ''}
        ${state.payment === 'pix' ? `<div class="sum-inst">no Pix: <b>${money(tot)}</b> à vista</div>` : ''}
      </div>
      <button class="btn btn-primary btn-block ck-place" id="ckPlace">Concluir pedido · ${money(tot)}</button>
      <p class="ck-safe">🔒 Ambiente simulado — nenhuma cobrança real é feita.</p>`;

    document.getElementById('ckCouponBtn').onclick = applyCoupon;
    document.getElementById('ckPlace').onclick = place;
  }

  function applyCoupon() {
    const code = (document.getElementById('ckCoupon').value || '').trim().toUpperCase();
    if (COUPONS[code]) {
      state.coupon = code; state.discountRate = COUPONS[code];
      toast('✓ Cupom <b>' + esc(code) + '</b> aplicado');
    } else {
      state.coupon = code; state.discountRate = 0;
      toast('Cupom inválido', 'warn');
    }
    renderSummary();
  }

  function renderPayDetail() {
    if (state.payment === 'pix') payDetail.innerHTML = `<div class="pay-box">Escaneie o QR Code na próxima etapa. <b>10% de desconto</b> aplicado automaticamente.</div>`;
    else if (state.payment === 'card') payDetail.innerHTML = `
      <div class="pay-box pay-card">
        <label class="f2">Número do cartão<input placeholder="0000 0000 0000 0000"></label>
        <label>Validade<input placeholder="MM/AA"></label>
        <label>CVV<input placeholder="123"></label>
        <label class="f2">Parcelas
          <select id="ckInst">${[1,2,3,4,5,6].map((n)=>`<option value="${n}">${n}x de ${money(total()/n)} sem juros</option>`).join('')}</select>
        </label>
      </div>`;
    else payDetail.innerHTML = `<div class="pay-box">O boleto será gerado ao concluir o pedido. Prazo de compensação de até 2 dias úteis.</div>`;
  }

  shipEl.onclick = (e) => {
    const b = e.target.closest('.ck-shipopt'); if (!b) return;
    state.shipping = b.getAttribute('data-ship');
    [...shipEl.children].forEach((c) => c.classList.toggle('on', c === b));
    renderSummary();
  };
  payEl.onclick = (e) => {
    const b = e.target.closest('.ck-pm'); if (!b) return;
    state.payment = b.getAttribute('data-pm');
    [...payEl.children].forEach((c) => c.classList.toggle('on', c === b));
    renderPayDetail(); renderSummary();
  };

  function place() {
    const name = val('ckName'), email = val('ckEmail'), street = val('ckStreet');
    if (!name || !email || !street) { toast('Preencha nome, e-mail e endereço', 'warn'); return; }
    const s = SHIPPING.find((x) => x.id === state.shipping);
    const payLabels = { pix: 'Pix à vista (10% off)', card: 'Cartão de crédito', boleto: 'Boleto bancário' };
    const order = S.placeOrder({
      items: S.getCart(),
      subtotal: subtotal(),
      discount: discount(),
      shipping: shipPrice(),
      total: total(),
      payment: { method: state.payment, label: payLabels[state.payment] },
      shippingMethod: { label: s.label, eta: s.eta },
      address: { name, street, district: val('ckDistrict'), city: val('ckCity'), state: val('ckState'), zip: val('ckZip') },
      email,
    });
    S.clearCart();
    toast('🎉 Pedido <b>' + esc(order.number) + '</b> confirmado!');
    go('#/pedido/' + order.number + '?success=1');
  }

  // init
  renderPayDetail();
  renderSummary();
}

function shipOption(s) {
  return `<button class="ck-shipopt ${s.id === 'sedex' ? 'on' : ''}" data-ship="${s.id}">
    <span class="cks-radio"></span>
    <span class="cks-info"><b>${esc(s.label)}</b><span>${esc(s.eta)}</span></span>
    <span class="cks-price">${s.price ? money(s.price) : 'Grátis*'}</span>
  </button>`;
}

const val = (id) => (document.getElementById(id)?.value || '').trim();
