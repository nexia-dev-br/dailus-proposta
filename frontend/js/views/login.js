/* Login — autenticação simulada (usuário único de demonstração) */
import { asset, BRAND_DIR, DEMO_USER } from '../config.js';
import { esc, toast, go } from '../ui.js';
import * as S from '../store.js';

export function renderLogin(app) {
  if (S.isLoggedIn()) { go('#/conta'); return; }

  app.innerHTML = `
  <section class="auth wrap">
    <div class="auth-card">
      <img class="auth-logo" src="${esc(asset(BRAND_DIR + 'logo_da_dailus.png'))}" alt="Dailus">
      <h1>Entrar na minha conta</h1>
      <p class="auth-sub">Acesse para acompanhar pedidos, salvar endereços e comprar mais rápido.</p>

      <form id="loginForm" class="auth-form">
        <label>E-mail
          <input type="email" id="loginEmail" value="${esc(DEMO_USER.email)}" required>
        </label>
        <label>Senha
          <input type="password" id="loginPass" value="demo1234" required>
        </label>
        <button class="btn btn-primary btn-block" type="submit">Entrar</button>
      </form>

      <div class="auth-demo">
        <span>Demonstração</span>
        <button class="btn btn-dark btn-block" id="demoLogin">Entrar como ${esc(DEMO_USER.firstName)} (conta demo)</button>
        <small>Conta simulada com histórico de pedidos e endereço salvos para mostrar a experiência completa.</small>
      </div>

      <p class="auth-alt">Não tem conta? <a href="#/login" id="noop">Criar agora</a> — nesta demo, qualquer login entra como ${esc(DEMO_USER.firstName)}.</p>
    </div>
  </section>`;

  const enter = () => {
    S.login();
    toast('✓ Bem-vinda, <b>' + esc(DEMO_USER.firstName) + '</b>!');
    go('#/conta');
  };
  document.getElementById('loginForm').onsubmit = (e) => { e.preventDefault(); enter(); };
  document.getElementById('demoLogin').onclick = enter;
  document.getElementById('noop').onclick = (e) => e.preventDefault();
}
