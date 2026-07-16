/* =====================================================================
   Dai — engine de venda consultiva (portado do explorador de catálogo)
   Provador guiado + motor de recomendação + NLU do chat (offline por regras)
   + IA local opcional (Ollama). Tudo sobre o catálogo real da Dailus.
   Sem DOM aqui: apenas lógica reutilizável pela UI.
   ===================================================================== */
import * as S from './store.js';
import { norm } from './ui.js';

const products = () => S.sellable(); // só vendáveis (com estoque + preço)
const pop = (p) => p.popularidade || null;
export const score = (p) => (p.popularidade && p.popularidade.score) || 0;

/* ---------- tom / acabamento a partir do nome ---------- */
const TONES = ['red velvet', 'baunilha', 'pistache', 'cookies', 'cookie', 'cappuccino', 'caramelo', 'chocolate', 'choco',
  'morango', 'cereja', 'amora', 'uva', 'melancia', 'limão', 'limao', 'menta', 'mocha', 'latte', 'bombom', 'brigadeiro',
  'nude', 'rosé', 'rose', 'marsala', 'rubi', 'vinho', 'vermelho', 'pink', 'coral', 'pêssego', 'pessego', 'bronze', 'holo', 'glitter', 'preto', 'marrom'];

export function toneOf(p) {
  const t = norm(p.title + ' ' + (p.tags || []).join(' '));
  for (const tone of TONES) if (t.includes(norm(tone))) return tone;
  return null;
}
const finishHas = (p, kw) => norm(p.title + ' ' + (p.tags || []).join(' ')).includes(norm(kw));
const toneIn = (t, list) => (t ? list.some((x) => norm(x) === norm(t)) : false);
const root = (t) => norm((t || '').split(/\s[–—-]\s|:/)[0]);

/* =====================================================================
   PROVADOR GUIADO — ocasião, tom de pele, idade, estilo, imagem -> look
   ===================================================================== */
