/* ═══════════════════════════════════════════════════════════════════════════
   Velo Toroide · interfície, simulació temporal i dibuix · V042
   La física és a fisica.js (objecte global FIS). Aquí només hi ha estat,
   controls, integració temporal dels anells i representació.
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';
const F = window.FIS;

/* ── Paràmetres: [mín, màx, pas, defecte, etiqueta, unitat, decimals] ────── */
const DEF = {
  spd:   [-2, 2, 0.05, 0, 'escala temporal (log₁₀)', '', 2],
  model: [0, 1, 1, 0, 'model del fenomen', '', 0],
  // Model B: nodes emissors
  e_n:   [1, 12, 1, 4, 'nombre de nodes', '', 0],
  e_D:   [1, 100, 0.5, 25, 'diàmetre de l\'òrbita', 'm', 1],
  e_cap: [0.1, 10, 0.1, 3, 'mida del cap (gruix del rastre)', 'm', 1],
  e_T:   [0.5, 120, 0.1, 7, 'període d\'una volta', 's', 1],
  e_sent:[-1, 1, 2, 1, 'sentit', '', 0],
  e_tau: [0.05, 30, 0.01, 1.3, 'durada de la llum del rastre τ', 's', 2],
  e_P:   [0, 1000, 0.1, 1.5, 'potència radiada per node', 'kW', 1],
  e_tipus:[0, 1, 1, 1, 'tipus d\'emissió', '', 0],
  e_Temp:[800, 6000, 10, 2000, 'temperatura (incandescència)', 'K', 0],
  e_h:   [1, 150, 0.5, 25, 'alçada del centre', 'm', 1],
  e_vida:[5, 900, 1, 180, 'durada', 's', 0],
  e_ext: [1, 300, 1, 25, 'durada de l\'extinció', 's', 0],
  // Lloc, data i hora (posició del sol)
  mes:   [1, 12, 1, 9, 'mes', '', 0],
  dia:   [1, 31, 1, 18, 'dia', '', 0],
  hora:  [0, 24, 0.05, 18, 'hora local', 'h', 2],
  tz:    [-12, 14, 1, 2, 'fus horari (CEST = +2)', 'h', 0],
  lat:   [-90, 90, 0.0001, 41.6142, 'latitud', '°', 4],
  lon:   [-180, 180, 0.0001, 0.6222, 'longitud', '°', 4],
  aot:   [0, 0.5, 0.01, 0.1, 'terbolesa β d\'Ångström (aerosols)', '', 2],
  // Testimoni
  az_vis:[0, 360, 0.5, 232, 'direcció de la mirada (azimut)', '°', 1],
  d_obs: [5, 1000, 1, 60, 'distància testimoni → origen de l\'anell', 'm', 0],
  // Atmosfera
  T:     [0, 50, 0.1, 35, 'temperatura', '°C', 1],
  P:     [950, 1050, 1, 1013, 'pressió', 'hPa', 0],
  H:     [5, 100, 1, 30, 'humitat relativa', '%', 0],
  W:     [0, 40, 0.1, 3, 'vent', 'km/h', 1],
  dirW:  [0, 360, 1, 90, 'direcció del vent (0 = s\'allunya, 90 = →)', '°', 0],
  turb:  [0.001, 2, 0.001, 0.2, 'turbulència ambient σ_w', 'm/s', 3],
  // Traçador
  aer:   [0, 20000, 1, 0, 'traçador a l\'aire de l\'obertura', 'mg/m³', 0],
  trac:  [0, 3, 1, 0, 'tipus de traçador', '', 0],
  // Emissor i anell
  h_src: [0.5, 150, 0.1, 5, 'alçada de l\'emissor sobre el riu', 'm', 1],
  D_ap:  [0.02, 30, 0.01, 0.5, 'diàmetre de l\'obertura D', 'm', 2],
  aR:    [0.02, 0.8, 0.01, 0.12, 'gruix del nucli a/R', '', 2],
  elev:  [-90, 90, 1, 0, 'elevació de l\'eix d\'emissió', '°', 0],
  az_eix:[-180, 180, 1, 0, 'eix respecte a la mirada (0 = s\'allunya)', '°', 0],
  npols: [0, 20, 1, 0, 'empentes d\'aire de l\'emissor (1 empenta = 1 anell)', '', 0],
  n_inj: [0, 12, 1, 0, 'injectors de traçador (0 = nodes espontanis)', '', 0],
  swirl: [-1, 1, 0.01, 0, 'swirl a l\'obertura w/u (+ = ↺)', '', 2],
  kdir:  [-1, 1, 2, 1, 'sentit de l\'ona de Kelvin', '', 0],
  dT0:   [-10, 300, 0.5, 0, 'excés de temperatura de l\'aire emès', 'K', 1],
  // Fonts
  f1:    [0.0005, 400, 0.0001, 3.5714, 'freqüència S₁', 'Hz', 4],
  f2:    [0.0005, 400, 0.0001, 3.0, 'freqüència S₂', 'Hz', 4],
  db1:   [0, 191, 0.5, 100, 'nivell S₁ (a 1 m)', 'dB', 1],
  db2:   [0, 191, 0.5, 100, 'nivell S₂ (a 1 m)', 'dB', 1],
  phi:   [-180, 180, 1, 0, 'desfasament S₁→S₂', '°', 0],
  // Riu, pont i línies
  a_riu: [5, 500, 1, 30, 'amplada del riu', 'm', 0],
  h_pont:[0.5, 50, 0.1, 5, 'alçada del pont (testimoni a +1.6 m)', 'm', 1],
  so:    [0, 50, 0.1, 10, 'separació S₁↔S₂', 'm', 1],
  sx_off:[-30, 30, 0.1, 0, 'posició lateral de l\'emissor', 'm', 1],
  hmt:   [0.5, 80, 0.1, 18, 'alçada MT sobre el riu', 'm', 1],
  hcat:  [0.5, 80, 0.1, 11, 'alçada catenària sobre el riu', 'm', 1],
  sl:    [0, 60, 0.1, 24, 'separació horitzontal MT↔Cat', 'm', 1],
  vmt:   [0, 500, 0.5, 25, 'tensió MT (entre fases, ef.)', 'kV', 1],
  vcat:  [0, 500, 0.5, 25, 'tensió catenària (fase-terra, ef.)', 'kV', 1],
  ph:    [0, 180, 1, 90, 'desfasament MT↔Cat', '°', 0],
  f_mt:  [40, 70, 0.1, 50, 'freqüència de xarxa', 'Hz', 1],
  rc:    [0.2, 3, 0.05, 0.9, 'radi del conductor', 'cm', 2],
  tau:   [-10000, 10000, 1, 0, 'retard τ (so respecte a EM)', 'µs', 0],
  // Objectiu (problema invers)
  oD:    [0.1, 100, 0.1, 25, 'diàmetre', 'm', 1],
  otub:  [0.01, 20, 0.01, 3, 'gruix del tub', 'm', 2],
  on:    [1, 12, 1, 4, 'nodes', '', 0],
  oT:    [0.5, 120, 0.1, 7, 'període d\'una volta', 's', 1],
  oh:    [0.5, 150, 0.5, 25, 'alçada', 'm', 1],
  oU:    [0.01, 10, 0.01, 1, 'velocitat pròpia màxima', 'm/s', 2],
  ovida: [5, 900, 1, 180, 'durada', 's', 0],
  oC:    [0.05, 5, 0.05, 2, 'contrast amb el cel', '', 2],
};
const S = {};
Object.keys(DEF).forEach(k => { S[k] = DEF[k][3]; });
const OPC = { dir: 1, prioritat: 'deriva', mov: 'contra' };
const VIS = { w: true, e: true, n: false, lb: true, sol: true };

/* ── Configuracions ─────────────────────────────────────────────────────────
   Les configuracions de l'observació es construeixen amb el disseny invers
   (FIS.dissenya), de manera que sempre són coherents amb la física actual.
   La geometria del testimoni (mirada i distància) i el vent no es van mesurar:
   els valors triats són els que fan compatible el fenomen amb l'observació.
   ─────────────────────────────────────────────────────────────────────────── */
const AMB_SEGRE = { T: 35, P: 1013, H: 30, W: 3, dirW: 90, turb: 0.2, aer: 0, trac: 0, aot: 0.1,
  mes: 9, dia: 18, hora: 18, tz: 2, lat: 41.6142, lon: 0.6222, az_vis: 232, d_obs: 60,
  hmt: 18, hcat: 11, sl: 24, vmt: 25, vcat: 25, ph: 90, f_mt: 50, rc: 0.9, tau: 0,
  a_riu: 30, h_pont: 5, h_src: 5, so: 10, sx_off: 0, D_ap: 0.5, aR: 0.12, elev: 0, az_eix: 0,
  npols: 0, n_inj: 0, swirl: 0, kdir: 1, dT0: 0,
  f1: 3.5714, f2: 3.0, db1: 100, db2: 100, phi: 0, spd: 0, model: 0,
  e_n: 4, e_D: 25, e_cap: 3, e_T: 7, e_sent: 1, e_tau: 1.3, e_P: 1.5, e_tipus: 1, e_Temp: 2000, e_h: 25, e_vida: 180, e_ext: 25 };
