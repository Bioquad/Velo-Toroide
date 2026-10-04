/**
 * Escombrat d'alçades: quines geometries i quins valors de so fan néixer el
 * toroide entre 25 i 200 m d'alçada (només valors que el formen, ≤ 191 dB,
 * amb un emissor possible). Mateix motor físic que el simulador.
 * Ús: node tests/escombrat_alcada.js → simulation/v041/RESULTATS_ALCADA.md
 */
const F = require('../simulation/v041/fisica.js');
const fs = require('fs');
const BASE = { T: 35, P: 1013, H: 30, W: 3, dirW: 0, turb: 0.2, aot: 0.1, vis: 40, d_obs: 900, v_obs: 5, t_cam: 90,
  mes: 9, dia: 18, hora: 18, tz: 2, lat: 41.6142, lon: 0.6222, az_vis: 232, h_pont: 5, a_riu: 30,
  hmt: 18, hcat: 11, sl: 24, vmt: 25, vcat: 25, ph: 90, rc: 0.9, f_mt: 50, lin_or: 0,
  form: 1, h_src: 5, so: 66, sx_off: 0, D_ap: 20, aR: 0.12, n_inj: 4, npols: 1, kdir: 1, swirl: 0, dT0: 0,
  aer: 500, trac: 1, feix: 180, h_creu: 25, phi: -90, forma: 0, nharm: 9, beta: 1.2, IR: 0, refl: 1, rfont: 0.3,
  f1: 1, f2: 1, db1: 150, db2: 150, elev: 0, az_eix: 0 };
const cfg = o => Object.assign({}, BASE, o);
const LMAX = Math.floor(F.dbMax(BASE) * 10) / 10, H0 = 25, H1 = 200;
const forma = (o, L, rapid) => F.anellPrincipalFont(cfg(Object.assign({}, o, { db1: L, db2: L, _rapid: !!rapid }))).an.es_forma;
function nivellMinim(o) {
  if (!forma(o, LMAX, true)) return null;
  let lo = 60, hi = LMAX;
  if (forma(o, lo, true) && forma(o, lo, false)) return lo;
  while (hi - lo > 0.05) { const m = (lo + hi) / 2; if (forma(o, m, true)) hi = m; else lo = m; }
  let L = Math.ceil(hi * 10) / 10;
  for (let i = 0; i < 30 && L <= LMAX && !forma(o, L, false); i++) L = Math.round((L + 0.1) * 10) / 10;
  return L <= LMAX ? L : null;
}
function detall(o, L) {
  const s = cfg(Object.assign({}, o, { db1: L, db2: L })), p = F.anellPrincipalFont(s), an = p.an;
  if (!an.es_forma) return null;
  const est = F.estaticaAnell(s, an.Gamma, an.a, 180);
  return { x: p.src.x, h: p.src.y, mec: an.mecanisme, T: F.rotacioNodes(s, an).T, V: F.volumFont(s, s.f1, L), E: est.E, esp: est.espurnes,
    sat: p.mig ? Math.max(...p.mig.d.map(q => q.sigma || 0)) : 0, r: p.mig ? Math.min(...p.mig.r) : NaN };
}
const classe = (L, V) => L <= 170 && V <= 10 ? 'assolible' : L <= LMAX && V <= 1000 ? 'extrem' : 'improbable';
const ICONA = { assolible: '🟢', extrem: '🟠', improbable: '🔴' };
const fmtF = f => f >= 1000 ? (f / 1000).toFixed(4) + ' kHz' : f >= 1 ? f.toFixed(1) + ' Hz' : f >= 0.1 ? f.toFixed(2) + ' Hz' : f.toFixed(3) + ' Hz';
const cm = x => x.toFixed(2) + ' m';
const fmtT = T => !isFinite(T) ? '—' : T >= 60 ? (T / 60).toFixed(1) + ' min' : T.toFixed(1) + ' s';
const fmtE = E => E >= 1e6 ? (E / 1e6).toFixed(2) + ' MV/m' : E >= 1e3 ? (E / 1e3).toFixed(1) + ' kV/m' : E.toFixed(1) + ' V/m';
const fmtV = V => V >= 1e3 ? V.toExponential(1).replace('e+', '·10^') + ' m³' : V >= 1 ? V.toFixed(1) + ' m³' : (V * 1e3).toFixed(1) + ' L';

const FREQS = [0.07, 12.6, 20, 31.6, 50.1, 79.4, 125.9, 199.5, 316.2, 501.2, 794.3, 1258.9, 1995.3];
const GEOM = [];
for (const h_src of [5, 25, 50, 100]) for (const so of [5, 10, 20, 30, 40, 50, 66]) {
  GEOM.push({ h_src, so, feix: 180, h_creu: 25 });
  for (const feix of [60, 30]) for (const h_creu of [50, 100, 150, 200]) if (h_creu > h_src) GEOM.push({ h_src, so, feix, h_creu });
}
const res = [];
let k = 0;
for (const g of GEOM) {
  for (const f of FREQS) {
    const o = Object.assign({ f1: f, f2: f }, g), L = nivellMinim(o);
    if (L == null) { res.push(Object.assign({ f, L: null }, g)); continue; }
    const d = detall(o, L);
    if (!d) { res.push(Object.assign({ f, L: null }, g)); continue; }
    const L6 = Math.min(L + 6, LMAX), d6 = detall(o, L6);
    res.push(Object.assign({ f, L, d, d6, cl: classe(L, d.V) }, g));
  }
  if (++k % 10 === 0) process.stdout.write(`${k}/${GEOM.length} `);
}
const dins = r => r.L != null && r.d && r.d.h >= H0 && r.d.h <= H1;
const ok = res.filter(r => dins(r) && r.cl !== 'improbable').sort((a, b) => a.d.h - b.d.h);
const geomTxt = r => `${cm(r.h_src)} · ${cm(r.so)} · ${r.feix === 180 ? '180.0° (altaveu)' : r.feix.toFixed(1) + '° → ' + cm(r.h_creu)}`;