export const OCC = [
  { k: 'dia', lab: 'Dia a dia', emoji: '☀️', tones: ['nude', 'rose', 'pessego', 'caramelo'], kw: ['bruma', 'bb', 'cc', 'protetor', 'gloss', 'lip oil'], dai: 'Pro dia a dia a pegada é leve e natural — pele fresquinha, um toque de cor e pronto 💛' },
  { k: 'trabalho', lab: 'Trabalho / reunião', emoji: '💼', tones: ['nude', 'rose', 'marrom', 'caramelo'], kw: ['matte', 'po', 'base', 'corretivo', 'sobrancelha'], dai: 'No trabalho, elegância discreta: pele uniforme, boca nude e sobrancelha alinhada ✨' },
  { k: 'balada', lab: 'Balada / night', emoji: '🌙', tones: ['vinho', 'cereja', 'vermelho', 'marsala', 'amora', 'preto'], kw: ['matte', 'glitter', 'iluminador', 'delineador', '12h', 'longa'], glam: 2, dai: 'Balada pede impacto que dura a noite toda: olhos marcados, boca poderosa e muito glow 🔥' },
  { k: 'formatura', lab: 'Baile de formatura', emoji: '🎓', tones: ['nude', 'rose', 'vinho', 'marsala', 'cereja'], kw: ['iluminador', 'cilios', '12h', 'longa', 'cobertura', 'matte', 'glitter'], glam: 2, dai: 'Formatura é O dia: make de longa duração, olhar de diva e uma boca que fica linda nas fotos 💖' },
  { k: 'casamento', lab: 'Casamento (convidada)', emoji: '💍', tones: ['nude', 'rose', 'pessego', 'marsala'], kw: ['iluminador', 'prova', 'longa', '12h', 'cilios'], glam: 1, dai: 'Convidada de casamento: sofisticada e à prova de emoção — nada de borrar na hora do buquê 🥹' },
  { k: 'junina', lab: 'Festa junina', emoji: '🤠', tones: ['morango', 'cereja', 'coral', 'pink', 'vermelho'], kw: ['blush', 'gloss', 'glitter', 'esmalte'], colorful: 2, dai: 'Arraiá é cor e alegria: bochecha rosada, boquinha vermelha e brilho pra dançar quadrilha 🌽' },
  { k: 'halloween', lab: 'Halloween', emoji: '🎃', tones: ['preto', 'vermelho', 'vinho', 'marrom', 'uva'], kw: ['delineador', 'preto', 'matte', 'esmalte', 'sombra', 'glitter'], dark: 2, dai: 'Halloween é hora de ousar: preto, vermelho sangue e um delineado afiado pra assustar (de linda) 🖤' },
  { k: 'encontro', lab: 'Encontro / date', emoji: '💘', tones: ['rose', 'cereja', 'pink', 'pessego'], kw: ['gloss', 'blush', 'iluminador', 'lip oil'], dai: 'Date pede aquele glow de quem tá feliz: blush, boca molhadinha e um brilho no olhar 😍' },
  { k: 'praia', lab: 'Praia / ar livre', emoji: '🏖️', tones: ['coral', 'pessego', 'morango', 'nude'], kw: ['bruma', 'prova', 'protetor', 'gloss', 'fluido'], colorful: 1, dai: 'Sol e mar: make à prova d’água, pele leve e um toque coral que combina com bronzeado 🌊' },
  { k: 'reveillon', lab: 'Réveillon', emoji: '🥂', tones: ['bronze', 'holo', 'glitter', 'nude', 'pink'], kw: ['glitter', 'iluminador', 'chrome', 'dourado', 'gold', 'metal'], glam: 2, dai: 'Réveillon é brilho: dourado, glitter e muito glow pra virar o ano cintilando ✨' },
  { k: 'ensaio', lab: 'Ensaio de fotos', emoji: '📸', tones: ['nude', 'rose', 'marrom', 'caramelo'], kw: ['cobertura', 'matte', 'po', 'contorno', 'iluminador', 'cilios'], glam: 1, dai: 'Ensaio pede pele impecável: alta cobertura, contorno e pó pra segurar sob a luz 📷' },
];
export const STYLES = [
  { k: 'natural', lab: 'Natural / clean', tones: ['nude', 'rose', 'pessego'], kw: ['bruma', 'bb', 'gloss', 'lip oil'], glam: -1 },
  { k: 'glam', lab: 'Glam / poderosa', tones: ['vinho', 'vermelho', 'cereja', 'marsala'], kw: ['iluminador', 'glitter', 'matte', 'delineador', 'cilios'], glam: 2 },
  { k: 'colorida', lab: 'Colorida / divertida', tones: ['pink', 'coral', 'morango', 'uva', 'melancia', 'holo'], kw: ['glitter', 'esmalte', 'sombra'], colorful: 2 },
  { k: 'dark', lab: 'Dark / editorial', tones: ['preto', 'vinho', 'marrom', 'uva'], kw: ['delineador', 'matte', 'preto', 'sombra'], dark: 2 },
  { k: 'romantica', lab: 'Romântica / delicada', tones: ['rose', 'pessego', 'nude', 'cereja'], kw: ['gloss', 'blush', 'iluminador'] },
];
export const IMAGES = [
  { k: 'poderosa', lab: 'Poderosa', tones: ['vermelho', 'vinho', 'marsala'], kw: ['matte', 'delineador', 'iluminador'], glam: 1 },
  { k: 'natural', lab: 'Natural', tones: ['nude', 'rose'], kw: ['bruma', 'gloss'], glam: -1 },
  { k: 'divertida', lab: 'Divertida', tones: ['pink', 'coral', 'morango'], kw: ['glitter', 'esmalte'], colorful: 1 },
  { k: 'elegante', lab: 'Elegante', tones: ['nude', 'marsala', 'rose'], kw: ['matte', 'iluminador'] },
  { k: 'sexy', lab: 'Sexy', tones: ['cereja', 'vermelho', 'vinho'], kw: ['gloss', 'iluminador'] },
  { k: 'fofa', lab: 'Fofa / romântica', tones: ['rose', 'pessego', 'pink'], kw: ['gloss', 'blush'] },
  { k: 'ousada', lab: 'Ousada', tones: ['preto', 'uva', 'holo', 'glitter'], kw: ['delineador', 'glitter'] },
];
export const SKIN = [
  { k: 'muito-clara', lab: 'Muito clara', bases: ['d1', 'd2', 'claro', 'marfim', 'porcelana'] },
  { k: 'clara', lab: 'Clara', bases: ['d2', 'd3', 'd4', 'claro', 'bege'] },
  { k: 'media', lab: 'Média', bases: ['d5', 'd6', 'd7', 'medio', 'bege'] },
  { k: 'morena', lab: 'Morena', bases: ['d8', 'd9', 'd10', 'moreno', 'caramelo', 'chocolate'] },
  { k: 'negra', lab: 'Negra / retinta', bases: ['d10', 'd11', 'd12', 'escuro', 'chocolate', 'cacau'] },
];
export const AGES = [{ k: 't1', lab: 'Até 20' }, { k: 't2', lab: '20–30' }, { k: 't3', lab: '30–45' }, { k: 't4', lab: '45+' }];

