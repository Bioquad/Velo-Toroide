/* ═══════════════════════════════════════════════════════════════════════════
   Velo Toroide · interfície, simulació temporal i dibuix · V041
   La física és a fisica.js (objecte global FIS). Aquí només hi ha estat,
   controls, integració temporal dels anells i representació.
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';
const F = window.FIS;

/* ── Paràmetres: [mín, màx, pas, defecte, etiqueta, unitat, decimals] ────── */
const DEF = {
  spd:   [-2, 2, 0.05, 0, 'escala temporal (log₁₀)', '', 2],
  T:     [0, 50, 0.1, 35, 'temperatura', '°C', 1],
  P:     [950, 1050, 1, 1013, 'pressió', 'hPa', 0],
  H:     [5, 100, 1, 30, 'humitat relativa', '%', 0],
  W:     [-40, 40, 0.1, 3, 'vent (+ cap a la dreta)', 'km/h', 1],
  turb:  [0, 2, 0.01, 0.2, 'turbulència ambient σ_w', 'm/s', 2],
  aer:   [0, 20000, 10, 0, 'traçador a l\'aire de l\'obertura', 'mg/m³', 0],
  trac:  [0, 1, 1, 0, 'tipus de traçador', '', 0],
  hmt:   [0.5, 80, 0.1, 18, 'alçada MT sobre el riu', 'm', 1],
  hcat:  [0.5, 80, 0.1, 11, 'alçada catenària sobre el riu', 'm', 1],
  sl:    [0, 60, 0.1, 24, 'separació horitzontal MT↔Cat', 'm', 1],
  vmt:   [0, 500, 0.5, 25, 'tensió MT (entre fases, ef.)', 'kV', 1],
  vcat:  [0, 500, 0.5, 25, 'tensió catenària (fase-terra, ef.)', 'kV', 1],
  ph:    [0, 180, 1, 90, 'desfasament MT↔Cat', '°', 0],
  f_mt:  [40, 70, 0.1, 50, 'freqüència de xarxa', 'Hz', 1],
  rc:    [0.2, 3, 0.05, 0.9, 'radi del conductor', 'cm', 2],
  a_riu: [5, 500, 1, 30, 'amplada del riu', 'm', 0],
  h_pont:[0.5, 50, 0.1, 5, 'alçada del pont (fonts) sobre el riu', 'm', 1],
  so:    [0, 50, 0.1, 10, 'separació S₁↔S₂', 'm', 1],
  sx_off:[-30, 30, 0.1, 0, 'posició lateral de S₁S₂', 'm', 1],
  D_ap:  [0.02, 30, 0.01, 0.5, 'diàmetre de l\'obertura D', 'm', 2],
  aR:    [0.05, 0.8, 0.01, 0.2, 'gruix del nucli a/R', '', 2],
  elev:  [0, 90, 1, 0, 'elevació de l\'eix d\'emissió', '°', 0],
  f1:    [0.05, 400, 0.01, 3.5714, 'freqüència S₁', 'Hz', 4],
  f2:    [0.05, 400, 0.01, 3.0, 'freqüència S₂', 'Hz', 4],
  db1:   [0, 191, 0.5, 100, 'nivell S₁ (a 1 m)', 'dB', 1],
  db2:   [0, 191, 0.5, 100, 'nivell S₂ (a 1 m)', 'dB', 1],
  phi:   [-180, 180, 1, 0, 'desfasament S₁→S₂', '°', 0],
  tau:   [-10000, 10000, 1, 0, 'retard τ (so respecte a EM)', 'µs', 0],
  // objectius (problema invers)
  oD:    [1, 100, 0.5, 25, 'diàmetre de l\'anell', 'm', 1],
  on:    [1, 24, 1, 4, 'nodes lluminosos', '', 0],
  oT:    [0.5, 60, 0.1, 7, 'període d\'una volta', 's', 1],
  oh:    [1, 150, 0.5, 25, 'alçada (trampa λ/2)', 'm', 1],
};
const S = {};
Object.keys(DEF).forEach(k => { S[k] = DEF[k][3]; });
const OPC = { dir: 1, usaH: false };            // sentit objectiu i ús de l'alçada
const VIS = { w: true, e: true, n: true, lb: true };

/* ── Presets (valors complets: cap paràmetre queda d'un preset anterior) ── */
const BASE_SEGRE = { T: 35, P: 1013, H: 30, W: 3, turb: 0.2, aer: 0, hmt: 18, hcat: 11, sl: 24,
  vmt: 25, vcat: 25, ph: 90, f_mt: 50, rc: 0.9, a_riu: 30, h_pont: 5, so: 10, sx_off: 0,
  D_ap: 0.5, aR: 0.12, elev: 0, trac: 0, f1: 3.5714, f2: 3.0, db1: 100, db2: 100, phi: 0, tau: 0, spd: 0 };
const BASE_LAB = Object.assign({}, BASE_SEGRE, { T: 20, H: 50, W: 0, turb: 0.02,
  vmt: 0, vcat: 0, a_riu: 5, h_pont: 1, so: 1, elev: 45, D_ap: 0.1, aR: 0.2, f1: 15, f2: 15, db1: 100, db2: 0, aer: 5000, trac: 1 });
const PRESETS = [
  { t: '📍 Segre 2022 — dades reals', d: '3.57 Hz · 100 dB · obertura 0.5 m',
    v: BASE_SEGRE },
  { t: '🎯 Requisits de l\'anell observat', d: 'infrasò 0.15 Hz · obertura 21 m',
    v: Object.assign({}, BASE_SEGRE, { D_ap: 20.83, aR: 0.62, elev: 20, f1: 0.7214, f2: 0.15,
      db1: 125, db2: 140.5, aer: 0 }) },
  { t: '🔬 Canó de vòrtex (laboratori)', d: '15 Hz · 100 dB · D=10 cm · fum',
    v: BASE_LAB },
  { t: '🌀 Batement lent', d: 'f₁−f₂ = 0.1 Hz · nodes giren',
    v: Object.assign({}, BASE_LAB, { f1: 15.1, f2: 15, db2: 100 }) },
  { t: '↻ Sentit invers', d: 'f₂ > f₁ → gir horari',
    v: Object.assign({}, BASE_LAB, { f1: 15, f2: 15.1, db2: 100 }) },
  { t: '⚡ Corona: línia de 400 kV', d: 'efecte corona real al conductor',
    v: Object.assign({}, BASE_SEGRE, { vmt: 400, vcat: 0, hmt: 12, rc: 0.9 }) },
];

/* ── Construcció dels panells ───────────────────────────────────────────── */
function fmtNum(v, dec) { return (Math.abs(v) >= 1e4 && dec === 0) ? v.toLocaleString('ca') : v.toFixed(dec); }
function filaSlider(k) {
  const [mn, mx, st, , lab, un] = DEF[k];
  return `<div class="pr"><div class="pr-h"><span class="pr-l">${lab}</span><span class="pr-v" id="lv-${k}"></span></div>
  <div class="row"><div class="sp"><button class="sb" data-k="${k}" data-d="-1">−</button><button class="sb" data-k="${k}" data-d="1">+</button></div>
  <input type="range" id="sl-${k}" data-k="${k}" min="${mn}" max="${mx}" step="${st}"></div></div>`;
}
function seccio(titol, cos, estil) { return `<div class="sec"${estil ? ` style="${estil}"` : ''}><div class="sec-t">${titol}</div>${cos}</div>`; }
function fm(id) { return `<div class="fm" id="${id}">—</div>`; }