const OBJ_SEGRE = { oD: 25, otub: 3, on: 4, oT: 7, oh: 25, oU: 1, ovida: 180, oC: 2 };
const AMB_LAB = Object.assign({}, AMB_SEGRE, { T: 20, H: 50, W: 0, turb: 0.02, aer: 5000, trac: 1,
  vmt: 0, vcat: 0, a_riu: 5, h_pont: 1, h_src: 1, so: 0, D_ap: 0.1, aR: 0.2, elev: 45,
  f1: 15, f2: 15, db1: 100, db2: 0, npols: 5, d_obs: 5 });
const PRESETS = [
  { t: '📍 Configuració original (V040)', d: '3.57 Hz · 100 dB · obertura 0.5 m',
    v: AMB_SEGRE },
  { t: '🏆 Segre: millor compromís', d: 'pols al contrallum · anell contra la brisa',
    v: Object.assign({}, AMB_SEGRE, { dirW: 180, aot: 0.1, d_obs: 40, trac: 0 }), solDv: 3,
    obj: Object.assign({}, OBJ_SEGRE), prioritat: 'deriva' },
  { t: '🍃 Segre: arrossegat per la brisa', d: 'brisa de 0.5 km/h · sense velocitat pròpia',
    v: Object.assign({}, AMB_SEGRE, { W: 0.5, dirW: 45, aot: 0.1, d_obs: 40, trac: 0 }), solDv: 5,
    obj: Object.assign({}, OBJ_SEGRE), prioritat: 'deriva', mov: 'brisa' },
  { t: '🌀 Segre: prioritat gir de 7 s', d: 'mostra el conflicte gir ↔ deriva',
    v: Object.assign({}, AMB_SEGRE, { dirW: 180, aot: 0.1, d_obs: 40, trac: 0 }), solDv: 3,
    obj: Object.assign({}, OBJ_SEGRE), prioritat: 'rotacio' },
  { t: '🧪 Assaig real a escala 1:10', d: 'anell de 2.5 m · fum blanc · sol de costat',
    v: Object.assign({}, AMB_SEGRE, { W: 1, dirW: 180, aot: 0.05, d_obs: 15, trac: 1, h_pont: 1, a_riu: 10, vmt: 0, vcat: 0 }), solDv: 100,
    obj: { oD: 2.5, otub: 0.3, on: 4, oT: 7, oh: 3, oU: 0.5, ovida: 30, oC: 0.3 }, prioritat: 'deriva' },
  { t: '✴ Segre: nodes emissors (sodi)', d: '4 fonts en òrbita · rastre de 1.3 s · 1.5 kW',
    v: Object.assign({}, AMB_SEGRE, { model: 1, W: 0.5, dirW: 90, aot: 0.1, d_obs: 40, e_tipus: 1, e_P: 1.5 }), solDv: 90 },
  { t: '✴ Segre: nodes incandescents', d: '2000 K · caldrien ~500 kW per node',
    v: Object.assign({}, AMB_SEGRE, { model: 1, W: 0.5, dirW: 90, aot: 0.1, d_obs: 40, e_tipus: 0, e_Temp: 2000, e_P: 500 }), solDv: 90 },
  { t: '🔬 Canó de vòrtex de taula', d: '15 Hz · 100 dB · D = 10 cm · fum',
    v: AMB_LAB },
  { t: '⚡ Corona: línia de 400 kV', d: 'efecte corona real al conductor',
    v: Object.assign({}, AMB_SEGRE, { vmt: 400, vcat: 0, hmt: 12 }) },
];

/* ── Construcció dels panells ───────────────────────────────────────────── */
function filaSlider(k) {
  const [mn, mx, st, , lab] = DEF[k];
  return `<div class="pr"><div class="pr-h"><span class="pr-l">${lab}</span><span class="pr-v" id="lv-${k}"></span></div>
  <div class="row"><div class="sp"><button class="sb" data-k="${k}" data-d="-1">−</button><button class="sb" data-k="${k}" data-d="1">+</button></div>
  <input type="range" id="sl-${k}" data-k="${k}" min="${mn}" max="${mx}" step="${st}"></div></div>`;
}
function seccio(titol, cos, estil) { return `<div class="sec"${estil ? ` style="${estil}"` : ''}><div class="sec-t">${titol}</div>${cos}</div>`; }
function fm(id) { return `<div class="fm" id="${id}">—</div>`; }
function grup(id, items) { return `<div class="sg" id="${id}">${items.map(([v, l]) => `<div class="sg-b" data-grup="${id}" data-v="${v}">${l}</div>`).join('')}</div>`; }

function construeixPanell() {
  const pr = PRESETS.map((p, i) => `<button class="pb-btn" id="pb-${i}" data-preset="${i}"><span class="pb-t">${p.t}</span><span class="pb-d">${p.d}</span></button>`).join('');
  let h = '';
  h += seccio('⚙ configuracions', `<div class="preset-grid">${pr}</div><div class="nota">Prem una configuració i després ▶ so.</div>`, 'border-color:#1a3050');
  h += seccio('🔬 model del fenomen', grup('g-model', [[0, 'A · anell de vòrtex'], [1, 'B · nodes emissors']]) +
    `<div class="nota" id="nota-model"></div>`, 'border-color:#305030');
  h += seccio('✴ nodes emissors (model B)', ['e_n', 'e_D', 'e_cap', 'e_T', 'e_tau', 'e_P', 'e_Temp', 'e_h', 'e_vida', 'e_ext'].map(filaSlider).join('') +
    `<div class="pr-l" style="margin:2px 0">emissió</div>${grup('g-etipus', [[0, 'incandescència'], [1, 'sodi 589 nm']])}
     <div class="pr-l" style="margin:2px 0">sentit</div>${grup('g-esent', [[1, '↺ antihorari'], [-1, '↻ horari']])}
     <div style="display:flex;gap:3px;margin-top:2px"><button class="bn opt" data-act="eTau" style="flex:1">τ per a cua del 25 %</button><button class="bn opt" data-act="eP" style="flex:1">potència per C = 1</button></div>` + fm('fc-emis'), 'border-color:#504020');
  h += seccio('🎯 disseny invers: reproduir un anell',
    ['oD', 'otub', 'on', 'oT', 'oh', 'oU', 'ovida', 'oC'].map(filaSlider).join('') +
    `<div class="pr-l" style="margin:2px 0">sentit dels nodes</div>${grup('g-dir', [[1, '↺ antihorari'], [-1, '↻ horari']])}
     <div class="pr-l" style="margin:2px 0">moviment de l'anell</div>${grup('g-mov', [['contra', 'propi (contra la brisa)'], ['brisa', 'arrossegat per la brisa']])}
     <div class="pr-l" style="margin:2px 0">prioritat (gir i deriva lenta són incompatibles)</div>${grup('g-prio', [['deriva', 'deriva lenta'], ['rotacio', 'gir ràpid']])}
     <button class="bn opt" data-act="objectiu" style="width:100%;margin-top:2px">▶ dissenya i aplica</button>${fm('fc-obj')}`,
    'border-color:#203848');
  h += seccio('velocitat de simulació', filaSlider('spd'));
  h += seccio('📍 lloc, data i hora', ['mes', 'dia', 'hora', 'tz', 'lat', 'lon', 'aot'].map(filaSlider).join('') + fm('fc-sol'));
  h += seccio('👁 testimoni', ['az_vis', 'd_obs'].map(filaSlider).join('') +
    `<button class="bn opt" data-act="miraSol" style="width:100%">☀ mirar 3° al costat del sol</button>` + fm('fc-obs'));
  h += seccio('🌬 atmosfera', ['T', 'P', 'H', 'W', 'dirW', 'turb'].map(filaSlider).join('') + fm('fc-amb'));
  h += seccio('🌀 emissor i anell de vòrtex', ['h_src', 'D_ap', 'aR', 'elev', 'az_eix', 'npols', 'n_inj', 'swirl', 'dT0'].map(filaSlider).join('') +
    `<div class="pr-l" style="margin:2px 0">sentit de l'ona de Kelvin sembrada</div>${grup('g-kdir', [[1, '↺'], [-1, '↻']])}` + fm('fc-anell') +
    `<div class="nota">Un camp acústic lineal és irrotacional (∇×v = 0): la vorticitat només neix a la vora d'una obertura on el flux oscil·lant se separa (jet sintètic / canó de vòrtex).</div>`);
  h += seccio('🔊 generadors S₁ i S₂', ['f1', 'f2', 'db1', 'db2', 'phi'].map(filaSlider).join('') + fm('fc-ac'));
  h += seccio('👁 traçador i visibilitat', grup('g-trac', [[0, 'pols'], [1, 'fum'], [2, 'boira'], [3, 'fum taronja']]) + filaSlider('aer') + fm('fc-vis'));
  h += seccio('🌊 riu i pont', ['a_riu', 'h_pont', 'so', 'sx_off'].map(filaSlider).join(''));
  h += seccio('⚡ línies elèctriques', ['hmt', 'hcat', 'sl', 'vmt', 'vcat', 'ph', 'f_mt', 'rc', 'tau'].map(filaSlider).join('') +
    `<button class="bn opt" data-act="tauopt" style="width:100%">🎯 τ òptim</button>` + fm('fc-em'));
  h += seccio('visualització',
    [['w', 'fronts d\'ona S₁ i S₂'], ['e', 'mapa del camp elèctric'], ['n', 'nodes acústics λ/4 i λ/2'], ['sol', 'direcció del sol'], ['lb', 'etiquetes']]
      .map(([k, l]) => `<div class="tr"><span class="tr-l">${l}</span><div class="sw${VIS[k] ? ' on' : ''}" id="tg-${k}" data-vis="${k}"></div></div>`).join(''));
  document.getElementById('pnl').innerHTML = h;

  document.getElementById('osc-rows').innerHTML = [['s1', 'S₁', '#30c050'], ['s2', 'S₂', '#d07020'], ['mt', 'MT', '#c09030'], ['cat', 'Cat', '#2090c0']]
    .map(([id, n, c]) => `<div class="osc-h"><span style="color:${c}">${n} <span id="osc-f-${id}">—</span></span><span style="color:${c};opacity:.8" id="osc-val-${id}">—</span><button id="spk-${id}" data-audio="${id}">🔊</button></div>
      <canvas class="osc-c" id="osc-${id}" width="148" height="34"></canvas>`).join('');
}