const DARK_T = ['preto', 'vinho', 'marrom', 'uva', 'marsala'];
const FUN_T = ['pink', 'coral', 'morango', 'uva', 'melancia', 'holo', 'vermelho', 'cereja'];

export const pickBy = (arr, k) => arr.find((o) => o.k === k) || null;

// pontua o quanto um produto combina com uma ocasião (usado no agrupamento do catálogo)
export function occScore(p, o) {
  let s = 0; const t = toneOf(p);
  if (toneIn(t, o.tones)) s += 3;
  o.kw.forEach((k) => { if (finishHas(p, k)) s += 1.2; });
  const pp = pop(p); if (pp) s += (pp.score || 0) / 60;
  return s;
}
// ocasiões em que o produto se encaixa (rótulos com emoji), para agrupar por ocasião
export function occasionsFor(p) {
  return OCC.filter((o) => occScore(p, o) >= 3).map((o) => `${o.emoji} ${o.lab}`);
}

function scoreBrief(p, b) {
  if (!p.price) return -1;
  const tones = [], kws = {};
  let glam = 0, dark = 0, colorful = 0;
  [b.occ, b.style, b.image].forEach((m) => {
    if (!m) return;
    (m.tones || []).forEach((t) => tones.push(t));
    (m.kw || []).forEach((k) => { kws[k] = 1; });
    glam += m.glam || 0; dark += m.dark || 0; colorful += m.colorful || 0;
  });
  let s = 0; const t = toneOf(p);
  if (toneIn(t, tones)) s += 3;
  Object.keys(kws).forEach((k) => { if (finishHas(p, k)) s += 1.2; });
  if (glam > 0 && (finishHas(p, 'iluminador') || finishHas(p, 'glitter') || finishHas(p, 'cilios') || finishHas(p, 'delineador') || finishHas(p, 'matte'))) s += 1.1 * Math.min(glam, 2);
  if (dark > 0 && toneIn(t, DARK_T)) s += 1.5 * Math.min(dark, 2);
  if (colorful > 0 && toneIn(t, FUN_T)) s += 1.3 * Math.min(colorful, 2);
  if (b.age === 't1' && (finishHas(p, 'gloss') || finishHas(p, 'glitter'))) s += 0.6;
  if (b.age === 't4' && finishHas(p, 'matte')) s += 0.6;
  const pp = pop(p); if (pp) s += (pp.score || 0) / 50;
  return s;
}
const baseMatchesSkin = (p, skin) => !skin || skin.bases.some((k) => norm(p.title).includes(norm(k)));

export function reasonFor(p, b) {
  const t = toneOf(p), bits = [], want = [];
  [b.occ, b.style, b.image].forEach((m) => (m && m.tones || []).forEach((x) => want.push(x)));
  if (toneIn(t, want)) bits.push('tom ' + t);
  if (finishHas(p, '12h') || finishHas(p, 'longa') || finishHas(p, 'prova')) bits.push('longa duração');
  else if (finishHas(p, 'iluminador') || finishHas(p, 'glitter')) bits.push('dá aquele glow');
  else if (finishHas(p, 'matte')) bits.push('acabamento matte');
  const pp = pop(p); if (pp && pp.bestseller_rank) bits.push('best-seller #' + pp.bestseller_rank);
  return bits.slice(0, 2).join(' · ') || 'combina com o que você descreveu';
}