function construeixPanell() {
  const pr = PRESETS.map((p, i) => `<button class="pb-btn" id="pb-${i}" data-preset="${i}"><span class="pb-t">${p.t}</span><span class="pb-d">${p.d}</span></button>`).join('');
  let h = '';
  h += seccio('⚙ configuracions', `<div class="preset-grid">${pr}</div><div class="nota">Prem un preset i després ▶ so.</div>`, 'border-color:#1a3050');
  h += seccio('🎯 objectiu: reproduir un anell',
    ['oD', 'on', 'oT'].map(filaSlider).join('') +
    `<div class="sg"><div class="sg-b on" id="dir-ccw" data-dir="1">↺ antihorari</div><div class="sg-b" id="dir-cw" data-dir="-1">↻ horari</div></div>
     <div class="tr"><span class="tr-l">fixar l'alçada amb la trampa λ/2</span><div class="sw" id="sw-h" data-act="usaH"></div></div>
     <div id="row-oh" style="display:none">${filaSlider('oh')}</div>
     <button class="bn opt" data-act="objectiu" style="width:100%;margin-top:2px">▶ calcula i aplica</button>${fm('fc-obj')}`,
    'border-color:#203848');
  h += seccio('velocitat de simulació', filaSlider('spd'));
  h += seccio('condicions ambientals', ['T', 'P', 'H', 'W', 'turb', 'aer'].map(filaSlider).join('') + fm('fc-amb'));
  h += seccio('🔊 generadors S₁ i S₂', ['f1', 'f2', 'db1', 'db2', 'phi'].map(filaSlider).join('') + fm('fc-ac'));
  h += seccio('🌀 obertura i anell de vòrtex', ['D_ap', 'aR', 'elev'].map(filaSlider).join('') + fm('fc-anell') +
    `<div class="nota">Un camp acústic lineal és irrotacional (∇×v = 0): la vorticitat només neix a la vora d'una obertura on el flux oscil·lant se separa (jet sintètic / canó de vòrtex).</div>`);
  h += seccio('🌊 riu i pont', ['a_riu', 'h_pont', 'so', 'sx_off'].map(filaSlider).join(''));
  h += seccio('⚡ línies elèctriques', ['hmt', 'hcat', 'sl', 'vmt', 'vcat', 'ph', 'f_mt', 'rc'].map(filaSlider).join('') + fm('fc-em'));
  h += seccio('sincronisme so ↔ camp elèctric', filaSlider('tau') +
    `<button class="bn opt" data-act="tauopt" style="width:100%">🎯 τ òptim</button>` + fm('fc-sync'));
  h += seccio('👁 visibilitat', `<div class="sg"><div class="sg-b on" id="trac-0" data-trac="0">pols mineral</div><div class="sg-b" id="trac-1" data-trac="1">fum / boira</div></div>` + fm('fc-vis'));
  h += seccio('visualització',
    [['w', 'fronts d\'ona S₁ i S₂'], ['e', 'mapa del camp elèctric'], ['n', 'nodes λ/4 i λ/2'], ['lb', 'etiquetes']]
      .map(([k, l]) => `<div class="tr"><span class="tr-l">${l}</span><div class="sw on" id="tg-${k}" data-vis="${k}"></div></div>`).join(''));
  document.getElementById('pnl').innerHTML = h;

  document.getElementById('osc-rows').innerHTML = [['s1', 'S₁', '#30c050'], ['s2', 'S₂', '#d07020'], ['mt', 'MT', '#c09030'], ['cat', 'Cat', '#2090c0']]
    .map(([id, n, c]) => `<div class="osc-h"><span style="color:${c}">${n} <span id="osc-f-${id}">—</span></span><span style="color:${c};opacity:.8" id="osc-val-${id}">—</span><button id="spk-${id}" data-audio="${id}">🔊</button></div>
      <canvas class="osc-c" id="osc-${id}" width="148" height="34"></canvas>`).join('');
}

/* ── Paràmetres: lectura/escriptura coherent (slider + etiqueta + estat) ── */
function decimals(st) { const s = String(st); return s.includes('.') ? s.split('.')[1].length : 0; }
function setParam(k, v, silenciós) {
  const [mn, mx, st] = DEF[k];
  if (!Number.isFinite(v)) return;
  S[k] = Math.round(Math.min(mx, Math.max(mn, v)) * 1e6) / 1e6;  // sense arrodonir al pas
  const sl = document.getElementById('sl-' + k); if (sl) sl.value = S[k];
  etiqueta(k);
  if (!silenciós) canviParams();
}
function etiqueta(k) {
  if (k === 'trac') { [0, 1].forEach(i => { const b = document.getElementById('trac-' + i); if (b) b.classList.toggle('on', S.trac === i); }); return; }
  const el = document.getElementById('lv-' + k); if (!el) return;
  const [, , , , , un, dec] = DEF[k];
  let txt = fmtNum(S[k], dec) + (un ? ' ' + un : '');
  if (k === 'spd') txt = '×' + Math.pow(10, S.spd).toFixed(Math.pow(10, S.spd) < 0.1 ? 3 : 2);
  if (k === 'db1' || k === 'db2') txt += S[k] > F.dbMax(S) ? ' ⚠' : '';
  el.textContent = txt;
}
function totesEtiquetes() { Object.keys(DEF).forEach(k => { const sl = document.getElementById('sl-' + k); if (sl) sl.value = S[k]; etiqueta(k); }); }

let derivat = null;   // magnituds derivades (es recalculen quan canvien els paràmetres)
let campCache = null; // mapa del camp elèctric
function canviParams() {
  derivat = calcDerivat();
  campCache = null;
  refreshInfo();
}

/* ── Magnituds derivades estàtiques ─────────────────────────────────────── */
function calcDerivat() {
  const fs = F.fonts(S);
  const anells = fs.map(src => F.anellFont(S, src.f, src.L));
  const iMain = anells[0].Gamma >= anells[1].Gamma ? 0 : 1;
  const an = anells[iMain], fMain = fs[iMain].f;
  const hN = F.hNodePressio(S, S.f1);
  const vida = an.es_forma ? F.vidaAnell(S, an.R, an.a) : 0;
  return { fs, anells, iMain, an, fMain, hN, vida, corona: F.corona(S) };
}

/* ── Simulació temporal ─────────────────────────────────────────────────── */
let simT = 0, PAUSED = false, sigOn = false, emOn = true;
let rings = [];                 // anells vius
const emissio = [0, 0];         // fase acumulada d'emissió de cada font (cicles)
const MAX_RINGS = 40;

function fesAnell(i) {
  const src = derivat.fs[i], an = derivat.anells[i];
  return { src: i, f: src.f, x: src.x, y: src.y, z: 0, R: an.R, a0: an.a, a: an.a, Gamma: an.Gamma,
    T: F.Tk(S), ne: 0, X: 0, age: 0, C0: 1, trapped: false };
}

