/* =====================================================================
   Dai — assistente flutuante (chat "Fale com a Dai") + provador guiado
   Reaproveita o motor em js/dai.js e adiciona os produtos ao carrinho real.
   ===================================================================== */
import { asset } from '../config.js';
import { money, esc, img, toast, go } from '../ui.js';
import * as S from '../store.js';
import * as Dai from '../dai.js';

let CHAT = [];
let CHAT_INPUT = '';
let mounted = false;

export function initDai() {
  if (mounted) return;
  mounted = true;
  const host = document.createElement('div');
  host.innerHTML = `
    <button class="dai-fab" id="daiFab" aria-label="Fale com a Dai"><span>💄</span> Fale com a Dai</button>
    <div class="dai-back" id="daiBack"></div>
    <aside class="dai-panel" id="daiPanel" aria-label="Chat com a Dai"></aside>
    <div class="dai-adv-back" id="daiAdvBack"></div>
    <div class="dai-adv" id="daiAdv" role="dialog" aria-label="Provador da Dai"></div>`;
  document.body.appendChild(host);

  document.getElementById('daiFab').onclick = openChat;
  document.getElementById('daiBack').onclick = closeChat;
  window.addEventListener('dai:chat', openChat);
  window.addEventListener('dai:advisor', () => { openChat(); openAdvisor(); });
  document.getElementById('daiAdvBack').onclick = closeAdvisor;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeChat(); closeAdvisor(); } });

  // detecta IA local (Ollama) em background; degrada pra regras
  Dai.llmProbe(() => { if (isChatOpen()) updateLlmBadge(); });
}

/* expõe abertura para outras telas (home, header) */
export function openDaiChat() { openChat(); }
export function openDaiAdvisor() { openChat(); openAdvisor(); }

const isChatOpen = () => document.getElementById('daiPanel')?.classList.contains('open');

function openChat() {
  if (!CHAT.length) CHAT.push({ who: 'dai', done: true, prods: [], txt: Dai.chatGreet(), raw: 'Oi! Sou a Dai.' });
  renderChat();
  document.getElementById('daiPanel').classList.add('open');
  document.getElementById('daiBack').classList.add('open');
}
function closeChat() {
  document.getElementById('daiPanel').classList.remove('open');
  document.getElementById('daiBack').classList.remove('open');
}

/* ---------------- chat ---------------- */
function prodCard(p, parsed) {
  const why = Dai.chatWhy(p, parsed);
  return `
    <div class="dai-pc" data-open="${esc(p.handle)}">
      <div class="dai-pc-th">${img(p.images?.[0], 'dai-pc-img')}</div>
      <div class="dai-pc-b">
        <div class="dai-pc-n">${esc(p.title)}</div>
        ${why ? `<div class="dai-pc-why">${esc(why)}</div>` : ''}
        <div class="dai-pc-f"><span class="dai-pc-p">${money(p.price)}</span>
          <button class="dai-add" data-add="${esc(p.handle)}" title="Adicionar à sacola">＋</button></div>
      </div>
    </div>`;
}
function msgHtml(m) {
  const body = m.typing ? '<span class="dai-typing"><span></span><span></span><span></span></span>' : m.txt;
  const prods = (m.prods && m.prods.length && !m.typing) ? `<div class="dai-prods">${m.prods.map((p) => prodCard(p, m.parsed)).join('')}</div>` : '';
  return `<div class="dai-msg ${m.who}"><div class="dai-who">${m.who === 'me' ? 'Você' : 'Dai 💄'}</div><div class="dai-bubble">${body}</div>${prods}</div>`;
}