export function buildLook(b) {
  const roles = [
    { bucket: 'Base e rosto', role: 'Rosto', base: true },
    { bucket: 'Olhos', role: 'Olhos' },
    { bucket: 'Sobrancelha', role: 'Sobrancelha' },
    { bucket: 'Blush e bronzer', role: 'Bochecha' },
    { bucket: 'Lábios', role: 'Boca' },
    { bucket: 'Esmaltes e unhas', role: 'Unhas' },
  ];
  if (b.occ && ['praia', 'reveillon', 'encontro'].includes(b.occ.k)) roles.push({ bucket: 'Corpo e fragrância', role: 'Corpo & aroma' });
  const used = {};
  return roles.map((r) => {
    let cand = products().filter((p) => p.bucket === r.bucket && !used[p.handle]);
    if (r.base) { const m = cand.filter((p) => baseMatchesSkin(p, b.skin)); if (m.length) cand = m; }
    cand = cand.map((p) => ({ p, s: scoreBrief(p, b) })).sort((a, c) => c.s - a.s);
    const pick = cand[0] && cand[0].p;
    if (pick) used[pick.handle] = 1;
    return { role: r.role, item: pick };
  }).filter((g) => g.item);
}

/* =====================================================================
   MOTOR DE RECOMENDAÇÃO (venda consultiva)
   ===================================================================== */
const COMPLEMENT = {
  'Lábios': ['Lábios', 'Base e rosto', 'Blush e bronzer'],
  'Base e rosto': ['Base e rosto', 'Blush e bronzer', 'Olhos'],
  'Blush e bronzer': ['Base e rosto', 'Blush e bronzer', 'Lábios'],
  'Olhos': ['Olhos', 'Sobrancelha', 'Lábios'],
  'Sobrancelha': ['Sobrancelha', 'Olhos'],
  'Esmaltes e unhas': ['Esmaltes e unhas'],
  'Corpo e fragrância': ['Corpo e fragrância'],
  'Outros': ['Base e rosto', 'Lábios'],
};
export const REGIONS = [['sp', 'São Paulo'], ['rj', 'Rio de Janeiro'], ['sul', 'Sul'], ['ne', 'Nordeste'], ['no', 'Norte / C.-Oeste'], ['mg', 'Minas Gerais']];

const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

export function alsoBought(p, n = 4) {
  const base = root(p.title), tb = toneOf(p), comp = COMPLEMENT[p.bucket] || [];
  const vp = (p.popularidade && p.popularidade.vitrines) || [];
  return products().filter((q) => q !== p).map((q) => {
    let s = 0;
    if (q.linha && p.linha && norm(q.linha) === norm(p.linha)) s += 2;
    const vq = (q.popularidade && q.popularidade.vitrines) || [];
    s += Math.min(vp.filter((x) => vq.includes(x)).length, 3) * 2;
    if (comp.includes(q.bucket)) s += 2;
    if (tb && toneOf(q) === tb) s += 2;
    s += score(q) / 40;
    if (p.price && q.price) { const r = q.price / p.price; if (r >= 0.4 && r <= 2.5) s += 1; }
    if (root(q.title) === base) s -= 3;
    return { q, s };
  }).sort((a, b) => b.s - a.s).slice(0, n).map((x) => x.q);
}

export function goesWith(p, n = 4) {
  const tb = toneOf(p);
  const comp = (COMPLEMENT[p.bucket] || []).filter((b) => b !== p.bucket);
  let pool = products().filter((q) => q !== p && comp.includes(q.bucket));
  if (pool.length < n) pool = pool.concat(products().filter((q) => q !== p && q.bucket === p.bucket && root(q.title) !== root(p.title)));
  const seen = {};
  return pool.map((q) => {
    let s = 0; if (tb && toneOf(q) === tb) s += 4; s += score(q) / 30;
    if (q.popularidade && q.popularidade.bestseller_rank) s += 1.5;
    return { q, s };
  }).sort((a, b) => b.s - a.s).filter((x) => { if (seen[x.q.handle]) return false; seen[x.q.handle] = 1; return true; }).slice(0, n).map((x) => x.q);
}