function updatePhysics(dt) {
  if (!derivat) derivat = calcDerivat();
  const Ta = F.Tk(S), el = S.elev * Math.PI / 180, wind = F.vent(S);
  // Emissió: un anell per cicle i per font, si el criteri de formació es compleix
  if (sigOn) {
    derivat.fs.forEach((src, i) => {
      if (!derivat.anells[i].es_forma) return;
      emissio[i] += src.f * dt;
      while (emissio[i] >= 1) {
        emissio[i] -= 1;
        rings.push(fesAnell(i));
        if (rings.length > MAX_RINGS) rings.shift();
      }
    });
  }
  for (const r of rings) {
    r.age += dt;
    const nuE = F.nuEfectiva(S, r.R);
    r.a = Math.sqrt(r.a0 * r.a0 + 4 * nuE * r.age);       // difusió del nucli
    const lg = Math.log(8 * r.R / r.a) - 0.25;
    const U = lg > 0 ? r.Gamma / (4 * Math.PI * r.R) * lg : 0;
    // Física del plasma (només rellevant si E ≥ E_ruptura)
    let X = 0, best = null;
    if (emOn) {
      for (const [dx, dy] of [[0, r.R], [0, -r.R], [r.R, 0], [-r.R, 0]]) {
        const rr = F.ratiRuptura(S, r.x + dx, r.y + dy * Math.cos(el));
        if (!best || rr.X > best.X) best = rr;
      }
      X = best.X;
    }
    r.X = X;
    if (best) {
      const pl = F.plasma(S, X, best.N, best.E * best.q / Math.SQRT2);
      r.ne = pl.ne;
      const tauC = (r.a * r.a) / (4 * (F.K.KAPPA_TH + nuE - F.nuAir(S)));
      const Teq = Ta + pl.pJoule / (F.rho(S) * F.K.CP) * tauC;
      r.T += (Math.min(Teq, 3e4) - r.T) * (1 - Math.exp(-dt / Math.max(tauC, 1e-3)));
    } else {
      r.ne = 0; r.T += (Ta - r.T) * (1 - Math.exp(-dt / 2));
    }
    // Moviment vertical: autoinducció + flotació (si és calent) o trampa acústica
    let vy = U * Math.sin(el);
    const dT = r.T - Ta;
    r.trapped = false;
    if (dT > 1) {
      const lev = F.levitacio(S, r.f, r.y);
      if (lev.Lambda > 1) { r.trapped = true; vy = (lev.hTrampa - r.y) * 0.5; }
      else vy += Math.sqrt(F.K.G * r.R * dT / r.T) * 0.5; // flotació d'un anell calent
    }
    r.y = Math.max(r.R * Math.cos(el) * 0.2, r.y + vy * dt);
    r.x += wind * dt;
    r.z += U * Math.cos(el) * dt;                           // allunyament (eix del riu)
    r.U = U;
  }
  rings = rings.filter(r => r.a < r.R && r.age < 3600);
}

/** Visibilitat d'un anell segons tres mecanismes físics */
function visibilitat(r) {
  const dil = (r.a0 * r.a0) / (r.a * r.a);
  const tau = F.profOptica(S, r.a, dil);
  const nucli = F.nucliTermo(S, r.Gamma, r.a);   // Γ es conserva; el nucli s'eixampla
  const glowT = r.T > 1500;                    // emissió tèrmica visible
  const glowP = r.ne > 1e16;                   // descàrrega luminescent (N₂)
  const contrast = 1 - Math.exp(-tau);
  const a = Math.max(Math.min(contrast / 0.1, 1), nucli.condensa ? 0.8 : 0, glowT ? Math.min((r.T - 1500) / 1500, 1) : 0, glowP ? 0.7 : 0);
  let mec = 'invisible', col = '150,150,150';
  if (glowT) { mec = 'incandescent'; col = F.colorCosNegre(r.T); }
  else if (glowP) { mec = 'descàrrega'; col = '170,140,255'; }
  else if (nucli.condensa) { mec = 'condensació'; col = '235,240,245'; }
  else if (contrast >= F.K.CONTRAST_MIN) { mec = S.trac ? 'fum' : 'pols'; col = S.trac ? '215,215,220' : '205,160,105'; }
  return { tau, contrast, condensa: nucli.condensa, glowT, glowP, alpha: a, visible: mec !== 'invisible', mec, col };
}

/* ── Panells d'informació ───────────────────────────────────────────────── */
function c(cls, txt) { return `<span class="${cls}">${txt}</span>`; }
function fmtT(s) { if (!isFinite(s)) return '∞'; if (s >= 3600) return (s / 3600).toFixed(1) + ' h'; if (s >= 60) return (s / 60).toFixed(1) + ' min'; if (s >= 1) return s.toFixed(1) + ' s'; return (s * 1000).toFixed(0) + ' ms'; }
function fmtE(v) { return v >= 1e6 ? (v / 1e6).toFixed(2) + ' MV/m' : v >= 1e3 ? (v / 1e3).toFixed(2) + ' kV/m' : v.toFixed(1) + ' V/m'; }
function fmtPa(p) { return p >= 1e3 ? (p / 1e3).toFixed(2) + ' kPa' : p >= 1 ? p.toFixed(1) + ' Pa' : (p * 1e3).toFixed(1) + ' mPa'; }
function set(id, txt) { const e = document.getElementById(id); if (e) e.textContent = txt; }
function setH(id, html) { const e = document.getElementById(id); if (e) e.innerHTML = html; }
function col(id, color) { const e = document.getElementById(id); if (e) e.style.color = color; }

function anellPrincipal() {
  if (!rings.length) return null;
  return rings.reduce((m, r) => (r.age > m.age ? r : m), rings[0]);
}

