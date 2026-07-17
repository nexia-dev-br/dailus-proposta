/* =====================================================================
   Bootstrap da loja Dailus (demonstração Nexify)
   ===================================================================== */
import * as S from './store.js';
import * as UI from './ui.js';
import { route, setNotFound, startRouter, resolve } from './router.js';

import { renderHome } from './views/home.js';
import { renderCatalog } from './views/catalog.js';
import { renderProduct } from './views/product.js';
import { renderCampaign } from './views/campaign.js';
import { renderCheckout } from './views/checkout.js';
import { renderLogin } from './views/login.js';
import { renderAccount } from './views/account.js';
import { renderTrack } from './views/track.js';
import { renderOrder } from './views/order.js';
import { initDai } from './views/dai-chat.js';

const app = document.getElementById('app');

route('/', () => renderHome(app));
route('/catalogo', ({ query }) => renderCatalog(app, query));
route('/produto/:handle', ({ params }) => renderProduct(app, params.handle));
route('/campanha/:id', ({ params }) => renderCampaign(app, params.id));
route('/checkout', () => renderCheckout(app));
route('/login', () => renderLogin(app));
route('/conta', () => renderAccount(app));
route('/pedidos', ({ query }) => renderTrack(app, query));
route('/pedido/:number', ({ params, query }) => renderOrder(app, params.number, query));

setNotFound(() => {
  app.innerHTML = `<div class="wrap page-404">
    <h1>Página não encontrada</h1>
    <p>O endereço acessado não existe nesta demonstração.</p>
    <a class="btn btn-primary" href="#/">Voltar à home</a></div>`;
});

// reações de estado -> UI
S.on('cart', () => { UI.updateCartCount(); UI.renderCart(); });
S.on('session', () => { UI.renderHeader(); });

document.getElementById('drawerBack').onclick = UI.closeCart;
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') UI.closeCart(); });

(async function init() {
  UI.renderFooter();
  try {
    await S.loadCatalog();
    UI.renderHeader();
    initDai();
    startRouter();
  } catch (e) {
    app.innerHTML = `<div class="wrap page-404">
      <h1>Não consegui carregar o catálogo</h1>
      <p>Sirva o projeto por HTTP a partir da raiz do repositório.<br>
      Ex.: <code>npm run shop</code> ou <code>python3 -m http.server</code> na raiz.</p>
      <p style="opacity:.6">Detalhe técnico: ${UI.esc(e.message)}</p></div>`;
  }
})();
