/* Conta — perfil do usuário simulado, endereço e histórico de pedidos */
import { money, esc, go, toast } from '../ui.js';
import * as S from '../store.js';
import { orderRow } from './track.js';

export function renderAccount(app) {
  const user = S.getUser();
  if (!user) { go('#/login'); return; }
  const orders = S.getOrders();
  const spent = orders.reduce((s, o) => s + o.total, 0);

  app.innerHTML = `
  <div class="wrap account">
    <nav class="crumbs"><a href="#/">Início</a> / <span>Minha conta</span></nav>
    <div class="acc-head">
      <div class="acc-avatar">${esc(user.firstName[0])}</div>
      <div>
        <h1>Olá, ${esc(user.firstName)} 👋</h1>
        <p>Cliente desde ${esc(user.since)} · ${esc(user.email)}</p>
      </div>
      <button class="btn btn-ghost acc-logout" id="accLogout">Sair</button>
    </div>

    <div class="acc-stats">
      <div><b>${orders.length}</b><span>pedidos</span></div>
      <div><b>${money(spent)}</b><span>total comprado</span></div>
      <div><b>★ ${(spent > 300 ? 'Diamante' : 'Ouro')}</b><span>nível Dai Club</span></div>
    </div>

    <div class="acc-grid">
      <section class="acc-card">
        <h2>Meus pedidos</h2>
        <div class="track-list">
          ${orders.length ? orders.map(orderRow).join('') : '<p class="dim">Você ainda não fez pedidos.</p>'}
        </div>
      </section>

      <aside class="acc-side">
        <section class="acc-card">
          <h2>Dados pessoais</h2>
          <div class="acc-field"><span>Nome</span><b>${esc(user.name)}</b></div>
          <div class="acc-field"><span>E-mail</span><b>${esc(user.email)}</b></div>
          <div class="acc-field"><span>Telefone</span><b>${esc(user.phone)}</b></div>
          <div class="acc-field"><span>CPF</span><b>${esc(user.cpf)}</b></div>
        </section>
        <section class="acc-card">
          <h2>Endereço salvo</h2>
          <div class="acc-addr">
            <span class="acc-addr-tag">${esc(user.address.label)}</span>
            <p>${esc(user.address.street)}<br>
            ${esc(user.address.district)} — ${esc(user.address.city)}/${esc(user.address.state)}<br>
            CEP ${esc(user.address.zip)}</p>
          </div>
        </section>
      </aside>
    </div>
  </div>`;

  document.getElementById('accLogout').onclick = () => {
    S.logout();
    toast('Você saiu da conta.');
    go('#/');
  };
}