/* ── Paràmetres: lectura/escriptura coherent (slider + etiqueta + estat) ── */
function setParam(k, v, silenciós) {
  const [mn, mx] = DEF[k];
  if (!Number.isFinite(v)) return;
  S[k] = Math.round(Math.min(mx, Math.max(mn, v)) * 1e6) / 1e6;   // sense arrodonir al pas
  const sl = document.getElementById('sl-' + k); if (sl) sl.value = S[k];
  etiqueta(k);
  if (!silenciós) canviParams();
}
function marcaGrup(id, v) { document.querySelectorAll(`[data-grup="${id}"]`).forEach(b => b.classList.toggle('on', String(b.dataset.v) === String(v))); }
function etiqueta(k) {
  if (k === 'trac') { marcaGrup('g-trac', S.trac); return; }
  if (k === 'kdir') { marcaGrup('g-kdir', S.kdir); return; }
  if (k === 'model') { marcaGrup('g-model', S.model); return; }
  if (k === 'e_tipus') { marcaGrup('g-etipus', S.e_tipus); return; }
  if (k === 'e_sent') { marcaGrup('g-esent', S.e_sent); return; }
  const el = document.getElementById('lv-' + k); if (!el) return;
  const [, , , , , un, dec] = DEF[k];
  let txt = S[k].toFixed(dec) + (un ? ' ' + un : '');
  if (k === 'spd') txt = '×' + Math.pow(10, S.spd).toFixed(Math.pow(10, S.spd) < 0.1 ? 3 : 2);
  if (k === 'npols' && S.npols === 0) txt = 'continu';
  if (k === 'n_inj' && S.n_inj === 0) txt = 'espontanis';
  if ((k === 'db1' || k === 'db2') && S[k] > F.dbMax(S)) txt += ' ⚠';
  if (k === 'swirl' && Math.abs(S.swirl) > 0.6) txt += ' ⚠';
  el.textContent = txt;
}
function totesEtiquetes() {
  Object.keys(DEF).forEach(k => { const sl = document.getElementById('sl-' + k); if (sl) sl.value = S[k]; etiqueta(k); });
  marcaGrup('g-dir', OPC.dir); marcaGrup('g-prio', OPC.prioritat); marcaGrup('g-mov', OPC.mov);
}

function objectiuActual() { return { D: S.oD, tub: S.otub, h: S.oh, nodes: S.on, Trot: S.oT, sentit: OPC.dir, durada: S.ovida, Umax: S.oU, passiu: OPC.mov === 'brisa' }; }
let derivat = null;   // magnituds derivades (es recalculen quan canvien els paràmetres)
let avaluacio = null; // comparació amb l'observació
let campCache = null; // mapa del camp elèctric
function canviParams() {
  derivat = calcDerivat();
  try { avaluacio = S.model === 1 ? F.avaluaEmissors(S) : F.avaluaObservacio(S, objectiuActual()); } catch (e) { console.warn('avaluació:', e); avaluacio = null; }
  campCache = null;
  refreshInfo(); comparacio();
}

/* ── Magnituds derivades estàtiques ─────────────────────────────────────── */
function calcDerivat() {
  const p = F.anellPrincipalFont(S);
  return { fs: p.fs, anells: p.ans, iMain: p.i, an: p.an, fMain: p.src.f, hN: F.hNodePressio(S, S.f1),
    vida: F.vidaAnell2(S, p.an), corona: F.corona(S), sol: F.posicioSol(S) };
}

/* ── Simulació temporal ─────────────────────────────────────────────────── */
let simT = 0, PAUSED = false, sigOn = false, emOn = true;
let rings = [];
let fenT = null;                // model B: temps des de l'inici del fenomen
const emissio = [0.5, 0.5];     // fase d'emissió (l'anell es forma al final de l'ejecció: mig cicle)
const emesos = [0, 0];          // anells emesos per cada font
const MAX_RINGS = 40;

function fesAnell(i) {
  const src = derivat.fs[i], an = derivat.anells[i];
  const vida = F.vidaAnell2(S, an);
  return { src: i, an, vida, x: src.x, y: src.y, z: 0, age: 0, ang: 0,
    T: F.Tk(S) + S.dT0, ne: 0, X: 0, ev: F.estatAnell(S, an, 0, vida) };
}

function updatePhysics(dt) {
  if (!derivat) derivat = calcDerivat();
  if (S.model === 1) {
    if (fenT !== null) { fenT += dt; if (fenT > S.e_vida + S.e_ext + 5) { fenT = null; if (sigOn) toggleSo(); } }
    return;
  }
  const Ta = F.Tk(S);
  // Emissió: un anell per cicle i per font, si el criteri de formació es compleix
  if (sigOn) {
    derivat.fs.forEach((src, i) => {
      if (!derivat.anells[i].es_forma) return;
      if (S.npols > 0 && emesos[i] >= S.npols) return;
      emissio[i] += src.f * dt;
      while (emissio[i] >= 1 && (S.npols === 0 || emesos[i] < S.npols)) {
        emissio[i] -= 1; emesos[i]++;
        rings.push(fesAnell(i));
        if (rings.length > MAX_RINGS) rings.shift();
      }
    });
  }
  for (const r of rings) {
    r.age += dt;
    r.ev = F.estatAnell(S, r.an, r.age, r.vida);
    // Ruptura elèctrica (només si hi ha línies en tensió)
    let X = 0, best = null;
    if (emOn && (S.vmt > 0 || S.vcat > 0)) {
      for (const [dx, dy] of [[0, r.ev.R], [0, -r.ev.R], [r.ev.R, 0], [-r.ev.R, 0]]) {
        const rr = F.ratiRuptura(S, r.x + dx, r.y + dy);
        if (!best || rr.X > best.X) best = rr;
      }
      X = best.X;
    }
    r.X = X;
    // Excés de temperatura inicial diluït per l'entrainment, més l'escalfament Joule si n'hi ha
    const Tbase = Ta + S.dT0 * r.ev.dil;
    if (best && X >= 1) {
      const pl = F.plasma(S, X, best.N, best.E * best.q / Math.SQRT2);
      r.ne = pl.ne;
      const tauC = (r.ev.a * r.ev.a) / (4 * (F.K.KAPPA_TH + F.nuEfectiva(S, r.ev.R) - F.nuAir(S)));
      const Teq = Tbase + pl.pJoule / (F.rho(S) * F.K.CP) * tauC;
      r.T += (Math.min(Teq, 3e4) - r.T) * (1 - Math.exp(-dt / Math.max(tauC, 1e-3)));
    } else {
      r.ne = 0; r.T = Tbase;
    }
    const v = F.velocitatAnell(S, r.an, r.ev, r.T - Ta);
    r.x += v.vx * dt; r.y = Math.max(r.y + v.vy * dt, r.ev.R * 0.1); r.z += v.vz * dt;
    if (!r.ev.disp) r.ang += F.rotacioNodes(S, r.an, r.ev).om * dt;
  }
  rings = rings.filter(r => r.age < r.vida.tCoh + 4 * r.vida.tFade && r.age < 3600);
}

/** Aparença d'un anell vist pel testimoni */
function visibilitat(r) {
  const tau = F.tauPunt(S, r);
  const g = F.geometriaVisio(S, r.x, r.y, r.z);
  const ap = F.aparenca(S, tau, g.az, g.el);
  const nucli = F.nucliTermo(S, r.ev.Gamma, r.ev.a);
  const glowT = r.T > 1500, glowP = r.ne > 1e16;
  let mec = 'invisible', alpha = Math.min(Math.abs(ap.C) / 0.3, 1);
  if (glowT) mec = 'incandescent';
  else if (glowP) mec = 'descàrrega';
  else if (nucli.condensa) mec = 'condensació';
  else if (ap.C >= 0.1) mec = 'brillant';
  else if (Math.abs(ap.C) >= F.K.CONTRAST_MIN) mec = ap.C > 0 ? 'tènue' : 'silueta fosca';
  // Color de visualització: el RGB físic normalitzat
  const mx = Math.max(...ap.rgb, 1e-9);
  let col = ap.rgb.map(v => Math.round(255 * v / mx)).join(',');
  if (glowT) col = F.colorCosNegre(r.T); else if (glowP) col = '170,140,255'; else if (nucli.condensa) col = '235,240,245';
  if (glowT || glowP || nucli.condensa) alpha = 0.9;
  return { tau, ap, g, condensa: nucli.condensa, glowT, glowP, alpha, visible: mec !== 'invisible', mec, col };
}