export function siblings(p, n = 6) {
  const base = root(p.title);
  return products().filter((q) => q !== p && root(q.title) === base).slice(0, n);
}

export function regionPicks(p, region, n = 4) {
  const poolL = alsoBought(p, 16);
  poolL.sort((a, b) => (hashStr(region + a.handle) % 1000) - (hashStr(region + b.handle) % 1000));
  return poolL.slice(0, n);
}

/* =====================================================================
   DICAS DA SACOLA (nudges de venda consultiva)
   ===================================================================== */
const FREE = 150;
const bagHas = (items, kw) => items.some((i) => norm(i.title).includes(kw));
const pickAvail = (items, pred) => {
  const inBag = new Set(items.map((i) => i.handle));
  return products().filter((q) => !inBag.has(q.handle) && q.price && pred(q)).sort((a, b) => score(b) - score(a))[0];
};

export function cartTips(items) {
  const tips = [];
  if (!items.length) return tips;
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const qty = items.reduce((s, i) => s + i.qty, 0);

  if (sub < FREE) {
    const falta = FREE - sub;
    const filler = pickAvail(items, (q) => q.price >= falta && q.price <= falta + 35) || pickAvail(items, (q) => q.price >= falta * 0.6);
    if (filler) tips.push({ txt: `Faltam <b>${money(falta)}</b> pro frete grátis. Que tal <b>${filler.title}</b> (${money(filler.price)})?`, product: filler });
  }
  const batom = items.find((i) => products().find((p) => p.handle === i.handle)?.bucket === 'Lábios');
  if (batom && !bagHas(items, 'gloss') && !bagHas(items, 'lip oil') && !bagHas(items, 'brilho')) {
    const g = pickAvail(items, (q) => q.bucket === 'Lábios' && /gloss|lip oil|brilho/.test(norm(q.title)));
    if (g) tips.push({ txt: `Selar seu batom com o <b>${g.title}</b> intensifica a cor e dá brilho de vitrine 💋`, product: g });
  }
  const hasBase = bagHas(items, 'base');
  const hasPo = items.some((i) => /\bpo (solto|compacto|transl|facial|ultrafino)/.test(norm(i.title)));
  if (hasBase && !hasPo) {
    const po = pickAvail(items, (q) => q.bucket === 'Base e rosto' && /\bpo (solto|compacto|transl|facial|ultrafino)/.test(norm(q.title)));
    if (po) tips.push({ txt: `Pra sua base durar o dia todo, fixa com o <b>${po.title}</b>.`, product: po });
  }
  if (items.some((i) => products().find((p) => p.handle === i.handle)?.bucket === 'Esmaltes e unhas') && !bagHas(items, 'top coat')) {
    const tc = pickAvail(items, (q) => norm(q.title).includes('top coat'));
    if (tc) tips.push({ txt: `Um <b>${tc.title}</b> por cima e a unha dura muito mais 💅`, product: tc });
  }
  if (qty >= 3) tips.push({ txt: `Você montou um kit com <b>${qty} itens</b> — combo perfeito pra ganhar de presente ou dividir 🛍️` });
  return tips.slice(0, 2);
}
const money = (v) => (v == null ? '—' : 'R$ ' + Number(v).toFixed(2).replace('.', ','));

/* =====================================================================
   CHAT — NLU offline por regras + curadoria
   ===================================================================== */
export const CHAT_EX = ['Esmalte pra balada com vestido rosa', 'Batom vermelho de longa duração',
  'Base pra pele oleosa no calor', 'Look natural pro dia a dia', 'Make de formatura poderosa', 'Presente até R$60'];

