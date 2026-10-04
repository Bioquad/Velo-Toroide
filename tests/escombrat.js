/**
 * Escombrat de configuracions: on es formaria el toroide i amb quines
 * freqüències, nivells, formes de senyal (harmònics), separacions, feixos,
 * fases i traçadors. Fa servir el mateix motor físic que el simulador.
 * Ús: node tests/escombrat.js  → escriu simulation/v041/RESULTATS_ESCOMBRAT.md
 */
const F = require('../simulation/v041/fisica.js');
const fs = require('fs');

// Escena del Segre (la mateixa que el simulador)
const BASE = { T: 35, P: 1013, H: 30, W: 3, dirW: 0, turb: 0.2, aot: 0.1, vis: 40, d_obs: 900, v_obs: 5, t_cam: 90,
  mes: 9, dia: 18, hora: 18, tz: 2, lat: 41.6142, lon: 0.6222, az_vis: 232, h_pont: 5, a_riu: 30,
  hmt: 18, hcat: 11, sl: 24, vmt: 25, vcat: 25, ph: 90, rc: 0.9, f_mt: 50, lin_or: 0,
  form: 1, h_src: 5, so: 69.2, sx_off: 0, D_ap: 20, aR: 0.12, n_inj: 4, npols: 1, kdir: 1, swirl: 0, dT0: 0,
  aer: 500, trac: 1, feix: 180, h_creu: 25, phi: -90, forma: 0, nharm: 9, beta: 1.2, IR: 0,
  f1: 1, f2: 1, db1: 150, db2: 150, elev: 0, az_eix: 0 };
const cfg = o => Object.assign({}, BASE, o);
const NOM_FORMA = ['sinus', 'quadrada', 'triangular'];
const fHz = f => f >= 1000 ? (f / 1000) + ' kHz' : f + ' Hz';

function analitza(s) {
  const p = F.anellPrincipalFont(s), an = p.an, m = p.mig;
  const out = { forma: an.es_forma, mec: an.mecanisme, x: p.src.x, h: p.src.y, G: an.Gamma, U: an.Uself };
  if (an.es_forma) {
    const rot = F.rotacioNodes(s, an);
    out.T = rot.T; out.sentit = rot.sentit;
    out.coherent = an.Gamma / (4 * Math.PI * an.R) / Math.max(s.turb, 1e-3);
  }
  const aud = F.harmonicsAudibles(s);
  out.audible = aud.length ? aud[0].f : 0;
  out.xoc = F.distanciaXoc(s, s.f1, s.db1);
  out.rM = m ? Math.min(...m.r) : NaN;
  out.eps = m ? m.eps : 0;
  return out;
}
/** Nivell mínim (dB a 1 m, cada font) perquè es formi l'anell */
function nivellMinim(o) {
  const forma = L => analitza(cfg(Object.assign({}, o, { db1: L, db2: L }))).forma;
  if (!forma(230)) return null;
  let lo = 60, hi = 230;
  if (forma(lo)) return lo;
  for (let i = 0; i < 12; i++) { const mid = (lo + hi) / 2; if (forma(mid)) hi = mid; else lo = mid; }
  return hi;
}
const fmtL = L => L == null ? '> 230' : L.toFixed(1);
const fmtT = T => !isFinite(T) ? '—' : T >= 60 ? (T / 60).toFixed(1) + ' min' : T.toFixed(1) + ' s';
const dbMax = F.dbMax(BASE);
let md = `# Escombrat: on i amb quines freqüències es formaria el toroide\n\n` +
  `Generat amb \`node tests/escombrat.js\` (mateix motor físic que el simulador). Escena del Segre: fonts a 5 m d'alçada, ` +
  `separades 69.2 m, zona de formació de 20 m, fum (500 mg/m³), turbulència σ_w = 0.2 m/s, testimoni a 900 m. ` +
  `Si no es diu el contrari: senyal sinusoïdal, φ = −90° (gir ↺), feix de 180° (altaveu convencional) creuant-se a 25 m.\n\n` +
  `Límit físic del nivell (la rarefacció arriba al buit): **${dbMax.toFixed(0)} dB**. Per sobre, la configuració és impossible.\n\n`;

