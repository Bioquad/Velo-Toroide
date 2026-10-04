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
  model: [0, 2, 1, 0, 'model del fenomen', '', 0],
  // Model C: patró acústic rotatiu
  c_D:   [1, 100, 0.5, 25, 'diàmetre de l\'anell', 'm', 1],
  c_m:   [1, 12, 1, 4, 'nodes (pètals)', '', 0],
  c_T:   [0.5, 120, 0.1, 7, 'període d\'una volta', 's', 1],
  c_K:   [1, 32, 1, 8, 'esglaons: ones de la pinta K', '', 0],
  c_fc:  [1, 200, 0.1, 13.7, 'freqüència portadora f_c', 'Hz', 1],
  c_L:   [100, 191, 0.5, 172, 'nivell mitjà a l\'anell', 'dB', 1],
  c_r:   [0.5, 100, 0.5, 40, 'radi de les gotes de boira', 'µm', 1],
  c_cap: [0.1, 10, 0.1, 3, 'gruix del node', 'm', 1],
  c_h:   [1, 150, 0.5, 25, 'alçada del centre', 'm', 1],
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
  e_impl:[0, 1, 1, 1, 'implosió: l\'òrbita es tanca durant l\'extinció (0/1)', '', 0],
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
  d_obs: [5, 3000, 5, 900, 'distància inicial testimoni → anell (observat: 800–1000 m)', 'm', 0],
  v_obs: [0, 10, 0.1, 5, 'el testimoni camina cap a l\'anell a', 'km/h', 1],
  t_cam: [0, 600, 5, 90, 'durant (després s\'atura)', 's', 0],
  vis:   [1, 100, 1, 40, 'visibilitat meteorològica', 'km', 0],
  // Atmosfera
  T:     [0, 50, 0.1, 35, 'temperatura', '°C', 1],
  P:     [950, 1050, 1, 1013, 'pressió', 'hPa', 0],
  H:     [5, 100, 1, 30, 'humitat relativa', '%', 0],
  W:     [0, 40, 0.1, 3, 'vent', 'km/h', 1],
  IR:    [0, 5, 0.01, 0, 'ionització residual (suposada mantinguda)', '%', 2],
  beta:  [1, 2, 0.01, 1.2, 'coef. de no-linealitat β (aire: 1.2)', '', 2],
  dirW:  [0, 360, 1, 90, 'direcció del vent (0 = cap al testimoni, 180 = s\'allunya, 90 = →)', '°', 0],
  turb:  [0.001, 2, 0.001, 0.2, 'turbulència ambient σ_w', 'm/s', 3],
  // Traçador
  aer:   [0, 20000, 1, 0, 'traçador a l\'aire de l\'obertura', 'mg/m³', 0],
  trac:  [0, 3, 1, 0, 'tipus de traçador', '', 0],
  // Emissor i anell
  h_src: [0.5, 150, 0.1, 5, 'alçada de l\'emissor sobre el riu', 'm', 1],
  D_ap:  [0.02, 30, 0.01, 0.5, 'diàmetre de l\'obertura / zona de formació D', 'm', 2],
  // h_form, h_creu i θ ja no són paràmetres: on neix l'anell ho decideix la física
  h_form:[1, 200, 0.5, 25, '(obsolet)', 'm', 1],
  h_creu:[1, 300, 0.5, 25, 'alçada on es creuen els feixos C', 'm', 1],
  feix:  [0, 180, 1, 180, 'obertura dels feixos (0° tancat · 180° altaveu convencional)', '°', 0],
  form:  [0, 1, 1, 1, 'on es forma l\'anell', '', 0],
  aR:    [0.02, 0.8, 0.01, 0.12, 'gruix del nucli a/R', '', 2],
  elev:  [-90, 90, 1, 0, 'elevació de l\'eix d\'emissió', '°', 0],
  az_eix:[-180, 180, 1, 0, 'eix de l\'anell (0 = avança cap al testimoni)', '°', 0],
  npols: [0, 20, 1, 0, 'empentes d\'aire de l\'emissor (1 empenta = 1 anell)', '', 0],
  n_inj: [0, 12, 1, 0, 'injectors de traçador (0 = nodes espontanis)', '', 0],
  swirl: [-1, 1, 0.01, 0, 'swirl a l\'obertura w/u (+ = ↺; al punt mig el dona Δφ)', '', 2],
  kdir:  [-1, 1, 2, 1, 'sentit de l\'ona de Kelvin', '', 0],
  dT0:   [-10, 300, 0.5, 0, 'excés de temperatura de l\'aire emès', 'K', 1],
  // Fonts
  // freqüència: control logarítmic, de 0.0005 Hz a 40 kHz (infrasò, audible i ultrasò)
  f1:    [0.0005, 40000, 0.0001, 3.5714, 'freqüència S₁', 'Hz', 4, 'log'],
  f2:    [0.0005, 40000, 0.0001, 3.0, 'freqüència S₂', 'Hz', 4, 'log'],
  db1:   [0, 191, 0.5, 100, 'nivell S₁ (a 1 m)', 'dB', 1],
  db2:   [0, 191, 0.5, 100, 'nivell S₂ (a 1 m)', 'dB', 1],
  phi:   [-180, 180, 1, 0, 'desfasament S₁→S₂ φ (gir: −90° ↺, +90° ↻)', '°', 0],
  forma: [0, 2, 1, 0, 'forma del senyal', '', 0],
  nharm: [1, 25, 1, 9, 'harmònics de la forma (N)', '', 0],
  // Riu, pont i línies
  a_riu: [5, 500, 1, 30, 'amplada del riu', 'm', 0],
  refl:  [0, 1, 0.01, 1, 'reflexió del so a l\'aigua (1 = mirall, 0 = sense)', '', 2],
  h_pont:[0.5, 50, 0.1, 5, 'alçada del pont (testimoni a +1.6 m)', 'm', 1],
  so:    [0, 100, 0.1, 10, 'separació S₁↔S₂', 'm', 1],
  sx_off:[-30, 30, 0.1, 0, 'posició lateral de S₁S₂', 'm', 1],
  theta: [0.5, 89, 0.5, 34.5, 'convergència θ dels feixos (respecte a la vertical)', '°', 1],
  hmt:   [0.5, 80, 0.1, 18, 'alçada MT sobre el riu', 'm', 1],
  hcat:  [0.5, 80, 0.1, 11, 'alçada catenària sobre el riu', 'm', 1],
  sl:    [0, 60, 0.1, 24, 'separació horitzontal MT↔Cat', 'm', 1],
  vmt:   [0, 500, 0.5, 25, 'tensió MT (entre fases, ef.)', 'kV', 1],
  vcat:  [0, 500, 0.5, 25, 'tensió catenària (fase-terra, ef.)', 'kV', 1],
  ph:    [0, 180, 1, 90, 'desfasament MT↔Cat', '°', 0],
  f_mt:  [40, 70, 0.1, 50, 'freqüència de xarxa', 'Hz', 1],
  rc:    [0.2, 3, 0.05, 0.9, 'radi del conductor', 'cm', 2],
  lin_or:[0, 1, 1, 0, 'orientació de les línies', '', 0],
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
// Geometria observada: línies al llarg de X, anell paral·lel a les línies (pla X–Y),
// desplaçament transversal (cap a +Z) amb el vent; el testimoni comença a +Z, a ~900 m,
// i camina cap a −Z (cap a l'anell) uns 90 s: el veu créixer una mica i després estable.
const AMB_SEGRE = { T: 35, P: 1013, H: 30, W: 3, dirW: 0, turb: 0.2, aer: 0, trac: 0, aot: 0.1, vis: 40,
  mes: 9, dia: 18, hora: 18, tz: 2, lat: 41.6142, lon: 0.6222, az_vis: 232, d_obs: 900, v_obs: 5, t_cam: 90,
  hmt: 18, hcat: 11, sl: 24, vmt: 25, vcat: 25, ph: 90, f_mt: 50, rc: 0.9, tau: 0, lin_or: 0,
  a_riu: 30, h_pont: 5, h_src: 5, so: 10, sx_off: 0, D_ap: 0.5, aR: 0.12, elev: 0, az_eix: 0, form: 1, h_form: 25, h_creu: 25, feix: 180, refl: 1, forma: 0, nharm: 9, IR: 0, beta: 1.2,
  npols: 0, n_inj: 0, swirl: 0, kdir: 1, dT0: 0,
  f1: 3.5714, f2: 3.0, db1: 100, db2: 100, phi: 0, spd: 0, model: 0,
  e_n: 4, e_D: 25, e_cap: 3, e_T: 7, e_sent: 1, e_tau: 1.3, e_P: 1.5, e_tipus: 1, e_Temp: 2000, e_h: 25, e_vida: 150, e_ext: 30, e_impl: 1,
  c_D: 25, c_m: 4, c_T: 7, c_K: 8, c_fc: 13.7, c_L: 172, c_r: 40, c_cap: 3, c_h: 25 };
const OBJ_SEGRE = { oD: 25, otub: 3, on: 4, oT: 7, oh: 25, oU: 1, ovida: 180, oC: 2 };
const AMB_LAB = Object.assign({}, AMB_SEGRE, { T: 20, H: 50, W: 0, turb: 0.02, aer: 5000, trac: 1,
  vmt: 0, vcat: 0, a_riu: 5, h_pont: 1, h_src: 1, so: 0.5, sx_off: 0.25, D_ap: 0.1, aR: 0.2, elev: 0,
  f1: 15, f2: 15, db1: 100, db2: 80, npols: 5, d_obs: 5, v_obs: 0, form: 0 });
const PRESETS = [
  { t: '📍 Configuració original (V040)', d: '3.57 Hz · 100 dB · obertura 0.5 m',
    v: AMB_SEGRE },
  { t: '🏆 Segre: millor compromís (vòrtex)', d: 'testimoni a 900 m · fum · sol de costat',
    v: Object.assign({}, AMB_SEGRE, { dirW: 0, trac: 1 }), solDv: 150,
    obj: Object.assign({}, OBJ_SEGRE), prioritat: 'deriva' },
  { t: '🍃 Segre: arrossegat per la brisa', d: 'brisa de 0.5 km/h · sense velocitat pròpia',
    v: Object.assign({}, AMB_SEGRE, { W: 0.5, dirW: 0, trac: 1 }), solDv: 150,
    obj: Object.assign({}, OBJ_SEGRE), prioritat: 'deriva', mov: 'brisa' },
  { t: '🌀 Segre: prioritat gir de 7 s', d: 'el gir de 7 s demanaria ~202 dB per font: impossible',
    v: Object.assign({}, AMB_SEGRE, { dirW: 0, trac: 1 }), solDv: 150,
    obj: Object.assign({}, OBJ_SEGRE), prioritat: 'rotacio' },
  { t: '🧪 Assaig real a escala 1:10', d: 'anell de 2.5 m · fum blanc · sol de costat',
    v: Object.assign({}, AMB_SEGRE, { W: 1, dirW: 0, aot: 0.05, d_obs: 90, v_obs: 0.5, t_cam: 15, trac: 1, h_pont: 1, a_riu: 10, vmt: 0, vcat: 0 }), solDv: 100,
    obj: { oD: 2.5, otub: 0.3, on: 4, oT: 7, oh: 3, oU: 0.5, ovida: 30, oC: 0.3 }, prioritat: 'deriva' },
  { t: '✴ Segre: nodes emissors (sodi)', d: '4 fonts en òrbita · rastre de 1.3 s · 1.5 kW',
    v: Object.assign({}, AMB_SEGRE, { model: 1, W: 0.5, dirW: 0, e_tipus: 1, e_P: 1.5 }), solDv: 90 },
  { t: '✴ Segre: nodes incandescents', d: '2000 K · caldrien ~500 kW per node',
    v: Object.assign({}, AMB_SEGRE, { model: 1, W: 0.5, dirW: 0, e_tipus: 0, e_Temp: 2000, e_P: 500 }), solDv: 90 },
  { t: '🔊 Segre: patró acústic rotatiu', d: 'portadora 13.7 Hz · Δf 0.571 Hz · 8 esglaons',
    v: Object.assign({}, AMB_SEGRE, { model: 2, W: 0.5, dirW: 0,
      f1: 13.7, f2: 13.7 + 4 / 7, db1: 172, db2: 172, h_src: 25, so: 25, sx_off: 0 }), solDv: 3 },
  { t: '🔬 Canó de vòrtex de taula', d: '15 Hz · 100 dB · D = 10 cm · fum',
    v: AMB_LAB },
  { t: '⚡ Corona: línia de 400 kV', d: 'efecte corona real al conductor',
    v: Object.assign({}, AMB_SEGRE, { vmt: 400, vcat: 0, hmt: 12 }) },
];

