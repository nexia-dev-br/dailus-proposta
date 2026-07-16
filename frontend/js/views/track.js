/* Consulta de pedidos — busca pública por número + contato, e lista do usuário */
import { asset } from '../config.js';
import { money, esc, go, toast } from '../ui.js';
import * as S from '../store.js';

export function statusClass(idx) {
  return ['s-recv', 's-pay', 's-sep', 's-ship', 's-done'][idx] || 's-recv';
}
const fmtDate = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

// linha de pedido reutilizada (conta + resultado da busca)
export function orderRow(o) {
  return `
  <a class="order-row" href="#/pedido/${esc(o.number)}">
    <div class="or-thumbs">
      ${o.items.slice(0, 3).map((i) => i.image ? `<img src="${esc(asset(i.image))}" alt="">` : '').join('')}
      ${o.items.length > 3 ? `<span class="or-more">+${o.items.length - 3}</span>` : ''}
    </div>
    <div class="or-info">
      <b>Pedido ${esc(o.number)}</b>
      <span>${fmtDate(o.createdAt)} · ${o.items.length} ${o.items.length === 1 ? 'item' : 'itens'}</span>
    </div>
    <span class="status-tag ${statusClass(o.statusIdx)}">${esc(o.status)}</span>
    <div class="or-total">${money(o.total)}<small>ver detalhes →</small></div>
  </a>`;
}

export function renderTrack(app, query = {}) {
  const user = S.getUser();
  const myOrders = user ? S.getOrders() : [];

  app.innerHTML = `
  <div class="wrap track">
    <nav class="crumbs"><a href="#/">Início</a> / <span>Meus pedidos</span></nav>
    <h1>Acompanhar pedido</h1>
    <p class="track-sub">Consulte o status informando o número do pedido e o e-mail ou CPF da compra.</p>

    <form class="track-form" id="trackForm">
      <div class="tf-row">
        <label>Número do pedido
          <input id="tfNum" type="text" placeholder="DLS-000000" value="${esc(query.n || '')}" required>
        </label>
        <label>E-mail ou CPF
          <input id="tfContact" type="text" placeholder="seu@email.com">
        </label>
      </div>
      <button class="btn btn-primary" type="submit">Buscar pedido</button>
      <p class="track-hint">Dica: experimente <b>DLS-874512</b> com o e-mail <b>${esc(S.getUser()?.email || 'marina.demo@dailus.com.br')}</b>.</p>
    </form>

    <div id="trackResult"></div>

    ${user ? `<section class="track-mine">
      <h2>Seus pedidos recentes</h2>
      <div class="track-list">${myOrders.length ? myOrders.map(orderRow).join('') : '<p class="dim">Nenhum pedido ainda.</p>'}</div>
    </section>` : `<div class="track-cta">
      <p><b>É cliente?</b> Entre na sua conta para ver todo o histórico automaticamente.</p>
      <a class="btn btn-dark" href="#/login">Entrar na minha conta</a>
    </div>`}
  </div>`;

  const result = document.getElementById('trackResult');
  document.getElementById('trackForm').onsubmit = (e) => {
    e.preventDefault();
    const num = document.getElementById('tfNum').value;
    const contact = document.getElementById('tfContact').value;
    const o = S.findOrder(num, contact);
    if (o) {
      result.innerHTML = `<div class="track-found"><p>Pedido encontrado 🎉</p>${orderRow(o)}</div>`;
    } else {
      result.innerHTML = `<div class="track-none">Não encontramos esse pedido. Confira o número e o contato informado.</div>`;
    }
  };

  // busca automática se veio número na URL
  if (query.n) {
    const o = S.findOrder(query.n, S.getUser()?.email || '');
    if (o) go('#/pedido/' + o.number);
  }
}