const CHAT_CAT = [
  ['Esmaltes e unhas', ['esmalte', 'unha', 'manicure', 'nail']],
  ['Lábios', ['batom', 'baton', 'gloss', 'labial', 'labio', 'boca', 'lip', 'brilho labial']],
  ['Base e rosto', ['base', 'corretivo', 'primer', 'bb cream', 'cc cream', 'po facial', 'po solto', 'po compacto', 'pele oleosa', 'pele seca']],
  ['Blush e bronzer', ['blush', 'bronzer', 'iluminador', 'contorno', 'bronzeador', 'rubor']],
  ['Olhos', ['sombra', 'delineador', 'rimel', 'mascara de cilios', 'cilios', 'olho', 'olhos', 'paleta de sombra']],
  ['Sobrancelha', ['sobrancelha', 'henna', 'soap brow']],
  ['Corpo e fragrância', ['perfume', 'body splash', 'hidratante', 'sabonete', 'corpo', 'aroma', 'cheiro', 'fragrancia', 'creme']],
];
const CHAT_COLOR = [
  [['rose', 'pink'], ['rosa', 'rose', 'rosinha']],
  [['pink'], ['pink', 'magenta']],
  [['vermelho', 'cereja'], ['vermelho', 'vermelha', 'red', 'cereja']],
  [['vinho', 'marsala', 'amora'], ['vinho', 'bordo', 'marsala', 'amora', 'ameixa']],
  [['nude', 'caramelo'], ['nude', 'bege', 'neutro', 'amendoado']],
  [['preto'], ['preto', 'preta', 'black']],
  [['marrom', 'chocolate', 'caramelo'], ['marrom', 'chocolate', 'cafe', 'caramelo', 'terroso']],
  [['coral', 'pessego'], ['coral', 'laranja', 'pessego', 'salmao']],
  [['uva'], ['roxo', 'lilas', 'uva', 'lavanda']],
  [['bronze', 'glitter', 'holo'], ['dourado', 'gold', 'glitter', 'metalico', 'cromado', 'holografico', 'brilho intenso']],
];
const CHAT_OCC = { noite: 'balada', night: 'balada', balada: 'balada', festa: 'balada', boate: 'balada', show: 'balada',
  formatura: 'formatura', baile: 'formatura', casamento: 'casamento', madrinha: 'casamento', convidada: 'casamento', noiva: 'casamento',
  trabalho: 'trabalho', reuniao: 'trabalho', escritorio: 'trabalho', entrevista: 'trabalho',
  dia: 'dia', faculdade: 'dia', aula: 'dia', passeio: 'dia',
  date: 'encontro', encontro: 'encontro', romantico: 'encontro', crush: 'encontro', jantar: 'encontro',
  praia: 'praia', piscina: 'praia', verao: 'praia', viagem: 'praia',
  reveillon: 'reveillon', ano: 'reveillon', virada: 'reveillon',
  halloween: 'halloween', fantasia: 'halloween', junina: 'junina', arraia: 'junina',
  foto: 'ensaio', fotos: 'ensaio', ensaio: 'ensaio' };

export function chatParse(text) {
  const t = norm(text);
  const buckets = []; CHAT_CAT.forEach((c) => { if (c[1].some((k) => t.includes(norm(k)))) buckets.push(c[0]); });
  const tones = []; CHAT_COLOR.forEach((c) => { if (c[1].some((k) => t.includes(norm(k)))) c[0].forEach((x) => { if (!tones.includes(x)) tones.push(x); }); });
  let occ = null; Object.keys(CHAT_OCC).some((k) => { if (t.includes(norm(k))) { occ = pickBy(OCC, CHAT_OCC[k]); return !!occ; } return false; });
  let style = null; STYLES.forEach((s) => { const w = norm(s.lab.split(/[\s/]/)[0]); if (w.length > 3 && t.includes(w)) style = s; });
  const mp = t.match(/(?:ate|maximo|no maximo|de|por)\s*r?\$?\s*(\d{1,4})/); const maxp = mp ? +mp[1] : null;
  const gift = /presente|presentear|kit|para dar/.test(t);
  return { text, buckets, tones, occ, style, maxp, gift };
}