// ── Taula 1: nivell mínim per freqüència i forma del senyal
const FREQS = [0.02, 0.07, 0.5, 3.57, 13.7, 50, 200, 1000, 2000, 5000, 10000, 20000, 40000];
md += `## 1. Nivell mínim per formar l'anell, segons la freqüència i la forma del senyal\n\n` +
  `| freqüència | nivell mínim sinus | via | on neix (x, h) | Γ (m²/s) | avança | 1 volta | quadrada (N = 9) | triangular | audible al testimoni (sinus) | xoc abans d'arribar |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
const resum = [];
for (const f of FREQS) {
  const Ls = nivellMinim({ f1: f, f2: f, forma: 0 });
  const Lq = nivellMinim({ f1: f, f2: f, forma: 1 });
  const Lt = nivellMinim({ f1: f, f2: f, forma: 2 });
  // amb harmònics, el so pot ser audible encara que el fonamental sigui infrasò
  const audQ = Lq != null && analitza(cfg({ f1: f, f2: f, forma: 1, db1: Lq + 0.5, db2: Lq + 0.5 })).audible;
  const audT = Lt != null && analitza(cfg({ f1: f, f2: f, forma: 2, db1: Lt + 0.5, db2: Lt + 0.5 })).audible;
  const fq = L => L == null ? '> 230' : (L > dbMax ? `~~${fmtL(L)}~~` : fmtL(L));
  let fila = `| ${fHz(f)} | ${Ls == null ? '> 230' : (Ls > dbMax ? `~~${fmtL(Ls)}~~ impossible` : `**${fmtL(Ls)} dB**`)} `;
  if (Ls != null) {
    const a = analitza(cfg({ f1: f, f2: f, db1: Ls + 0.5, db2: Ls + 0.5 }));
    resum.push({ f, L: Ls, a });
    fila += `| ${a.mec} | (${a.x.toFixed(1)}, ${a.h.toFixed(1)}) m | ${a.G.toFixed(1)} | ${a.U.toFixed(2)} m/s | ${fmtT(a.T)} ${a.sentit > 0 ? '↺' : a.sentit < 0 ? '↻' : ''} `;
    fila += `| ${fq(Lq)}${audQ ? ' ♪' : ''} | ${fq(Lt)}${audT ? ' ♪' : ''} | ${a.audible ? '♪ sí (' + fHz(+a.audible.toFixed(0)) + ')' : 'no'} | ${a.xoc < a.rM ? '⚠ a ' + (a.xoc >= 1 ? a.xoc.toFixed(1) + ' m' : (a.xoc * 100).toFixed(0) + ' cm') : 'no'} |\n`;
  } else fila += `| — | — | — | — | — | ${fq(Lq)}${audQ ? ' ♪' : ''} | ${fq(Lt)}${audT ? ' ♪' : ''} | — | — |\n`;
  md += fila;
  process.stdout.write('.');
}

// ── Taula 2: mapa freqüència × nivell
const NIV = [130, 140, 150, 160, 170, 180, 190];
md += `\n## 2. Mapa freqüència × nivell (sinus)\n\nO = es forma per oscil·lació de l'aire · E = es forma per l'empenta estable del so · — = no es forma · ♪ = audible al testimoni · entre parèntesis, l'alçada on neix\n\n` +
  `| freqüència | ${NIV.map(L => L + ' dB').join(' | ')} |\n|---|${NIV.map(() => '---').join('|')}|\n`;
for (const f of FREQS) {
  md += `| ${fHz(f)} | ` + NIV.map(L => {
    const a = analitza(cfg({ f1: f, f2: f, db1: L, db2: L }));
    if (!a.forma) return '—' + (a.audible ? ' ♪' : '');
    return (a.mec === 'oscil·lació' ? 'O' : 'E') + ` (${a.h.toFixed(0)} m)` + (a.audible ? ' ♪' : '');
  }).join(' | ') + ' |\n';
  process.stdout.write('.');
}

// ── Taula 3: separació de les fonts
md += `\n## 3. Separació de les fonts (sinus)\n\n| separació | f | nivell mínim | on neix (x, h) | via |\n|---|---|---|---|---|\n`;
for (const so of [10, 30, 69.2, 150]) for (const f of [0.07, 5000]) {
  const L = nivellMinim({ so, f1: f, f2: f });
  const a = L != null ? analitza(cfg({ so, f1: f, f2: f, db1: L + 0.5, db2: L + 0.5 })) : null;
  md += `| ${so} m | ${fHz(f)} | ${fmtL(L)}${L != null && L > dbMax ? ' (impossible)' : ''} | ${a ? `(${a.x.toFixed(1)}, ${a.h.toFixed(1)}) m` : '—'} | ${a ? a.mec : '—'} |\n`;
  process.stdout.write('.');
}