let md = `# Escombrat d'alçades: el toroide entre ${H0} i ${H1} m\n\n` +
  `Generat amb \`node tests/escombrat_alcada.js\` (mateix motor físic que el simulador). Escena del Segre (35 °C, brisa 3 km/h, σ_w = 0.2 m/s, fum 500 mg/m³, reflex de l'aigua, saturació i xoc inclosos), anell de 24.00 m, senyal sinusoïdal, φ = −90.0°. ` +
  `Es varien l'alçada de les fonts sobre l'aigua, la separació, l'obertura del feix i l'alçada on es creuen. Només es llisten valors que formen l'anell amb ≤ ${LMAX} dB i un emissor possible ` +
  `(🟢 ≤ 170.0 dB i ≤ 10 m³ d'aire per cicle · 🟠 fins a ${LMAX} dB i ≤ 1000 m³). Alçades al cm, nivells a 0.1 dB.\n\n`;

// 1. Taula completa ordenada per alçada
md += `## 1. Configuracions que fan néixer l'anell entre ${H0} i ${H1} m (ordenades per alçada)\n\n` +
  `| alçada on neix | fonts: alçada · separació · feix | freqüència | nivell mínim | x | amb +6.0 dB: alçada | via | 1 volta | volum/cicle | estàtica (3 min) | |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
for (const r of ok) md += `| **${cm(r.d.h)}** | ${geomTxt(r)} | ${fmtF(r.f)} | ${r.L.toFixed(1)} dB | ${r.d.x.toFixed(2)} | ${r.d6 ? cm(r.d6.h) : '—'} | ${r.d.mec}${r.d.sat >= 1 ? ' (xoc)' : ''} | ${fmtT(r.T = r.d.T)} | ${fmtV(r.d.V)} | ${fmtE(r.d.E)}${r.d.esp ? ' ⚡' : ''} | ${ICONA[r.cl]} |\n`;
if (!ok.length) md += `| cap | | | | | | | | | | |\n`;

// 2. Per franges d'alçada: el millor (menys dB) de cada franja
const FR = [[25, 50], [50, 75], [75, 100], [100, 150], [150, 200]];
md += `\n## 2. El més fàcil de cada franja d'alçada (menys dB per font)\n\n| franja | alçada | fonts: alçada · separació · feix | freqüència | nivell | |\n|---|---|---|---|---|---|\n`;
const resumF = [];
for (const [a, b] of FR) {
  const c = ok.filter(r => r.d.h >= a && r.d.h < b).sort((p, q) => p.L - q.L)[0];
  resumF.push({ a, b, c });
  md += c ? `| ${a}–${b} m | **${cm(c.d.h)}** | ${geomTxt(c)} | ${fmtF(c.f)} | ${c.L.toFixed(1)} dB | ${ICONA[c.cl]} |\n` : `| ${a}–${b} m | cap | — | — | — | — |\n`;
}

// 3. Què mou l'alçada
md += `\n## 3. Què fixa l'alçada (199.5 Hz, nivell mínim de cada cas)\n\n| fonts a | separació | feix 180.0° | feix 60.0° → 100.00 m | feix 30.0° → 200.00 m |\n|---|---|---|---|---|\n`;
for (const h_src of [5, 25, 50, 100]) for (const so of [10, 30, 66]) {
  const cel = [[180, 25], [60, 100], [30, 200]].map(([feix, h_creu]) => {
    const r = res.find(q => q.h_src === h_src && q.so === so && q.feix === feix && q.h_creu === h_creu && q.f === 199.5);
    return !r ? '—' : r.L == null ? 'no es forma' : `${cm(r.d.h)} (${r.L.toFixed(1)} dB${r.cl === 'improbable' ? ' 🔴' : ''})`;
  });
  md += `| ${cm(h_src)} | ${cm(so)} | ${cel.join(' | ')} |\n`;
}

// 4. Què no funciona
const tot = res.filter(r => r.L != null);
const altes = tot.filter(r => r.d && r.d.h > H1).length, baixes = tot.filter(r => r.d && r.d.h < H0).length;
const imp = res.filter(r => dins(r) && r.cl === 'improbable').length, cap = res.filter(r => r.L == null).length;
md += `\n## 4. Què no funciona\n\n` +
  `- De ${res.length} combinacions provades: ${cap} no formen l'anell ni a ${LMAX} dB; ${baixes} el formen per sota de ${H0} m; ${altes} per sobre de ${H1} m; ${imp} el formen a ${H0}–${H1} m però només amb infrasò (🔴, massa aire per cicle).\n`;
const perF = FREQS.map(f => ({ f, n: ok.filter(r => r.f === f).length }));
md += `- Freqüències que donen anells a ${H0}–${H1} m amb emissor possible: ${perF.filter(p => p.n).map(p => `${fmtF(p.f)} (${p.n})`).join(', ') || 'cap'}. Sense cap cas: ${perF.filter(p => !p.n).map(p => fmtF(p.f)).join(', ')}.\n`;
fs.writeFileSync(__dirname + '/../simulation/v041/RESULTATS_ALCADA.md', md);
console.log('\n' + md);
