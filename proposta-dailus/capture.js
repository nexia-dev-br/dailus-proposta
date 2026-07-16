/* Captura a apresentação, a loja e o catálogo como um navegador desktop largo
   (1440px, retina @2x), sem margens, para virar um PDF fiel ao site.
   Usa o Google Chrome instalado via puppeteer-core. Requer o servidor local (porta 8802). */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE || 'http://127.0.0.1:8802';
const OUT = path.join(__dirname, 'pdf', 'frames');
const WIDTH = 1440, SCALE = 2, Q = 92;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let idx = 0;
const frame = () => path.join(OUT, String(++idx).padStart(3, '0') + '.jpg');

// elementos de UI fixa/overlays que não devem aparecer nas capturas
const HIDE = ['#nav', '.progress', '.present-fab', '.showbar', '.showprog', '.showtag',
  '.cartfab', '.cartback', '.cartdrawer', '.adv-overlay', '.overlay',
  '.demo-ribbon', '.drawer-back', '.cart-drawer', '.toast-wrap', '.dai-fab', '.dai-back', '.dai-panel'];

async function hideChrome(page) {
  await page.evaluate(sels => sels.forEach(s => document.querySelectorAll(s).forEach(e => (e.style.display = 'none'))), HIDE);
}

// Para capturas de pagina inteira (loja/catalogo): forca lazy imgs, rola tudo e espera carregar.
async function loadAll(page) {
  await page.evaluate(() => document.querySelectorAll('img[loading]').forEach(i => (i.loading = 'eager')));
  await page.evaluate(async () => {
    await new Promise(res => {
      let y = 0; const step = 700;
      const t = setInterval(() => {
        window.scrollBy(0, step); y += step;
        if (y >= document.body.scrollHeight) { clearInterval(t); window.scrollTo(0, 0); res(); }
      }, 80);
    });
  });
  await page.waitForFunction(() => [...document.images].every(i => i.complete), { timeout: 15000 }).catch(() => {});
  await sleep(600);
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
    args: ['--no-sandbox', '--hide-scrollbars']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: 900, deviceScaleFactor: SCALE });

  /* 1) APRESENTAÇÃO — uma imagem por seção (full-bleed) */
  await page.goto(BASE + '/proposta-dailus/proposta/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('#deck > *').length > 10, { timeout: 30000 });
  await sleep(3200); // revealAll (2.2s) + contadores animados
  await page.evaluate(() => {
    document.querySelectorAll('[data-r]').forEach(e => e.classList.add('in'));
    document.querySelectorAll('.bar').forEach(e => e.classList.add('in'));
  });
  await hideChrome(page);
  const secs = await page.$$('#deck > *');
  for (const el of secs) {
    const box = await el.boundingBox();
    if (!box || box.height < 12) continue;
    await el.screenshot({ path: frame(), type: 'jpeg', quality: Q });
  }

  /* 2) LOJA — página inteira */
  await page.goto(BASE + '/frontend/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => !document.querySelector('.page-loading'), { timeout: 30000 }).catch(() => {});
  await sleep(1500);
  await loadAll(page);
  await hideChrome(page);
  await page.screenshot({ path: frame(), type: 'jpeg', quality: Q, fullPage: true });

  /* 3) CATÁLOGO — KPIs + filtros + amostra de produtos */
  await page.goto(BASE + '/proposta-dailus/proposta/explorer.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('#grid > *').length > 0, { timeout: 30000 }).catch(() => {});
  await sleep(2000);
  await page.evaluate(() => {
    const g = document.getElementById('grid');
    if (g) [].slice.call(g.children).forEach((c, i) => { if (i >= 24) c.remove(); });
    const cta = document.querySelector('.adv-cta'); if (cta) cta.remove();
  });
  await loadAll(page);
  await hideChrome(page);
  await page.screenshot({ path: frame(), type: 'jpeg', quality: Q, fullPage: true });

  await browser.close();
  console.log('frames gerados:', idx, '->', OUT);
}

main().catch(e => { console.error(e); process.exit(1); });