export function chatPick(parsed, n = 4) {
  const b = { occ: parsed.occ, style: parsed.style, image: null, skin: null, age: null };
  const scored = products().filter((p) => p.price && (!parsed.maxp || p.price <= parsed.maxp)).map((p) => {
    let s = scoreBrief(p, b);
    if (parsed.buckets.length) s += parsed.buckets.includes(p.bucket) ? 4 : -2.5;
    if (parsed.tones.length) { const tp = toneOf(p); if (tp && parsed.tones.includes(tp)) s += 4; }
    if (parsed.gift && pop(p) && (pop(p).queridinho || pop(p).bestseller_rank)) s += 2;
    s += score(p) / 80;
    return { p, s };
  }).sort((a, c) => c.s - a.s);
  const seen = {}, out = [];
  for (let i = 0; i < scored.length && out.length < n; i++) { const r = root(scored[i].p.title); if (seen[r]) continue; seen[r] = 1; out.push(scored[i].p); }
  return out;
}

export function chatWhy(p, parsed) {
  const bits = [], tp = toneOf(p);
  if (parsed && parsed.tones.length && tp && parsed.tones.includes(tp)) bits.push('tom ' + tp);
  else if (tp) bits.push(tp);
  if (finishHas(p, '12h') || finishHas(p, 'longa') || finishHas(p, 'prova')) bits.push('longa duração');
  else if (finishHas(p, 'matte')) bits.push('matte');
  else if (finishHas(p, 'gloss') || finishHas(p, 'iluminador') || finishHas(p, 'glitter')) bits.push('glow');
  const pp = pop(p); if (pp && pp.bestseller_rank) bits.push('best-seller');
  return bits.slice(0, 2).join(' · ');
}

function chatBeautyTip(prods) {
  const b = prods[0]; if (!b) return '';
  return {
    'Lábios': '💡 Dica: contorna o lábio com lápis antes do batom — dura mais e não escorre.',
    'Esmaltes e unhas': '💡 Dica: base + 2 camadas finas + top coat = esmalte que não lasca fácil.',
    'Base e rosto': '💡 Dica: fixa a base com pó translúcido na zona T pra segurar o dia todo.',
    'Olhos': '💡 Dica: um primer nos olhos deixa a sombra mais viva e sem vincar.',
    'Blush e bronzer': '💡 Dica: sorri e aplica o blush no ponto alto da bochecha pra um ar saudável.',
    'Corpo e fragrância': '💡 Dica: passa o hidratante com a pele ainda úmida — fixa o aroma por mais tempo.',
  }[b.bucket] || '';
}

export function chatFallback(parsed, prods) {
  if (!prods.length) return 'Hmm, não achei nada certeiro pra isso 🤔 Me diz a categoria (batom, esmalte, base…) e a cor ou ocasião que eu encontro pra você 💕';
  const intro = parsed.occ ? parsed.occ.dai : 'Separei umas queridinhas que combinam com o que você pediu 💕';
  const tip = chatBeautyTip(prods);
  return intro + (tip ? '<br><br>' + tip : '') + '<br><br>Toca no <b>＋</b> que eu já jogo na sacola e cuido do frete pra você ✨';
}

export const chatGreet = () => 'Oi! Sou a <b>Dai</b> 💕 Me conta pra onde você vai ou o que procura — tipo <i>"esmalte pra balada com vestido rosa"</i> — que eu monto seu look e ainda solto umas dicas ✨';

/* =====================================================================
   IA LOCAL OPCIONAL (Ollama) — degrada pra regras se indisponível
   ===================================================================== */
export const LLM = { on: false, checking: false, endpoint: 'http://localhost:11434', model: null };
const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '');

/* ---- cache de respostas (memória + localStorage) ----
   Evita reprocessar o mesmo prompt no Ollama (inferência em CPU é lenta) e
   deixa o demo instantâneo em perguntas repetidas. */