/* ── Panells d'informació ───────────────────────────────────────────────── */
function c(cls, txt) { return `<span class="${cls}">${txt}</span>`; }
function fmtT(s) { if (!isFinite(s)) return '∞'; if (s >= 3600) return (s / 3600).toFixed(1) + ' h'; if (s >= 60) return (s / 60).toFixed(1) + ' min'; if (s >= 1) return s.toFixed(1) + ' s'; return (s * 1000).toFixed(0) + ' ms'; }
function fmtE(v) { return v >= 1e6 ? (v / 1e6).toFixed(2) + ' MV/m' : v >= 1e3 ? (v / 1e3).toFixed(2) + ' kV/m' : v.toFixed(1) + ' V/m'; }
function set(id, txt) { const e = document.getElementById(id); if (e) e.textContent = txt; }
function setH(id, html) { const e = document.getElementById(id); if (e) e.innerHTML = html; }
function col(id, color) { const e = document.getElementById(id); if (e) e.style.color = color; }
function anellPrincipal() { return rings.length ? rings.reduce((m, r) => (r.age > m.age ? r : m), rings[0]) : null; }
const NOMS_TRAC = ['pols de riu', 'fum blanc', 'boira', 'fum taronja'];

function refreshInfo() {
  if (!derivat) derivat = calcDerivat();
  const d = derivat, an = d.an, cs = F.cSo(S), sol = d.sol;
  // Sol
  const En = F.iluminanciaSol(S, sol.alt), T = F.transSol(S, sol.alt), m = F.massaAire(sol.alt);
  setH('fc-sol', `sol: altura ${c('o', sol.alt.toFixed(1) + '°')} · azimut ${c('o', sol.az.toFixed(1) + '°')}<br>` +
    `il·luminància directa ${c('v', (En / 1000).toFixed(1) + ' klux')} · massa d'aire ${c('v', isFinite(m) ? m.toFixed(2) : '—')}<br>` +
    `color del sol (R:G:B) = ${c('v', T.map(t => (t / Math.max(...T)).toFixed(2)).join(' : '))}`);
  // Testimoni
  const src = d.fs[d.iMain];
  const g0 = F.geometriaVisio(S, src.x, src.y, 0);
  const psi0 = F.aparenca(S, 0, g0.az, g0.el).psi;
  setH('fc-obs', `testimoni a ${c('v', (S.h_pont + 1.6).toFixed(1) + ' m')} sobre el riu<br>` +
    `l'emissor es veu a ${c('v', g0.el.toFixed(1) + '°')} d'elevació, a ${c('v', g0.dist.toFixed(0) + ' m')}<br>` +
    `angle emissor–sol ψ = ${c(psi0 < 10 ? 'g' : 'w', psi0.toFixed(1) + '°')} ${psi0 < 10 ? '(contrallum: dispersió cap endavant)' : ''}`);
  // Atmosfera
  setH('fc-amb', `c = ${c('v', cs.toFixed(1) + ' m/s')} · ρ = ${c('v', F.rho(S).toFixed(3) + ' kg/m³')}<br>` +
    `punt de rosada = ${c('v', F.puntRosada(S).toFixed(1) + ' °C')} · ν = ${c('v', (F.nuAir(S) * 1e5).toFixed(2) + '·10⁻⁵ m²/s')}<br>` +
    `σ_w típica a 25 m: ${c('v', '0.1–0.3 m/s')} (vespre tranquil) · ${c('v', '0.5–1 m/s')} (tarda convectiva)`);
  // Acústica
  const xs1 = F.distanciaXoc(S, S.f1, S.db1);
  const audible = (S.f1 >= 20 && S.db1 > 0) || (S.f2 >= 20 && S.db2 > 0);
  setH('fc-ac', `λ₁ = ${c('v', F.lambda(S, S.f1).toFixed(1) + ' m')} · període ${c('v', fmtT(1 / S.f1))}<br>` +
    `node de pressió λ₁/4 = ${c('v', F.hNodePressio(S, S.f1).toFixed(1) + ' m')} · trampa λ₁/2 = ${c('v', F.hNodeVelocitat(S, S.f1).toFixed(1) + ' m')}<br>` +
    `xoc de S₁ a ${c(xs1 > 50 ? 'g' : 'r', isFinite(xs1) ? xs1.toFixed(0) + ' m' : '∞')} · nivell màxim físic ${F.dbMax(S).toFixed(0)} dB<br>` +
    `${audible ? c('w', '⚠ audible (≥ 20 Hz): el testimoni no va sentir res') : c('g', '✓ infrasò: inaudible')}`);
  // Anell
  let ha = '';
  d.anells.forEach((a, i) => {
    if (d.fs[i].L <= 0) { ha += `${i ? 'S₂' : 'S₁'}: ${c('r', 'apagada')}<br>`; return; }
    ha += `${i ? 'S₂' : 'S₁'}: u = ${c('v', a.u.toFixed(2) + ' m/s')} (Mach ${a.mach.toFixed(3)}) · L₀/D = ${c('v', a.F.toFixed(2))} · ` +
      `Holman ${c(a.es_forma ? 'g' : 'r', a.holman.toFixed(3) + (a.es_forma ? ' ✓' : ' < 0.16 ✗'))}<br>`;
  });
  if (an.es_forma) {
    const v = d.vida, rot = F.rotacioNodes(S, an, null), vInd = an.Gamma / (4 * Math.PI * an.R);
    ha += `Γ = ${c('o', an.Gamma.toFixed(2) + ' m²/s')} · R = ${c('v', an.R.toFixed(2) + ' m')} · a = ${c('v', an.a.toFixed(2) + ' m')} · Re_Γ = ${c('v', an.ReG.toExponential(1))}<br>` +
      `U (Saffman) = ${c('v', an.Uself.toFixed(2) + ' m/s')} · velocitat induïda Γ/4πR = ${c(vInd > S.turb ? 'g' : 'r', vInd.toFixed(3) + ' m/s')} ${vInd > S.turb ? '> σ_w ✓' : '< σ_w: la turbulència el desfà'}<br>` +
      `fase coherent ${c('v', fmtT(v.tCoh))} + dispersió ${c('v', fmtT(v.tFade))}<br>` +
      `nodes ${c('o', an.nodes)} ${S.n_inj > 0 ? '(injectors)' : '(Widnall espontani)'} · gir: Kelvin ${c('v', rot.omK.toFixed(3))} + swirl ${c('v', rot.omS.toFixed(3))} rad/s → ${c('o', isFinite(rot.T) ? fmtT(rot.T) : '—')} per volta<br>` +
      (() => { const cu = F.cuaNodes(S, an, null, rot); return isFinite(cu.dtNodes)
        ? `cua de cometa: entre nodes ${c('v', fmtT(cu.dtNodes))} · dispersió del rastre τ = a/σ_w = ${c('v', fmtT(cu.tau))} → gruix al node següent ${c(cu.fFinal >= 0.05 && cu.fFinal <= 0.4 ? 'g' : 'w', Math.round(cu.fFinal * 100) + ' %')}<br>` : ''; })() +
      `${Math.abs(S.swirl) > 0.6 ? c('w', '⚠ swirl > 0.6: risc de trencament del vòrtex<br>') : ''}${an.F > 4 ? c('w', 'L₀/D > 4: part del flux queda com a jet de cua<br>') : ''}${an.lineal ? '' : c('w', '⚠ Mach > 0.1: acústica no lineal')}`;
  }
  setH('fc-anell', ha);
  // Camp elèctric
  const r0 = anellPrincipal();
  const px = r0 ? r0.x : src.x, py = r0 ? r0.y : src.y;
  const rr = F.ratiRuptura(S, px, py);
  const vMax = Math.max(S.vmt, S.vcat);
  setH('fc-em', `${r0 ? 'a l\'anell' : 'a l\'emissor'} (x=${px.toFixed(1)}, y=${py.toFixed(1)} m):<br>` +
    `E_pic = ${c('v', fmtE(rr.E))} · E_ruptura = ${c('v', fmtE(rr.Ebd))}<br>` +
    `E/E_rup = ${c(rr.X >= 1 ? 'g' : 'r', rr.X.toExponential(2))}` + (rr.X < 1 && rr.X > 0 ? ` → caldrien ~${c('r', (vMax / rr.X / 1000).toFixed(0) + ' MV')} a les línies` : '') + `<br>` +
    d.corona.map(k => `${k.nom}: superfície ${c('v', fmtE(k.Es))} / Peek ${fmtE(k.Ec)} ${k.actiu ? c('o', '⚡ CORONA') : c('g', 'sense corona')}`).join('<br>') +
    `<div class="nota">MT modelada com un sol conductor a tensió de fase: és una cota superior.</div>`);
  refreshVis(); refreshEmissors();
}

