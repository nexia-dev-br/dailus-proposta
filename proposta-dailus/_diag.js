const puppeteer = require('puppeteer-core');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://127.0.0.1:8802';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 30000, args: ['--no-sandbox', '--hide-scrollbars'] });
  const page = await b.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(BASE + '/proposta-dailus/proposta/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('#deck > *').length > 10, { timeout: 30000 });
  await sleep(3000);
  const info = await page.evaluate(() => {
    const bf = [];
    document.querySelectorAll('*').forEach(e => {
      const s = getComputedStyle(e);
      if ((s.backdropFilter && s.backdropFilter !== 'none') || (s.webkitBackdropFilter && s.webkitBackdropFilter !== 'none')) bf.push(e.className || e.tagName);
    });
    const secs = [...document.querySelectorAll('#deck > *')].map((e, i) => ({ i, tag: e.tagName, id: e.id, h: Math.round(e.getBoundingClientRect().height) }));
    return { secs, bfCount: bf.length, bfSample: bf.slice(0, 8) };
  });
  console.log('backdrop-filter elements:', info.bfCount, info.bfSample);
  console.log('sections:');
  info.secs.forEach(s => console.log(`  #${s.i} ${s.tag}#${s.id} h=${s.h}`));
  // tenta screenshot da seção 0 com timeout curto
  const secs = await page.$$('#deck > *');
  for (let i = 0; i < secs.length; i++) {
    const box = await secs[i].boundingBox();
    if (!box || box.height < 12) { console.log(`skip #${i}`); continue; }
    const t = Date.now();
    try {
      await secs[i].screenshot({ type: 'jpeg', quality: 80, path: `/tmp/diag_${String(i).padStart(2,'0')}.jpg` });
      console.log(`ok #${i} in ${Date.now() - t}ms`);
    } catch (e) { console.log(`FAIL #${i} after ${Date.now() - t}ms: ${e.message.split('\n')[0]}`); }
  }
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