const LLM_CACHE_KEY = 'dai_llm_cache_v1';
const LLM_CACHE_MAX = 120;
const llmCache = (() => { try { return JSON.parse(localStorage.getItem(LLM_CACHE_KEY)) || {}; } catch (e) { return {}; } })();
const cacheKey = (model, msgs) => model + '|' + JSON.stringify(msgs);
function cacheGet(k) { return Object.prototype.hasOwnProperty.call(llmCache, k) ? llmCache[k] : null; }
function cacheSet(k, v) {
  llmCache[k] = v;
  const keys = Object.keys(llmCache);
  if (keys.length > LLM_CACHE_MAX) delete llmCache[keys[0]];
  try { localStorage.setItem(LLM_CACHE_KEY, JSON.stringify(llmCache)); } catch (e) { /* quota cheia: ignora */ }
}

export function llmProbe(onChange) {
  if (LLM.checking) return; LLM.checking = true;
  const to = setTimeout(() => { LLM.on = false; LLM.checking = false; onChange && onChange(); }, 2500);
  fetch(LLM.endpoint + '/api/tags', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      clearTimeout(to);
      const names = ((d && d.models) || []).map((m) => m.name).filter((nm) => {
        const n = nm.toLowerCase();
        return !n.includes('embed') && !n.includes('vision') && !n.includes('llava') && !n.includes('mllama');
      });
      if (names.length) {
        // preferência: modelos mais leves primeiro (menos RAM/CPU → resposta mais rápida)
        const pref = ['gemma3', 'phi3', 'llama3.2', 'qwen2.5', 'llama3.1', 'gemma2', 'llama3', 'qwen2', 'mistral', 'gemma'];
        let chosen = null;
        pref.some((pf) => { const f = names.find((nm) => nm.toLowerCase().includes(pf)); if (f) { chosen = f; return true; } return false; });
        LLM.model = chosen || names[0]; LLM.on = true; llmWarm();
      } else LLM.on = false;
    }).catch(() => { clearTimeout(to); LLM.on = false; })
    .finally(() => { LLM.checking = false; onChange && onChange(); });
}

/* pré-carrega o modelo pra 1ª resposta não pegar o cold start (~load inicial) */
function llmWarm() {
  if (!LLM.model) return;
  fetch(LLM.endpoint + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: LLM.model, messages: [{ role: 'user', content: 'oi' }], stream: false, options: { num_predict: 1 } }) }).catch(() => {});
}

export function llmReply(parsed, prods, history, cb) {
  const sys = 'Você é a "Dai", consultora de beleza da Dailus (cosméticos brasileiros, veganos e cruelty-free). '
    + 'Fale como uma amiga próxima: calorosa, animada, gen-z brasileira, frases curtas, no máximo 2-3 emojis. '
    + 'Você ajuda a escolher maquiagem e dá 1 dica de beleza prática. REGRAS: só comente os produtos da LISTA fornecida '
    + '(não invente outros nem preços); seja breve (até ~60 palavras); termine incentivando a tocar em "+" pra adicionar na sacola.';
  const ctx = prods.length
    ? 'Produtos disponíveis pra esta pergunta (use só estes nomes):\n' + prods.map((p) => `- ${p.title} — R$ ${p.price} (${p.linha || 'Dailus'} · ${p.bucket})`).join('\n')
    : 'Nenhum produto casou exatamente; peça mais detalhes (categoria/cor/ocasião).';
  const msgs = [{ role: 'system', content: sys }];
  (history || []).slice(-6).forEach((m) => { if (m.txt || m.raw) msgs.push({ role: m.who === 'me' ? 'user' : 'assistant', content: m.raw || stripHtml(m.txt) }); });
  msgs.push({ role: 'user', content: parsed.text + '\n\n[' + ctx + ']' });

  const key = cacheKey(LLM.model, msgs);
  const hit = cacheGet(key);
  if (hit != null) { cb(hit); return; }

  fetch(LLM.endpoint + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: LLM.model, messages: msgs, stream: false, options: { temperature: 0.7 } }) })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { const c = d && d.message && d.message.content; const out = c ? c.trim().replace(/\n/g, '<br>') : null; if (out != null) cacheSet(key, out); cb(out); })
    .catch(() => cb(null));
}