function refreshEmissors() {
  const nota = document.getElementById('nota-model');
  if (nota) nota.innerHTML = S.model === 1
    ? 'B: l\'anell és el <b>rastre lluminós</b> de n objectes que orbiten. No hi ha so ni vòrtex; ▶ inicia el fenomen.'
    : 'A: anell de vòrtex creat per una empenta d\'aire, visible pel traçador il·luminat pel sol.';
  const b = document.getElementById('b-go'); if (b && !sigOn) b.textContent = S.model === 1 ? '▶ inicia' : '▶ so';
  if (S.model !== 1) { setH('fc-emis', 'actiu només amb el model B'); return; }
  const a = F.avaluaEmissors(S), e = a.e;
  setH('fc-emis', `velocitat dels nodes ${c('o', e.v.toFixed(1) + ' m/s')} (${(e.v * 3.6).toFixed(0)} km/h)<br>` +
    `acceleració cap al centre ${c('o', e.ac.toFixed(1) + ' m/s²')} = ${c('o', e.g.toFixed(2) + ' g')} → cada objecte necessita una força cap al centre de ${e.g.toFixed(2)}× el seu pes (un dron hauria d'anar inclinat ${e.inclinacio.toFixed(0)}°)<br>` +
    `entre nodes ${c('v', e.dt.toFixed(2) + ' s')} · gruix al node següent ${c(e.fFinal >= 0.05 && e.fFinal <= 0.4 ? 'g' : 'w', Math.round(e.fFinal * 100) + ' %')} (τ per al 25 %: ${e.tauPerFinal(0.25).toFixed(2)} s)<br>` +
    `eficàcia lluminosa ${c('v', e.eff.toFixed(1) + ' lm/W')} · lluminància del cap ${c('v', (e.L0 / 1000).toFixed(2) + ' kcd/m²')}<br>` +
    `cel darrere ${c('v', (a.Lsky / 1000).toFixed(2) + ' kcd/m²')} → contrast ${c(a.C > 0.3 ? 'g' : 'r', a.C.toFixed(2))} · per a C = 1 caldrien ${c('o', e.potenciaPerL(a.Lsky).toFixed(1) + ' kW')} per node<br>` +
    `color ${c('v', Math.round(e.hue) + '°')} <span style="display:inline-block;width:22px;height:9px;border-radius:2px;vertical-align:middle;background:rgb(${e.rgb.map(v => Math.round(255 * F.gammaSRGB(v))).join(',')})"></span> ${e.taronja ? c('g', 'taronja') : ''}`);
}
function refreshVis() {
  const r0 = anellPrincipal(), a = avaluacio;
  const tr = F.tracador(S);
  let h = `traçador: ${c('v', NOMS_TRAC[S.trac])} (r = ${(tr.r * 1e6).toFixed(1)} µm) · ${c('v', S.aer.toFixed(0) + ' mg/m³')}<br>`;
  const ap = r0 ? visibilitat(r0).ap : a && a.ap;
  if (ap) {
    const mx = Math.max(...ap.rgb, 1e-9), sw = ap.rgb.map(v => Math.round(255 * Math.pow(v / mx, 0.8))).join(',');
    h += `${r0 ? 'anell principal' : 'predicció (meitat de l\'observació)'}:<br>` +
      `ψ (anell–sol) = ${c('v', ap.psi.toFixed(1) + '°')} · fase P = ${c('v', ap.P.toFixed(1))}<br>` +
      `L_cel = ${c('v', (ap.Lsky / 1000).toFixed(1) + ' kcd/m²')} · L_anell = ${c('v', (ap.Y / 1000).toFixed(1) + ' kcd/m²')}<br>` +
      `contrast C = ${c(ap.C >= 0.3 ? 'g' : Math.abs(ap.C) >= 0.02 ? 'w' : 'r', ap.C.toFixed(2))} · to ${c('v', Math.round(ap.hue) + '°')} ` +
      `<span style="display:inline-block;width:22px;height:9px;border-radius:2px;vertical-align:middle;background:rgb(${sw})"></span> ${ap.taronja ? c('g', 'taronja') : ''}`;
  } else h += c('r', 'no es forma cap anell');
  h += `<div class="nota">Mecanismes reals: (1) llum solar dispersada pel traçador (molt intensa a contrallum), (2) condensació al nucli, (3) emissió de plasma si E ≥ E_ruptura.</div>`;
  setH('fc-vis', h);
}

/* ── Comparació amb l'observació ────────────────────────────────────────── */
function comparacio() {
  const a = avaluacio;
  if (!a) { setH('cmp-rows', ''); set('cmp-score', ''); return; }
  document.getElementById('cmp-rows').innerHTML = a.files.map(f =>
    `<div class="cr"><span>${f.nom}</span><b style="color:${f.ok === null ? '#6a7488' : f.ok ? '#40c080' : '#e05050'}">${f.valor} ${f.ok === null ? '·' : f.ok ? '✓' : '✗'}</b></div>`).join('');
  set('cmp-score', a.emissors
    ? `model B: ${a.n}/${a.total} conseqüències físiques complertes (· = valor imposat, no compta)`
    : `${a.n}/${a.total} condicions complertes (predicció del model; objectius = observació si no els canvies)`);
}

/* ── Capçalera i estat ──────────────────────────────────────────────────── */
function refreshHeader() {
  if (S.model === 1) {
    const e = F.emissors(S), a = avaluacio;
    set('hv-gam', '—'); set('hv-u', (F.vent(S)).toFixed(2) + ' m/s (vent)');
    set('hv-rot', S.e_T.toFixed(1) + ' s ' + (S.e_sent > 0 ? '↺' : '↻'));
    set('hv-c', a ? a.C.toFixed(2) : '—'); col('hv-c', a && a.C > 0.3 ? '#40c080' : '#8892aa');
    set('hv-x', '—'); set('hv-n', String(e.n)); set('hv-vida', fmtT(S.e_vida));
    const es = estat(); set('hv-es', es.n); col('hv-es', es.c); set('ph-n', es.n); col('ph-n', es.c); set('ph-d', es.d);
    return;
  }
  const d = derivat, an = d.an, r0 = anellPrincipal();
  const ev = r0 ? r0.ev : (an.es_forma ? F.estatAnell(S, an, 0, d.vida) : null);
  set('hv-gam', ev ? ev.Gamma.toFixed(2) + ' m²/s' : '—');
  set('hv-u', ev ? ev.U.toFixed(2) + ' m/s' : '—');
  const rot = an.es_forma ? F.rotacioNodes(S, an, ev) : null;
  set('hv-rot', rot && isFinite(rot.T) ? fmtT(rot.T) + (rot.sentit > 0 ? ' ↺' : ' ↻') : '—');
  const vis = r0 ? visibilitat(r0) : null;
  const C = vis ? vis.ap.C : avaluacio && avaluacio.ap ? avaluacio.ap.C : null;
  set('hv-c', C == null ? '—' : C.toFixed(2)); col('hv-c', C != null && C >= 0.3 ? '#40c080' : '#8892aa');
  const X = r0 ? r0.X : F.ratiRuptura(S, d.fs[d.iMain].x, d.fs[d.iMain].y).X;
  set('hv-x', emOn ? X.toExponential(1) : 'EM off'); col('hv-x', X >= 1 ? '#40c080' : '#e05050');
  set('hv-n', an.es_forma ? String(an.nodes) : '—');
  set('hv-vida', avaluacio && avaluacio.tVis != null ? fmtT(avaluacio.tVis) : '—');
  const es = estat();
  set('hv-es', es.n); col('hv-es', es.c);
  set('ph-n', es.n); col('ph-n', es.c); set('ph-d', es.d);
}
function estat() {
  if (S.model === 1) {
    if (fenT === null) return { n: 'aturat', d: 'Model B (nodes emissors): prem ▶ inicia', c: '#4a5468' };
    const a = avaluacio, env = F.envolupantEmissors(S, fenT);
    return { n: env < 1 ? 'extingint-se' : 'anell de rastres', d: `t = ${fmtT(fenT)} · ${S.e_n} nodes a ${F.emissors(S).v.toFixed(1)} m/s · C = ${(a ? a.C * env : 0).toFixed(2)}`, c: env > 0 ? '#ff9030' : '#4a5468' };
  }
  const d = derivat, an = d.an, r0 = anellPrincipal();
  if (!sigOn && !rings.length) return { n: 'aturat', d: 'Prem ▶ so per emetre (la comparació és la predicció del model)', c: '#4a5468' };
  if (sigOn && !an.es_forma) {
    const a = d.anells[d.iMain];
    return { n: 'ones sense anell', d: `L₀/D = ${a.F.toFixed(3)}, Holman = ${a.holman.toFixed(3)} < 0.16: el flux no se separa de l'obertura. Puja el nivell, baixa la freqüència o redueix D.`, c: '#e0a030' };
  }
  if (!r0) return { n: 'emetent', d: `formant l'anell (cal mig cicle: ${fmtT(0.5 / d.fMain)})…`, c: '#7f77dd' };
  const v = visibilitat(r0);
  return { n: 'anell ' + v.mec, d: `edat ${fmtT(r0.age)} · ${r0.ev.disp ? 'dispersant-se' : 'coherent'} · Ø ${(2 * r0.ev.R).toFixed(1)} m · y = ${r0.y.toFixed(1)} m · C = ${v.ap.C.toFixed(2)}`, c: v.visible ? '#40c080' : '#8860e0' };
}

/* ── Dibuix ─────────────────────────────────────────────────────────────── */
const cv = document.getElementById('cv'), cx = cv.getContext('2d');
let DPR = 1;
function rc() { DPR = window.devicePixelRatio || 1; cv.width = cv.offsetWidth * DPR; cv.height = cv.offsetHeight * DPR; campCache = null; }
window.addEventListener('resize', rc);