// ── Taula 4: obertura del feix i alçada de creuament
md += `\n## 4. Obertura del feix i alçada on es creuen (5 kHz)\n\n| obertura | creuament C | nivell mínim | on neix (x, h) | boca necessària |\n|---|---|---|---|---|\n`;
for (const feix of [180, 90, 60, 30]) for (const h_creu of [25, 45]) {
  const L = nivellMinim({ feix, h_creu, f1: 5000, f2: 5000 });
  const a = L != null ? analitza(cfg({ feix, h_creu, f1: 5000, f2: 5000, db1: L + 0.5, db2: L + 0.5 })) : null;
  const bo = F.bocaFeix(cfg({ feix }), 5000);
  md += `| ${feix}° | ${h_creu} m | ${fmtL(L)} | ${a ? `(${a.x.toFixed(1)}, ${a.h.toFixed(1)}) m` : '—'} | ${bo ? (bo * 100).toFixed(1) + ' cm' : 'altaveu'} |\n`;
  process.stdout.write('.');
}

// ── Taula 5: desfasament (gir)
md += `\n## 5. Desfasament S₁→S₂ (0.07 Hz, 161 dB): el gir\n\n| φ | ε (gir de l'aire) | sentit dels nodes | 1 volta |\n|---|---|---|---|\n`;
for (const phi of [0, -45, -90, -135, 180, 90]) {
  const a = analitza(cfg({ phi, f1: 0.0714, f2: 0.0714, db1: 161.2, db2: 161.2 }));
  md += `| ${phi}° | ${a.eps.toFixed(2)} | ${a.forma ? (a.sentit > 0 ? '↺ antihorari' : a.sentit < 0 ? '↻ horari' : '—') : 'no es forma'} | ${a.forma ? fmtT(a.T) : '—'} |\n`;
}

// ── Taula 6: contingut de l'anell (contrast) a kHz
md += `\n## 6. Què porta l'aire on neix (pressió de radiació sobre el contrast)\n\n| contingut | 1 kHz | 5 kHz | 0.07 Hz |\n|---|---|---|---|\n`;
for (const [nom, o] of [['aire net', { aer: 0, dT0: 0 }], ['fum 500 mg/m³', { aer: 500, trac: 1, dT0: 0 }], ['aire +10 °C', { aer: 0, dT0: 10 }], ['boira 5000 mg/m³', { aer: 5000, trac: 2, dT0: 0 }]]) {
  md += `| ${nom} | ` + [1000, 5000, 0.07].map(f => fmtL(nivellMinim(Object.assign({}, o, { f1: f, f2: f })))).join(' | ') + ' |\n';
  process.stdout.write('.');
}

// ── Conclusions automàtiques
const possibles = resum.filter(r => r.L <= dbMax);
const inaudibles = possibles.filter(r => !r.a.audible);
md += `\n## Què en surt\n\n`;
md += `- Freqüències on l'anell és **físicament possible** (≤ ${dbMax.toFixed(0)} dB): ${possibles.map(r => fHz(r.f) + ' (' + r.L.toFixed(0) + ' dB, ' + r.a.mec + ')').join(', ') || 'cap'}.\n`;
md += `- D'aquestes, **inaudibles** per al testimoni (com es va observar): ${inaudibles.map(r => fHz(r.f)).join(', ') || 'cap'}.\n`;
const best = possibles.slice().sort((a, b) => a.L - b.L)[0];
if (best) md += `- El nivell més baix: **${fHz(best.f)} a ${best.L.toFixed(1)} dB** per font, neix a (${best.a.x.toFixed(1)}, ${best.a.h.toFixed(1)}) m per ${best.a.mec}${best.a.audible ? ', però és audible' : ''}.\n`;
md += `- Les columnes «quadrada» i «triangular» marquen amb ♪ quan algun harmònic (3f, 5f…) seria audible per al testimoni. Ratllat = per sobre del límit físic.\n`;
md += `- **Sentit de gir a kHz:** amb λ de pocs centímetres, la fase amb què arriba cada ona depèn del punt exacte on neix l'anell; fora del centre el sentit pot sortir invertit. Només en infrasò el desfasament φ controla el sentit de manera robusta.\n`;
md += `- **Al llindar, l'anell neix més avall i desplaçat** (un dels dos punts simètrics): al màxim de l'energia del gir encara no hi arriba prou; amb uns quants dB més, neix al centre (taula 2).\n`;
md += `- **Aire més calent dins la zona de formació** abaixa molt el nivell necessari a kHz (pressió de radiació sobre el contrast); fum o boira, en canvi, gairebé no hi influeixen.\n`;
fs.writeFileSync(__dirname + '/../simulation/v041/RESULTATS_ESCOMBRAT.md', md);
console.log('\n' + md);