function refreshInfo() {
  if (!derivat) derivat = calcDerivat();
  const d = derivat, an = d.an, cs = F.cSo(S);
  // Ambient
  setH('fc-amb', `c = ${c('v', cs.toFixed(1) + ' m/s')} · ρ = ${c('v', F.rho(S).toFixed(3) + ' kg/m³')}<br>` +
    `punt de rosada = ${c('v', F.puntRosada(S).toFixed(1) + ' °C')} · ν = ${c('v', (F.nuAir(S) * 1e5).toFixed(2) + '·10⁻⁵ m²/s')}<br>` +
    `nivell màxim físic = ${c('o', F.dbMax(S).toFixed(1) + ' dB')} (p = P_atm)`);
  // Acústica
  const fb = F.fBat(S), sb = F.sentitBat(S);
  const xs1 = F.distanciaXoc(S, S.f1, S.db1);
  const audible = (S.f1 >= 20 && S.db1 > 0) || (S.f2 >= 20 && S.db2 > 0);
  setH('fc-ac', `λ₁ = ${c('v', F.lambda(S, S.f1).toFixed(1) + ' m')} · λ₂ = ${c('v', F.lambda(S, S.f2).toFixed(1) + ' m')}<br>` +
    `node de pressió λ₁/4 = ${c('o', F.hNodePressio(S, S.f1).toFixed(2) + ' m')} · trampa λ₁/2 = ${c('o', F.hNodeVelocitat(S, S.f1).toFixed(2) + ' m')}<br>` +
    `f_bat = ${c('v', fb.toFixed(3) + ' Hz')} · franges ${sb > 0 ? c('g', '↺') : sb < 0 ? c('w', '↻') : c('r', 'quietes')}<br>` +
    `p al node = ${c('v', fmtPa(F.pAcPunt(S, S.sx_off, d.hN)))} · xoc S₁ a ${c(xs1 > d.hN ? 'g' : 'r', isFinite(xs1) ? xs1.toFixed(0) + ' m' : '∞')}<br>` +
    `${audible ? c('w', '⚠ audible (≥ 20 Hz): el testimoni no va sentir res') : c('g', '✓ infrasò: inaudible')}`);
  // Anell
  const fonts = ['S₁', 'S₂'];
  let ha = '';
  d.anells.forEach((a, i) => {
    if (d.fs[i].L <= 0) { ha += `${fonts[i]}: ${c('r', 'apagada')}<br>`; return; }
    ha += `${fonts[i]}: u = ${c('v', a.u.toFixed(2) + ' m/s')} (Mach ${a.mach.toFixed(3)}) · L₀/D = ${c('v', a.F.toFixed(2))}<br>` +
      `&nbsp;Holman ${c(a.es_forma ? 'g' : 'r', a.holman.toFixed(3) + (a.es_forma ? ' > 0.16 ✓ anell' : ' < 0.16 ✗ no s\'enrotlla'))}<br>`;
  });
  if (an.es_forma) {
    ha += `Γ = ${c('o', an.Gamma.toFixed(2) + ' m²/s')} · R = ${c('v', an.R.toFixed(2) + ' m')} · a = ${c('v', an.a.toFixed(2) + ' m')}<br>` +
      `U (Saffman) = ${c('v', an.Uself.toFixed(2) + ' m/s')} · Re_Γ = ${c('v', an.ReG.toExponential(1))}<br>` +
      `nodes de Widnall n ≈ 2.5·R/a = ${c('o', an.nWidnall)} · vida = ${c('v', fmtT(d.vida))}<br>` +
      `${an.F > 4 ? c('w', 'L₀/D > 4: part del flux queda com a jet de cua') : ''}${an.lineal ? '' : c('w', ' ⚠ Mach > 0.1: acústica no lineal')}`;
    const lev = F.levitacio(S, d.fMain, Math.max(d.hN, S.h_pont + 1));
    ha += `<br>trampa acústica d'un anell calent Λ = v²k/2g = ${c(lev.Lambda > 1 ? 'g' : 'r', lev.Lambda.toExponential(1))} ${lev.Lambda > 1 ? '✓' : '(cal > 1)'}`;
  }
  setH('fc-anell', ha);
  // Camp elèctric al node λ/4 (o a l'anell principal)
  const r0 = anellPrincipal();
  const px = r0 ? r0.x : S.sx_off, py = r0 ? r0.y : d.hN;
  const rr = F.ratiRuptura(S, px, py);
  const cor = d.corona;
  setH('fc-em', `${r0 ? 'a l\'anell' : 'al node λ/4'} (x=${px.toFixed(1)}, y=${py.toFixed(1)} m):<br>` +
    `E_pic = ${c('v', fmtE(rr.E))} · E_ruptura = ${c('v', fmtE(rr.Ebd))}<br>` +
    `E/E_rup = ${c(rr.X >= 1 ? 'g' : 'r', rr.X.toExponential(2))} → ${rr.X >= 1 ? c('g', 'allau electrònica') : 'falta un factor ' + c('r', '×' + (1 / Math.max(rr.X, 1e-12)).toExponential(1))}<br>` +
    `rarefacció acústica: N baixa un ${c('v', ((1 - rr.Ebd / rr.Ebd0) * 100).toFixed(3) + ' %')}<br>` +
    cor.map(k => `${k.nom}: superfície ${c('v', fmtE(k.Es))} / Peek ${fmtE(k.Ec)} ${k.actiu ? c('o', '⚡ CORONA') : c('g', 'sense corona')}`).join('<br>') +
    `<div class="nota">MT modelada com un sol conductor a tensió de fase: és una cota superior (en una línia trifàsica els camps es compensen).</div>`);
  // Sincronisme
  const sy = F.sincronisme(S, py);
  setH('fc-sync', `temps de viatge = ${c('v', (sy.tv * 1e3).toFixed(1) + ' ms')}<br>` +
    (sy.comensurable ? `f_xarxa/f₁ = ${c('g', sy.n)} (sincronisme estable)<br>fase EM a la rarefacció = ${c('v', sy.fase.toFixed(0) + '°')} · factor = ${c('v', sy.q.toFixed(3))}`
      : `f₁ no és submúltiple de f_xarxa: la coincidència rarefacció–pic EM es repeteix sola · factor = 1`) +
    `<div class="nota">El sincronisme només modula el camp efectiu (≤ ×1). No hi ha cap amplificació ressonant entre so i camp elèctric en aire neutre.</div>`);
  refreshVis();
}

function refreshVis() {
  const r0 = anellPrincipal(), d = derivat;
  let h = '';
  if (r0) {
    const v = visibilitat(r0);
    h += `anell principal: ${c(v.visible ? 'g' : 'r', v.mec)}<br>` +
      `pols: τ_òptica = ${c('v', v.tau.toExponential(1))} → contrast ${c(v.contrast >= 0.02 ? 'g' : 'r', (v.contrast * 100).toFixed(2) + ' %')} (cal ≥ 2 %)<br>` +
      `condensació al nucli: ${v.condensa ? c('g', 'sí') : c('r', 'no')} · T plasma = ${c('v', Math.round(r0.T) + ' K')}<br>` +
      `n_e = ${c('v', r0.ne.toExponential(1) + ' m⁻³')}`;
  } else if (d.an.es_forma) {
    const nuc = F.nucliTermo(S, d.an.Gamma, d.an.a), tau = F.profOptica(S, d.an.a, 1);
    h += `predicció (prem ▶ so):<br>pols τ = ${c('v', tau.toExponential(1))} · contrast ${c(1 - Math.exp(-tau) >= 0.02 ? 'g' : 'r', ((1 - Math.exp(-tau)) * 100).toFixed(2) + ' %')}<br>` +
      `nucli: Δp = ${c('v', fmtPa(nuc.dp))} · T = ${c('v', nuc.Tnucli.toFixed(2) + ' °C')} (rosada ${F.puntRosada(S).toFixed(1)} °C) ${nuc.condensa ? c('g', '→ condensa') : c('r', '→ no condensa')}`;
  } else h += c('r', 'no es forma cap anell');
  h += `<div class="nota">Mecanismes reals: (1) pols o fum arrossegat, (2) condensació per la caiguda de pressió al nucli, (3) emissió de plasma si E ≥ E_ruptura.</div>`;
  setH('fc-vis', h);
}