function escena(W, H) {
  const d = derivat;
  const linies = S.vmt > 0 || S.vcat > 0;
  const R = S.model === 1 ? S.e_D / 2 : (d.an.es_forma ? d.an.R : 0);
  const xspan = Math.max(S.a_riu / 2 + 2, linies ? S.sl / 2 + 8 : 0, S.so / 2 + Math.abs(S.sx_off) + 2, R * 2.2, 3);
  let ymax = Math.max(linies ? Math.max(S.hmt, S.hcat) + 6 : 0, S.h_pont + 4, (S.model === 1 ? S.e_h : S.h_src) + R * 1.8, 4);
  const r0 = anellPrincipal();
  if (r0 && r0.ev.R > 1) ymax = Math.max(ymax, Math.min(r0.y, 150) + r0.ev.R + 4);
  if (VIS.n && d.hN < 150) ymax = Math.max(ymax, d.hN + 5);
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
      const l = Math.log10(Math.max(F.campEPic(S, x, y) / Ebd0, 1e-7));
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
  const sc = escena(W, H), d = derivat, f = DPR, sol = d.sol;
  cx.clearRect(0, 0, W, H);
  // Cel: més clar de dia
  const dia = Math.max(0, Math.min(1, sol.alt / 25));
  const g = cx.createLinearGradient(0, 0, 0, sc.oy);
  g.addColorStop(0, `rgb(${Math.round(7 + 30 * dia)},${Math.round(16 + 60 * dia)},${Math.round(31 + 100 * dia)})`);
  g.addColorStop(1, `rgb(${Math.round(13 + 60 * dia)},${Math.round(26 + 90 * dia)},${Math.round(44 + 120 * dia)})`);
  cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  // Sol (direcció relativa a la mirada, projectada al pla de l'anell)
  if (VIS.sol && sol.alt > -2) {
    const dAz = ((sol.az - S.az_vis + 540) % 360) - 180;
    const dist = S.d_obs, hO = S.h_pont + 1.6;
    if (Math.abs(dAz) < 80) {
      const sx = sc.X(dist * Math.tan(dAz * Math.PI / 180)), sy = sc.Y(hO + dist * Math.tan(sol.alt * Math.PI / 180) / Math.cos(dAz * Math.PI / 180));
      const gg = cx.createRadialGradient(sx, sy, 0, sx, sy, 60 * f);
      gg.addColorStop(0, 'rgba(255,245,210,.95)'); gg.addColorStop(0.15, 'rgba(255,230,170,.5)'); gg.addColorStop(1, 'rgba(255,220,150,0)');
      cx.fillStyle = gg; cx.beginPath(); cx.arc(sx, sy, 60 * f, 0, 2 * Math.PI); cx.fill();
      if (VIS.lb) { cx.fillStyle = 'rgba(255,230,170,.85)'; cx.font = `${9 * f}px sans-serif`; cx.textAlign = 'center'; cx.fillText(`☀ ${sol.alt.toFixed(1)}° · ${sol.az.toFixed(0)}°`, sx, sy + 70 * f); }
    } else if (VIS.lb) {
      cx.fillStyle = 'rgba(255,230,170,.7)'; cx.font = `${9 * f}px sans-serif`; cx.textAlign = dAz > 0 ? 'right' : 'left';
      cx.fillText(`☀ fora de vista (${dAz > 0 ? '→' : '←'} ${Math.abs(dAz).toFixed(0)}°)`, dAz > 0 ? W - 8 * f : 8 * f, 40 * f);
    }
  }
  if (VIS.e && (S.vmt > 0 || S.vcat > 0)) dibuixaCamp(W, H, sc);
  // Riu i pont
  const rh = (S.a_riu / 2) * sc.pxM;
  cx.fillStyle = '#16120c'; cx.fillRect(0, sc.oy, W, H - sc.oy);
  cx.fillStyle = 'rgba(25,70,140,.6)'; cx.fillRect(sc.ox - rh, sc.oy, 2 * rh, H - sc.oy);
  cx.strokeStyle = 'rgba(60,150,240,.8)'; cx.lineWidth = 1.5 * f;
  cx.beginPath(); cx.moveTo(sc.ox - rh, sc.oy); cx.lineTo(sc.ox + rh, sc.oy); cx.stroke();
  const yb = sc.Y(S.h_pont);
  cx.fillStyle = 'rgba(120,120,110,.35)'; cx.fillRect(sc.ox - rh - 20 * f, yb, 2 * rh + 40 * f, 4 * f);
  cx.font = `${9 * f}px sans-serif`; cx.textAlign = 'left';
  if (VIS.lb) { cx.fillStyle = 'rgba(160,160,140,.7)'; cx.fillText('pont ' + S.h_pont.toFixed(1) + ' m · testimoni a ' + S.d_obs.toFixed(0) + ' m', Math.max(4 * f, sc.ox - rh - 18 * f), yb - 4 * f); }
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
  if (VIS.w && sigOn && S.model !== 1) {
    d.fs.forEach((src, i) => {
      if (src.L <= 0) return;
      const lam = F.lambda(S, src.f), cs = F.cSo(S);
      if (lam * sc.pxM < 3) return;
      const a = Math.min(0.5, 0.08 + src.L / 400), cc = i === 0 ? '90,200,110' : '230,140,40';
      const maxR = Math.hypot(sc.xspan, sc.ymax) * 1.2, off = (cs * simT) % lam;
      for (let rr = off; rr < maxR; rr += lam) {
        if (rr * sc.pxM < 2) continue;
        cx.strokeStyle = `rgba(${cc},${a * (1 - rr / maxR)})`; cx.lineWidth = f;
        cx.beginPath(); cx.arc(sc.X(src.x), sc.Y(src.y), rr * sc.pxM, Math.PI, 2 * Math.PI); cx.stroke();
      }
    });
  }
  // Emissors amb obertura (model A)
  if (S.model !== 1) d.fs.forEach((src, i) => {
    if (src.L <= 0 && i === 1) return;
    const w = Math.max(S.D_ap * sc.pxM, 5 * f), x = sc.X(src.x), y = sc.Y(src.y);
    cx.strokeStyle = 'rgba(140,140,118,.3)'; cx.lineWidth = f;
    if (src.y > S.h_pont + 0.5) { cx.beginPath(); cx.moveTo(x, sc.Y(S.h_pont)); cx.lineTo(x, y); cx.stroke(); }
    cx.fillStyle = src.L > 0 ? (i === 0 ? '#3aa050' : '#c07020') : '#333';
    cx.fillRect(x - w / 2, y - 3 * f, w, 6 * f);
    if (VIS.lb) { cx.fillStyle = 'rgba(200,200,200,.75)'; cx.textAlign = 'center'; cx.fillText((i ? 'S₂ ' : 'S₁ ') + (src.f < 1 ? src.f.toFixed(3) : src.f.toFixed(2)) + ' Hz · ' + src.L.toFixed(0) + ' dB · D ' + S.D_ap.toFixed(1) + ' m', x, y + (16 + 11 * i) * f); }
  });
  // Conductors (secció transversal)
  F.conductors(S).forEach((cd, i) => {
    if (cd.V <= 0) return;
    const x = sc.X(cd.x), y = sc.Y(cd.y), on = emOn, cr = d.corona[i];
    cx.strokeStyle = 'rgba(140,140,118,.25)'; cx.lineWidth = f;
    cx.beginPath(); cx.moveTo(x, sc.oy); cx.lineTo(x, y); cx.stroke();
    if (on && cr.actiu) {
      const gg = cx.createRadialGradient(x, y, 0, x, y, 14 * f);
      gg.addColorStop(0, 'rgba(170,140,255,.9)'); gg.addColorStop(1, 'rgba(120,80,255,0)');
      cx.fillStyle = gg; cx.beginPath(); cx.arc(x, y, 14 * f, 0, 2 * Math.PI); cx.fill();
    }
    cx.fillStyle = on ? (i === 0 ? '#d85a30' : '#378add') : '#444';
    cx.beginPath(); cx.arc(x, y, 4 * f, 0, 2 * Math.PI); cx.fill();
    if (VIS.lb) { cx.fillStyle = 'rgba(220,200,180,.8)'; cx.textAlign = 'center'; cx.fillText(cd.nom + ' ' + (i ? S.vcat : S.vmt).toFixed(0) + ' kV · ' + cd.y.toFixed(1) + ' m' + (on && cr.actiu ? ' ⚡corona' : ''), x, y - 8 * f); }
  });
  // Vent (component lateral)
  if (VIS.lb && S.W > 0) {
    const w = F.ventXZ(S), len = Math.min(40, 10 + S.W * 4) * f, x0 = W - 70 * f, y0 = 40 * f;
    const ax = w.x / Math.max(F.vent(S), 1e-9);
    cx.strokeStyle = 'rgba(180,200,220,.7)'; cx.lineWidth = 1.5 * f;
    cx.beginPath(); cx.moveTo(x0 - ax * len / 2, y0); cx.lineTo(x0 + ax * len / 2, y0); cx.stroke();
    cx.fillStyle = 'rgba(180,200,220,.8)'; cx.textAlign = 'center';
    cx.fillText(`vent ${S.W.toFixed(1)} km/h · ${S.dirW.toFixed(0)}°`, x0, y0 + 14 * f);
  }
  // Anells: el·lipse segons l'orientació de l'eix respecte a la mirada
  const el = S.elev * Math.PI / 180, az = S.az_eix * Math.PI / 180;
  const pX = Math.sin(az) * Math.cos(el), pY = Math.sin(el), menor = Math.abs(Math.cos(az) * Math.cos(el));
  const rotEl = Math.hypot(pX, pY) > 1e-6 ? Math.atan2(-pX, -pY) : 0;
  for (const r of rings) {
    const v = visibilitat(r), ev = r.ev;
    const x = sc.X(r.x), y = sc.Y(r.y), rx = ev.R * sc.pxM, ry = Math.max(ev.R * menor, ev.R * 0.05) * sc.pxM;
    const lw = Math.max(2 * ev.a * sc.pxM, 1.5 * f);
    if (rx < 1) continue;
    cx.save(); cx.translate(x, y); cx.rotate(rotEl);
    const n = Math.min(r.an.nodes, 24);
    const rot = F.rotacioNodes(S, r.an, ev), cua = F.cuaNodes(S, r.an, ev, rot);
    if (v.visible && !ev.disp && n > 1 && isFinite(cua.dtNodes)) {
      // Forma de cometa: darrere de cada node el tub té el gruix del node i
      // s'aprima (matèria més vella, més dispersa) fins al node següent.
      const gap = 2 * Math.PI / n, sg = rot.om >= 0 ? 1 : -1, NS = 40, k_ = ry / rx;
      cx.fillStyle = `rgba(${v.col},${0.85 * v.alpha})`;
      for (let k = 0; k < n; k++) {
        const cap = -(r.ang + k * gap), ext = [], int = [];
        for (let j = 0; j <= NS; j++) {
          const u = j / NS, th = cap + sg * u * gap, h = Math.max(lw * cua.factor(u), 1 * f) / 2;
          ext.push([(rx + h) * Math.cos(th), (ry + h * k_) * Math.sin(th)]);
          int.push([(rx - h) * Math.cos(th), (ry - h * k_) * Math.sin(th)]);
        }
        cx.beginPath(); cx.moveTo(ext[0][0], ext[0][1]);
        for (const [px_, py_] of ext) cx.lineTo(px_, py_);
        for (let j = int.length - 1; j >= 0; j--) cx.lineTo(int[j][0], int[j][1]);
        cx.closePath(); cx.fill();
      }
    } else if (v.visible) {
      cx.strokeStyle = `rgba(${v.col},${0.18 * v.alpha})`; cx.lineWidth = lw * (ev.disp ? 2.5 : 1.8);
      cx.beginPath(); cx.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI); cx.stroke();
      cx.strokeStyle = `rgba(${v.col},${0.8 * v.alpha})`; cx.lineWidth = lw;
      cx.beginPath(); cx.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI); cx.stroke();
    } else {
      cx.strokeStyle = 'rgba(160,150,220,.35)'; cx.lineWidth = f; cx.setLineDash([3 * f, 4 * f]);
      cx.beginPath(); cx.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI); cx.stroke(); cx.setLineDash([]);
    }
    // Nodes: el patró gira amb Ω = Ω_Kelvin + Ω_swirl (positiu = antihorari a la pantalla)
    if (!ev.disp) for (let k = 0; k < n; k++) {
      const ang = -(r.ang + k * 2 * Math.PI / n);
      const nx = Math.cos(ang) * rx, ny = Math.sin(ang) * ry;
      const gl = Math.max(lw * 0.7, 3 * f);
      if (v.visible) {
        const gg = cx.createRadialGradient(nx, ny, 0, nx, ny, gl);
        gg.addColorStop(0, `rgba(255,240,200,${Math.min(1, v.alpha * 1.1)})`); gg.addColorStop(1, `rgba(${v.col},0)`);
        cx.fillStyle = gg; cx.beginPath(); cx.arc(nx, ny, gl, 0, 2 * Math.PI); cx.fill();
      } else { cx.fillStyle = 'rgba(170,160,230,.35)'; cx.beginPath(); cx.arc(nx, ny, 2.5 * f, 0, 2 * Math.PI); cx.fill(); }
    }
    cx.restore();
  }
  if (S.model === 1) dibuixaEmissors(sc, f);
  const r0 = anellPrincipal();
  if (r0 && VIS.lb) {
    const v = visibilitat(r0);
    cx.fillStyle = v.visible ? `rgba(${v.col},.95)` : 'rgba(170,160,230,.75)';
    cx.textAlign = 'center'; cx.font = `bold ${10 * f}px sans-serif`;
    cx.fillText(`Ø ${(2 * r0.ev.R).toFixed(1)} m · ${v.mec} · C = ${v.ap.C.toFixed(2)} · ${(2 * r0.ev.R / v.g.dist * 180 / Math.PI).toFixed(1)}° aparents`,
      sc.X(r0.x), sc.Y(r0.y + r0.ev.R * Math.max(menor, 0.05)) - 8 * f);
    cx.font = `${9 * f}px sans-serif`;
  }
  if (VIS.lb) {
    cx.fillStyle = 'rgba(160,150,220,.75)'; cx.textAlign = 'left'; cx.font = `${9 * f}px sans-serif`;
    cx.fillText(`t = ${fmtT(simT)} · anells vius ${rings.length} · escala ${(50 * f / sc.pxM).toFixed(1)} m / 50 px · vista frontal des del pont`, 8 * f, H - 6 * f);
    if (VIS.e && (S.vmt > 0 || S.vcat > 0)) { cx.textAlign = 'right'; cx.fillText('fons: log₁₀(E/E_ruptura) de −6 a 0', W - 8 * f, H - 6 * f); }
  }
}

