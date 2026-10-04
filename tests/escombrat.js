/**
 * Escombrat de configuracions: NOMÉS els valors que formen el toroide, amb
 * l'alçada on neix (al centímetre), i quins rangs no el formen.
 * Precisió: distàncies al cm, freqüències a la dècima d'Hz (centèsima i
 * mil·lèsima per sota d'1 Hz i de 0.1 Hz), nivells a la dècima de dB, angles a
 * la dècima de grau. Fa servir el mateix motor físic que el simulador.
 * L'audibilitat NO és criteri (el testimoni portava auriculars).
 * Ús: node tests/escombrat.js  → escriu simulation/v041/RESULTATS_ESCOMBRAT.md
 */
const F = require('../simulation/v041/fisica.js');
const fs = require('fs');

// Escena del Segre (la mateixa que el simulador)
const BASE = { T: 35, P: 1013, H: 30, W: 3, dirW: 0, turb: 0.2, aot: 0.1, vis: 40, d_obs: 900, v_obs: 5, t_cam: 90,
  mes: 9, dia: 18, hora: 18, tz: 2, lat: 41.6142, lon: 0.6222, az_vis: 232, h_pont: 5, a_riu: 30,
  hmt: 18, hcat: 11, sl: 24, vmt: 25, vcat: 25, ph: 90, rc: 0.9, f_mt: 50, lin_or: 0,
  form: 1, h_src: 5, so: 66, sx_off: 0, D_ap: 20, aR: 0.12, n_inj: 4, npols: 1, kdir: 1, swirl: 0, dT0: 0,
  aer: 500, trac: 1, feix: 180, h_creu: 25, phi: -90, forma: 0, nharm: 9, beta: 1.2, IR: 0, refl: 1, rfont: 0.3,
  f1: 1, f2: 1, db1: 150, db2: 150, elev: 0, az_eix: 0 };
const cfg = o => Object.assign({}, BASE, o);
const LMAX = Math.floor(F.dbMax(BASE) * 10) / 10;        // límit físic, a la dècima
const LMIN = 60;

/** Precisió de la freqüència segons la magnitud */
const pasF = f => f >= 1 ? 0.1 : f >= 0.1 ? 0.01 : 0.001;
const arrF = f => { const p = pasF(f); return Math.round(f / p) * p; };
const fmtF = f => { const p = pasF(f), d = p === 0.1 ? 1 : p === 0.01 ? 2 : 3; return f >= 1000 ? (f / 1000).toFixed(4) + ' kHz' : f.toFixed(d) + ' Hz'; };
const cm = x => x.toFixed(2) + ' m';

function forma(o, L, rapid) {
  const s = cfg(Object.assign({}, o, { db1: L, db2: L, _rapid: !!rapid }));
  return F.anellPrincipalFont(s).an.es_forma;
}
/** Nivell mínim a la dècima de dB (null si no es forma ni al límit físic) */
function nivellMinim(o) {
  if (!forma(o, LMAX, true)) return null;
  let lo = LMIN, hi = LMAX;
  if (forma(o, lo, true)) return lo;
  while (hi - lo > 0.05) { const m = (lo + hi) / 2; if (forma(o, m, true)) hi = m; else lo = m; }
  let L = Math.ceil(hi * 10) / 10;
  // confirmació amb la cerca fina (la ràpida pot errar per poc)
  for (let i = 0; i < 30 && L <= LMAX && !forma(o, L, false); i++) L = Math.round((L + 0.1) * 10) / 10;
  return L <= LMAX ? L : null;
}
/** Tot el que interessa de l'anell format */
function detall(o, L) {
  const s = cfg(Object.assign({}, o, { db1: L, db2: L }));
  const p = F.anellPrincipalFont(s), an = p.an;
  const rot = F.rotacioNodes(s, an);
  const est = F.estaticaAnell(s, an.Gamma, an.a, 180);
  const so1 = F.sorollAnell(s, an.Gamma, an.a, 1), soT = F.sorollAnell(s, an.Gamma, an.a, 900);
  const m = p.mig, sat = m ? Math.max(...m.d.map(q => q.sigma || 0)) : 0;
  return { s, an, x: p.src.x, h: p.src.y, D: 2 * an.R, G: an.Gamma, mec: an.mecanisme, T: rot.T, sentit: rot.sentit,
    V: F.volumFont(s, s.f1, L), E: est.E, esp: est.espurnes, L1: so1.L1, LT: soT.L, sat };
}
/** Vora d'una banda de freqüència entre fa (forma) i fb (no forma), a la precisió de la freqüència */
function vora(o, fa, fb) {
  for (let i = 0; i < 40; i++) {
    const fm = Math.sqrt(fa * fb);
    if (Math.abs(fa - fb) <= pasF(Math.min(fa, fb)) / 2) break;
    if (forma(Object.assign({}, o, { f1: fm, f2: fm }), LMAX, true)) fa = fm; else fb = fm;
  }
  return arrF(fa);
}
// Freqüències de mostra (log, de 0.005 Hz a 40 kHz)
const FREQS = []; for (let e = Math.log10(0.005); e <= Math.log10(40000) + 1e-9; e += 0.1) FREQS.push(arrF(Math.pow(10, e)));