/* ── Construcció dels panells ───────────────────────────────────────────── */
const esLog = k => DEF[k] && DEF[k][7] === 'log';
const aSlider = k => esLog(k) ? Math.log10(S[k]) : S[k];
function filaSlider(k) {
  let [mn, mx, st, , lab] = DEF[k];
  if (esLog(k)) { mn = Math.log10(mn); mx = Math.log10(mx); st = 0.0005; }
  return `<div class="pr"><div class="pr-h"><span class="pr-l">${lab}</span><span class="pr-v" id="lv-${k}"></span></div>
  <div class="row"><div class="sp"><button class="sb" data-k="${k}" data-d="-1">−</button><button class="sb" data-k="${k}" data-d="1">+</button></div>
  <input type="range" id="sl-${k}" data-k="${k}" min="${mn}" max="${mx}" step="${st}"></div></div>`;
}
/** Secció del panell; `models` = models on es mostra (per defecte, tots) */
function seccio(titol, cos, estil, models, plegada) {
  const at = `${models ? ` data-models="${models}"` : ''}${estil ? ` style="${estil}"` : ''}`;
  // Seccions secundàries (observació, lloc i hora): plegades, s'obren en tocar el títol
  if (plegada) return `<details class="sec"${at}><summary class="sec-t">${titol}</summary>${cos}</details>`;
  return `<div class="sec"${at}><div class="sec-t">${titol}</div>${cos}</div>`;
}
/** Mostra només les seccions que afecten el model actiu */
function mostraSeccions() {
  // Tots els paràmetres sempre visibles i ajustables; els que no afecten el model
  // actiu es veuen atenuats (els valors es conserven en canviar de model)
  document.querySelectorAll('#pnl .sec[data-models]').forEach(el => {
    const actiu = el.dataset.models.split(',').includes(String(S.model));
    el.classList.toggle('inactiva', !actiu);
    el.title = actiu ? '' : 'No afecta el model actiu; els valors es conserven';
  });
}
function fm(id) { return `<div class="fm" id="${id}">—</div>`; }
function grup(id, items) { return `<div class="sg" id="${id}">${items.map(([v, l]) => `<div class="sg-b" data-grup="${id}" data-v="${v}">${l}</div>`).join('')}</div>`; }

function construeixPanell() {
  const pr = PRESETS.map((p, i) => `<button class="pb-btn" id="pb-${i}" data-preset="${i}"><span class="pb-t">${p.t}</span><span class="pb-d">${p.d}</span></button>`).join('');
  let h = '';
  h += seccio('⚙ configuracions', `<div class="preset-grid">${pr}</div><div class="nota">Prem una configuració i després ▶ so.</div>`, 'border-color:#1a3050');
  h += seccio('🔬 model del fenomen', grup('g-model', [[0, 'A · vòrtex'], [1, 'B · emissors'], [2, 'C · patró de so']]) +
    `<div class="nota" id="nota-model"></div>` + filaSlider('spd'), 'border-color:#305030');
  // 1. Les fonts de so: el que es pot ajustar per provocar el fenomen
  h += seccio('🔊 generadors de so S₁ i S₂', ['f1', 'f2', 'db1', 'db2', 'phi'].map(filaSlider).join('') +
    `<div style="display:flex;gap:3px;margin:2px 0"><button class="bn opt" data-act="f2f1" style="flex:1">f₂ = f₁</button><button class="bn opt" data-act="phiL" style="flex:1">φ = −90° ↺</button><button class="bn opt" data-act="phiR" style="flex:1">φ = +90° ↻</button><button class="bn opt" data-act="phi0" style="flex:1">φ = 0°</button></div>
     <div class="pr-l" style="margin:2px 0">forma del senyal</div>${grup('g-forma', [[0, '∿ sinusoïdal'], [1, '⊓ quadrada'], [2, '△ triangular']])}` +
    filaSlider('nharm') + fm('fc-ac'), 'border-color:#305048', '0');
  h += seccio('📐 geometria de les fonts i formació', ['so', 'sx_off', 'h_src', 'h_creu', 'feix'].map(filaSlider).join('') +
    `<div class="pr-l" style="margin:2px 0">on es forma l'anell</div>${grup('g-form', [[1, '◎ entre els feixos (on el situa la física)'], [0, 'a l\'obertura d\'una font']])}` + fm('fc-geom'), 'border-color:#305048', '0');
  h += seccio('🌀 anell de vòrtex', ['D_ap', 'aR', 'npols', 'n_inj', 'swirl', 'dT0', 'elev', 'az_eix'].map(filaSlider).join('') +
    `<div class="pr-l" style="margin:2px 0">sentit de l'ona de Kelvin sembrada</div>${grup('g-kdir', [[1, '↺'], [-1, '↻']])}` + fm('fc-anell') +
    `<div class="nota">Un camp acústic lineal és irrotacional (∇×v = 0): a una obertura, la vorticitat neix a la vora on el flux oscil·lant se separa (jet sintètic / canó de vòrtex). Al punt mig no hi ha cap vora: el model hi aplica el mateix criteri a l'aire que mouen les dues ones juntes, i el mecanisme no lineal que hi generaria la vorticitat queda obert.</div>`, '', '0');
  h += seccio('✴ nodes emissors (model B)', ['e_n', 'e_D', 'e_cap', 'e_T', 'e_tau', 'e_P', 'e_Temp', 'e_h', 'e_vida', 'e_ext', 'e_impl'].map(filaSlider).join('') +
    `<div class="pr-l" style="margin:2px 0">emissió</div>${grup('g-etipus', [[0, 'incandescència'], [1, 'sodi 589 nm']])}
     <div class="pr-l" style="margin:2px 0">sentit</div>${grup('g-esent', [[1, '↺ antihorari'], [-1, '↻ horari']])}
     <div style="display:flex;gap:3px;margin-top:2px"><button class="bn opt" data-act="eTau" style="flex:1">τ per a cua del 25 %</button><button class="bn opt" data-act="eP" style="flex:1">potència per C = 1</button></div>` + fm('fc-emis'), 'border-color:#504020', '1');
  h += seccio('🔊 patró acústic rotatiu (model C)', ['c_D', 'c_m', 'c_T', 'c_K', 'c_fc', 'c_L', 'c_r', 'c_cap', 'c_h'].map(filaSlider).join('') +
    `<div style="display:flex;gap:3px;margin-top:2px"><button class="bn opt" data-act="cFc" style="flex:1">f_c per al radi</button><button class="bn opt" data-act="cL" style="flex:1">nivell per fer boira</button><button class="bn opt" data-act="cR" style="flex:1">gotes per a cua 25 %</button></div>` + fm('fc-patro'), 'border-color:#204860', '2');
  // 2. L'entorn físic
  h += seccio('🌬 condicions ambientals', ['T', 'P', 'H', 'W', 'dirW', 'turb', 'IR', 'beta'].map(filaSlider).join('') + fm('fc-amb'));
  h += seccio('⚡ línies elèctriques', `<div class="pr-l" style="margin:2px 0">orientació respecte a l'anell</div>${grup('g-linor', [[0, '∥ paral·leles a l\'anell'], [1, '⊥ al llarg de la mirada']])}` +
    ['hmt', 'hcat', 'sl', 'vmt', 'vcat', 'ph', 'f_mt', 'rc', 'tau'].map(filaSlider).join('') +
    `<button class="bn opt" data-act="tauopt" style="width:100%">🎯 τ òptim</button>` + fm('fc-em'));
  h += seccio('🌊 riu i pont', ['a_riu', 'h_pont', 'refl'].map(filaSlider).join('') +
    `<div class="nota">L'aigua reflecteix el so com si cada font tingués una imatge sota la superfície: ona directa i reflectida se sumen amb les seves fases.</div>`);
  h += seccio('👁 traçador i visibilitat', grup('g-trac', [[0, 'pols'], [1, 'fum'], [2, 'boira'], [3, 'fum taronja']]) + filaSlider('aer') + fm('fc-vis'), '', '0');
  // 3. Eines i observació (plegades)
  h += seccio('🎯 disseny invers: reproduir un anell',
    ['oD', 'otub', 'on', 'oT', 'oh', 'oU', 'ovida', 'oC'].map(filaSlider).join('') +
    `<div class="pr-l" style="margin:2px 0">sentit dels nodes</div>${grup('g-dir', [[1, '↺ antihorari'], [-1, '↻ horari']])}
     <div class="pr-l" style="margin:2px 0">moviment de l'anell</div>${grup('g-mov', [['contra', 'propi (contra la brisa)'], ['brisa', 'arrossegat per la brisa']])}
     <div class="pr-l" style="margin:2px 0">prioritat (gir i deriva lenta són incompatibles)</div>${grup('g-prio', [['deriva', 'deriva lenta'], ['rotacio', 'gir ràpid']])}
     <button class="bn opt" data-act="objectiu" style="width:100%;margin-top:2px">▶ dissenya i aplica</button>${fm('fc-obj')}`,
    'border-color:#203848', '0', true);
  h += seccio('👁 testimoni i observació', ['az_vis', 'd_obs', 'v_obs', 't_cam', 'vis'].map(filaSlider).join('') +
    `<button class="bn opt" data-act="miraSol" style="width:100%">☀ mirar 3° al costat del sol</button>` + fm('fc-obs'), '', '', true);
  h += seccio('📍 lloc, data i hora', ['mes', 'dia', 'hora', 'tz', 'lat', 'lon', 'aot'].map(filaSlider).join('') + fm('fc-sol'), '', '', true);
  h += seccio('visualització',
    [['w', 'fronts d\'ona S₁ i S₂'], ['e', 'mapa del camp elèctric'], ['n', 'nodes acústics λ/4 i λ/2'], ['sol', 'direcció del sol'], ['lb', 'etiquetes']]
      .map(([k, l]) => `<div class="tr"><span class="tr-l">${l}</span><div class="sw${VIS[k] ? ' on' : ''}" id="tg-${k}" data-vis="${k}"></div></div>`).join(''));
  document.getElementById('pnl').innerHTML = h;

  document.getElementById('osc-rows').innerHTML = [['s1', 'S₁', '#30c050'], ['s2', 'S₂', '#d07020'], ['mt', 'MT', '#c09030'], ['cat', 'Cat', '#2090c0']]
    .map(([id, n, c]) => `<div class="osc-h"><span style="color:${c}">${n} <span id="osc-f-${id}">—</span></span><span style="color:${c};opacity:.8" id="osc-val-${id}">—</span><button id="spk-${id}" data-audio="${id}">🔊</button></div>
      <canvas class="osc-c" id="osc-${id}" width="148" height="34"></canvas>`).join('');
}

/* ── Paràmetres: lectura/escriptura coherent (slider + etiqueta + estat) ── */
const CLAUS_INTENT = ['f1', 'f2', 'db1', 'db2', 'phi', 'forma', 'nharm', 'so', 'sx_off', 'h_src', 'h_creu', 'feix', 'D_ap', 'aR', 'npols', 'n_inj'];
function setParam(k, v, silenciós) {
  const [mn, mx] = DEF[k];
  if (!Number.isFinite(v)) return;
  S[k] = Math.round(Math.min(mx, Math.max(mn, v)) * 1e6) / 1e6;   // sense arrodonir al pas
  const sl = document.getElementById('sl-' + k); if (sl) sl.value = aSlider(k);
  etiqueta(k);
  // Simulador: si toques les fonts o la geometria amb el so en marxa, és un intent nou
  if (!silenciós && sigOn && CLAUS_INTENT.includes(k)) { emesos[0] = emesos[1] = 0; }
  if (!silenciós) canviParams();
}
function marcaGrup(id, v) { document.querySelectorAll(`[data-grup="${id}"]`).forEach(b => b.classList.toggle('on', String(b.dataset.v) === String(v))); }
function etiqueta(k) {
  if (k === 'trac') { marcaGrup('g-trac', S.trac); return; }
  if (k === 'kdir') { marcaGrup('g-kdir', S.kdir); return; }
  if (k === 'model') { marcaGrup('g-model', S.model); mostraSeccions(); return; }
  if (k === 'e_tipus') { marcaGrup('g-etipus', S.e_tipus); return; }
  if (k === 'lin_or') { marcaGrup('g-linor', S.lin_or); return; }
  if (k === 'form') { marcaGrup('g-form', S.form); return; }
  if (k === 'forma') { marcaGrup('g-forma', S.forma); return; }
  if (k === 'e_sent') { marcaGrup('g-esent', S.e_sent); return; }
  const el = document.getElementById('lv-' + k); if (!el) return;
  const [, , , , , un, dec] = DEF[k];
  let txt = S[k].toFixed(dec) + (un ? ' ' + un : '');
  if (k === 'spd') txt = '×' + Math.pow(10, S.spd).toFixed(Math.pow(10, S.spd) < 0.1 ? 3 : 2);
  if (k === 'f1' || k === 'f2') { const f = S[k]; txt = f >= 20000 ? (f / 1000).toFixed(2) + ' kHz (ultrasò)' : f >= 1000 ? (f / 1000).toFixed(3) + ' kHz' : f >= 20 ? f.toFixed(1) + ' Hz' : f.toFixed(f < 1 ? 4 : 3) + ' Hz (infrasò)'; }
  if (k === 'npols' && S.npols === 0) txt = 'continu';
  if (k === 'n_inj' && S.n_inj === 0) txt = 'espontanis';
  if ((k === 'db1' || k === 'db2') && S[k] > F.dbMax(S)) txt += ' ⚠';
  if (k === 'swirl' && Math.abs(S.swirl) > 0.6) txt += ' ⚠';
  el.textContent = txt;
}
function totesEtiquetes() {
  Object.keys(DEF).forEach(k => { const sl = document.getElementById('sl-' + k); if (sl) sl.value = aSlider(k); etiqueta(k); });
  marcaGrup('g-dir', OPC.dir); marcaGrup('g-prio', OPC.prioritat); marcaGrup('g-mov', OPC.mov);
}