/** Model B: n caps que orbiten i deixen un rastre lluminós que s'aprima */
function dibuixaEmissors(sc, f) {
  if (fenT === null) {
    const e = F.emissors(S);   // previsualització de l'òrbita
    cx.strokeStyle = 'rgba(255,170,90,.25)'; cx.lineWidth = f; cx.setLineDash([3 * f, 5 * f]);
    cx.beginPath(); cx.arc(sc.X(S.sx_off), sc.Y(S.e_h), e.R * sc.pxM, 0, 2 * Math.PI); cx.stroke(); cx.setLineDash([]);
    return;
  }
  const e = F.emissors(S), a = avaluacio, env = F.envolupantEmissors(S, fenT);
  if (env <= 0) return;
  const p = F.posicioEmissors(S, fenT), x = sc.X(p.x), y = sc.Y(p.y), rx = e.R * sc.pxM, ry = rx;
  const lw = Math.max(S.e_cap * sc.pxM, 2 * f), col_ = e.rgb.map(v => Math.round(255 * F.gammaSRGB(v))).join(',');
  const alpha = Math.max(0.12, Math.min(1, (a ? a.C : 0.5))) * env;
  const gap = 2 * Math.PI / e.n, ang0 = S.e_sent * 2 * Math.PI * fenT / S.e_T, NS = 40;
  cx.save(); cx.translate(x, y);
  cx.fillStyle = `rgba(${col_},${0.85 * alpha})`;
  for (let k = 0; k < e.n; k++) {
    const cap = -(ang0 + k * gap), ext = [], int = [];
    for (let j = 0; j <= NS; j++) {
      const u = j / NS, th = cap + S.e_sent * u * gap, h = Math.max(lw * e.factor(u), 1 * f) / 2;
      ext.push([(rx + h) * Math.cos(th), (ry + h) * Math.sin(th)]);
      int.push([(rx - h) * Math.cos(th), (ry - h) * Math.sin(th)]);
    }
    cx.beginPath(); cx.moveTo(ext[0][0], ext[0][1]);
    for (const [u_, v_] of ext) cx.lineTo(u_, v_);
    for (let j = int.length - 1; j >= 0; j--) cx.lineTo(int[j][0], int[j][1]);
    cx.closePath(); cx.fill();
    const hx = rx * Math.cos(cap), hy = ry * Math.sin(cap), gl = lw * 0.9;
    const gg = cx.createRadialGradient(hx, hy, 0, hx, hy, gl);
    gg.addColorStop(0, `rgba(255,245,215,${alpha})`); gg.addColorStop(1, `rgba(${col_},0)`);
    cx.fillStyle = gg; cx.beginPath(); cx.arc(hx, hy, gl, 0, 2 * Math.PI); cx.fill();
    cx.fillStyle = `rgba(${col_},${0.85 * alpha})`;
  }
  cx.restore();
  if (VIS.lb) {
    cx.fillStyle = `rgba(${col_},.95)`; cx.textAlign = 'center'; cx.font = `bold ${10 * f}px sans-serif`;
    cx.fillText(`Ø ${(2 * e.R).toFixed(0)} m · ${e.n} nodes a ${(e.v * 3.6).toFixed(0)} km/h · ${e.g.toFixed(2)} g · C = ${((a ? a.C : 0) * env).toFixed(2)}`, x, y - ry - lw - 8 * f);
    cx.font = `${9 * f}px sans-serif`;
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
      const nSub = Math.min(50, Math.ceil(sdt / 0.02));
      for (let i = 0; i < nSub; i++) { simT += sdt / nSub; updatePhysics(sdt / nSub); }
    }
    draw();
    if (now - lastInfo > 250) { lastInfo = now; refreshHeader(); refreshVis(); }
  } catch (e) { console.warn('loop:', e); }
}