/* ── Comparació amb l'observació ────────────────────────────────────────── */
function comparacio() {
  const d = derivat, r0 = anellPrincipal(), an = d.an;
  const fb = F.fBat(S);
  const rows = [];
  const ok = (b) => b ? '✓' : '✗';
  const forma = an.es_forma;
  rows.push(['anell format', forma ? '✓' : '✗', forma]);
  const D = forma ? 2 * an.R : 0;
  rows.push(['diàmetre ≈ 25 m', forma ? D.toFixed(1) + ' m ' + ok(Math.abs(D - 25) < 7.5) : '—', forma && Math.abs(D - 25) < 7.5]);
  const tub = forma ? 2 * (r0 ? r0.a : an.a) : 0;
  rows.push(['tub ≈ 3 m', forma ? tub.toFixed(1) + ' m ' + ok(Math.abs(tub - 3) < 1.5) : '—', forma && Math.abs(tub - 3) < 1.5]);
  const y = r0 ? r0.y : NaN;
  rows.push(['alçada 20–30 m', r0 ? y.toFixed(1) + ' m ' + ok(y >= 20 && y <= 30) : '—', r0 && y >= 20 && y <= 30]);
  rows.push(['4 nodes', forma ? an.nWidnall + ' ' + ok(an.nWidnall === 4) : '—', forma && an.nWidnall === 4]);
  const Trot = fb > 0 && forma ? an.nWidnall / fb : Infinity;
  rows.push(['1 volta ≈ 7 s', isFinite(Trot) ? Trot.toFixed(1) + ' s ' + ok(Math.abs(Trot - 7) < 2) : '—', Math.abs(Trot - 7) < 2]);
  const Uv = forma ? an.Uself : NaN;
  rows.push(['deriva lenta amb el vent', forma ? Uv.toFixed(2) + ' m/s ' + ok(Uv < 1.5) : '—', forma && Uv < 1.5]);
  rows.push(['durada ≈ 3 min', forma ? fmtT(d.vida) + ' ' + ok(d.vida > 120 && d.vida < 300) : '—', forma && d.vida > 120 && d.vida < 300]);
  let vis = null;
  if (r0) vis = visibilitat(r0);
  rows.push(['visible de dia', vis ? vis.mec + ' ' + ok(vis.visible) : '—', vis && vis.visible]);
  rows.push(['color taronja', vis ? (vis.glowT ? '✓' : vis.mec === 'pols' ? '≈ ocre' : '✗') : '—', vis && vis.glowT]);
  const silenci = !((S.f1 >= 20 && S.db1 > 0) || (S.f2 >= 20 && S.db2 > 0));
  rows.push(['sense so audible', ok(silenci), silenci]);
  document.getElementById('cmp-rows').innerHTML = rows.map(([l, v, b]) =>
    `<div class="cr"><span>${l}</span><b style="color:${b ? '#40c080' : v === '—' ? '#4a5468' : '#e05050'}">${v}</b></div>`).join('');
  const n = rows.filter(r => r[2]).length;
  set('cmp-score', `${n}/${rows.length} condicions complertes amb física establerta`);
}

/* ── Capçalera i estat ──────────────────────────────────────────────────── */
function refreshHeader() {
  const d = derivat, an = d.an, r0 = anellPrincipal();
  set('hv-hn', d.hN.toFixed(1) + ' m');
  set('hv-gam', an.es_forma ? an.Gamma.toFixed(2) + ' m²/s' : '—');
  set('hv-u', an.es_forma ? an.Uself.toFixed(2) + ' m/s' : '—');
  const X = r0 ? r0.X : F.ratiRuptura(S, S.sx_off, d.hN).X;
  set('hv-x', emOn ? X.toExponential(1) : 'EM off'); col('hv-x', X >= 1 ? '#40c080' : '#e05050');
  const vis = r0 ? visibilitat(r0) : null;
  set('hv-vis', vis ? vis.mec : '—'); col('hv-vis', vis && vis.visible ? '#40c080' : '#8892aa');
  set('hv-n', an.es_forma ? String(an.nWidnall) : '—');
  set('hv-vida', an.es_forma ? fmtT(d.vida) : '—');
  const es = estat();
  set('hv-es', es.n); col('hv-es', es.c);
  set('ph-n', es.n); col('ph-n', es.c); set('ph-d', es.d);
}
function estat() {
  const d = derivat, an = d.an, r0 = anellPrincipal();
  if (!sigOn && !rings.length) return { n: 'aturat', d: 'Prem ▶ so per emetre', c: '#4a5468' };
  if (sigOn && !an.es_forma) {
    const a = d.anells[d.iMain];
    return { n: 'ones sense anell', d: `L₀/D = ${a.F.toFixed(3)}, Holman = ${a.holman.toFixed(3)} < 0.16: el flux no se separa de l'obertura. Puja el nivell, baixa la freqüència o redueix D.`, c: '#e0a030' };
  }
  if (!r0) return { n: 'emetent', d: 'formant el primer anell…', c: '#7f77dd' };
  const v = visibilitat(r0);
  const extra = r0.trapped ? ' · atrapat a λ/2' : '';
  if (!v.visible) return { n: 'anell invisible', d: `Γ = ${r0.Gamma.toFixed(2)} m²/s · U = ${(r0.U || 0).toFixed(2)} m/s · existeix però sense traçador ni emissió de llum${extra}`, c: '#8860e0' };
  return { n: 'anell visible (' + v.mec + ')', d: `y = ${r0.y.toFixed(1)} m · edat ${fmtT(r0.age)} · nucli a = ${r0.a.toFixed(2)} m${extra}`, c: '#40c080' };
}

/* ── Dibuix ─────────────────────────────────────────────────────────────── */
const cv = document.getElementById('cv'), cx = cv.getContext('2d');
let DPR = 1;
function rc() { DPR = window.devicePixelRatio || 1; cv.width = cv.offsetWidth * DPR; cv.height = cv.offsetHeight * DPR; campCache = null; }
window.addEventListener('resize', rc);

function escena(W, H) {
  const d = derivat;
  const linies = S.vmt > 0 || S.vcat > 0;
  const xspan = Math.max(S.a_riu / 2 + 2, linies ? S.sl / 2 + 8 : 0, S.so / 2 + Math.abs(S.sx_off) + 2, d.an.R * 3, 3);
  let ymax = Math.max(linies ? Math.max(S.hmt, S.hcat) + 6 : 0, S.h_pont + 2, d.an.R * 4 + S.h_pont, 4);
  const r0 = anellPrincipal();
  if (r0 && r0.R > 1) ymax = Math.max(ymax, Math.min(r0.y, 150) + r0.R + 4);
  if (d.hN < 150) ymax = Math.max(ymax, d.hN + 5);
  ymax = Math.min(ymax * 1.08, 400);
  const pxM = Math.min(W / (2 * xspan), (H - 34 * DPR) / ymax);
  const ox = W / 2, oy = H - 24 * DPR;
  return { pxM, ox, oy, X: x => ox + x * pxM, Y: y => oy - y * pxM, ymax, xspan };
}

function dibuixaCamp(W, H, sc) {
  const step = Math.round(9 * DPR);
  if (!campCache || campCache.W !== W || campCache.H !== H) {
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const o = off.getContext('2d');
    const Ebd0 = F.K.ETD_CRIT * F.nDens(F.pAtm(S), F.Tk(S));
    for (let py = 0; py < sc.oy; py += step) for (let px = 0; px < W; px += step) {
      const x = (px + step / 2 - sc.ox) / sc.pxM, y = (sc.oy - py - step / 2) / sc.pxM;
      const E = F.campEPic(S, x, y);
      const l = Math.log10(Math.max(E / Ebd0, 1e-7));      // -7 … 0
      const t = Math.max(0, Math.min(1, (l + 6) / 6));
      if (t <= 0) continue;
      o.fillStyle = `rgba(${Math.round(80 + 175 * t)},${Math.round(60 + 60 * t)},${Math.round(160 - 140 * t)},${0.06 + 0.32 * t})`;
      o.fillRect(px, py, step, step);
    }
    campCache = { W, H, img: off };
  }
  cx.drawImage(campCache.img, 0, 0);
}