function objectiuActual() { return { D: S.oD, tub: S.otub, h: S.oh, nodes: S.on, Trot: S.oT, sentit: OPC.dir, durada: S.ovida, Umax: S.oU, passiu: OPC.mov === 'brisa' }; }
let derivat = null;   // magnituds derivades (es recalculen quan canvien els paràmetres)
let avaluacio = null; // comparació amb l'observació
let campCache = null; // mapa del camp elèctric
function canviParams() {
  derivat = calcDerivat();
  try { avaluacio = S.model === 1 ? F.avaluaEmissors(S) : S.model === 2 ? F.avaluaPatro(S) : F.avaluaObservacio(S, objectiuActual()); } catch (e) { console.warn('avaluació:', e); avaluacio = null; }
  campCache = null;
  refreshInfo(); comparacio();
}

/* ── Magnituds derivades estàtiques ─────────────────────────────────────── */
function calcDerivat() {
  const p = F.anellPrincipalFont(S);
  // Emissors d'anells: les fonts (formació a l'obertura) o el punt mig M
  const emisors = p.mig ? [{ x: p.mig.x, y: p.mig.y, f: p.mig.ritme, L: p.mig.Lm }] : p.fs;
  return { fs: p.fs, anells: p.ans, iMain: p.i, an: p.an, fMain: p.src.f, hN: F.hNodePressio(S, S.f1),
    src: p.src, mig: p.mig, emisors, anellsE: p.ans,
    vida: F.vidaAnell2(S, p.an), corona: F.corona(S), sol: F.posicioSol(S) };
}

/* ── Simulació temporal ─────────────────────────────────────────────────── */
let simT = 0, PAUSED = false, sigOn = false, emOn = true;
let rings = [];
let extingits = 0;              // anells que ja s'han extingit
let fenT = null;                // model B: temps des de l'inici del fenomen
const emissio = [0.5, 0.5];     // fase d'emissió (l'anell es forma al final de l'ejecció: mig cicle)
const emesos = [0, 0];          // anells emesos per cada font
const MAX_RINGS = 40;

function fesAnell(i) {
  const src = derivat.emisors[i], an = derivat.anellsE[i];
  const vida = F.vidaAnell2(S, an);
  return { src: i, an: Object.assign({}, an), vida, x: src.x, y: src.y, z: 0, age: 0, tEv: 0, alim: false, ang: 0,
    T: F.Tk(S) + S.dT0, ne: 0, X: 0, ev: F.estatAnell(S, an, 0, vida) };
}