/* ── Accions ────────────────────────────────────────────────────────────── */
function toggleSo() {
  sigOn = !sigOn;
  const b = document.getElementById('b-go'); b.classList.toggle('on', sigOn);
  b.textContent = S.model === 1 ? (sigOn ? '⏹ atura' : '▶ inicia') : (sigOn ? '⏹ so' : '▶ so');
  if (S.model === 1) fenT = sigOn ? 0 : null;
  if (sigOn) { emissio[0] = emissio[1] = 0.5; emesos[0] = emesos[1] = 0; }
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
  simT = 0; rings = []; fenT = null; emissio[0] = emissio[1] = 0.5; emesos[0] = emesos[1] = 0;
  refreshInfo();
}
function aplicaValors(v) { Object.keys(DEF).forEach(k => { if (k in v) setParam(k, v[k], true); }); }
function loadPreset(i) {
  reinicia();
  const p = PRESETS[i];
  aplicaValors(p.v);
  if (p.solDv != null) setParam('az_vis', (F.posicioSol(S).az - p.solDv + 360) % 360, true);
  aplicaValors(p.obj || OBJ_SEGRE); OPC.dir = 1; OPC.prioritat = p.prioritat || 'deriva'; OPC.mov = p.mov || 'contra'; totesEtiquetes();
  if (p.obj) dissenyaIAplica(true);
  document.querySelectorAll('.pb-btn').forEach((b, j) => b.classList.toggle('active', j === i));
  // Un anell lent s'ha de poder veure sencer en pocs minuts
  const fm = F.anellPrincipalFont(S).src.f;
  setParam('spd', fm < 0.2 ? 1 : 0, true);
  canviParams();
}
function tauOptim() {
  const src = derivat.fs[derivat.iMain];
  const sy = F.sincronisme(Object.assign({}, S, { tau: 0 }), src.y);
  const T = 1e6 / S.f_mt;
  let tau = -(sy.tv * 1e6) % T;
  if (tau > T / 2) tau -= T; if (tau < -T / 2) tau += T;
  setParam('tau', Math.round(tau));
}
function dissenyaIAplica(silenciós) {
  const obj = { D: S.oD, tub: S.otub, n: S.on, Trot: S.oT, sentit: OPC.dir, h: S.oh, Umax: S.oU, vida: S.ovida, contrast: S.oC, prioritat: OPC.prioritat, passiu: OPC.mov === 'brisa' };
  const r = F.dissenya(S, obj);
  const claus = ['D_ap', 'aR', 'f1', 'f2', 'db1', 'db2', 'phi', 'npols', 'n_inj', 'swirl', 'kdir', 'h_src', 'elev', 'az_eix', 'dT0', 'sx_off', 'so', 'turb', 'aer'];
  claus.forEach(k => setParam(k, r.cfg[k], true));
  if (!silenciós) { reinicia(); canviParams(); }
  const conf = r.conflicte > 1.05;
  setH('fc-obj', `obertura D = ${c('v', r.cfg.D_ap.toFixed(2) + ' m')} · a/R = ${c('v', r.cfg.aR.toFixed(2))} · emissor a ${c('v', r.cfg.h_src.toFixed(1) + ' m')}<br>` +
    `1 pols: ejecció de ${c('v', fmtT(0.5 / r.f))} (f = ${c('v', r.f.toFixed(4) + ' Hz')}) · u = ${c('v', r.u.toFixed(2) + ' m/s')} · ${c(r.L <= F.dbMax(S) ? 'g' : 'r', r.L.toFixed(1) + ' dB a 1 m')}<br>` +
    `Γ = ${c('o', r.Gamma.toFixed(1) + ' m²/s')} (per a la deriva → ${r.GamDeriva.toFixed(1)} · per al gir → ${r.GamRot.toFixed(1)})<br>` +
    (OPC.mov === 'brisa' ? `arrossegat per la brisa: velocitat pròpia ≤ ${c('v', r.Umax.toFixed(3) + ' m/s')} (½ del vent)<br>` : '') +
    `${conf ? c('r', '⚠ conflicte: el gir demana ×' + r.conflicte.toFixed(1) + ' més circulació que la deriva lenta') : c('g', '✓ gir i deriva compatibles')}<br>` +
    `turbulència necessària σ_w = ${c(r.cfg.turb < 0.1 ? 'w' : 'g', r.cfg.turb.toFixed(3) + ' m/s')} (ha de ser < ${r.vInd.toFixed(3)})<br>` +
    `traçador necessari = ${c('v', r.cfg.aer.toFixed(0) + ' mg/m³')} de ${NOMS_TRAC[S.trac]} · ψ = ${r.psi.toFixed(1)}°` +
    `${r.cMax < S.oC ? '<br>' + c('r', '⚠ contrast màxim possible ' + r.cMax.toFixed(2) + ': mira més a prop del sol o canvia de traçador') : ''}` +
    `<div class="nota">El disseny no fixa: hora i lloc (sol), direcció de la mirada, distància, vent i tipus de traçador. Canvia'ls i torna a dissenyar.</div>`);
  return r;
}

/* ── Oscil·loscopi i àudio ──────────────────────────────────────────────── */
function drawOsc(id, freq, amp, phDeg, color) {
  const c2 = document.getElementById('osc-' + id); if (!c2) return;
  const o = c2.getContext('2d'), W = c2.width, H = c2.height;
  o.fillStyle = '#02040a'; o.fillRect(0, 0, W, H);
  o.strokeStyle = 'rgba(20,40,60,.6)'; o.lineWidth = .5;
  o.beginPath(); o.moveTo(0, H / 2); o.lineTo(W, H / 2); o.stroke();
  if (amp <= 0) { o.fillStyle = 'rgba(60,80,100,.7)'; o.font = '7px monospace'; o.textAlign = 'center'; o.fillText('off', W / 2, H / 2 + 3); return; }
  const tw = Math.max(3 / Math.max(freq, 0.005), 0.04), ph = phDeg * Math.PI / 180;
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
  set('osc-f-s1', S.f1.toFixed(3) + ' Hz'); set('osc-f-s2', S.f2.toFixed(3) + ' Hz');
  set('osc-f-mt', S.f_mt.toFixed(1) + ' Hz'); set('osc-f-cat', S.f_mt.toFixed(1) + ' Hz');
  set('osc-val-s1', sigOn && S.db1 > 0 ? S.db1.toFixed(0) + ' dB' : 'off');
  set('osc-val-s2', sigOn && S.db2 > 0 ? S.db2.toFixed(0) + ' dB' : 'off');
  set('osc-val-mt', emOn ? S.vmt.toFixed(0) + ' kV' : 'off'); set('osc-val-cat', emOn ? S.vcat.toFixed(0) + ' kV' : 'off');
}
let audioCtx = null;
const audioNodes = {};
function fBase(id) { return id === 's1' ? S.f1 : id === 's2' ? S.f2 : S.f_mt; }
function freqAudio(id) { let f = Math.max(fBase(id), 0.005); while (f < 20) f *= 10; return f; }   // infrasò: ×10 fins que és audible
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
    const k = Math.round(freqAudio(id) / fBase(id));
    btn.textContent = k > 1 ? '♦×' + k : '■';
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
  // Claus que no existien en versions anteriors → valor per defecte
  Object.keys(DEF).forEach(k => setParam(k, k in cfg.S ? cfg.S[k] : DEF[k][3], true));
  if ('h_pont' in cfg.S && !('h_src' in cfg.S)) setParam('h_src', cfg.S.h_pont, true);
  if (cfg.opc) { OPC.dir = cfg.opc.dir === -1 ? -1 : 1; OPC.prioritat = cfg.opc.prioritat === 'rotacio' ? 'rotacio' : 'deriva'; OPC.mov = cfg.opc.mov === 'brisa' ? 'brisa' : 'contra'; }
  totesEtiquetes(); canviParams();
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

/* ── Esdeveniments (delegació) ──────────────────────────────────────────── */
function initEvents() {
  document.body.addEventListener('input', e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k && e.target.type === 'range') setParam(k, +e.target.value);
  });
  document.body.addEventListener('click', e => {
    const t = e.target.closest('[data-k],[data-preset],[data-act],[data-vis],[data-grup],[data-audio]');
    if (!t) return;
    if (t.dataset.k && t.dataset.d) { const k = t.dataset.k; setParam(k, S[k] + (+t.dataset.d) * DEF[k][2]); return; }
    if (t.dataset.preset) { loadPreset(+t.dataset.preset); return; }
    if (t.dataset.vis) { const k = t.dataset.vis; VIS[k] = !VIS[k]; t.classList.toggle('on', VIS[k]); return; }
    if (t.dataset.audio) { toggleAudio(t.dataset.audio); return; }
    if (t.dataset.grup) {
      const g = t.dataset.grup, v = t.dataset.v;
      if (g === 'g-trac') setParam('trac', +v);
      else if (g === 'g-kdir') setParam('kdir', +v);
      else if (g === 'g-model') { reinicia(); setParam('model', +v); }
      else if (g === 'g-etipus') setParam('e_tipus', +v);
      else if (g === 'g-esent') setParam('e_sent', +v);
      else if (g === 'g-dir') { OPC.dir = +v; marcaGrup(g, v); canviParams(); }
      else if (g === 'g-prio') { OPC.prioritat = v; marcaGrup(g, v); }
      else if (g === 'g-mov') { OPC.mov = v; marcaGrup(g, v); canviParams(); }
      return;
    }
    const acts = {
      so: toggleSo, em: toggleEM, pausa: togglePausa, reinicia,
      osc: () => { const p = document.getElementById('osc-panel'); p.style.display = p.style.display === 'none' ? 'block' : 'none'; },
      desa: () => { const p = document.getElementById('savecfg-panel'); const obre = p.style.display !== 'block'; p.style.display = obre ? 'block' : 'none'; if (obre) cfgRefreshList(); },
      'cfg-desa': cfgSave, 'cfg-carrega': cfgLoad, 'cfg-elimina': cfgDelete,
      objectiu: () => dissenyaIAplica(false), tauopt: tauOptim,
      miraSol: () => setParam('az_vis', (F.posicioSol(S).az - 3 + 360) % 360),
      eTau: () => setParam('e_tau', F.emissors(S).tauPerFinal(0.25)),
      eP: () => { const a = F.avaluaEmissors(S); setParam('e_P', a.e.potenciaPerL(a.Lsky)); },
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