function draw() {
  const W = cv.width, H = cv.height; if (!W || !H) return;
  const sc = escena(W, H), d = derivat, f = DPR;
  cx.clearRect(0, 0, W, H);
  const g = cx.createLinearGradient(0, 0, 0, sc.oy);
  g.addColorStop(0, '#07101f'); g.addColorStop(1, '#0d1a2c');
  cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  if (VIS.e && (S.vmt > 0 || S.vcat > 0)) dibuixaCamp(W, H, sc);
  // Riu i ribes
  const rh = (S.a_riu / 2) * sc.pxM;
  cx.fillStyle = '#16120c'; cx.fillRect(0, sc.oy, W, H - sc.oy);
  cx.fillStyle = 'rgba(25,70,140,.6)'; cx.fillRect(sc.ox - rh, sc.oy, 2 * rh, H - sc.oy);
  cx.strokeStyle = 'rgba(60,150,240,.8)'; cx.lineWidth = 1.5 * f;
  cx.beginPath(); cx.moveTo(sc.ox - rh, sc.oy); cx.lineTo(sc.ox + rh, sc.oy); cx.stroke();
  // Pont
  const yb = sc.Y(S.h_pont);
  cx.fillStyle = 'rgba(120,120,110,.35)'; cx.fillRect(sc.ox - rh - 20 * f, yb, 2 * rh + 40 * f, 4 * f);
  cx.font = `${9 * f}px sans-serif`; cx.textAlign = 'left';
  if (VIS.lb) { cx.fillStyle = 'rgba(160,160,140,.6)'; cx.fillText('pont ' + S.h_pont.toFixed(1) + ' m', sc.ox - rh - 18 * f, yb - 4 * f); cx.fillStyle = 'rgba(100,170,230,.8)'; cx.fillText('riu ' + S.a_riu.toFixed(0) + ' m', sc.ox - rh + 3 * f, sc.oy + 12 * f); }
  // Nodes acústics
  if (VIS.n) {
    [[d.hN, 'node de pressió λ/4', 'rgba(130,110,230,.55)'], [F.hNodeVelocitat(S, S.f1), 'trampa d\'aire calent λ/2', 'rgba(80,200,140,.45)']].forEach(([h, l, cc]) => {
      if (h > sc.ymax) return;
      const y = sc.Y(h);
      cx.strokeStyle = cc; cx.lineWidth = f; cx.setLineDash([4 * f, 4 * f]);
      cx.beginPath(); cx.moveTo(20 * f, y); cx.lineTo(W - 20 * f, y); cx.stroke(); cx.setLineDash([]);
      if (VIS.lb) { cx.fillStyle = cc; cx.textAlign = 'right'; cx.fillText(l + ' · ' + h.toFixed(1) + ' m', W - 22 * f, y - 3 * f); }
    });
  }
  // Fronts d'ona
  if (VIS.w && sigOn) {
    d.fs.forEach((src, i) => {
      if (src.L <= 0) return;
      const lam = F.lambda(S, src.f), cs = F.cSo(S);
      const a = Math.min(0.5, 0.08 + src.L / 400);
      const cc = i === 0 ? '90,200,110' : '230,140,40';
      const maxR = Math.hypot(sc.xspan, sc.ymax) * 1.2;
      const off = (cs * simT) % lam;
      for (let rr = off; rr < maxR; rr += lam) {
        if (rr * sc.pxM < 2) continue;
        cx.strokeStyle = `rgba(${cc},${a * (1 - rr / maxR)})`; cx.lineWidth = f;
        cx.beginPath(); cx.arc(sc.X(src.x), sc.Y(src.y), rr * sc.pxM, Math.PI, 2 * Math.PI); cx.stroke();
        if (lam * sc.pxM < 3) break;
      }
    });
  }
  // Fonts amb obertura
  d.fs.forEach((src, i) => {
    const w = Math.max(S.D_ap * sc.pxM, 5 * f), x = sc.X(src.x), y = sc.Y(src.y);
    cx.fillStyle = src.L > 0 ? (i === 0 ? '#3aa050' : '#c07020') : '#333';
    cx.fillRect(x - w / 2, y - 4 * f, w, 4 * f);
    if (VIS.lb) { cx.fillStyle = 'rgba(200,200,200,.7)'; cx.textAlign = 'center'; cx.fillText((i ? 'S₂ ' : 'S₁ ') + src.f.toFixed(2) + ' Hz · ' + src.L.toFixed(0) + ' dB', x, y + (14 + 11 * i) * f); }
  });
  // Conductors (secció transversal: les línies van al llarg del riu)
  F.conductors(S).forEach((cd, i) => {
    const x = sc.X(cd.x), y = sc.Y(cd.y), on = emOn && cd.V > 0;
    const cr = d.corona[i];
    cx.strokeStyle = 'rgba(140,140,118,.25)'; cx.lineWidth = f;
    cx.beginPath(); cx.moveTo(x, sc.oy); cx.lineTo(x, y); cx.stroke();
    if (on && cr.actiu) {
      const gg = cx.createRadialGradient(x, y, 0, x, y, 14 * f);
      gg.addColorStop(0, 'rgba(170,140,255,.9)'); gg.addColorStop(1, 'rgba(120,80,255,0)');
      cx.fillStyle = gg; cx.beginPath(); cx.arc(x, y, 14 * f, 0, 2 * Math.PI); cx.fill();
    }
    cx.fillStyle = on ? (i === 0 ? '#d85a30' : '#378add') : '#444';
    cx.beginPath(); cx.arc(x, y, 4 * f, 0, 2 * Math.PI); cx.fill();
    if (VIS.lb) { cx.fillStyle = on ? 'rgba(220,200,180,.8)' : 'rgba(120,120,120,.6)'; cx.textAlign = 'center'; cx.fillText(cd.nom + ' ' + (i ? S.vcat : S.vmt).toFixed(0) + ' kV · ' + cd.y.toFixed(1) + ' m' + (on && cr.actiu ? ' ⚡corona' : ''), x, y - 8 * f); }
  });
  // Anells
  const el = S.elev * Math.PI / 180, fb = F.fBat(S), sb = F.sentitBat(S);
  for (const r of rings) {
    const v = visibilitat(r);
    const x = sc.X(r.x), y = sc.Y(r.y), rx = r.R * sc.pxM, ry = Math.max(r.R * Math.cos(el), r.R * 0.06) * sc.pxM;
    const lw = Math.max(2 * r.a * sc.pxM, 1.5 * f);
    if (rx < 1) continue;
    if (v.visible) {
      cx.strokeStyle = `rgba(${v.col},${0.15 * v.alpha})`; cx.lineWidth = lw * 1.8;
      cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI); cx.stroke();
      cx.strokeStyle = `rgba(${v.col},${0.75 * v.alpha})`; cx.lineWidth = lw;
      cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI); cx.stroke();
    } else {
      cx.strokeStyle = 'rgba(160,150,220,.35)'; cx.lineWidth = f; cx.setLineDash([3 * f, 4 * f]);
      cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI); cx.stroke(); cx.setLineDash([]);
    }
    // Nodes: modes de Widnall; el patró gira amb les franges del batement (hipòtesi)
    const n = Math.min(Math.max(1, Math.round(2.5 * r.R / r.a)), 24);
    const ang0 = fb > 0 ? sb * 2 * Math.PI * fb * simT / n : 0;
    for (let k = 0; k < n; k++) {
      const ang = -(ang0 + k * 2 * Math.PI / n);
      const nx = x + Math.cos(ang) * rx, ny = y + Math.sin(ang) * ry;
      const al = v.visible ? v.alpha : 0.25;
      cx.fillStyle = v.visible ? `rgba(${v.col},${al})` : 'rgba(170,160,230,.35)';
      cx.beginPath(); cx.arc(nx, ny, v.visible ? Math.max(lw * 0.45, 2 * f) : 2.5 * f, 0, 2 * Math.PI); cx.fill();
    }
  }
  const r0 = anellPrincipal();
  if (r0 && VIS.lb) {
    const v = visibilitat(r0);
    cx.fillStyle = v.visible ? `rgba(${v.col},.9)` : 'rgba(170,160,230,.7)';
    cx.textAlign = 'center'; cx.font = `bold ${10 * f}px sans-serif`;
    cx.fillText(`anell Ø ${(2 * r0.R).toFixed(1)} m · ${v.visible ? v.mec : 'invisible'}${r0.trapped ? ' · atrapat' : ''}`,
      sc.X(r0.x), sc.Y(r0.y + r0.R * Math.max(Math.cos(el), 0.06)) - 8 * f);
    cx.font = `${9 * f}px sans-serif`;
  }
  // Barra inferior d'informació
  if (VIS.lb) {
    cx.fillStyle = 'rgba(140,130,210,.7)'; cx.textAlign = 'left'; cx.font = `${9 * f}px sans-serif`;
    cx.fillText(`t = ${simT.toFixed(1)} s · anells vius ${rings.length} · escala ${(1 / sc.pxM * 50 * f).toFixed(1)} m / 50 px`, 8 * f, H - 6 * f);
    if (VIS.e && (S.vmt > 0 || S.vcat > 0)) { cx.textAlign = 'right'; cx.fillText('color de fons: log₁₀(E/E_ruptura) de −6 (fosc) a 0 (vermell)', W - 8 * f, H - 6 * f); }
  }
}

