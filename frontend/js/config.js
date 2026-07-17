/* =====================================================================
   Configuração da loja demonstrativa Dailus (Nexia)
   - Reaproveita o catálogo já existente (catalog.json) e as imagens em /data.
   - Nada é duplicado: apenas referenciamos os arquivos do repositório.
   ===================================================================== */

import { ICON } from './icons.js';

// prefixo até a raiz do repositório (a loja é servida a partir de /frontend)
export const REPO = '../';

// catálogo consolidado já gerado por backend/build_explorer.py
export const CATALOG_URL = REPO + 'proposta-dailus/proposta/data/catalog.json';

// resolve um caminho de asset relativo à raiz do repo (ou mantém URLs remotas)
export const asset = (p) => (/^https?:/.test(p || '') ? p : REPO + p);

export const BANNERS_DIR = 'data/site/banners/';
export const LIFESTYLE_DIR = 'data/site/lifestyle/';
export const BRAND_DIR = 'data/site/brand/';

// chaves de persistência (localStorage)
export const LS = {
  cart: 'dailus_cart_v1',
  session: 'dailus_session_v1',
  orders: 'dailus_orders_v1',
};

/* ---- Campanhas: cada banner vira uma landing filtrando o catálogo real ---- */
export const CAMPAIGNS = [
  {
    id: 'fix-tudo',
    banner: 'DESK-GEL-FIX-TUDO.png',
    tag: 'Lançamento',
    title: 'Linha Fix Tudo',
    subtitle: 'Bruma, primer e blindagem que seguram a make o dia inteiro.',
    filter: { q: 'fix tudo' },
    accent: '#E4004B',
  },
  {
    id: 'batom-liquido',
    banner: 'DESK-BATOM-LIQUIDO-NOVAS-CORES.gif',
    tag: 'Novas cores',
    title: 'Batom Líquido — Novas Cores',
    subtitle: 'Cor intensa, toque aveludado e altíssima fixação.',
    filter: { q: 'batom', bucket: 'Lábios' },
    accent: '#EC5A78',
  },
  {
    id: 'sweet-skin',
    banner: 'DESK-SWEET-SKIN-NOVOS-SABORES.gif',
    tag: 'Novos sabores',
    title: 'Sweet Skin',
    subtitle: 'Skincare gostoso de usar, com aromas irresistíveis.',
    filter: { linha: 'SWEET SKIN' },
    accent: '#FF808B',
  },
  {
    id: 'top-chrome',
    banner: 'DESK-TOP-CHROME.png',
    tag: 'Efeito metalizado',
    title: 'Top Chrome',
    subtitle: 'Unhas espelhadas com o acabamento chrome do momento.',
    filter: { q: 'chrome', bucket: 'Esmaltes e unhas' },
    accent: '#8A1538',
  },
  {
    id: 'po-translucido',
    banner: 'DESKTOP-PO-TRANSLUCIDO.png',
    tag: 'Best-seller',
    title: 'Pó Translúcido',
    subtitle: 'Selagem impecável, efeito soft matte sem ressecar.',
    filter: { q: 'translucido', bucket: 'Base e rosto' },
    accent: '#C8801A',
  },
  {
    id: 'quarteto-sobrancelha',
    banner: 'DESKTOP-QUARTETO-SOBRANCELHA.png',
    tag: 'Sobrancelha perfeita',
    title: 'Quarteto de Sobrancelha',
    subtitle: 'Pó, cera e pinça: sobrancelhas definidas em minutos.',
    filter: { q: 'sobrancelha', bucket: 'Sobrancelha' },
    accent: '#7A123F',
  },
  {
    id: 'ultima-chamada',
    banner: 'DESK-ULTIMA-CHAMADA-01_1.png',
    tag: 'Últimas unidades',
    title: 'Última Chamada',
    subtitle: 'Preços especiais enquanto durarem os estoques.',
    filter: { onSale: true },
    accent: '#E4004B',
  },
];

/* ---- Usuário simulado (demonstração de conta logada) ---- */
export const DEMO_USER = {
  name: 'Marina Duarte',
  firstName: 'Marina',
  email: 'marina.demo@dailus.com.br',
  phone: '(11) 98888-1234',
  cpf: '123.•••.•••-09',
  since: '2024',
  address: {
    label: 'Casa',
    street: 'Rua das Acácias, 245 — Apto 72',
    district: 'Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
    zip: '05445-020',
  },
};

// categorias em destaque na home (buckets reais do catálogo)
export const CATEGORY_NAV = [
  { bucket: 'Lábios', icon: ICON.lips, label: 'Lábios' },
  { bucket: 'Base e rosto', icon: ICON.face, label: 'Rosto & Base' },
  { bucket: 'Olhos', icon: ICON.eye, label: 'Olhos' },
  { bucket: 'Blush e bronzer', icon: ICON.blush, label: 'Blush' },
  { bucket: 'Sobrancelha', icon: ICON.brow, label: 'Sobrancelha' },
  { bucket: 'Esmaltes e unhas', icon: ICON.nails, label: 'Unhas' },
  { bucket: 'Corpo e fragrância', icon: ICON.body, label: 'Corpo' },
];