function renderChat() {
  const panel = document.getElementById('daiPanel');
  panel.innerHTML = `
    <div class="dai-head">
      <div class="dai-head-t"><div class="dai-avatar">💄</div>
        <div><b>Fale com a Dai</b><span class="dai-sim">sua consultora de beleza · simulação</span></div></div>
      <button class="dai-x" id="daiClose" aria-label="Fechar">✕</button>
    </div>
    <div class="dai-llm" id="daiLlm"></div>
    <div class="dai-thread" id="daiThread">${CHAT.map(msgHtml).join('')}</div>
    <button class="dai-provador" id="daiProvador">✨ Não sabe por onde começar? Deixa a Dai montar seu look →</button>
    <div class="dai-quick" id="daiQuick">${Dai.CHAT_EX.map((x) => `<button type="button">${esc(x)}</button>`).join('')}</div>
    <form class="dai-form" id="daiForm">
      <input id="daiInput" type="text" autocomplete="off" placeholder="Fala com a Dai… ex: batom pra formatura">
      <button type="submit" aria-label="Enviar">➤</button>
    </form>`;

  panel.querySelector('#daiClose').onclick = closeChat;
  panel.querySelector('#daiProvador').onclick = openAdvisor;
  panel.querySelector('#daiForm').onsubmit = (e) => { e.preventDefault(); send(panel.querySelector('#daiInput').value); };
  panel.querySelector('#daiQuick').onclick = (e) => { const b = e.target.closest('button'); if (b) send(b.textContent); };
  const input = panel.querySelector('#daiInput');
  input.value = CHAT_INPUT; input.oninput = () => { CHAT_INPUT = input.value; };

  panel.onclick = (e) => {
    const add = e.target.closest('[data-add]');
    if (add) { e.stopPropagation(); addHandle(add.getAttribute('data-add'), add); return; }
    const op = e.target.closest('[data-open]');
    if (op) { closeChat(); go('#/produto/' + op.getAttribute('data-open')); }
  };

  const thread = panel.querySelector('#daiThread'); thread.scrollTop = thread.scrollHeight;
  updateLlmBadge();
}

function updateLlmBadge() {
  const b = document.getElementById('daiLlm'); if (!b) return;
  b.innerHTML = `<span class="dot${Dai.LLM.on ? ' on' : ''}"></span>${Dai.LLM.on ? 'Dai IA · Ollama (' + esc(Dai.LLM.model) + ')' : 'Dai · modo local (regras)'}`;
}

function send(text) {
  text = (text || '').trim(); if (!text) return;
  CHAT.push({ who: 'me', txt: esc(text), raw: text, prods: [] });
  const parsed = Dai.chatParse(text);
  const prods = Dai.chatPick(parsed, 4);
  const msg = { who: 'dai', txt: '', raw: '', prods, parsed, typing: true, done: false };
  CHAT.push(msg);
  CHAT_INPUT = '';
  renderChat();

  const finish = (t) => {
    if (msg.done) return; msg.done = true; msg.typing = false;
    const out = t || Dai.chatFallback(parsed, prods);
    msg.txt = out; msg.raw = out.replace(/<[^>]+>/g, '');
    renderChat();
  };
  if (Dai.LLM.on) { Dai.llmReply(parsed, prods, CHAT.slice(0, -1), (t) => finish(t)); setTimeout(() => finish(null), 40000); }
  else setTimeout(() => finish(null), 340);
}

function addHandle(handle, btn) {
  const p = S.getProduct(handle); if (!p) return;
  S.addToCart(p, null, 1);
  if (btn) { btn.classList.add('added'); setTimeout(() => btn.classList.remove('added'), 600); }
  toast('✓ <b>' + esc(p.title) + '</b> na sacola');
}

/* =====================================================================
   PROVADOR GUIADO
   ===================================================================== */
function openAdvisor() {
  const adv = document.getElementById('daiAdv');
  const chips = (g, arr) => arr.map((it) => `<button class="dai-qchip" data-g="${g}" data-k="${it.k}">${it.emoji ? it.emoji + ' ' : ''}${esc(it.lab)}</button>`).join('');
  adv.innerHTML = `
    <button class="dai-adv-x" id="advClose" aria-label="Fechar">✕</button>
    <div class="dai-adv-hd"><div class="dai-avatar">💄</div><div><h2>Oi! Sou a Dai ✨</h2>
      <p>Me conta pra onde você vai e como quer se sentir — eu monto seu look e separo os produtos.</p></div></div>
    <div class="dai-qsec"><h4>1 · Qual a ocasião?</h4><div class="dai-qchips">${chips('occ', Dai.OCC)}</div></div>
    <div class="dai-qsec"><h4>2 · Seu tom de pele</h4><div class="dai-qchips">${chips('skin', Dai.SKIN)}</div></div>
    <div class="dai-qsec"><h4>3 · Sua idade</h4><div class="dai-qchips">${chips('age', Dai.AGES)}</div></div>
    <div class="dai-qsec"><h4>4 · Seu estilo</h4><div class="dai-qchips">${chips('style', Dai.STYLES)}</div></div>
    <div class="dai-qsec"><h4>5 · A imagem que você quer passar</h4><div class="dai-qchips">${chips('image', Dai.IMAGES)}</div></div>
    <div class="dai-adv-foot"><button class="dai-go" id="advGo">Montar meu look com a Dai →</button>
      <span class="dai-note">Curadoria ilustrativa a partir do catálogo real da Dailus.</span></div>`;

  const sel = {};
  adv.querySelector('#advClose').onclick = closeAdvisor;
  adv.onclick = (e) => {
    const c = e.target.closest('.dai-qchip');
    if (c) { const g = c.getAttribute('data-g'); sel[g] = c.getAttribute('data-k');
      adv.querySelectorAll(`.dai-qchip[data-g="${g}"]`).forEach((x) => x.classList.toggle('on', x === c)); return; }
    if (e.target.closest('#advGo')) showLook(sel);
  };
  adv.classList.add('open');
  document.getElementById('daiAdvBack').classList.add('open');
}
function closeAdvisor() {
  document.getElementById('daiAdv').classList.remove('open');
  document.getElementById('daiAdvBack').classList.remove('open');
}