/* ── Bucle principal ────────────────────────────────────────────────────── */
let lastW = null, lastInfo = 0;
function loop(now) {
  requestAnimationFrame(loop);
  if (lastW === null) lastW = now;
  const wdt = Math.min((now - lastW) / 1000, 0.05); lastW = now;
  try {
    if (!PAUSED) {
      const sdt = wdt * Math.pow(10, S.spd);
      // Subpassos: amb escala ×100 l'emissió i la difusió segueixen sent estables
      const nSub = Math.min(50, Math.ceil(sdt / 0.02));
      for (let i = 0; i < nSub; i++) { simT += sdt / nSub; updatePhysics(sdt / nSub); }
    }
    draw();
    if (now - lastInfo > 250) { lastInfo = now; refreshHeader(); refreshVis(); comparacio(); }
  } catch (e) { console.warn('loop:', e); }
}

/* ── Accions ────────────────────────────────────────────────────────────── */
function toggleSo() {
  sigOn = !sigOn;
  const b = document.getElementById('b-go'); b.textContent = sigOn ? '⏹ so' : '▶ so'; b.classList.toggle('on', sigOn);
}
function toggleEM() {
  emOn = !emOn;
  const b = document.getElementById('b-em'); b.textContent = emOn ? '⚡ EM ON' : '🔌 EM OFF'; b.classList.toggle('em-off', !emOn);
  campCache = null; refreshInfo();
}
function togglePausa() {
  PAUSED = !PAUSED;
  const b = document.getElementById('b-pa'); b.classList.toggle('on', PAUSED); b.textContent = PAUSED ? '▶ reprèn' : '⏸ pausa';
}
function reinicia() {
  if (sigOn) toggleSo();
  if (!emOn) toggleEM();
  if (PAUSED) togglePausa();
  simT = 0; rings = []; emissio[0] = emissio[1] = 0;
  refreshInfo();
}
let activePreset = -1;
function loadPreset(i) {
  reinicia();
  const p = PRESETS[i];
  Object.keys(DEF).forEach(k => { if (k in p.v) setParam(k, p.v[k], true); });
  activePreset = i;
  document.querySelectorAll('.pb-btn').forEach((b, j) => b.classList.toggle('active', j === i));
  canviParams();
}
function tauOptim() {
  // τ que posa el pic del camp EM a la mateixa fase que la rarefacció al node
  const sy = F.sincronisme(Object.assign({}, S, { tau: 0 }), derivat.hN);
  const T = 1e6 / S.f_mt;
  let tau = -(sy.tv * 1e6) % T;
  if (tau > T / 2) tau -= T; if (tau < -T / 2) tau += T;
  setParam('tau', Math.round(tau));
}
function aplicaObjectiu() {
  const obj = { D: S.oD, n: S.on, Trot: S.oT, sentit: OPC.dir, h: OPC.usaH ? S.oh : null };
  let r = F.requisits(S, obj);
  let fAuto = false;
  if (!OPC.usaH && r.mach > 0.1) { r = F.requisits(Object.assign({}, S, { f1: 0.8 * r.fMaxLineal }), obj); fAuto = true; }
  // La font que forma l'anell treballa a la freqüència base; l'altra a base+f_bat
  const fBase = r.f1, fAlt = fBase + r.fb;
  setParam('D_ap', r.D_ap, true); setParam('aR', r.aR, true);
  if (OPC.dir > 0) { setParam('f1', fAlt, true); setParam('f2', fBase, true); setParam('db2', Math.min(r.L, DEF.db2[1]), true); setParam('db1', Math.min(r.L, DEF.db1[1]) - 15, true); }
  else { setParam('f1', fBase, true); setParam('f2', fAlt, true); setParam('db1', Math.min(r.L, DEF.db1[1]), true); setParam('db2', Math.min(r.L, DEF.db2[1]) - 15, true); }
  canviParams();
  setH('fc-obj', `obertura D = ${c('v', r.D_ap.toFixed(2) + ' m')} · a/R = ${c('v', r.aR.toFixed(2))}<br>` +
    `f base = ${c('v', fBase.toFixed(3) + ' Hz')}${fAuto ? ' (rebaixada per mantenir Mach < 0.1)' : ''} · f_bat = ${c('v', r.fb.toFixed(3) + ' Hz')}<br>` +
    `u a l'obertura = ${c('v', r.u.toFixed(1) + ' m/s')} (Mach ${r.mach.toFixed(2)})<br>` +
    `nivell necessari = ${c(r.L <= F.dbMax(S) ? 'g' : 'r', r.L.toFixed(1) + ' dB a 1 m')} ${r.L > F.dbMax(S) ? '— impossible (> ' + F.dbMax(S).toFixed(0) + ' dB)' : ''}<br>` +
    `${r.viable ? c('g', '✓ físicament viable') : c('r', '✗ no viable')}${r.audible ? c('w', ' · audible') : c('g', ' · infrasò')}` +
    `<div class="nota">La segona font, ${15} dB més baixa, només aporta el batement que fa girar el patró de nodes (hipòtesi).</div>`);
}