/** Bandes de freqüència que formen l'anell per a una geometria */
function bandes(o) {
  const ok = FREQS.map(f => forma(Object.assign({}, o, { f1: f, f2: f }), LMAX, true));
  const B = [];
  for (let i = 0; i < FREQS.length; i++) if (ok[i] && (i === 0 || !ok[i - 1])) {
    let j = i; while (j + 1 < FREQS.length && ok[j + 1]) j++;
    const f0 = i === 0 ? -FREQS[0] : vora(o, FREQS[i], FREQS[i - 1]);
    const f1 = j === FREQS.length - 1 ? FREQS[j] : vora(o, FREQS[j], FREQS[j + 1]);
    B.push({ f0, f1, mostres: FREQS.slice(i, j + 1) });
  }
  return B;
}
const fmtB = b => (b.f0 < 0 ? '≤ ' + fmtF(-b.f0) : fmtF(b.f0)) + ' – ' + fmtF(b.f1);
const fmtT = T => !isFinite(T) ? '—' : T >= 60 ? (T / 60).toFixed(1) + ' min' : T.toFixed(1) + ' s';
const fmtV = V => V >= 1e3 ? V.toExponential(1).replace('e+', '·10^') + ' m³' : V >= 1 ? V.toFixed(1) + ' m³' : (V * 1e3).toFixed(1) + ' L';
/** Què caldria per emetre-ho: nivell a 1 m i volum d'aire que ha de moure cada font per cicle */
const classe = (L, V) => L <= 170 && V <= 10 ? 'assolible' : L <= LMAX && V <= 1000 ? 'extrem' : 'improbable';
const ICONA = { assolible: '🟢 assolible', extrem: '🟠 extrem', improbable: '🔴 improbable' };
const fmtE = E => E >= 1e6 ? (E / 1e6).toFixed(2) + ' MV/m' : E >= 1e3 ? (E / 1e3).toFixed(1) + ' kV/m' : E.toFixed(1) + ' V/m';

let md = `# Escombrat: on, a quina alçada i amb quins valors es forma el toroide\n\n` +
  `Generat amb \`node tests/escombrat.js\` (mateix motor físic que el simulador). Escena del Segre: fonts a 5.00 m d'alçada sobre l'aigua, ` +
  `zona de formació de 20.00 m (anell de 24.00 m), fum 500 mg/m³, turbulència σ_w = 0.2 m/s, senyal sinusoïdal, φ = −90.0°, ` +
  `reflex de l'aigua (coeficient 1), saturació no lineal i xoc inclosos.\n\n` +
  `**Només es llisten valors que formen l'anell** amb nivell ≤ ${LMAX} dB per font (límit físic: la rarefacció arriba al buit). ` +
  `Precisió: distàncies al cm, freqüències a 0.1 Hz (0.01 / 0.001 Hz per sota d'1 / 0.1 Hz), nivells a 0.1 dB, angles a 0.1°. ` +
  `L'audibilitat no és criteri.\n\n` +
  `Condicions per formar-se (totes alhora): (1) criteri de formació —oscil·lació (Holman) o circulació sostinguda per l'empenta del so que venç la turbulència—; ` +
  `(2) les dues ones arriben comparables (cap per sota d'1/3 de l'altra); (3) l'anell cap per sobre de l'aigua (alçada ≥ radi).\n\n`;

