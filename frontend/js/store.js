/* =====================================================================
   Store — carregamento do catálogo + estado (carrinho, sessão, pedidos)
   Estado persiste em localStorage e emite eventos para a UI reagir.
   ===================================================================== */
import { CATALOG_URL, LS, DEMO_USER } from './config.js';

const bus = new EventTarget();
export const on = (evt, fn) => bus.addEventListener(evt, fn);
const emit = (evt, detail) => bus.dispatchEvent(new CustomEvent(evt, { detail }));

/* ---------- catálogo ---------- */
export const catalog = { loaded: false, summary: null, products: [], byHandle: new Map() };

export async function loadCatalog() {
  if (catalog.loaded) return catalog;
  const res = await fetch(CATALOG_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  catalog.summary = data.summary;
  // catálogo COMPLETO (mesma base do explorador): todos os produtos Dailus, incl. esgotados
  catalog.products = (data.products || []).filter((p) => p.price != null);
  catalog.products.forEach((p) => catalog.byHandle.set(p.handle, p));
  catalog.loaded = true;
  return catalog;
}

export const getProduct = (handle) => catalog.byHandle.get(handle);

// disponível para compra (com estoque e preço) — usado nas vitrines/recomendações
export const isSellable = (p) => p.available !== false && p.price != null;
export const sellable = () => catalog.products.filter(isSellable);

// popularidade -> score de ordenação padrão
export const popScore = (p) => (p.popularidade && p.popularidade.score) || 0;
export const bestRank = (p) => (p.popularidade && p.popularidade.bestseller_rank) || null;

export function bestSellers(limit = 12) {
  return sellable()
    .filter((p) => bestRank(p))
    .sort((a, b) => bestRank(a) - bestRank(b))
    .slice(0, limit);
}

export function onSale(limit = 40) {
  return sellable()
    .filter((p) => p.compare_at && Number(p.compare_at) > Number(p.price))
    .sort((a, b) => popScore(b) - popScore(a))
    .slice(0, limit);
}

// preço "de" simulado quando não há compare_at, para dar sensação de vitrine
export function listPrice(p) {
  if (p.compare_at && Number(p.compare_at) > Number(p.price)) return Number(p.compare_at);
  return null;
}

/* ---------- utils localStorage ---------- */
const read = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* ---------- carrinho ---------- */
let cart = read(LS.cart, []); // [{handle, title, price, image, variant, qty}]

export const getCart = () => cart;
export const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

function persistCart() { write(LS.cart, cart); emit('cart'); }

export function addToCart(product, variant = null, qty = 1) {
  const key = product.handle + '::' + (variant || '');
  const found = cart.find((i) => i.key === key);
  if (found) found.qty += qty;
  else cart.push({
    key,
    handle: product.handle,
    title: product.title,
    price: Number(product.price),
    image: (product.images && product.images[0]) || null,
    variant,
    qty,
  });
  persistCart();
}

export function setQty(key, qty) {
  const it = cart.find((i) => i.key === key);
  if (!it) return;
  it.qty = Math.max(1, qty);
  persistCart();
}
export function removeFromCart(key) { cart = cart.filter((i) => i.key !== key); persistCart(); }
export function clearCart() { cart = []; persistCart(); }

/* ---------- sessão / login (usuário simulado) ---------- */
let session = read(LS.session, null);
export const getUser = () => session;
export const isLoggedIn = () => !!session;

export function login() { session = { ...DEMO_USER }; write(LS.session, session); ensureSeedOrders(); emit('session'); return session; }
export function logout() { session = null; localStorage.removeItem(LS.session); emit('session'); }

/* ---------- pedidos ---------- */
let orders = read(LS.orders, null);

const STATUS_FLOW = ['Pedido recebido', 'Pagamento aprovado', 'Em separação', 'Enviado', 'Entregue'];
export const statusFlow = () => STATUS_FLOW.slice();

function makeOrderNumber() {
  return 'DLS-' + Math.floor(100000 + Math.random() * 899999);
}
function daysAgoISO(d) { const t = new Date(); t.setDate(t.getDate() - d); return t.toISOString(); }
function trackingCode() {
  const L = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return L() + L() + Math.floor(100000000 + Math.random() * 899999999) + 'BR';
}

// cria os 2 pedidos históricos da Marina a partir de produtos reais do catálogo
function seedOrders() {
  const pick = (h) => getProduct(h);
  const addr = DEMO_USER.address;
  const build = (num, daysAgo, statusIdx, handles) => {
    const items = handles
      .map((h) => pick(h))
      .filter(Boolean)
      .map((p) => ({ handle: p.handle, title: p.title, price: Number(p.price), image: p.images?.[0] || null, variant: null, qty: 1 }));
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal >= 150 ? 0 : 19.9;
    return {
      number: num,
      createdAt: daysAgoISO(daysAgo),
      status: STATUS_FLOW[statusIdx],
      statusIdx,
      items,
      subtotal,
      discount: 0,
      shipping,
      total: subtotal + shipping,
      payment: { method: 'Pix', label: 'Pix à vista' },
      shippingMethod: { label: 'Sedex', eta: '2 a 4 dias úteis' },
      address: { ...addr, name: DEMO_USER.name },
      tracking: statusIdx >= 3 ? trackingCode() : null,
      email: DEMO_USER.email,
    };
  };
  return [
    build('DLS-874512', 26, 4, ['bruma-facial-fix-tudo', 'blush-iluminador-holo-rose', 'esmalte-top-coat-glass']),
    build('DLS-901337', 5, 3, ['sombra-liquida-eye-paint-velvet-black', 'cleasing-balm-sweet-skin']),
  ];
}

function ensureSeedOrders() {
  if (orders === null) { orders = seedOrders(); write(LS.orders, orders); emit('orders'); }
}

export function getOrders() { return orders || []; }
export function getOrder(number) { return (orders || []).find((o) => o.number === number) || null; }

// consulta pública: número + email/cpf (aceita e-mail do demo ou qualquer um dos pedidos)
export function findOrder(number, contact) {
  const o = getOrder((number || '').trim().toUpperCase());
  if (!o) return null;
  const c = (contact || '').trim().toLowerCase();
  if (!c) return o;
  const match = o.email.toLowerCase() === c || c.replace(/\D/g, '') === '12300000009' || c === DEMO_USER.email;
  return match ? o : null;
}

export function placeOrder({ items, subtotal, discount, shipping, total, payment, shippingMethod, address, email }) {
  ensureSeedOrders();
  const order = {
    number: makeOrderNumber(),
    createdAt: new Date().toISOString(),
    status: STATUS_FLOW[1],
    statusIdx: 1,
    items: items.map((i) => ({ ...i })),
    subtotal, discount, shipping, total,
    payment, shippingMethod, address, email,
    tracking: null,
  };
  orders = [order, ...(orders || [])];
  write(LS.orders, orders);
  emit('orders');
  return order;
}