function showLook(sel) {
  const brief = {
    occ: Dai.pickBy(Dai.OCC, sel.occ) || Dai.OCC[0],
    style: Dai.pickBy(Dai.STYLES, sel.style),
    image: Dai.pickBy(Dai.IMAGES, sel.image),
    skin: Dai.pickBy(Dai.SKIN, sel.skin),
    age: sel.age,
  };
  const look = Dai.buildLook(brief);
  const items = look.map((g) => g.item);
  const total = items.reduce((a, p) => a + (p.price || 0), 0);
  const summary = [brief.occ && (brief.occ.emoji + ' ' + brief.occ.lab), brief.skin && ('pele ' + brief.skin.lab.toLowerCase()),
    brief.style && brief.style.lab, brief.image && ('imagem ' + brief.image.lab.toLowerCase())].filter(Boolean);
  const daimsg = (brief.occ && brief.occ.dai) || 'Montei um look do seu jeitinho 💕';

  const adv = document.getElementById('daiAdv');
  adv.innerHTML = `
    <button class="dai-adv-x" id="advClose" aria-label="Fechar">✕</button>
    <div class="dai-look-banner">
      <div class="dai-avatar">💄</div>
      <div class="dai-look-txt">
        <div class="dai-look-chips">${summary.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
        <p>${daimsg}</p>
      </div>
    </div>
    ${look.length ? look.map((g) => `
      <div class="dai-look-role">
        <div class="dai-look-rolehd">${esc(g.role)}</div>
        <div class="dai-look-item" data-open="${esc(g.item.handle)}">
          <div class="dai-look-th">${img(g.item.images?.[0], 'dai-look-img')}</div>
          <div class="dai-look-info">
            <b>${esc(g.item.title)}</b>
            <span class="dai-look-why">💡 ${esc(Dai.reasonFor(g.item, brief))}</span>
            <span class="dai-look-price">${money(g.item.price)}</span>
          </div>
          <button class="dai-add" data-add="${esc(g.item.handle)}" title="Adicionar">＋</button>
        </div>
      </div>`).join('') : '<div class="dai-look-empty">Não consegui montar dessa vez — tenta outra combinação 💕</div>'}
    <div class="dai-adv-foot look">
      ${items.length ? `<button class="dai-go" id="advAddLook">Adicionar look à sacola · ${money(total)}</button>` : ''}
      <button class="dai-again" id="advAgain">Refazer</button>
    </div>`;

  adv.querySelector('#advClose').onclick = closeAdvisor;
  adv.querySelector('#advAgain').onclick = openAdvisor;
  const addLook = adv.querySelector('#advAddLook');
  if (addLook) addLook.onclick = () => {
    items.forEach((p) => S.addToCart(p, null, 1));
    toast('💄 Look completo na sacola!');
    closeAdvisor(); closeChat();
  };
  adv.onclick = (e) => {
    const add = e.target.closest('[data-add]');
    if (add) { e.stopPropagation(); addHandle(add.getAttribute('data-add'), add); return; }
    const op = e.target.closest('[data-open]');
    if (op) { closeAdvisor(); closeChat(); go('#/produto/' + op.getAttribute('data-open')); }
  };
}