function updatePhysics(dt) {
  if (!derivat) derivat = calcDerivat();
  if (S.model === 2) { if (sigOn) fenT = (fenT || 0) + dt; return; }
  if (S.model === 1) {
    if (fenT !== null) { fenT += dt; if (fenT > S.e_vida + S.e_ext + 5) { fenT = null; if (sigOn) toggleSo(); } }
    return;
  }
  const Ta = F.Tk(S);
  // Emissió: un anell per cicle i per font, si el criteri de formació es compleix
  if (sigOn) {
    derivat.emisors.forEach((src, i) => {
      if (!derivat.anellsE[i].es_forma) return;
      if (S.npols > 0 && emesos[i] >= S.npols) return;
      if (derivat.mig && rings.some(r => r.alim)) return;     // entre els feixos: un sol anell, sostingut
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
    // Anell SOSTINGUT pel so (hipòtesi del model entre feixos): a cada instant es calcula
    // el camp de S₁ i S₂ allà on és ara l'anell. Si encara compleix el criteri de
    // formació, les ones l'alimenten (Γ cap al valor actual en ~1 cicle, gir segons Δφ)
    // i no envelleix. Si no (menys dB, antifase, fonts separades, o el vent l'ha
    // allunyat), queda lliure: creix, es dispersa i s'extingeix.
    let alim = false;
    if (sigOn && derivat.mig && !r.ev.disp) {
      const ra = F.anellAlPunt(S, { x: r.x, y: r.y, z: r.z }), m = ra.m, anv = ra.an;
      if (anv.es_forma) {
        alim = true;
        const k = 1 - Math.exp(-dt * Math.max(m.f, 0.02));
        r.an = Object.assign({}, r.an, { Gamma: r.an.Gamma + (anv.Gamma - r.an.Gamma) * k, u: anv.u, holman: anv.holman,
          swirl: m.swirl, kdir: m.eps > 1e-6 ? 1 : m.eps < -1e-6 ? -1 : r.an.kdir });
      }
      r.camp = m;
    }
    r.alim = alim;
    if (!alim) r.tEv += dt;
    r.vida = F.vidaAnell2(S, r.an);                  // turbulència i circulació actuals
    r.ev = F.estatAnell(S, r.an, r.tEv, r.vida);
    // Ruptura elèctrica (només si hi ha línies en tensió)
    let X = 0, best = null;
    if (emOn && (S.vmt > 0 || S.vcat > 0)) {
      for (const [dx, dy] of [[0, r.ev.R], [0, -r.ev.R], [r.ev.R, 0], [-r.ev.R, 0]]) {
        const rr = F.ratiRuptura(S, r.x + dx, r.y + dy, r.z);
        if (!best || rr.X > best.X) best = rr;
      }
      X = best.X;
    }
    r.X = X;
    // Excés de temperatura inicial diluït per l'entrainment, més l'escalfament Joule si n'hi ha
    const Tbase = Ta + S.dT0 * r.ev.dil;
    if (best && (X >= 1 || S.IR > 0)) {
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
  // Quan l'anell s'extingeix (es dispersa i ja no es distingeix del cel) desapareix
  const abans = rings.length;
  rings = rings.filter(r => r.tEv < r.vida.tCoh + 4 * r.vida.tFade && r.tEv < 3600 && !(r.ev.disp && !visibilitat(r).visible));
  extingits += abans - rings.length;
  // Empenta única (o n empentes) acabada i anell extingit: el so s'atura
  if (sigOn && !rings.length && extingits > 0 && S.npols > 0 &&
      derivat.emisors.every((e, i) => emesos[i] >= S.npols || !derivat.anellsE[i].es_forma)) toggleSo();
}

/** Aparença d'un anell vist pel testimoni */
function visibilitat(r) {
  const tau = F.tauPunt(S, r);
  const g = F.geometriaVisio(S, r.x, r.y, r.z, r.age);
  const ap = F.aparenca(S, tau, g.az, g.el, g.dist);
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
function fmtT(s) { if (!isFinite(s)) return '∞'; if (s >= 3600) return (s / 3600).toFixed(1) + ' h'; if (s >= 60) return (s / 60).toFixed(1) + ' min'; if (s >= 1) return s.toFixed(1) + ' s'; if (s >= 0.01) return (s * 1000).toFixed(0) + ' ms'; return (s * 1e6).toFixed(0) + ' µs'; }
function fmtL(m) { return m >= 1 ? m.toFixed(1) + ' m' : m >= 0.01 ? (m * 100).toFixed(1) + ' cm' : (m * 1000).toFixed(1) + ' mm'; }
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
  const src = d.src;
  const g0 = F.geometriaVisio(S, src.x, src.y, 0);
  const psi0 = F.aparenca(S, 0, g0.az, g0.el, g0.dist).psi;
  setH('fc-obs', `testimoni a ${c('v', (S.h_pont + 1.6).toFixed(1) + ' m')} sobre el riu<br>` +
    `l'emissor es veu a ${c('v', g0.el.toFixed(1) + '°')} d'elevació, a ${c('v', g0.dist.toFixed(0) + ' m')}<br>` +
    `angle emissor–sol ψ = ${c(psi0 < 10 ? 'g' : 'w', psi0.toFixed(1) + '°')} ${psi0 < 10 ? '(contrallum: dispersió cap endavant)' : ''}`);
  // Atmosfera
  setH('fc-amb', `c = ${c('v', cs.toFixed(1) + ' m/s')} · ρ = ${c('v', F.rho(S).toFixed(3) + ' kg/m³')}<br>` +
    `punt de rosada = ${c('v', F.puntRosada(S).toFixed(1) + ' °C')} · ν = ${c('v', (F.nuAir(S) * 1e5).toFixed(2) + '·10⁻⁵ m²/s')}<br>` +
    `σ_w típica a 25 m: ${c('v', '0.1–0.3 m/s')} (vespre tranquil) · ${c('v', '0.5–1 m/s')} (tarda convectiva)`);
  // Acústica
  const xs1 = F.distanciaXoc(S, S.f1, S.db1);
  const hAud = F.harmonicsAudibles(S), audible = hAud.length > 0, fo = F.formaOna(S);
  const fb = S.f1 !== S.f2 ? Math.abs(S.f1 - S.f2) : 0;
  setH('fc-ac', `λ₁ = ${c('v', fmtL(F.lambda(S, S.f1)))} · període ${c('v', fmtT(1 / S.f1))} · absorció ${c('v', (F.alfaAbs(S.f1, S) * 8.686).toExponential(1) + ' dB/m')}<br>` +
    `node de pressió λ₁/4 = ${c('v', fmtL(F.hNodePressio(S, S.f1)))} · trampa λ₁/2 = ${c('v', fmtL(F.hNodeVelocitat(S, S.f1)))}<br>` +
    `xoc de S₁ a ${c(xs1 > 50 ? 'g' : 'r', isFinite(xs1) ? fmtL(xs1) : '∞')} · nivell màxim físic ${F.dbMax(S).toFixed(0)} dB<br>` +
    `${fb > 0 ? `batec |f₁ − f₂| = ${c('v', fb.toFixed(3) + ' Hz')} (període ${fmtT(1 / fb)})<br>` : ''}` +
    `forma ${c('v', ['sinusoïdal', 'quadrada', 'triangular'][fo.tipus])}${fo.tipus ? ` · ${fo.harm.length} harmònics fins a ${c('v', (fo.harm[fo.harm.length - 1].k * Math.max(S.f1, S.f2)).toFixed(1) + ' Hz')} · el fonamental porta el ${c('v', (fo.frac * fo.frac * 100).toFixed(0) + ' %')} de l'energia` : ''}<br>` +
    `${audible ? c('w', `⚠ audible al testimoni: ${hAud[0].f.toFixed(0)} Hz (harmònic ${hAud[0].k}, ${hAud[0].L.toFixed(0)} dB) — el testimoni no va sentir res`) : c('g', '✓ inaudible per al testimoni (infrasò o harmònics per sota del llindar)')}`);
  // On la física situa l'anell
  if (d.mig) {
    const m = d.mig, ps = m.pos, a2 = S.so / 2, dh = m.y - S.h_src;
    setH('fc-geom', `la física situa l'anell a ${c('o', 'x = ' + m.x.toFixed(1) + ' m · h = ' + m.y.toFixed(1) + ' m')}` +
      ` (${(Math.abs(dh) / Math.max(a2, 1e-9)).toFixed(2)} × separació/2 per sobre de les fonts)<br>` +
      `és on les dues velocitats es creuen amb més força i angle (màxim de l'energia del gir)<br>` +
      `els feixos es creuen a C: ${c('v', 'h = ' + S.h_creu.toFixed(1) + ' m')} · convergència θ = ${c('v', (Math.atan2(a2, Math.max(S.h_creu - S.h_src, 1e-6)) * 180 / Math.PI).toFixed(1) + '°')}` +
      (S.feix >= 180 ? ' · feix d\'altaveu convencional (180°)<br>' : (() => { const fm_ = Math.max(S.f1, S.f2), bo = F.bocaFeix(S, fm_);
        const tx = bo >= 1000 ? (bo / 1000).toFixed(1) + ' km' : bo >= 1 ? bo.toFixed(1) + ' m' : (bo * 100).toFixed(1) + ' cm';
        return ` · feix de ${S.feix}°: caldria una boca de ${c(bo > 50 ? 'r' : 'g', tx)} a ${fm_ < 1 ? fm_.toFixed(3) : fm_.toFixed(0)} Hz<br>`; })()) +
      (Math.abs(m.x - S.sx_off) > 0.5 && S.f1 === S.f2 && S.db1 === S.db2 ? c('w', '(fonts simètriques: hi ha un punt equivalent a l\'altre costat)') + '<br>' : '') +
      (ps && ps.valid ? (ps.rank === 0 ? c('g', '✓ al punt més favorable es compleix el criteri de formació')
        : c('w', `al punt més favorable (h = ${ps.millor.y.toFixed(1)} m) les ones no hi arriben prou: es forma al següent punt on sí`))
        : c('r', '✗ enlloc del pla es compleix el criteri de formació: no es forma cap anell')));
  } else setH('fc-geom', 'l\'anell surt de l\'obertura de la font principal');
  // Anell
  let ha = '';
  if (d.mig) {
    const m = d.mig, a = an;
    ha += `punt de formació M: x = ${c('v', m.x.toFixed(1) + ' m')} · h = ${c('v', m.y.toFixed(1) + ' m')} · a ${c('v', m.r[0].toFixed(1))} / ${c('v', m.r[1].toFixed(1) + ' m')} de S₁ / S₂<br>` +
      `p₁ = ${c('v', m.p[0].toFixed(1) + ' Pa')} · p₂ = ${c('v', m.p[1].toFixed(1) + ' Pa')} · ` +
      (m.iguals ? `Δφ = ${c('v', (((m.dphi * 180 / Math.PI) % 360 + 540) % 360 - 180).toFixed(0) + '°')} → pressió ${Math.abs(Math.cos(m.dphi)) < 0.05 ? c('v', 'en quadratura (×√2)') : c(Math.cos(m.dphi) > 0 ? 'g' : 'w', Math.cos(m.dphi) > 0 ? 'se suma' : 'es resta')}`
        : `batec |f₁−f₂| = ${c('v', m.fBat.toFixed(3) + ' Hz')} → es forma als màxims (sincronisme)`) + `<br>` +
      `velocitats u₁ = ${c('v', m.u[0].toFixed(2))} · u₂ = ${c('v', m.u[1].toFixed(2) + ' m/s')} (camp proper) · els feixos es creuen a ${c('v', (m.angleCreu * 180 / Math.PI).toFixed(0) + '°')}<br>` +
      `el·lipse de velocitat: ${c('v', m.el.max.toFixed(2))} × ${c('v', m.el.min.toFixed(2) + ' m/s')} → ` +
      (m.iguals ? (Math.abs(m.eps) > 0.01 ? `${c('o', 'l\'aire gira ' + (m.eps > 0 ? '↺' : '↻'))} (ε = ${m.eps.toFixed(2)}, swirl ${m.swirl.toFixed(2)}): la diferència de fase produeix la rotació`
        : c('w', 'oscil·la sense girar (Δφ = 0° o 180°): cap rotació per fase'))
        : c('w', 'el gir s\'inverteix cada mig batec (de mitjana, zero)')) + `<br>` +
      `p_M = ${c('o', m.pM.toFixed(1) + ' Pa')} (${m.Lm.toFixed(0)} dB) · u_M = ${c('v', a.u.toFixed(2) + ' m/s')} · L₀/D = ${c('v', a.F.toFixed(2))} · ` +
      `Holman ${c(a.holman > 0.16 ? 'g' : 'r', a.holman.toFixed(3) + (a.holman > 0.16 ? ' ✓' : ' < 0.16 ✗'))}` +
      (a.es_forma ? ` · es forma per ${c('o', a.mecanisme)}` : '') + `<br>` +
      (() => { const ca = F.correntAcustic(S, null, a.Gamma); return `<b>què empeny l'aire?</b> absorció de les ones (α = ${(ca.alfa * 8.686).toExponential(1)} dB/m): ${c('v', ca.Fabs.toExponential(1) + ' N/m³')} · ` +
        `pressió de radiació sobre el contingut de l'anell (fum, gotes, aire calent; contrast ${ca.Phi.toExponential(1)}): ${c('v', ca.Fcon.toExponential(1) + ' N/m³')} · parell de l'espín ${c('v', ca.tau.toExponential(1) + ' N/m²')} → ` +
        `poden sostenir Γ ≈ ${c(ca.suficient ? 'g' : 'r', ca.G.toExponential(1) + ' m²/s')}` + (a.Gamma > 0 ? ` de ${a.Gamma.toFixed(1)} que cal ${ca.suficient ? c('g', '✓') : c('r', '(falta ×' + ca.factor.toExponential(0) + ')')}` : '') + `<br>` +
        (() => { const xs = F.distanciaXoc(S, m.f, Math.max(S.db1, S.db2)); return xs < Math.min(...m.r) ? c('w', `⚠ el so fa xoc a ${fmtL(xs)} de la font, abans d'arribar a M: el model lineal no compta la dissipació del xoc (incerta, normalment més empenta a prop de les fonts i menys so a M)`) + '<br>' : ''; })(); })();
  } else d.anells.forEach((a, i) => {
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
  const rr = F.ratiRuptura(S, px, py, r0 ? r0.z : 0);
  const vMax = Math.max(S.vmt, S.vcat);
  setH('fc-em', `${r0 ? 'a l\'anell' : 'a l\'emissor'} (x=${px.toFixed(1)}, y=${py.toFixed(1)} m):<br>` +
    `E_pic = ${c('v', fmtE(rr.E))} · E_ruptura = ${c('v', fmtE(rr.Ebd))}<br>` +
    `E/E_rup = ${c(rr.X >= 1 ? 'g' : 'r', rr.X.toExponential(2))}` + (rr.X < 1 && rr.X > 0 ? ` → caldrien ~${c('r', (vMax / rr.X / 1000).toFixed(0) + ' MV')} a les línies` : '') + `<br>` +
    d.corona.map(k => `${k.nom}: superfície ${c('v', fmtE(k.Es))} / Peek ${fmtE(k.Ec)} ${k.actiu ? c('o', '⚡ CORONA') : c('g', 'sense corona')}`).join('<br>') +
    `<br>` + (() => {
      // Soroll de les línies (efecte corona): a 1 m i al testimoni
      const dT = Math.hypot(S.d_obs, Math.max(S.hmt, S.hcat));
      const n1 = F.sorollCorona(S, 1), nT = F.sorollCorona(S, dT), act = n1.filter(k => k.actiu);
      if (!act.length) return `🔊 soroll de les línies: ${c('g', 'cap espetec de corona')} (camp per sota del llindar); només el brunzit magnètic dels transformadors, lluny`;
      return act.map(k => { const kt = nT.find(q => q.nom === k.nom);
        return `🔊 ${k.nom}: corona ${c('o', k.AN.toFixed(0) + ' dB(A)')} a 1 m amb pluja (${(k.AN - 25).toFixed(0)} sec) · al testimoni ${c('v', kt.AN.toFixed(0) + ' dB(A)')} · espetec de kHz + brunzit de ${k.brunzit} Hz` +
          (k.valida ? '' : c('w', ' (fora del rang de la fórmula)')); }).join('<br>') +
        `<br>per formar l'anell amb so caldrien ${c('r', '~133–165 dB')} a cada font: el soroll de corona hi queda ${c('r', 'molt lluny')}`;
    })() +
    `<div class="nota">MT modelada com un sol conductor a tensió de fase: és una cota superior.</div>`);
  refreshVis(); refreshEmissors();
}

function refreshEmissors() {
  const nota = document.getElementById('nota-model');
  if (nota) nota.innerHTML = S.model === 1
    ? 'B: l\'anell és el <b>rastre lluminós</b> de n objectes que orbiten. No hi ha so ni vòrtex; ▶ inicia el fenomen.'
    : S.model === 2
      ? 'C: els nodes són <b>màxims d\'energia d\'un camp de so que gira</b> (com rodes sobre una via ondulada). No es mou cap material; ▶ so engega el camp.'
      : 'A: anell de vòrtex creat per una empenta d\'aire, visible pel traçador il·luminat pel sol.';
  const b = document.getElementById('b-go'); if (b && !sigOn) b.textContent = S.model === 1 ? '▶ inicia' : '▶ so';
  refreshPatro();
  if (S.model !== 1) { setH('fc-emis', 'actiu només amb el model B'); return; }
  const a = F.avaluaEmissors(S), e = a.e;
  setH('fc-emis', `velocitat dels nodes ${c('o', e.v.toFixed(1) + ' m/s')} (${(e.v * 3.6).toFixed(0)} km/h)<br>` +
    `acceleració cap al centre ${c('o', e.ac.toFixed(1) + ' m/s²')} = ${c('o', e.g.toFixed(2) + ' g')} → cada objecte necessita una força cap al centre de ${e.g.toFixed(2)}× el seu pes (un dron hauria d'anar inclinat ${e.inclinacio.toFixed(0)}°)<br>` +
    `entre nodes ${c('v', e.dt.toFixed(2) + ' s')} · gruix al node següent ${c(e.fFinal >= 0.05 && e.fFinal <= 0.4 ? 'g' : 'w', Math.round(e.fFinal * 100) + ' %')} (τ per al 25 %: ${e.tauPerFinal(0.25).toFixed(2)} s)<br>` +
    `eficàcia lluminosa ${c('v', e.eff.toFixed(1) + ' lm/W')} · lluminància del cap ${c('v', (e.L0 / 1000).toFixed(2) + ' kcd/m²')}<br>` +
    `cel darrere ${c('v', (a.Lsky / 1000).toFixed(2) + ' kcd/m²')} → contrast ${c(a.C > 0.3 ? 'g' : 'r', a.C.toFixed(2))} · per a C = 1 caldrien ${c('o', e.potenciaPerL(a.Lsky).toFixed(1) + ' kW')} per node<br>` +
    `color ${c('v', Math.round(e.hue) + '°')} <span style="display:inline-block;width:22px;height:9px;border-radius:2px;vertical-align:middle;background:rgb(${e.rgb.map(v => Math.round(255 * F.gammaSRGB(v))).join(',')})"></span> ${e.taronja ? c('g', 'taronja') : ''}`);
}
function refreshPatro() {
  if (S.model !== 2) { setH('fc-patro', 'actiu només amb el model C'); return; }
  const a = F.avaluaPatro(S), p = a.p;
  setH('fc-patro', `${p.K} ones de ${S.c_fc.toFixed(1)} a ${(S.c_fc + (p.K - 1) * p.df).toFixed(2)} Hz, separades Δf = ${c('o', p.df.toFixed(3) + ' Hz')}, càrrega ℓ ≈ ${p.l}<br>` +
    `velocitat de fase dels nodes ${c('o', p.v.toFixed(1) + ' m/s')} · cap material es mou → sense força centrípeta<br>` +
    `radi natural amb aquesta portadora ${c(Math.abs(p.Rnat / p.R - 1) < 0.15 ? 'g' : 'w', p.Rnat.toFixed(1) + ' m')} (per a R = ${p.R.toFixed(1)} m cal f_c = ${p.fcRadi.toFixed(1)} Hz)<br>` +
    `concentració als nodes ×${p.K} → pic ${c('o', p.Lpic.toFixed(0) + ' dB')} · amplada del node ${c('v', p.amplada.toFixed(1) + ' m')}<br>` +
    `boira si T < ${p.Td.toFixed(1)} °C: cal ${c('o', p.Lcond.toFixed(0) + ' dB')} al node (${p.LmitjaCond.toFixed(0)} dB de mitjana) · ara T = ${c(p.condensa ? 'g' : 'r', p.Tmin.toFixed(1) + ' °C')}<br>` +
    `aigua condensada ${c('v', (p.lwc * 1000).toFixed(2) + ' g/m³')} · τ = ${c('v', p.tau.toFixed(2))} · evaporació ${c('v', fmtT(p.tEv))} → cua ${Math.round(p.fFinal * 100)} %<br>` +
    `testimoni: ${c(p.perillos ? 'r' : p.percep ? 'w' : 'g', p.Lobs.toFixed(0) + ' dB')} a ${S.c_fc.toFixed(1)} Hz (es percep a partir de ${p.Lth.toFixed(0)} dB; perillós > 140 dB)`);
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
  set('cmp-score', a.emissors || a.patro
    ? `model ${a.patro ? 'C' : 'B'}: ${a.n}/${a.total} conseqüències físiques complertes (· = valor imposat, no compta)`
    : `${a.n}/${a.total} condicions complertes (predicció del model; objectius = observació si no els canvies)`);
}

/* ── Capçalera i estat ──────────────────────────────────────────────────── */
const fmtC = T => (T >= 1000 ? T.toFixed(0) : T.toFixed(1)) + ' °C';
/** Valors comuns a tots els models: temperatura, mida, alçada, distància i edat */
function capcaleraMida(o) {
  set('hv-temp', o.temp == null ? '—' : o.temp); col('hv-temp', o.colT || '');
  set('hv-dim', o.D == null ? '—' : `Ø ${o.D.toFixed(1)} · ${o.tub.toFixed(2)} m`);
  set('hv-h', o.h == null ? '—' : o.h.toFixed(1) + ' m');
  set('hv-dist', o.dist == null ? '—' : o.dist.toFixed(0) + ' m');
  set('hv-edat', o.edat == null ? '—' : fmtT(o.edat));
}
function refreshHeader() {
  if (S.model === 2) {
    const a = avaluacio, p = a && a.p;
    set('hv-gam', '—'); set('hv-u', '0 (patró fix)'); set('hv-rot', S.c_T.toFixed(1) + ' s ↺');
    set('hv-c', a ? a.C.toFixed(2) : '—'); col('hv-c', a && a.C > 0.3 ? '#40c080' : '#8892aa');
    set('hv-x', '—'); set('hv-n', p ? String(p.m) : '—'); set('hv-vida', 'mentre soni');
    // Temperatura: mínima a la rarefacció dels nodes (refredament adiabàtic)
    const gC = F.geometriaVisio(S, S.sx_off, S.c_h, 0, fenT || 0);
    capcaleraMida({ temp: p ? `${fmtC(p.Tmin)} al node (aire ${fmtC(S.T)})` : null, colT: p && p.condensa ? '#a8d0ff' : '',
      D: S.c_D, tub: S.c_cap, h: S.c_h, dist: gC.dist, edat: sigOn ? fenT || 0 : null });
    const es = estat(); set('hv-es', es.n); col('hv-es', es.c); set('ph-n', es.n); col('ph-n', es.c); set('ph-d', es.d);
    return;
  }
  if (S.model === 1) {
    const e = F.emissors(S), a = avaluacio;
    set('hv-gam', '—'); set('hv-u', (F.vent(S)).toFixed(2) + ' m/s (vent)');
    set('hv-rot', S.e_T.toFixed(1) + ' s ' + (S.e_sent > 0 ? '↺' : '↻'));
    set('hv-c', a ? a.C.toFixed(2) : '—'); col('hv-c', a && a.C > 0.3 ? '#40c080' : '#8892aa');
    set('hv-x', '—'); set('hv-n', String(e.n)); set('hv-vida', fmtT(S.e_vida));
    // Temperatura: la dels emissors si és incandescència; el sodi no és tèrmic
    const tB = fenT || 0, pB = F.posicioEmissors(S, tB), gB = F.geometriaVisio(S, pB.x, pB.y, pB.z, tB), fr = F.factorRadiEmissors(S, tB);
    capcaleraMida({ temp: S.e_tipus === 0 ? `${fmtC(S.e_Temp - 273.15)} (incandescent)` : 'línia del sodi (no tèrmica)', colT: '#ff9030',
      D: 2 * e.R * fr, tub: S.e_cap, h: S.e_h, dist: gB.dist, edat: fenT });
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
  const X = r0 ? r0.X : F.ratiRuptura(S, d.src.x, d.src.y).X;
  set('hv-x', emOn ? X.toExponential(1) : 'EM off'); col('hv-x', X >= 1 ? '#40c080' : '#e05050');
  set('hv-n', an.es_forma ? String(an.nodes) : '—');
  set('hv-vida', avaluacio && avaluacio.tVis != null ? fmtT(avaluacio.tVis) : '—');
  // Temperatura del toroide: l'aire de l'anell (aire emès diluït + escalfament, si n'hi ha)
  // i la del nucli, on la caiguda de pressió del vòrtex el refreda (expansió adiabàtica)
  if (ev) {
    const Tair = r0 ? r0.T - 273.15 : S.T + S.dT0, nu = F.nucliTermo(S, ev.Gamma, ev.a);
    const gA = r0 ? visibilitat(r0).g : F.geometriaVisio(S, d.src.x, d.src.y, 0, 0);
    const dTn = nu.Tnucli - S.T;
    capcaleraMida({ temp: `${fmtC(Tair)} · nucli ${dTn >= 0 ? '+' : '−'}${Math.abs(dTn).toFixed(Math.abs(dTn) < 0.1 ? 3 : 1)} °C`, colT: r0 && r0.T > 1500 ? '#ff9030' : nu.condensa ? '#a8d0ff' : '',
      D: 2 * ev.R, tub: 2 * ev.a, h: r0 ? r0.y : d.src.y, dist: gA.dist, edat: r0 ? r0.age : null });
  } else capcaleraMida({ temp: `${fmtC(S.T)} (aire, sense anell)` });
  const es = estat();
  set('hv-es', es.n); col('hv-es', es.c);
  set('ph-n', es.n); col('ph-n', es.c); set('ph-d', es.d);
}
function estat() {
  if (S.model === 2) {
    const p = avaluacio && avaluacio.p;
    if (!sigOn) return { n: 'aturat', d: 'Model C (patró de so rotatiu): prem ▶ so', c: '#4a5468' };
    return p && p.condensa
      ? { n: 'nodes de boira', d: `pic ${p.Lpic.toFixed(0)} dB al node · el testimoni rebria ${p.Lobs.toFixed(0)} dB`, c: '#40c080' }
      : { n: 'patró invisible', d: `no condensa: calen ${p ? p.Lcond.toFixed(0) : '—'} dB al node`, c: '#8860e0' };
  }
  if (S.model === 1) {
    if (fenT === null) return { n: 'aturat', d: 'Model B (nodes emissors): prem ▶ inicia', c: '#4a5468' };
    const a = avaluacio, env = F.envolupantEmissors(S, fenT);
    return { n: env < 1 ? 'extingint-se' : 'anell de rastres', d: `t = ${fmtT(fenT)} · ${S.e_n} nodes a ${F.emissors(S).v.toFixed(1)} m/s · C = ${(a ? a.C * env : 0).toFixed(2)}`, c: env > 0 ? '#ff9030' : '#4a5468' };
  }
  const d = derivat, an = d.an, r0 = anellPrincipal();
  if (!sigOn && !rings.length && extingits > 0) return { n: 'extingit', d: 'l\'anell s\'ha dispersat fins a fondre\'s amb el cel i ha desaparegut · prem ▶ so per tornar a començar', c: '#8892aa' };
  if (!sigOn && !rings.length) return { n: 'aturat', d: 'Prem ▶ so per emetre (la comparació és la predicció del model)', c: '#4a5468' };
  if (sigOn && !an.es_forma) {
    const a = d.an;
    if (d.mig && a.u === 0) return { n: 'ones que s\'anul·len', d: 'Al punt mig les dues ones arriben en antifase i s\'anul·len: canvia el desfasament S₁→S₂.', c: '#e0a030' };
    return { n: 'ones sense anell', d: `L₀/D = ${a.F.toFixed(3)}, Holman = ${a.holman.toFixed(3)} < 0.16: ${d.mig ? 'les ones juntes no mouen prou aire al punt mig' : 'el flux no se separa de l\'obertura'}. Puja el nivell, baixa la freqüència o redueix D.`, c: '#e0a030' };
  }
  if (!r0 && extingits > 0 && (!sigOn || (S.npols > 0 && emesos.every((e, i) => e >= S.npols || !(d.anellsE[i] && d.anellsE[i].es_forma)))))
    return { n: 'extingit', d: 'l\'anell s\'ha dispersat fins a fondre\'s amb el cel i ha desaparegut', c: '#8892aa' };
  if (!r0) return { n: 'emetent', d: `formant l'anell (cal mig cicle: ${fmtT(0.5 / d.fMain)})…`, c: '#7f77dd' };
  const v = visibilitat(r0);
  return { n: 'anell ' + v.mec, d: `edat ${fmtT(r0.age)} · ${r0.ev.disp ? 'dispersant-se' : r0.alim ? 'sostingut pel so' : 'lliure'} · Ø ${(2 * r0.ev.R).toFixed(1)} m · y = ${r0.y.toFixed(1)} m · C = ${v.ap.C.toFixed(2)}`, c: v.visible ? '#40c080' : '#8860e0' };
}

/* ── Dibuix 3D ──────────────────────────────────────────────────────────────
   Escena en perspectiva amb càmera orbital. Eixos (com a l'observació):
     X → al llarg de les línies elèctriques
     Y → amunt
     Z → transversal a les línies; el testimoni comença a +Z (a d_obs metres),
         mira cap a −Z i camina cap a l'anell (v_obs durant t_cam)
   L'anell és paral·lel a les línies (pla X–Y) i el vent el porta cap a +Z.
   Sistema dextrogir: mirant cap a −Z, +X queda a la dreta.
   Vistes: testimoni · frontal · zenital · lateral · 3D lliure (arrossegar per
   girar, roda o pessic per apropar, doble clic per tornar a la vista triada).
   ─────────────────────────────────────────────────────────────────────────── */
const cv = document.getElementById('cv'), cx = cv.getContext('2d');
let DPR = 1;
function rc() { DPR = window.devicePixelRatio || 1; cv.width = cv.offsetWidth * DPR; cv.height = cv.offsetHeight * DPR; campCache = null; }
window.addEventListener('resize', rc);

const VISTES = {
  testimoni: { nom: '👁 testimoni' },
  frontal:   { nom: 'frontal',  yaw: 0,   pitch: 0 },
  zenital:   { nom: 'zenital',  yaw: 0,   pitch: 89 },
  lateral:   { nom: 'lateral',  yaw: 90,  pitch: 0 },
  persp:     { nom: '3D',       yaw: -38, pitch: 16 },
};
const CAM = { vista: 'persp', yaw: -38, pitch: 16, zoom: 1 };
const NEAR = 0.5;
let VW = null;   // estat de la vista del fotograma actual

/* Vectors */
const v3 = (x, y, z) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** Centre i mida del fenomen (on mira la càmera) */
function centreEscena() {
  const d = derivat, r0 = anellPrincipal();
  let c, R;
  if (S.model === 1) { const p = fenT !== null ? F.posicioEmissors(S, fenT) : { x: S.sx_off, y: S.e_h, z: 0 }; c = v3(p.x, p.y, p.z); R = S.e_D / 2; }
  else if (S.model === 2) { c = v3(S.sx_off, S.c_h, 0); R = S.c_D / 2; }
  else if (r0) { c = v3(r0.x, r0.y, r0.z); R = r0.ev.R; }
  else { const src = d.src; c = v3(src.x, src.y, 0); R = d.an.es_forma ? d.an.R : Math.max(S.D_ap, 1); }
  // La càmera enquadra tot el que importa: l'anell sencer (amb el radi), les
  // fonts amb els seus pals, i el punt de formació M i el creuament C
  const pts = [add(c, v3(-R, -R, 0)), add(c, v3(R, R, 0))];
  if (S.model !== 1) d.fs.forEach(q => { pts.push(v3(q.x, q.y, 0), v3(q.x, 0, 0)); });
  if (d.mig) pts.push(v3(d.mig.x, d.mig.y, 0), v3(d.mig.x, d.mig.yC, 0));
  const lo = [0, 1, 2].map(k => Math.min(...pts.map(q => q[k]))), hi = [0, 1, 2].map(k => Math.max(...pts.map(q => q[k])));
  const cv = lo.map((v, k) => (v + hi[k]) / 2);
  const mig = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2;
  const radi = Math.max(mig * 1.1, R * 1.8, S.a_riu / 2 + 2, 6);
  return { c, R, radi, cv };
}

/** Prepara la càmera del fotograma */
/** Temps del fenomen (per a la posició del testimoni que camina) */
function tFenomen() { if (S.model !== 0) return fenT || 0; const r0 = anellPrincipal(); return r0 ? r0.age : 0; }
function posTestimoni() { const o = F.posicioTestimoni(S, tFenomen()); return v3(o.x, o.y, o.z); }
function preparaVista(W, H) {
  const ce = centreEscena();
  let pos, target = ce.cv, fov;
  if (CAM.vista === 'testimoni') {
    pos = posTestimoni();
    const semi = Math.max(ce.radi * 0.85, 8) / CAM.zoom;
    fov = 2 * Math.atan(semi / Math.max(Math.hypot(...sub(target, pos)), 1));
  } else {
    // yaw = 0: des del costat del testimoni (+Z) mirant cap a −Z
    const yaw = CAM.yaw * Math.PI / 180, pit = CAM.pitch * Math.PI / 180;
    const dir = v3(Math.sin(yaw) * Math.cos(pit), Math.sin(pit), Math.cos(yaw) * Math.cos(pit));
    const ortho = CAM.vista === 'frontal' || CAM.vista === 'zenital' || CAM.vista === 'lateral';
    fov = ortho ? 6 * Math.PI / 180 : 50 * Math.PI / 180;       // les vistes planes gairebé ortogràfiques
    const dist = ce.radi * 1.25 / Math.tan(fov / 2) / CAM.zoom;
    pos = add(target, mul(dir, dist));
  }
  const fw = norm3(sub(target, pos));
  let rt = cross(fw, v3(0, 1, 0));                 // dextrogir: dreta = endavant × amunt
  if (Math.hypot(...rt) < 1e-6) rt = v3(1, 0, 0);
  rt = norm3(rt);
  const up = cross(rt, fw);
  const foc = (Math.min(W, H) / 2) / Math.tan(fov / 2);   // el camp de visió cap a la dimensió més petita (mòbil vertical)
  VW = { pos, fw, rt, up, foc, W, H, ce, fov };
  return VW;
}
function aCam(p) { const d = sub(p, VW.pos); return [dot(d, VW.rt), dot(d, VW.up), dot(d, VW.fw)]; }
function deCam(c) { return { x: VW.W / 2 + c[0] * VW.foc / c[2], y: VW.H / 2 - c[1] * VW.foc / c[2], s: VW.foc / c[2], z: c[2] }; }
/** Projecta un punt; null si és darrere la càmera */
function P(p) { const c = aCam(p); return c[2] < NEAR ? null : deCam(c); }
/** Segment retallat al pla proper */
function segment(a, b) {
  let A = aCam(a), B = aCam(b);
  if (A[2] < NEAR && B[2] < NEAR) return null;
  if (A[2] < NEAR) { const t = (NEAR - A[2]) / (B[2] - A[2]); A = add(A, mul(sub(B, A), t)); }
  else if (B[2] < NEAR) { const t = (NEAR - B[2]) / (A[2] - B[2]); B = add(B, mul(sub(A, B), t)); }
  return [deCam(A), deCam(B)];
}
function linia(a, b, estil, amplada, guions) {
  const s_ = segment(a, b); if (!s_) return;
  cx.strokeStyle = estil; cx.lineWidth = amplada; if (guions) cx.setLineDash(guions);
  cx.beginPath(); cx.moveTo(s_[0].x, s_[0].y); cx.lineTo(s_[1].x, s_[1].y); cx.stroke();
  if (guions) cx.setLineDash([]);
}
function polilinia(punts, estil, amplada, guions, tancada) {
  for (let i = 0; i < punts.length - 1 + (tancada ? 1 : 0); i++) linia(punts[i], punts[(i + 1) % punts.length], estil, amplada, guions);
}
function poligon(punts, farciment) {
  const ps = punts.map(P); if (ps.some(p => !p)) return;
  cx.fillStyle = farciment; cx.beginPath(); cx.moveTo(ps[0].x, ps[0].y);
  for (let i = 1; i < ps.length; i++) cx.lineTo(ps[i].x, ps[i].y);
  cx.closePath(); cx.fill();
}
function brillantor(p, radiM, color, alpha, minPx) {
  const q = P(p); if (!q) return;
  const r = Math.max(radiM * q.s, minPx || 3 * DPR);
  const g = cx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r);
  g.addColorStop(0, `rgba(255,245,215,${alpha})`); g.addColorStop(0.35, `rgba(${color},${alpha * 0.7})`); g.addColorStop(1, `rgba(${color},0)`);
  cx.fillStyle = g; cx.beginPath(); cx.arc(q.x, q.y, r, 0, 2 * Math.PI); cx.fill();
}
function text3(p, txt, color, dy, alinea, negreta) {
  const q = P(p); if (!q || !VIS.lb) return;
  cx.font = `${negreta ? 'bold ' : ''}${(negreta ? 10 : 9) * DPR}px sans-serif`;
  cx.fillStyle = color; cx.textAlign = alinea || 'center';
  // Manté l'etiqueta dins la pantalla (a la vora es desplaça cap a dins)
  const w = cx.measureText(txt).width, m = 4 * DPR, al = alinea || 'center';
  const esq = al === 'center' ? q.x - w / 2 : al === 'left' ? q.x : q.x - w;
  const dx = esq < m ? m - esq : esq + w > cv.width - m ? cv.width - m - (esq + w) : 0;
  cx.fillText(txt, q.x + (w < cv.width - 2 * m ? dx : 0), q.y + (dy || 0) * DPR);
}
/**
 * Cinta (tub vist en pantalla): punts del centre en 3D i semiamplada en metres.
 * Es construeix en espai de pantalla amb la normal de la tangent projectada.
 */
function cinta(centres, semiM, color) {
  const ps = centres.map(P);
  if (ps.some(p => !p)) return;
  const ext = [], int = [];
  for (let i = 0; i < ps.length; i++) {
    const a = ps[Math.max(0, i - 1)], b = ps[Math.min(ps.length - 1, i + 1)];
    let tx = b.x - a.x, ty = b.y - a.y; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const h = Math.max(semiM[i] * ps[i].s, 0.6 * DPR);
    ext.push([ps[i].x - ty * h, ps[i].y + tx * h]); int.push([ps[i].x + ty * h, ps[i].y - tx * h]);
  }
  cx.fillStyle = color; cx.beginPath(); cx.moveTo(ext[0][0], ext[0][1]);
  for (const [x, y] of ext) cx.lineTo(x, y);
  for (let i = int.length - 1; i >= 0; i--) cx.lineTo(int[i][0], int[i][1]);
  cx.closePath(); cx.fill();
}
/** Base del pla de l'anell a partir de la direcció de l'eix */
function basePla(eix) {
  let u = cross(v3(0, 1, 0), eix);
  if (Math.hypot(...u) < 1e-6) u = v3(1, 0, 0);
  u = norm3(u);
  return { u, v: cross(eix, u) };
}
function eixAnell() {
  const el = S.elev * Math.PI / 180, az = S.az_eix * Math.PI / 180;
  return v3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
}
const puntAnell = (c, b, R, phi) => add(c, add(mul(b.u, R * Math.cos(phi)), mul(b.v, R * Math.sin(phi))));

/** Anell amb forma de cometa (n caps; la cua s'aprima amb factor(u)) */
function anellCometa(c, b, R, a, n, ang, sentit, factor, color, alpha) {
  const gap = 2 * Math.PI / n, NS = 32;
  for (let k = 0; k < n; k++) {
    const cap = ang + k * gap, cs = [], sm = [];
    for (let j = 0; j <= NS; j++) { const u = j / NS; cs.push(puntAnell(c, b, R, cap - sentit * u * gap)); sm.push(a * factor(u)); }
    cinta(cs, sm, `rgba(${color},${0.85 * alpha})`);
    brillantor(puntAnell(c, b, R, cap), a * 1.4, color, Math.min(1, alpha * 1.1));
  }
}
function anellUniforme(c, b, R, a, color, alpha, guions) {
  const cs = [], sm = [];
  for (let j = 0; j <= 96; j++) { cs.push(puntAnell(c, b, R, j / 96 * 2 * Math.PI)); sm.push(a); }
  if (guions) { polilinia(cs, color, DPR, [3 * DPR, 4 * DPR]); return; }
  cinta(cs, sm, `rgba(${color},${alpha})`);
}

/* ── Mapa del camp elèctric al pla de l'anell (z = 0) ── */
function mapaCamp(Lx, Ymax) {
  const nx = 36, ny = 20;
  if (!campCache || campCache.Lx !== Lx || campCache.Ymax !== Ymax) {
    const Ebd0 = F.K.ETD_CRIT * F.nDens(F.pAtm(S), F.Tk(S)), cel = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const x = -Lx + (i + 0.5) * 2 * Lx / nx, y = (j + 0.5) * Ymax / ny;
      const t = Math.max(0, Math.min(1, (Math.log10(Math.max(F.campEPic(S, x, y, 0) / Ebd0, 1e-7)) + 6) / 6));
      if (t > 0) cel.push({ i, j, c: `rgba(${Math.round(80 + 175 * t)},${Math.round(60 + 60 * t)},${Math.round(160 - 140 * t)},${0.05 + 0.3 * t})` });
    }
    campCache = { Lx, Ymax, cel };
  }
  const dx = 2 * Lx / nx, dy = Ymax / ny;
  for (const k of campCache.cel) {
    const x0 = -Lx + k.i * dx, y0 = k.j * dy;
    poligon([v3(x0, y0, 0), v3(x0 + dx, y0, 0), v3(x0 + dx, y0 + dy, 0), v3(x0, y0 + dy, 0)], k.c);
  }
}

function draw() {
  const W = cv.width, H = cv.height; if (!W || !H) return;
  const d = derivat, f = DPR, sol = d.sol;
  const vw = preparaVista(W, H), ce = vw.ce;
  cx.clearRect(0, 0, W, H);
  const Lx = Math.max(ce.radi * 2.6, 60), Lz = Math.max(ce.radi * 2.6, 60);

  // Cel i horitzó
  const dia = Math.max(0, Math.min(1, sol.alt / 25));
  const hor = (() => { const dh = norm3(v3(vw.fw[0], 0, vw.fw[2])); const q = P(add(vw.pos, mul(dh, 1e6))); return q ? q.y : (vw.fw[1] < 0 ? -1 : H + 1); })();
  const g = cx.createLinearGradient(0, 0, 0, Math.max(hor, 1));
  g.addColorStop(0, `rgb(${Math.round(7 + 30 * dia)},${Math.round(16 + 60 * dia)},${Math.round(31 + 100 * dia)})`);
  g.addColorStop(1, `rgb(${Math.round(13 + 70 * dia)},${Math.round(26 + 100 * dia)},${Math.round(44 + 130 * dia)})`);
  cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  if (hor < H) { cx.fillStyle = '#14110b'; cx.fillRect(0, Math.max(hor, 0), W, H - Math.max(hor, 0)); }

  // Sol
  const dAz = (sol.az - S.az_vis) * Math.PI / 180, alt = sol.alt * Math.PI / 180;
  const dirSol = v3(Math.sin(dAz) * Math.cos(alt), Math.sin(alt), Math.cos(dAz) * Math.cos(alt));
  if (VIS.sol && sol.alt > -2) {
    const q = P(add(vw.pos, mul(dirSol, 1e6)));
    if (q && q.x > -60 * f && q.x < W + 60 * f && q.y > -60 * f && q.y < H + 60 * f) {
      const gg = cx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 55 * f);
      gg.addColorStop(0, 'rgba(255,245,210,.95)'); gg.addColorStop(0.15, 'rgba(255,230,170,.5)'); gg.addColorStop(1, 'rgba(255,220,150,0)');
      cx.fillStyle = gg; cx.beginPath(); cx.arc(q.x, q.y, 55 * f, 0, 2 * Math.PI); cx.fill();
      if (VIS.lb) { cx.fillStyle = 'rgba(255,230,170,.85)'; cx.font = `${9 * f}px sans-serif`; cx.textAlign = 'center'; cx.fillText(`☀ ${sol.alt.toFixed(1)}° · ${sol.az.toFixed(0)}°`, q.x, q.y + 66 * f); }
    }
  }

  // Terra: quadrícula i riu (el riu va al llarg de Z)
  const pas = Math.pow(10, Math.floor(Math.log10(Math.max(ce.radi / 2, 1))));
  const pasG = ce.radi / pas > 5 ? pas * 5 : ce.radi / pas > 2 ? pas * 2 : pas;
  const nG = Math.ceil(Lx / pasG);
  for (let i = -nG; i <= nG; i++) {
    linia(v3(i * pasG, 0, -Lz), v3(i * pasG, 0, Lz), 'rgba(120,120,100,.13)', f);
    linia(v3(-Lx, 0, i * pasG), v3(Lx, 0, i * pasG), 'rgba(120,120,100,.13)', f);
  }
  const ar = S.a_riu / 2, NZ = 12;
  for (let k = 0; k < NZ; k++) {
    const z0 = -Lz + k * 2 * Lz / NZ, z1 = z0 + 2 * Lz / NZ;
    poligon([v3(-ar, 0, z0), v3(ar, 0, z0), v3(ar, 0, z1), v3(-ar, 0, z1)], 'rgba(25,70,140,.55)');
  }
  linia(v3(-ar, 0, -Lz), v3(-ar, 0, Lz), 'rgba(60,150,240,.6)', 1.2 * f);
  linia(v3(ar, 0, -Lz), v3(ar, 0, Lz), 'rgba(60,150,240,.6)', 1.2 * f);
  text3(v3(ar, 0, Lz * 0.6), `riu ${S.a_riu.toFixed(0)} m`, 'rgba(100,170,230,.8)', 12);

  // Mapa del camp elèctric al pla de l'anell
  const Ymax = Math.max(S.hmt, S.hcat, ce.c[1] + ce.R) * 1.3;
  if (VIS.e && (S.vmt > 0 || S.vcat > 0)) mapaCamp(Lx, Ymax);

  // Nodes acústics (plans horitzontals)
  if (VIS.n) {
    [[d.hN, 'node de pressió λ/4', 'rgba(130,110,230,.55)'], [F.hNodeVelocitat(S, S.f1), 'trampa λ/2', 'rgba(80,200,140,.45)']].forEach(([h, l, cc]) => {
      if (h > Ymax * 3) return;
      linia(v3(-Lx, h, 0), v3(Lx, h, 0), cc, f, [4 * f, 4 * f]);
      text3(v3(Lx, h, 0), `${l} · ${h.toFixed(1)} m`, cc, -3, 'right');
    });
  }

  // Línies elèctriques
  F.conductors(S).forEach((cd, i) => {
    const on = emOn && cd.V > 0, cr = d.corona[i];
    const col_ = on ? (i === 0 ? '216,90,48' : '55,138,221') : '110,110,110';
    const paral = S.lin_or !== 1;
    const A = paral ? v3(-Lx, cd.y, cd.x) : v3(cd.x, cd.y, -Lz), B = paral ? v3(Lx, cd.y, cd.x) : v3(cd.x, cd.y, Lz);
    const nPals = 4;
    for (let k = 0; k <= nPals; k++) {
      const t = k / nPals, p = add(A, mul(sub(B, A), t));
      linia(v3(p[0], 0, p[2]), p, 'rgba(150,150,128,.4)', 1.6 * f);
    }
    if (on && cr.actiu) linia(A, B, 'rgba(170,140,255,.3)', 9 * f);
    linia(A, B, `rgba(${col_},${on ? 0.9 : 0.5})`, 1.8 * f, [10 * f, 5 * f]);
    const et = paral ? v3(-Lx * 0.85, cd.y, cd.x) : v3(cd.x, cd.y, -Lz * 0.85);
    text3(et, `${cd.nom} ${(i ? S.vcat : S.vmt).toFixed(0)} kV · ${cd.y.toFixed(1)} m${on && cr.actiu ? ' · ⚡corona' : ''}`, `rgba(${col_},.95)`, -6, 'left');
  });

  // Feixos de S₁ i S₂: cada feix surt de la seva font cap al punt de creuament C
  // i dibuixa la sinusoide del seu so, com a l'oscil·loscopi. Cada so gira (fasor)
  // a la seva pròpia freqüència: la fase avança 2π·f·t + φ. Si λ no hi cap, el
  // nombre d'oscil·lacions del feix s'escala però el període és el real.
  const mig = d.mig, tS = sigOn ? simT : 0, ona = F.formaOna(S).val;
  const Cp = mig ? v3(mig.xC, mig.yC, 0) : null;
  d.fs.forEach((src, i) => {
    const c = v3(src.x, src.y, 0), on = src.L > 0, cc = i === 0 ? '48,192,80' : '208,112,32';
    linia(v3(src.x, 0, 0), c, 'rgba(150,150,128,.45)', 1.5 * f);
    if (!mig) {
      // Formació a l'obertura: disc de l'obertura, perpendicular a l'eix d'emissió
      const bE = basePla(eixAnell()), cerc = [];
      for (let j = 0; j <= 24; j++) cerc.push(puntAnell(c, bE, Math.max(S.D_ap / 2, 0.05), j / 24 * 2 * Math.PI));
      const qs = cerc.map(P);
      if (qs.every(Boolean)) {
        cx.fillStyle = `rgba(${cc},.22)`; cx.beginPath(); cx.moveTo(qs[0].x, qs[0].y); qs.forEach(q => cx.lineTo(q.x, q.y)); cx.closePath(); cx.fill();
        cx.strokeStyle = `rgb(${cc})`; cx.lineWidth = 1.5 * f; cx.stroke();
      }
    }
    brillantor(c, 0.5, on ? cc : '90,90,90', 0.95, 4 * f);
    if (S.refl > 0 && mig) {                                           // font imatge (reflex a l'aigua)
      const im = v3(src.x, -src.y, 0);
      linia(v3(src.x, 0, 0), im, `rgba(${cc},.15)`, f, [2 * f, 3 * f]);
      brillantor(im, 0.4, cc, 0.25 * S.refl, 3 * f);
    }
    const lam = F.lambda(S, src.f), fase = 2 * Math.PI * src.f * tS + src.ph;
    text3(c, `${i ? 'S₂' : 'S₁'} ${src.f < 1 ? src.f.toFixed(3) : src.f.toFixed(2)} Hz · ${src.Ltot.toFixed(0)} dB · φ ${(src.ph * 180 / Math.PI).toFixed(0)}°`, 'rgba(210,210,210,.85)', 16 + 12 * i);
    // Fasor: un cercle amb l'agulla que gira a la freqüència del so
    const Rf = Math.max(ce.radi * 0.05, 0.4), cerc = [];
    for (let j = 0; j <= 32; j++) cerc.push(add(c, v3(Rf * Math.cos(j / 32 * 2 * Math.PI), Rf * Math.sin(j / 32 * 2 * Math.PI), 0)));
    polilinia(cerc, `rgba(${cc},${on ? 0.7 : 0.25})`, f);
    if (on) linia(c, add(c, v3(Rf * Math.cos(fase), Rf * Math.sin(fase), 0)), `rgb(${cc})`, 2 * f);
    if (!on || !VIS.w) return;
    // Feix: la sinusoide del so, de la font a C (o cap amunt si no hi ha punt de creuament)
    const fi = Cp || add(c, v3(0, ce.radi, 0)), dir = sub(fi, c), L = Math.hypot(...dir);
    if (L < 0.5) return;
    const u = mul(dir, 1 / L), nrm = v3(-u[1], u[0], 0);               // perpendicular dins el pla X–Y
    const cicles = Math.min(Math.max(L / lam, 2), 12);                  // oscil·lacions visibles al feix
    const A = Math.max(0.25, Math.min(1, (src.L - 60) / 130)) * Math.min(L * 0.06, ce.radi * 0.12);
    const pts = [];
    for (let j = 0; j <= 160; j++) {
      const sF = j / 160, env = Math.sin(Math.PI * Math.min(sF * 8, 1) / 2);   // neix suau a la font
      const y = A * env * ona(fase - 2 * Math.PI * cicles * sF);               // ona que viatja cap a C
      pts.push(add(add(c, mul(u, sF * L)), mul(nrm, y)));
    }
    polilinia(pts, `rgba(${cc},${sigOn ? 0.95 : 0.4})`, 2 * f);
    linia(c, fi, `rgba(${cc},.18)`, f, [3 * f, 5 * f]);                 // eix del feix
    if (S.feix < 180) {                                                 // vores del feix (±obertura/2)
      const ang = S.feix / 2 * Math.PI / 180, Lv = L * 1.1;
      [-1, 1].forEach(sg => { const ca_ = Math.cos(sg * ang), sa = Math.sin(sg * ang);
        linia(c, add(c, mul(v3(u[0] * ca_ - u[1] * sa, u[0] * sa + u[1] * ca_, 0), Lv)), `rgba(${cc},.12)`, f); });
    }
  });

  // C: on es creuen els feixos · M: on neix l'anell (a C o entre els feixos)
  if (mig) {
    const M = v3(mig.x, mig.y, 0);
    linia(v3(mig.x, 0, 0), v3(mig.x, Math.max(mig.y, mig.yC) * 1.2 + 4, 0), 'rgba(230,220,160,.3)', f, [3 * f, 4 * f]);
    if (Math.hypot(mig.xC - mig.x, mig.yC - mig.y) > 0.3) {
      const q = P(Cp);
      if (q) { cx.strokeStyle = 'rgba(230,230,230,.8)'; cx.lineWidth = 1.5 * f; cx.beginPath(); cx.moveTo(q.x - 5 * f, q.y - 5 * f); cx.lineTo(q.x + 5 * f, q.y + 5 * f); cx.moveTo(q.x + 5 * f, q.y - 5 * f); cx.lineTo(q.x - 5 * f, q.y + 5 * f); cx.stroke(); }
      text3(Cp, `C · creuament dels feixos · h = ${mig.yC.toFixed(0)} m`, 'rgba(230,230,230,.85)', -10, 'center');
    }
    // El·lipse de la velocitat a M i el vector que hi gira: la rotació per fase
    const el = mig.el, Re = Math.max(S.D_ap / 2, 1.5) * 0.9, kE = el.max > 0 ? Re / el.max : 0;
    const w = 2 * Math.PI * mig.f * tS, ves = [];
    const pT = t => mig.iguals ? v3(el.P[0] * Math.cos(t) - el.Q[0] * Math.sin(t), el.P[1] * Math.cos(t) - el.Q[1] * Math.sin(t), 0) : v3(0, 0, 0);
    if (sigOn && mig.iguals && el.P) {
      for (let j = 0; j <= 48; j++) ves.push(add(M, mul(pT(j / 48 * 2 * Math.PI), kE)));
      polilinia(ves, 'rgba(255,230,150,.75)', 1.5 * f);
      const v = add(M, mul(pT(w), kE));
      linia(M, v, 'rgba(255,240,190,.95)', 2.2 * f);
      brillantor(v, 0.2, '255,240,190', 0.9, 3 * f);
    }
    brillantor(M, Math.max(S.D_ap / 2, 1) * 0.5, '255,225,140', sigOn ? 0.55 : 0.25, 6 * f);
    const gir = mig.iguals ? (Math.abs(mig.eps) > 0.01 ? ` · gira ${mig.eps > 0 ? '↺' : '↻'} per Δφ` : ' · sense gir (Δφ = 0/180°)') : ` · batec ${mig.fBat.toFixed(3)} Hz`;
    text3(M, `M · neix l'anell · h = ${mig.y.toFixed(0)} m · u = ${mig.uM.toFixed(1)} m/s${gir}`, 'rgba(255,230,150,.95)', -12, 'center');
  }

  // Testimoni i línia de visió
  const ull = posTestimoni(), hO = S.h_pont + 1.6;
  if (CAM.vista !== 'testimoni') {
    linia(ull, ce.c, 'rgba(230,230,210,.25)', f, [2 * f, 5 * f]);
    // Camí del testimoni: d'on surt fins on s'atura
    const zFi = F.posicioTestimoni(S, Infinity).z;
    if (zFi < S.d_obs) linia(v3(0, hO - 1.6, S.d_obs), v3(0, hO - 1.6, zFi), 'rgba(230,230,210,.35)', 2 * f, [4 * f, 4 * f]);
    brillantor(ull, 0, '230,230,210', 0.9, 3 * f);
    const dist = Math.hypot(...sub(ce.c, ull));
    text3(ull, `👁 testimoni a ${dist.toFixed(0)} m${tFenomen() < S.t_cam && S.v_obs > 0 ? ' · caminant ' + S.v_obs.toFixed(1) + ' km/h' : ''}`, 'rgba(230,230,210,.85)', -8);
  }

  // Vent (fletxa sobre el fenomen)
  if (S.W > 0) {
    const w = F.ventXZ(S), u = norm3(v3(w.x, 0, w.z)), base = add(ce.c, v3(-ce.R * 1.4, ce.R * 1.1, 0));
    const llarg = Math.max(ce.R * 0.6, 3), punta = add(base, mul(u, llarg));
    linia(base, punta, 'rgba(180,200,220,.8)', 1.8 * f);
    const lat = norm3(cross(v3(0, 1, 0), u));
    linia(punta, add(punta, add(mul(u, -llarg * 0.25), mul(lat, llarg * 0.15))), 'rgba(180,200,220,.8)', 1.8 * f);
    linia(punta, add(punta, add(mul(u, -llarg * 0.25), mul(lat, -llarg * 0.15))), 'rgba(180,200,220,.8)', 1.8 * f);
    text3(base, `vent ${S.W.toFixed(1)} km/h`, 'rgba(180,200,220,.85)', 12);
  }

  // Fenomen
  if (S.model === 0) dibuixaVortex(f);
  if (S.model === 1) dibuixaEmissors(f);
  if (S.model === 2) dibuixaPatro(f);

  // Eixos (cantonada inferior esquerra)
  {
    const o = { x: 34 * f, y: H - 40 * f }, Lg = 20 * f;
    [[v3(1, 0, 0), 'X línies', '230,120,90'], [v3(0, 1, 0), 'Y', '150,220,150'], [v3(0, 0, 1), 'Z', '120,170,255']].forEach(([e, n, c]) => {
      const sx = dot(e, vw.rt), sy = dot(e, vw.up);
      cx.strokeStyle = `rgb(${c})`; cx.lineWidth = 2 * f;
      cx.beginPath(); cx.moveTo(o.x, o.y); cx.lineTo(o.x + sx * Lg, o.y - sy * Lg); cx.stroke();
      cx.fillStyle = `rgb(${c})`; cx.font = `${8 * f}px sans-serif`; cx.textAlign = 'center';
      cx.fillText(n, o.x + sx * (Lg + 8 * f), o.y - sy * (Lg + 8 * f) + 3 * f);
    });
  }
  if (VIS.lb) {
    cx.fillStyle = 'rgba(160,150,220,.75)'; cx.textAlign = 'right'; cx.font = `${9 * f}px sans-serif`;
    cx.fillText(W / f > 700 ? `t = ${fmtT(simT)} · vista ${VISTES[CAM.vista] ? VISTES[CAM.vista].nom : 'lliure'} · arrossega per girar, roda per apropar, doble clic per restablir`
      : `t = ${fmtT(simT)} · ${VISTES[CAM.vista] ? VISTES[CAM.vista].nom : 'lliure'}`, W - 8 * f, H - 6 * f);
  }
}

/** Model A: anells de vòrtex */
function dibuixaVortex(f) {
  const eix = eixAnell(), b = basePla(eix);
  for (const r of rings) {
    const v = visibilitat(r), ev = r.ev, c = v3(r.x, r.y, r.z);
    const n = Math.min(r.an.nodes, 24);
    const rot = F.rotacioNodes(S, r.an, ev), cua = F.cuaNodes(S, r.an, ev, rot);
    if (v.visible && !ev.disp && n > 1 && isFinite(cua.dtNodes)) {
      anellCometa(c, b, ev.R, ev.a, n, r.ang, rot.om >= 0 ? 1 : -1, cua.factor, v.col, v.alpha);
    } else if (v.visible) {
      anellUniforme(c, b, ev.R, ev.a * (ev.disp ? 2 : 1), v.col, 0.8 * v.alpha);
    } else {
      anellUniforme(c, b, ev.R, ev.a, 'rgba(160,150,220,.4)', 1, true);
      for (let k = 0; k < n && !ev.disp; k++) brillantor(puntAnell(c, b, ev.R, r.ang + k * 2 * Math.PI / n), 0, '170,160,230', 0.4, 2.5 * f);
    }
  }
  const r0 = anellPrincipal();
  if (r0) {
    const v = visibilitat(r0);
    text3(add(v3(r0.x, r0.y, r0.z), mul(b.v, r0.ev.R + r0.ev.a + 1)), `Ø ${(2 * r0.ev.R).toFixed(1)} m · ${v.mec}${derivat.mig ? (r0.alim ? ' · sostingut pel so' : ' · lliure') : ''} · C = ${v.ap.C.toFixed(2)} · ${(2 * r0.ev.R / v.g.dist * 180 / Math.PI).toFixed(2)}° aparents`,
      v.visible ? `rgba(${v.col},.95)` : 'rgba(170,160,230,.8)', -6, 'center', true);
  }
}

/** Model B: n caps que orbiten i deixen un rastre lluminós que s'aprima */
function dibuixaEmissors(f) {
  const e = F.emissors(S), b = { u: v3(1, 0, 0), v: v3(0, 1, 0) };
  if (fenT === null) {
    const cs = []; for (let j = 0; j <= 96; j++) cs.push(puntAnell(v3(S.sx_off, S.e_h, 0), b, e.R, j / 96 * 2 * Math.PI));
    polilinia(cs, 'rgba(255,170,90,.35)', f, [3 * f, 5 * f]);
    text3(v3(S.sx_off, S.e_h + e.R + 2, 0), 'òrbita dels nodes (▶ inicia)', 'rgba(255,170,90,.7)', -4);
    return;
  }
  const a = avaluacio, env = F.envolupantEmissors(S, fenT);
  if (env <= 0) return;
  const p = F.posicioEmissors(S, fenT), c = v3(p.x, p.y, p.z);
  const col_ = e.rgb.map(v => Math.round(255 * F.gammaSRGB(v))).join(',');
  const alpha = Math.max(0.12, Math.min(1, (a ? a.C : 0.5))) * env;
  const Rt = e.R * F.factorRadiEmissors(S, fenT);       // implosió: l'òrbita es tanca
  if (Rt > 0.05) anellCometa(c, b, Rt, Math.min(S.e_cap / 2, Rt), e.n, S.e_sent * 2 * Math.PI * fenT / S.e_T, S.e_sent, e.factor, col_, alpha);
  text3(add(c, v3(0, Rt + S.e_cap + 1, 0)), `Ø ${(2 * Rt).toFixed(0)} m · ${e.n} nodes a ${(e.v * 3.6).toFixed(0)} km/h · ${e.g.toFixed(2)} g · C = ${((a ? a.C : 0) * env).toFixed(2)}`,
    `rgba(${col_},.95)`, -6, 'center', true);
}

/** Model C: via ondulada (portadora) i nodes de boira que hi corren */
function dibuixaPatro(f) {
  const a = avaluacio && avaluacio.patro ? avaluacio : F.avaluaPatro(S), p = a.p;
  const c = v3(S.sx_off, S.c_h, 0), b = { u: v3(1, 0, 0), v: v3(0, 1, 0) }, t = fenT || 0;
  const ondes = Math.max(4, Math.round(2 * Math.PI * p.R / (F.cSo(S) / S.c_fc)));
  const via = [];
  for (let j = 0; j <= 240; j++) {
    const th = j / 240 * 2 * Math.PI, rr = p.R * (1 + 0.025 * Math.sin(ondes * th - (sigOn ? 2 * Math.PI * S.c_fc * t * 0.05 : 0)));
    via.push(puntAnell(c, b, rr, th));
  }
  polilinia(via, sigOn ? 'rgba(120,180,255,.45)' : 'rgba(120,180,255,.22)', f);
  if (sigOn) {
    const visible = p.condensa && a.C > 0.02;
    const col_ = visible ? '240,244,248' : '150,170,255', alpha = visible ? Math.min(1, Math.max(0.2, a.C)) : 0.35;
    if (visible) anellCometa(c, b, p.R, S.c_cap / 2, p.m, 2 * Math.PI * t / S.c_T, 1, p.factor, col_, alpha);
    else for (let k = 0; k < p.m; k++) brillantor(puntAnell(c, b, p.R, 2 * Math.PI * t / S.c_T + k * 2 * Math.PI / p.m), S.c_cap / 2, col_, alpha, 5 * f);
    text3(add(c, v3(0, p.R + S.c_cap + 1, 0)), `${p.m} nodes de so a ${(p.v * 3.6).toFixed(0)} km/h · pic ${p.Lpic.toFixed(0)} dB · ${visible ? 'boira visible' : p.condensa ? 'boira massa tènue (C = ' + a.C.toFixed(2) + ')' : 'invisible (no condensa)'}`,
      'rgba(200,220,255,.9)', -6, 'center', true);
  }
}

/* ── Interacció amb la càmera ── */
function posaVista(nom) {
  CAM.vista = nom; CAM.zoom = 1;
  const v = VISTES[nom]; if (v && v.yaw != null) { CAM.yaw = v.yaw; CAM.pitch = v.pitch; }
  document.querySelectorAll('[data-vista]').forEach(b => b.classList.toggle('on', b.dataset.vista === nom));
}
(() => {
  const punters = new Map(); let distIni = 0, zoomIni = 1;
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); punters.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punters.size === 2) { const [a, b] = [...punters.values()]; distIni = Math.hypot(a.x - b.x, a.y - b.y); zoomIni = CAM.zoom; } });
  cv.addEventListener('pointermove', e => {
    if (!punters.has(e.pointerId)) return;
    const prev = punters.get(e.pointerId); punters.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punters.size === 2) {
      const [a, b] = [...punters.values()]; const dd = Math.hypot(a.x - b.x, a.y - b.y);
      if (distIni > 0) CAM.zoom = Math.min(20, Math.max(0.2, zoomIni * dd / distIni));
      return;
    }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    if (Math.abs(dx) + Math.abs(dy) < 1) return;
    if (CAM.vista === 'testimoni') { CAM.yaw = 0; CAM.pitch = 2; }
    if (CAM.vista !== 'lliure') { CAM.vista = 'lliure'; document.querySelectorAll('[data-vista]').forEach(b => b.classList.remove('on')); }
    CAM.yaw += dx * 0.35; CAM.pitch = Math.max(-10, Math.min(89, CAM.pitch + dy * 0.35));
  });
  const fi = e => { punters.delete(e.pointerId); };
  cv.addEventListener('pointerup', fi); cv.addEventListener('pointercancel', fi);
  cv.addEventListener('wheel', e => { e.preventDefault(); CAM.zoom = Math.min(20, Math.max(0.2, CAM.zoom * Math.exp(-e.deltaY * 0.0012))); }, { passive: false });
  cv.addEventListener('dblclick', () => posaVista(VISTES[CAM.vista] ? CAM.vista : 'persp'));
})();

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
  simT = 0; rings = []; extingits = 0; fenT = null; emissio[0] = emissio[1] = 0.5; emesos[0] = emesos[1] = 0;
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
  const src = derivat.src;
  const sy = F.sincronisme(Object.assign({}, S, { tau: 0 }), src.y);
  const T = 1e6 / S.f_mt;
  let tau = -(sy.tv * 1e6) % T;
  if (tau > T / 2) tau -= T; if (tau < -T / 2) tau += T;
  setParam('tau', Math.round(tau));
}
function dissenyaIAplica(silenciós) {
  const obj = { D: S.oD, tub: S.otub, n: S.on, Trot: S.oT, sentit: OPC.dir, h: S.oh, Umax: S.oU, vida: S.ovida, contrast: S.oC, prioritat: OPC.prioritat, passiu: OPC.mov === 'brisa' };
  const r = F.dissenya(S, obj);
  const claus = ['h_creu', 'D_ap', 'aR', 'f1', 'f2', 'db1', 'db2', 'phi', 'npols', 'n_inj', 'swirl', 'kdir', 'h_src', 'elev', 'az_eix', 'dT0', 'sx_off', 'so', 'turb', 'aer'];
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
function drawOsc(id, freq, amp, phDeg, color, ona) {
  const c2 = document.getElementById('osc-' + id); if (!c2) return;
  const o = c2.getContext('2d'), W = c2.width, H = c2.height;
  o.fillStyle = '#02040a'; o.fillRect(0, 0, W, H);
  o.strokeStyle = 'rgba(20,40,60,.6)'; o.lineWidth = .5;
  o.beginPath(); o.moveTo(0, H / 2); o.lineTo(W, H / 2); o.stroke();
  if (amp <= 0) { o.fillStyle = 'rgba(60,80,100,.7)'; o.font = '7px monospace'; o.textAlign = 'center'; o.fillText('off', W / 2, H / 2 + 3); return; }
  const tw = Math.max(3 / Math.max(freq, 0.005), 0.04), ph = phDeg * Math.PI / 180;
  o.strokeStyle = color; o.lineWidth = 1.3; o.beginPath();
  for (let px = 0; px < W; px++) {
    const th = 2 * Math.PI * freq * (simT - tw + px / W * tw) + ph;
    const y = (ona ? ona(th) : Math.sin(th)) * amp;
    const py = H / 2 * (1 - y * 0.85); px ? o.lineTo(px, py) : o.moveTo(px, py);
  }
  o.stroke();
}
function updateOsc() {
  if (document.getElementById('osc-panel').style.display === 'none') return;
  const ampDb = L => Math.min(1, Math.sqrt(L / 191));
  const ona = F.formaOna(S).val;
  drawOsc('s1', S.f1, sigOn ? ampDb(S.db1) : 0, 0, '#28b040', ona);
  drawOsc('s2', S.f2, sigOn ? ampDb(S.db2) : 0, S.phi, '#c06010', ona);
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
function freqAudio(id) { let f = Math.max(fBase(id), 0.005); while (f < 20) f *= 10; while (f > 18000) f /= 10; return f; }   // infrasò ×10, ultrasò ÷10 fins que és audible
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
    if (id === 's1' || id === 's2') osc.type = ['sine', 'square', 'triangle'][S.forma || 0];
    osc.connect(g); g.connect(audioCtx.destination); osc.start();
    audioNodes[id] = { osc, g };
    const k = freqAudio(id) / fBase(id);
    btn.textContent = k > 1.5 ? '♦×' + Math.round(k) : k < 0.67 ? '♦÷' + Math.round(1 / k) : '■';
    btn.style.color = '#40e080';
  }).catch(() => {});
}
function updateAudio() {
  if (!audioCtx) return;
  Object.keys(audioNodes).forEach(id => {
    audioNodes[id].osc.frequency.setTargetAtTime(freqAudio(id), audioCtx.currentTime, 0.05);
    if (id === 's1' || id === 's2') audioNodes[id].osc.type = ['sine', 'square', 'triangle'][S.forma || 0];
  });
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
    if (k && e.target.type === 'range') setParam(k, esLog(k) ? Math.pow(10, +e.target.value) : +e.target.value);
  });
  document.body.addEventListener('click', e => {
    const t = e.target.closest('[data-k],[data-preset],[data-act],[data-vis],[data-grup],[data-audio],[data-vista]');
    if (!t) return;
    if (t.dataset.vista) { posaVista(t.dataset.vista); return; }
    if (t.dataset.k && t.dataset.d) { const k = t.dataset.k; setParam(k, esLog(k) ? S[k] * Math.pow(1.01, +t.dataset.d) : S[k] + (+t.dataset.d) * DEF[k][2]); return; }   // log: ±1 %
    if (t.dataset.preset) { loadPreset(+t.dataset.preset); return; }
    if (t.dataset.vis) { const k = t.dataset.vis; VIS[k] = !VIS[k]; t.classList.toggle('on', VIS[k]); return; }
    if (t.dataset.audio) { toggleAudio(t.dataset.audio); return; }
    if (t.dataset.grup) {
      const g = t.dataset.grup, v = t.dataset.v;
      if (g === 'g-trac') setParam('trac', +v);
      else if (g === 'g-kdir') setParam('kdir', +v);
      else if (g === 'g-model') { reinicia(); setParam('model', +v); }
      else if (g === 'g-etipus') setParam('e_tipus', +v);
      else if (g === 'g-linor') setParam('lin_or', +v);
      else if (g === 'g-form') { reinicia(); setParam('form', +v); }
      else if (g === 'g-forma') { setParam('forma', +v); updateAudio(); }
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
      f2f1: () => setParam('f2', S.f1), phiL: () => setParam('phi', -90), phiR: () => setParam('phi', 90), phi0: () => setParam('phi', 0),
      eTau: () => setParam('e_tau', F.emissors(S).tauPerFinal(0.25)),
      cFc: () => setParam('c_fc', F.patroAcustic(S).fcRadi),
      cL: () => { const p = F.patroAcustic(S); setParam('c_L', p.LmitjaCond + 4); },
      cR: () => setParam('c_r', F.patroAcustic(S).rPerCua(0.25)),
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