// ── 1. Bandes per separació de les fonts (feix d'altaveu, 180.0°)
const SEPS = [5, 10, 20, 27.5, 40, 50, 66];
const files = [];
md += `## 1. Bandes de freqüència que formen l'anell, per separació de les fonts (feix 180.0°)\n\n` +
  `| separació | banda (≤ ${LMAX} dB) | freqüència | nivell mínim | on neix x · **alçada** | amb +6.0 dB: x · alçada | via | 1 volta (4 nodes) | volum/cicle per font | emissor | estàtica (3 min) | soroll del gir a 1 m |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
for (const so of SEPS) {
  const o = { so };
  const B = bandes(o);
  if (!B.length) { md += `| ${cm(so)} | **cap** | — | — | — | — | — | — | — | — | — | — |\n`; process.stdout.write('x'); continue; }
  for (const b of B) {
    // mostres representatives de la banda: extrems i 2 interiors
    const ms = [...new Set([Math.abs(b.f0), b.mostres[Math.floor(b.mostres.length / 3)], b.mostres[Math.floor(2 * b.mostres.length / 3)], b.f1].map(arrF))];
    ms.forEach((f, k) => {
      const L = nivellMinim({ so, f1: f, f2: f });
      if (L == null) return;
      const d = detall({ so, f1: f, f2: f }, L);
      const L6 = Math.min(L + 6, LMAX), d6 = detall({ so, f1: f, f2: f }, L6);
      files.push(Object.assign({ so, f, L, h6: d6.an.es_forma ? d6.h : NaN }, d));
      md += `| ${k ? '' : cm(so)} | ${k ? '' : fmtB(b)} | ${fmtF(f)} | **${L.toFixed(1)} dB** | ${d.x.toFixed(2)} · **${cm(d.h)}** | ${d6.an.es_forma ? d6.x.toFixed(2) + ' · ' + cm(d6.h) : '—'} | ${d.mec}${d.sat >= 1 ? ' ⚠ xoc' : ''} | ${fmtT(d.T)} ${d.sentit > 0 ? '↺' : d.sentit < 0 ? '↻' : ''} | ${fmtV(d.V)} | ${ICONA[classe(L, d.V)]} | ${fmtE(d.E)}${d.esp ? ' ⚡' : ''} | ${d.L1.toFixed(1)} dB |\n`;
    });
    process.stdout.write('.');
  }
}
md += `\nNo es forma (amb cap nivell ≤ ${LMAX} dB) fora de les bandes llistades. «≤ 0.005 Hz»: la banda continua per sota (límit de l'escombrat).\n\n` +
  `Emissor: 🟢 assolible = ≤ 170.0 dB a 1 m i ≤ 10 m³ per cicle (sirenes i pistons molt grans) · 🟠 extrem = fins al límit físic i ≤ 1000 m³ (només explosions o motors de coet) · 🔴 improbable = cal moure més de 1000 m³ d'aire per cicle (cap emissor conegut). ` +
  `En infrasò, el nivell en dB a 1 m enganya: el que costa és el volum d'aire que s'ha de moure.\n`;

// ── 1b. Per què no es forma fora de les bandes
md += `\n### Per què no es forma fora de les bandes (separació 66.00 m, al límit de ${LMAX} dB, al punt més favorable)\n\n| freqüència | motiu |\n|---|---|\n`;
for (const f of [1, 3.5, 7, 1000, 2000, 5000, 10000, 20000, 40000]) {
  const s = cfg({ f1: f, f2: f, db1: LMAX, db2: LMAX });
  if (F.anellPrincipalFont(s).an.es_forma) { md += `| ${fmtF(f)} | (es forma) |\n`; continue; }
  const r = F.anellAlPunt(s, F.millorPuntFormacio(s)), mot = r.an.motiu;
  const txt = mot === 'turbulència' ? `massa feble: Γ/4πR = ${(r.an.Gamma / (4 * Math.PI * r.an.R)).toFixed(3)} m/s < σ_w = 0.2 m/s`
    : mot === 'vent' ? `el corrent (${r.m.uM.toFixed(2)} m/s) és més lent que la brisa (${(BASE.W / 3.6).toFixed(2)} m/s)`
    : mot === 'criteri de formació' ? `l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = ${r.ca.G.toExponential(1)} m²/s) no venç la turbulència`
    : 'al punt més favorable sí, però les dues ones no hi arriben comparables o l\'anell no hi cap per sobre de l\'aigua';
  md += `| ${fmtF(f)} | ${txt}${(r.m.d || []).some(q => q.sigma >= 1) ? ' · l\'ona fa xoc abans d\'arribar-hi' : ''} |\n`;
}

// ── 2. Obertura del feix i alçada de creuament
md += `\n## 2. Obertura del feix i alçada on es creuen (separació 66.00 m)\n\n` +
  `| feix | creuament | banda | freqüència | nivell mínim | on neix x · **alçada** | via |\n|---|---|---|---|---|---|---|\n`;
for (const feix of [180, 120, 90, 60, 45.5, 30]) for (const h_creu of (feix === 180 ? [25] : [15, 25, 40])) {
  const o = { feix, h_creu };
  const B = bandes(o);
  if (!B.length) { md += `| ${feix.toFixed(1)}° | ${cm(h_creu)} | **cap** | — | — | — | — |\n`; continue; }
  B.forEach((b, k) => {
    const f = b.mostres[Math.floor(b.mostres.length / 2)], L = nivellMinim(Object.assign({ f1: f, f2: f }, o));
    const d = L != null ? detall(Object.assign({ f1: f, f2: f }, o), L) : null;
    md += `| ${k ? '' : feix.toFixed(1) + '°'} | ${k ? '' : cm(h_creu)} | ${fmtB(b)} | ${fmtF(f)} | ${L != null ? L.toFixed(1) + ' dB' : '—'} | ${d ? d.x.toFixed(2) + ' · **' + cm(d.h) + '**' : '—'} | ${d ? d.mec : '—'} |\n`;
  });
  process.stdout.write('.');
}

// ── 3. Alçada de les fonts sobre l'aigua
md += `\n## 3. Alçada de les fonts sobre l'aigua (separació 66.00 m, 199.1 Hz)\n\n| alçada fonts | nivell mínim | on neix x · **alçada** |\n|---|---|---|\n`;
for (const h_src of [0.5, 2, 5, 10, 20]) {
  const o = { h_src, f1: 199.1, f2: 199.1 }, L = nivellMinim(o), d = L != null ? detall(o, L) : null;
  md += `| ${cm(h_src)} | ${L != null ? L.toFixed(1) + ' dB' : 'no es forma'} | ${d ? d.x.toFixed(2) + ' · **' + cm(d.h) + '**' : '—'} |\n`;
}

// ── 4. Desfasament: el gir
md += `\n## 4. Desfasament S₁→S₂ (199.1 Hz, 66.00 m): sentit i període de gir\n\n| φ | nivell mínim | sentit dels nodes | 1 volta |\n|---|---|---|---|\n`;
for (const phi of [0, -45, -90, -135, 180, 90]) {
  const o = { phi, f1: 199.1, f2: 199.1 }, L = nivellMinim(o), d = L != null ? detall(o, L) : null;
  md += `| ${phi.toFixed(1)}° | ${L != null ? L.toFixed(1) + ' dB' : 'no es forma'} | ${d ? (d.sentit > 0 ? '↺ antihorari' : d.sentit < 0 ? '↻ horari' : '—') : '—'} | ${d ? fmtT(d.T) : '—'} |\n`;
}

// ── 5. Contingut de l'aire: estàtica i contrast
md += `\n## 5. Què porta l'aire: nivell mínim i electricitat estàtica als 3 min (0.07 Hz i 199.1 Hz)\n\n` +
  `| contingut | 0.07 Hz: nivell · camp | 199.1 Hz: nivell · camp | espurnes? |\n|---|---|---|---|\n`;
for (const [nom, o] of [['aire net', { aer: 0 }], ['fum 500 mg/m³', { aer: 500, trac: 1 }], ['fum 3600 mg/m³', { aer: 3600, trac: 1 }], ['boira 5000 mg/m³', { aer: 5000, trac: 2 }], ['aire +10.0 °C', { aer: 0, dT0: 10 }]]) {
  let esp = false;
  const cel = [0.07, 199.1].map(f => {
    const oo = Object.assign({ f1: f, f2: f }, o), L = nivellMinim(oo);
    if (L == null) return 'no es forma';
    const d = detall(oo, L); esp = esp || d.esp;
    return `${L.toFixed(1)} dB · ${fmtE(d.E)}`;
  });
  md += `| ${nom} | ${cel.join(' | ')} | ${esp ? '⚡ sí' : 'no (per sota de 2.86 MV/m)'} |\n`;
  process.stdout.write('.');
}

// ── 6. Soroll de les línies (efecte corona)
md += `\n## 6. Soroll de les línies (efecte corona, fórmula BPA amb pluja)\n\n| línia | gradient al conductor | corona | soroll a 1 m | a 900 m |\n|---|---|---|---|---|\n`;
for (const [nom, o] of [['MT 25 kV (Segre)', { vmt: 25, vcat: 25 }], ['MT 66 kV', { vmt: 66, vcat: 0 }], ['AT 132 kV', { vmt: 132, vcat: 0 }], ['MAT 400 kV, un conductor', { vmt: 400, vcat: 0, hmt: 12 }]]) {
  const sc = cfg(o), n1 = F.sorollCorona(sc, 1)[0], nT = F.sorollCorona(sc, 900)[0];
  md += `| ${nom} | ${n1.g.toFixed(1)} kV/cm | ${n1.actiu ? 'sí' : 'no'} | ${n1.actiu ? n1.AN.toFixed(1) + ' dB(A)' + (n1.valida ? '' : ' *') : '—'} | ${nT.actiu ? nT.AN.toFixed(1) + ' dB(A)' : '—'} |\n`;
}
md += `\n\\* fora del rang de validesa de la fórmula (10–25 kV/cm): orientatiu.\n`;

// ── Resum: només els valors probables
const prob = files.filter(r => classe(r.L, r.V) !== 'improbable').sort((a, b) => a.L - b.L);
md += `\n## Resum: valors probables que formen el toroide (🟢 i 🟠)\n\n| separació | freqüència | nivell mínim | alçada on neix (al llindar · +6.0 dB) | via | 1 volta | emissor |\n|---|---|---|---|---|---|---|\n`;
for (const r of prob) md += `| ${cm(r.so)} | ${fmtF(r.f)} | ${r.L.toFixed(1)} dB | **${cm(r.h)}** · ${isFinite(r.h6) ? cm(r.h6) : '—'} | ${r.mec}${r.sat >= 1 ? ' (amb xoc)' : ''} | ${fmtT(r.T)} | ${ICONA[classe(r.L, r.V)]} |\n`;
if (!prob.length) md += `| — | cap | — | — | — | — | — |\n`;

// ── Conclusions automàtiques
const obs = files.filter(r => r.h >= 20 && r.h <= 30 && classe(r.L, r.V) !== 'improbable');
const minL = files.slice().sort((a, b) => a.L - b.L)[0];
const mecs = [...new Set(files.map(r => r.mec))];
md += `\n## Què en surt\n\n`;
md += `- Configuracions que formen l'anell: ${files.length} punts representatius; vies: ${mecs.join(', ')}.\n`;
const minP = prob[0];
if (minP) md += `- Nivell més baix amb un emissor possible: **${minP.L.toFixed(1)} dB** a ${fmtF(minP.f)} amb les fonts a ${cm(minP.so)}; neix a **${cm(minP.h)}** d'alçada.\n`;
if (minL) md += `- Nivell més baix de tots (però 🔴 improbable pel volum d'aire): **${minL.L.toFixed(1)} dB** a ${fmtF(minL.f)} amb les fonts a ${cm(minL.so)}; neix a **${cm(minL.h)}** d'alçada.\n`;
md += `- Amb l'alçada observada (20–30 m): ${obs.length ? obs.map(r => `${cm(r.so)} · ${fmtF(r.f)} · ${r.L.toFixed(1)} dB → ${cm(r.h)}`).join('; ') : 'cap'}.\n`;
md += `- **L'alçada la fixa sobretot la geometria** (separació, alçada de les fonts, feix i creuament). Just al llindar l'anell neix al primer punt on n'hi ha prou, sovint més avall i a un costat; amb uns dB més es desplaça cap al màxim de l'energia del gir (columna «+6.0 dB») i allà s'hi queda.\n`;
md += `- **Condicions que abans faltaven:** l'anell ha de ser més fort que la turbulència (Γ/4πR > σ_w) i el corrent que el forma, més ràpid que la brisa. Sense aquestes condicions sortien anells «possibles» a 0.005 Hz amb 87 dB, que la brisa s'hauria endut.\n`;
md += `- **La finestra dels 10–20 kHz de l'escombrat anterior era un error**: no es modelava la saturació no lineal (l'ona es converteix en dent de serra i es dissipa en el xoc). Amb el xoc inclòs, a kHz no arriba prou ona al punt de formació ni al límit físic.\n`;
md += `- **Preu de l'infrasò:** el volum que ha de moure cada font per cicle creix com 1/f²: a 0.005–0.5 Hz són de 10⁴ a 10⁶ m³ per cicle. La física de l'anell hi funciona (fins i tot amb pocs dB a 1 m), però cap emissor conegut mou tant d'aire: tota la via de l'oscil·lació en infrasò queda com a 🔴 improbable.\n`;
md += `- **La via probable és l'empenta del so entre ~12 Hz i uns centenars d'Hz** (fins a ~3.8 kHz amb les fonts a 10 m): l'ona arriba al punt de formació ja en xoc (dent de serra) i és justament aquesta dissipació la que empeny i fa girar l'aire. Demana 160–180 dB a 1 m per font.\n`;
const esp = files.filter(r => r.esp);
md += `- **Electricitat estàtica:** el fregament del fum o la boira dins el nucli carrega l'anell (de kV/m a ~2–2.7 MV/m amb boira densa), però per sota de la ruptura de l'aire (2.86 MV/m): no hi ha espurnes` +
  (esp.length ? `, excepte amb anells extremadament forts (${esp.map(r => `${cm(r.so)} · ${fmtF(r.f)} · ${r.L.toFixed(1)} dB`).join('; ')}), on el camp estimat la supera i hi hauria espetecs` : '') +
  `. Estimació d'ordre de magnitud (incerta ×10–100). El soroll del gir (Lighthill) és inaudible als valors probables.\n`;
const T7 = prob.filter(r => r.T >= 5 && r.T <= 10);
md += `- **Gir dels nodes (observat: 1 volta cada ~7 s):** ${T7.length ? 'compatible a ' + T7.map(r => `${cm(r.so)} · ${fmtF(r.f)} · ${r.L.toFixed(1)} dB (${fmtT(r.T)})`).join('; ') : 'cap valor probable el reprodueix'}; als altres valors probables, el gir és d'una volta cada 14 s a ~1 min. Amb més dB (més Γ) gira més de pressa.\n`;
md += `- **Línies de 25 kV:** el camp al conductor és molt lluny del llindar de corona: no fan soroll ni intervenen.\n`;
fs.writeFileSync(__dirname + '/../simulation/v041/RESULTATS_ESCOMBRAT.md', md);
console.log('\n' + md);
