/* Detalhe do pedido — timeline de status, itens, totais, entrega e pagamento */
import { asset } from '../config.js';
import { money, img, esc } from '../ui.js';
import * as S from '../store.js';
import { statusClass } from './track.js';

const fmtDateTime = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export function renderOrder(app, number, query = {}) {
  const o = S.getOrder(number);
  if (!o) {
    app.innerHTML = `<div class="wrap page-404"><h1>Pedido não encontrado</h1>
      <a class="btn btn-primary" href="#/pedidos">Buscar pedido</a></div>`;
    return;
  }

  const flow = S.statusFlow();
  const success = query.success === '1';

  app.innerHTML = `
  <div class="wrap order">
    <nav class="crumbs"><a href="#/">Início</a> / <a href="#/pedidos">Pedidos</a> / <span>${esc(o.number)}</span></nav>

    ${success ? `<div class="order-success">
      <div class="os-ic">✓</div>
      <div><h1>Pedido confirmado!</h1><p>Enviamos a confirmação para <b>${esc(o.email)}</b>. Acompanhe o status abaixo.</p></div>
    </div>` : `<div class="order-title"><h1>Pedido ${esc(o.number)}</h1>
      <span class="status-tag ${statusClass(o.statusIdx)}">${esc(o.status)}</span></div>`}

    <p class="order-date">Realizado em ${fmtDateTime(o.createdAt)}</p>

    <section class="order-timeline">
      ${flow.map((s, i) => `
        <div class="tl-step ${i <= o.statusIdx ? 'done' : ''} ${i === o.statusIdx ? 'current' : ''}">
          <span class="tl-dot">${i < o.statusIdx ? '✓' : i + 1}</span>
          <span class="tl-lbl">${esc(s)}</span>
        </div>`).join('<div class="tl-line"></div>')}
    </section>

    ${o.tracking ? `<div class="order-track">📦 Código de rastreio: <b>${esc(o.tracking)}</b> · previsão de entrega em ${esc(o.shippingMethod?.eta || '3 a 5 dias úteis')}</div>` : ''}

    <div class="order-grid">
      <section class="order-items">
        <h2>Itens (${o.items.length})</h2>
        ${o.items.map((i) => `
          <div class="oi-row">
            <a href="#/produto/${esc(i.handle)}">${img(i.image, 'oi-img')}</a>
            <div class="oi-info">
              <a href="#/produto/${esc(i.handle)}">${esc(i.title)}</a>
              ${i.variant ? `<span>${esc(i.variant)}</span>` : ''}
              <span class="dim">Qtd: ${i.qty}</span>
            </div>
            <div class="oi-price">${money(i.price * i.qty)}</div>
          </div>`).join('')}
      </section>

      <aside class="order-aside">
        <section class="order-card">
          <h3>Resumo</h3>
          <div class="sum-row"><span>Subtotal</span><b>${money(o.subtotal)}</b></div>
          ${o.discount ? `<div class="sum-row disc"><span>Desconto</span><b>- ${money(o.discount)}</b></div>` : ''}
          <div class="sum-row"><span>Frete (${esc(o.shippingMethod?.label || 'Padrão')})</span><b>${o.shipping ? money(o.shipping) : 'Grátis'}</b></div>
          <div class="sum-row total"><span>Total</span><b>${money(o.total)}</b></div>
        </section>

        <section class="order-card">
          <h3>Entrega</h3>
          <p>${esc(o.address?.name || '')}<br>
          ${esc(o.address?.street || '')}<br>
          ${esc(o.address?.district || '')} — ${esc(o.address?.city || '')}/${esc(o.address?.state || '')}<br>
          CEP ${esc(o.address?.zip || '')}</p>
        </section>

        <section class="order-card">
          <h3>Pagamento</h3>
          <p>${esc(o.payment?.label || o.payment?.method || '—')}</p>
        </section>
      </aside>
    </div>

    <div class="order-actions">
      <a class="btn btn-dark" href="#/catalogo">Comprar novamente</a>
      <a class="btn btn-ghost" href="#/pedidos">Voltar aos pedidos</a>
    </div>
  </div>`;
}