/* ── Oscil·loscopi i àudio ──────────────────────────────────────────────── */
function drawOsc(id, freq, amp, phDeg, color, sig) {
  const c2 = document.getElementById('osc-' + id); if (!c2) return;
  const o = c2.getContext('2d'), W = c2.width, H = c2.height;
  o.fillStyle = '#02040a'; o.fillRect(0, 0, W, H);
  o.strokeStyle = 'rgba(20,40,60,.6)'; o.lineWidth = .5;
  o.beginPath(); o.moveTo(0, H / 2); o.lineTo(W, H / 2); o.stroke();
  if (amp <= 0) { o.fillStyle = 'rgba(60,80,100,.7)'; o.font = '7px monospace'; o.textAlign = 'center'; o.fillText('off', W / 2, H / 2 + 3); return; }
  const tw = Math.max(3 / Math.max(freq, 0.01), 0.04), ph = phDeg * Math.PI / 180;
  o.strokeStyle = color; o.lineWidth = 1.3; o.beginPath();
  for (let px = 0; px < W; px++) {
    const y = Math.sin(2 * Math.PI * freq * (simT - tw + px / W * tw) + ph) * amp;
    const py = H / 2 * (1 - y * 0.85); px ? o.lineTo(px, py) : o.moveTo(px, py);
  }
  o.stroke();
}
function updateOsc() {
  if (document.getElementById('osc-panel').style.display === 'none') return;
  const ampDb = L => Math.min(1, Math.sqrt(L / 191));
  drawOsc('s1', S.f1, sigOn ? ampDb(S.db1) : 0, 0, '#28b040');
  drawOsc('s2', S.f2, sigOn ? ampDb(S.db2) : 0, S.phi, '#c06010');
  drawOsc('mt', S.f_mt, emOn ? Math.min(1, S.vmt / 50) : 0, 0, '#b08020');
  drawOsc('cat', S.f_mt, emOn ? Math.min(1, S.vcat / 50) : 0, S.ph, '#1888b0');
  set('osc-f-s1', S.f1.toFixed(2) + ' Hz'); set('osc-f-s2', S.f2.toFixed(2) + ' Hz');
  set('osc-f-mt', S.f_mt.toFixed(1) + ' Hz'); set('osc-f-cat', S.f_mt.toFixed(1) + ' Hz');
  set('osc-val-s1', sigOn && S.db1 > 0 ? S.db1.toFixed(0) + ' dB' : 'off');
  set('osc-val-s2', sigOn && S.db2 > 0 ? S.db2.toFixed(0) + ' dB' : 'off');
  set('osc-val-mt', emOn ? S.vmt.toFixed(0) + ' kV' : 'off'); set('osc-val-cat', emOn ? S.vcat.toFixed(0) + ' kV' : 'off');
}
let audioCtx = null;
const audioNodes = {};
function freqAudio(id) {
  const f = id === 's1' ? S.f1 : id === 's2' ? S.f2 : S.f_mt;
  return f < 20 ? f * 100 : f;
}
function toggleAudio(id) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const btn = document.getElementById('spk-' + id);
  if (audioNodes[id]) {
    try { audioNodes[id].osc.stop(); audioNodes[id].g.disconnect(); } catch (e) { /* ja aturat */ }
    delete audioNodes[id]; btn.textContent = '🔊'; btn.style.color = ''; return;
  }
  audioCtx.resume().then(() => {
    const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.frequency.value = freqAudio(id); g.gain.value = 0.08;
    osc.connect(g); g.connect(audioCtx.destination); osc.start();
    audioNodes[id] = { osc, g };
    btn.textContent = freqAudio(id) !== (id === 's1' ? S.f1 : id === 's2' ? S.f2 : S.f_mt) ? '♦×100' : '■';
    btn.style.color = '#40e080';
  }).catch(() => {});
}
function updateAudio() {
  if (!audioCtx) return;
  Object.keys(audioNodes).forEach(id => audioNodes[id].osc.frequency.setTargetAtTime(freqAudio(id), audioCtx.currentTime, 0.05));
}

/* ── Configuracions desades ─────────────────────────────────────────────── */
const CFG_KEY = 'toroide_cfgs_v041';
function cfgAll() { try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch (e) { return {}; } }
function cfgPut(all) { try { localStorage.setItem(CFG_KEY, JSON.stringify(all)); return true; } catch (e) { alert('No es pot desar (emmagatzematge del navegador no disponible).'); return false; } }
function cfgSave() {
  const name = prompt('Nom de la configuració:', 'exp_' + new Date().toLocaleTimeString().replace(/:/g, '')); if (!name) return;
  const all = cfgAll(); all[name] = { S: Object.assign({}, S), opc: Object.assign({}, OPC), ts: new Date().toLocaleString() };
  if (cfgPut(all)) cfgRefreshList();
}
function cfgLoad() {
  const sel = document.getElementById('cfg-list'); if (!sel.value) return;
  const cfg = cfgAll()[sel.value]; if (!cfg) return;
  reinicia();
  Object.keys(DEF).forEach(k => setParam(k, k in cfg.S ? cfg.S[k] : DEF[k][3], true));   // claus noves → valor per defecte
  if (cfg.opc) { setDir(cfg.opc.dir || 1); setUsaH(!!cfg.opc.usaH); }
  canviParams();
  document.getElementById('savecfg-panel').style.display = 'none';
}
function cfgDelete() {
  const sel = document.getElementById('cfg-list'); if (!sel.value) return;
  if (!confirm('Eliminar "' + sel.value + '"?')) return;
  const all = cfgAll(); delete all[sel.value]; if (cfgPut(all)) cfgRefreshList();
}
function cfgRefreshList() {
  const sel = document.getElementById('cfg-list'); sel.innerHTML = '';
  const all = cfgAll(), noms = Object.keys(all);
  if (!noms.length) { sel.innerHTML = '<option value="">(cap configuració desada)</option>'; return; }
  noms.forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = n + ' [' + all[n].ts + ']'; sel.appendChild(o); });
}
function setDir(dv) { OPC.dir = dv; document.getElementById('dir-ccw').classList.toggle('on', dv === 1); document.getElementById('dir-cw').classList.toggle('on', dv === -1); }
function setUsaH(v) { OPC.usaH = v; document.getElementById('sw-h').classList.toggle('on', v); document.getElementById('row-oh').style.display = v ? 'block' : 'none'; }

/* ── Esdeveniments (delegació) ──────────────────────────────────────────── */
function initEvents() {
  document.body.addEventListener('input', e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k && e.target.type === 'range') setParam(k, +e.target.value);
  });
  document.body.addEventListener('click', e => {
    const t = e.target.closest('[data-k],[data-preset],[data-act],[data-vis],[data-dir],[data-audio],[data-trac]');
    if (!t) return;
    if (t.dataset.k && t.dataset.d) { const k = t.dataset.k; setParam(k, S[k] + (+t.dataset.d) * DEF[k][2]); return; }
    if (t.dataset.preset) { loadPreset(+t.dataset.preset); return; }
    if (t.dataset.vis) { const k = t.dataset.vis; VIS[k] = !VIS[k]; t.classList.toggle('on', VIS[k]); return; }
    if (t.dataset.dir) { setDir(+t.dataset.dir); return; }
    if (t.dataset.trac) { setParam('trac', +t.dataset.trac); return; }
    if (t.dataset.audio) { toggleAudio(t.dataset.audio); return; }
    const acts = {
      so: toggleSo, em: toggleEM, pausa: togglePausa, reinicia,
      osc: () => { const p = document.getElementById('osc-panel'); p.style.display = p.style.display === 'none' ? 'block' : 'none'; },
      desa: () => { const p = document.getElementById('savecfg-panel'); const obre = p.style.display !== 'block'; p.style.display = obre ? 'block' : 'none'; if (obre) cfgRefreshList(); },
      'cfg-desa': cfgSave, 'cfg-carrega': cfgLoad, 'cfg-elimina': cfgDelete,
      objectiu: aplicaObjectiu, tauopt: tauOptim, usaH: () => setUsaH(!OPC.usaH),
    };
    if (acts[t.dataset.act]) acts[t.dataset.act]();
  });
}

/* ── Arrencada ──────────────────────────────────────────────────────────── */
construeixPanell();
initEvents();
totesEtiquetes();
canviParams();
setInterval(() => { try { updateOsc(); updateAudio(); } catch (e) { console.warn('osc:', e); } }, 100);
setTimeout(() => { rc(); requestAnimationFrame(loop); }, 50);
