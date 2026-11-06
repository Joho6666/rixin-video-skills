// Grok image-to-video through the JOHO relay.
//   node grok_i2v.mjs <start.png|jpg> <out.mp4> "<prompt>" [model=grok-imagine-video-1.5] [seconds=5]
//   node grok_i2v.mjs --fetch <request_id> <out.mp4>        (recover a clip whose poller died)
// Every submit is appended to ledger.jsonl next to <out.mp4> BEFORE polling, so a paid job is never lost.
// Cost measured 2026-11: $0.71 per 5 s clip. Output 1280x720 @24fps with a "Grok" watermark bottom-right.
import fs from 'node:fs';
import path from 'node:path';
const kv = Object.fromEntries(fs.readFileSync('C:/Users/JOHO/tools/joho-image/keys.env', 'utf8').split(/\r?\n/)
  .filter((l) => /^[A-Z_0-9]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));
const B = kv.JOHO_BASE_URL.replace(/\/$/, ''), H = {Authorization: 'Bearer ' + kv.JOHO_KEY_GROK, 'Content-Type': 'application/json'};
const args = process.argv.slice(2);

async function poll(id, out) {
  for (let i = 0; i < 180; i++) {
    await new Promise((s) => setTimeout(s, 5000));
    const q = await (await fetch(B + '/videos/' + id, {headers: H}).catch(() => null))?.json().catch(() => ({})) ?? {};
    const v = q.video || (q.data && !Array.isArray(q.data) ? q.data : q);
    const st = String(q.status || v.status || '');
    if (i % 6 === 0) console.log(i * 5, 's', st);
    const u0 = v.url || q.url || v.content;
    if (typeof u0 === 'string' && u0.length > 4) {
      const url = u0.startsWith('http') ? u0 : B.replace(/\/v1$/, '') + u0;
      const b = Buffer.from(await (await fetch(url, {headers: H})).arrayBuffer());
      fs.writeFileSync(out, b);
      console.log('SAVED', out, b.length, 'cost $', q.usage?.cost_in_usd_ticks ? q.usage.cost_in_usd_ticks / 1e10 : '?');
      return;
    }
    if (/fail|error|expired/i.test(st)) { console.log('FAILED', JSON.stringify(q).slice(0, 300)); process.exit(1); }
  }
  console.log('TIMEOUT — recover later with --fetch', id);
}

if (args[0] === '--fetch') {
  await poll(args[1], args[2]);
} else {
  const [img, out, prompt, model = 'grok-imagine-video-1.5', secs = '5'] = args;
  if (!img || !out || !prompt) { console.log('usage: grok_i2v.mjs <start> <out.mp4> "<prompt>" [model] [seconds] | --fetch <id> <out.mp4>'); process.exit(2); }
  const mime = /\.png$/i.test(img) ? 'image/png' : 'image/jpeg';
  const body = {model, prompt, image: {url: `data:${mime};base64,` + fs.readFileSync(img).toString('base64')}, duration: Number(secs), aspect_ratio: '16:9', resolution: '720p'};
  const r = await fetch(B + '/videos/generations', {method: 'POST', headers: H, body: JSON.stringify(body), signal: AbortSignal.timeout(120000)});
  const t = await r.text();
  console.log('submit', r.status, t.slice(0, 200));
  let id; try { const j = JSON.parse(t); id = j.request_id || j.id; } catch {}
  if (!r.ok || !id) process.exit(1);
  fs.appendFileSync(path.join(path.dirname(path.resolve(out)), 'ledger.jsonl'), JSON.stringify({t: new Date().toISOString(), id, model, img, out, secs}) + '\n');
  await poll(id, out);
}
