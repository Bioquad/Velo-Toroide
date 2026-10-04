// Proves del nucli de física (sense dependències): node tests/fisica.test.js
'use strict';
const assert = require('assert');
const F = require('../simulation/v041/fisica.js');

const SEGRE = { T: 35, P: 1013, H: 30, W: 3, dirW: 90, turb: 0.2, aer: 0, trac: 0, aot: 0.1,
  hmt: 18, hcat: 11, sl: 24, vmt: 25, vcat: 25, ph: 90, rc: 0.9, f_mt: 50, h_pont: 5, h_src: 5,
  so: 10, sx_off: 0, a_riu: 30, D_ap: 0.5, elev: 0, az_eix: 0, aR: 0.12, f1: 3.5714, f2: 3.0,
  db1: 100, db2: 100, phi: 0, tau: 0, npols: 0, n_inj: 0, swirl: 0, kdir: 1, dT0: 0,
  mes: 9, dia: 18, hora: 18, tz: 2, lat: 41.6142, lon: 0.6222, az_vis: 232, d_obs: 60 };
const amb = o => Object.assign({}, SEGRE, o);
const prop = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol * Math.abs(b), `${msg}: ${a} vs ${b}`);
let n = 0;
function t(nom, fn) { fn(); n++; console.log('✓', nom); }

/* Aire i acústica */
t('velocitat del so a 35 °C ≈ 352 m/s', () => prop(F.cSo(SEGRE), 351.9, 0.002, 'c'));
t('densitat de l\'aire a 35 °C ≈ 1.145 kg/m³', () => prop(F.rho(SEGRE), 1.145, 0.005, 'ρ'));
t('node λ/4 a 3.5714 Hz ≈ 24.6 m', () => prop(F.hNodePressio(SEGRE, 3.5714), 24.63, 0.005, 'h'));
t('nivell màxim físic ≈ 191 dB', () => prop(F.dbMax(SEGRE), 191.1, 0.002, 'dB'));
t('punt de rosada (35 °C, 30 %) ≈ 14.8 °C', () => prop(F.puntRosada(SEGRE), 14.8, 0.02, 'Td'));
t('inversió coherent: dbPerVelocitat ∘ velocitatObertura = identitat', () => {
  const s = amb({ D_ap: 3 });
  prop(F.dbPerVelocitat(s, 2, F.velocitatObertura(s, 2, 150)), 150, 1e-9, 'L');
});

/* Electricitat */
t('camp de ruptura a STP ≈ 3 MV/m', () => prop(F.campRuptura(amb({ T: 20 }), 0).Ebd, 3.0e6, 0.03, 'E_bd'));
t('la rarefacció acústica baixa el llindar, però poc', () => {
  const a = F.campRuptura(SEGRE, 0).Ebd, b = F.campRuptura(SEGRE, 0.5 * F.pAtm(SEGRE)).Ebd;
  assert.ok(b < a && b > 0.4 * a);
});
t('camp d\'una línia aïllada = fórmula analítica sota el conductor', () => {
  const s = amb({ vcat: 0, sl: 0, hmt: 10 });
  const V = 25e3 * Math.sqrt(2 / 3), h = 10, y = 5;
  prop(F.campEPic(s, 0, y), V / Math.log(2 * h / 0.009) * (1 / (h - y) + 1 / (h + y)), 1e-6, 'E');
});
t('línies paral·leles a l\'anell: el camp no depèn de x; perpendiculars: sí', () => {
  const par = amb({ lin_or: 0 }), per = amb({ lin_or: 1 });
  prop(F.campEPic(par, -10, 20, 0), F.campEPic(par, 10, 20, 0), 1e-12, 'E paral·leles');
  assert.ok(Math.abs(F.campEPic(per, -10, 20) - F.campEPic(per, 10, 20)) > 1);
  assert.ok(F.campEPic(par, 0, 20, -12) > F.campEPic(par, 0, 20, 0));   // més a prop de la MT
});
t('Segre: les línies de 25 kV queden molt lluny de la ruptura (X < 1e-3)', () => assert.ok(F.ratiRuptura(SEGRE, 0, 24.6).X < 1e-3));
t('25 kV no fa corona; 400 kV amb el mateix conductor sí', () => {
  assert.ok(F.corona(SEGRE).every(c => !c.actiu));
  assert.ok(F.corona(amb({ vmt: 400, hmt: 12 }))[0].actiu);
});
t('plasma: sense ruptura no conductor; amb X > 1 hi ha allau', () => {
  assert.ok(F.plasma(SEGRE, 0.001, F.K.N_STP, 100).ne < 1);
  assert.ok(F.plasma(SEGRE, 1.2, F.K.N_STP, 3e6).ne > 1e18);
});

/* Anells de vòrtex */
t('configuració original (100 dB, obertura 0.5 m): no es forma cap anell', () => assert.strictEqual(F.anellFont(SEGRE, 3.5714, 100).es_forma, false));
t('canó de vòrtex de taula (D = 10 cm, 15 Hz, 100 dB): sí que forma anell', () => {
  const a = F.anellFont(amb({ D_ap: 0.1, aR: 0.2, T: 20 }), 15, 100);
  assert.ok(a.es_forma && a.Gamma > 0 && a.Uself > 0);
});
t('velocitat de Saffman: Γ/(4πR)·(ln(8R/a) − 1/4)', () => {
  const a = F.anellFont(amb({ D_ap: 0.1, aR: 0.2, T: 20 }), 15, 100);
  prop(a.Uself, a.Gamma / (4 * Math.PI * a.R) * (Math.log(8 / 0.2) - 0.25), 1e-9, 'U');
});
t('anell turbulent: impuls conservat (R²Γ constant) i U ∝ R⁻³', () => {
  const s = amb({ D_ap: 20, aR: 0.12, f1: 0.05 });
  const an = F.anellFont(s, 0.05, 115), e0 = F.evolucio(s, an, 0), e1 = F.evolucio(s, an, 500);
  assert.ok(an.ReG > 1e4 && e1.R > e0.R);
  prop(e1.R * e1.R * e1.Gamma, e0.R * e0.R * e0.Gamma, 1e-9, 'I');
  prop(e1.U / e0.U, Math.pow(e0.R / e1.R, 3), 1e-9, 'U');
});
t('la vida baixa quan augmenta la turbulència ambient', () => {
  const s = amb({ D_ap: 20, aR: 0.12, f1: 0.05 }), an = F.anellFont(s, 0.05, 115);
  assert.ok(F.vidaAnell2(amb({ D_ap: 20, aR: 0.12, turb: 0.05 }), an).total > F.vidaAnell2(amb({ D_ap: 20, aR: 0.12, turb: 0.5 }), an).total);
});
t('nodes: n injectors sembren el mode n; sense injectors, Widnall', () => {
  assert.strictEqual(F.anellFont(amb({ n_inj: 4 }), 3, 120).nodes, 4);
  const a = F.anellFont(amb({ aR: 0.2 }), 3, 120);
  assert.strictEqual(a.nodes, a.nWidnall);
});
t('cua de cometa: el gruix decau com exp(−Δt/τ) entre nodes', () => {
  const s = amb({ D_ap: 2, n_inj: 4, f1: 1, swirl: 0.5 }), an = F.anellFont(s, 1, 140);
  const cu = F.cuaNodes(s, an);
  prop(cu.fFinal, Math.exp(-cu.dtNodes / (an.a / s.turb)), 1e-9, 'f');
  assert.ok(cu.factor(0) === 1 && cu.factor(0.5) > cu.factor(1));
});
t('gir: el swirl canvia el sentit i el període', () => {
  const s = amb({ D_ap: 2, n_inj: 4, f1: 1 }), an = F.anellFont(s, 1, 140);
  const a = F.rotacioNodes(amb({ D_ap: 2, n_inj: 4, swirl: 0.5 }), an), b = F.rotacioNodes(amb({ D_ap: 2, n_inj: 4, swirl: -0.5, kdir: -1 }), an);
  assert.ok(a.sentit > 0 && b.sentit < 0);
  prop(a.T, b.T, 1e-9, 'T');
});

/* Sol i òptica */
t('sol a Lleida, 18-09-2022 18:00 CEST: altura ≈ 22°, azimut ≈ 252°', () => {
  const p = F.posicioSol(SEGRE);
  assert.ok(Math.abs(p.alt - 22) < 1.5 && Math.abs(p.az - 252) < 2, JSON.stringify(p));
});
t('sol al migdia solar de l\'equinocci a l\'equador: zenit', () => {
  const p = F.posicioSol(amb({ mes: 3, dia: 20, lat: 0, lon: 0, tz: 0, hora: 12.12 }));
  assert.ok(p.alt > 88, JSON.stringify(p));
});
t('funció de fase HG normalitzada (mitjana sobre l\'esfera = 1)', () => {
  let sum = 0; const N = 20000;
  for (let i = 0; i < N; i++) { const mu = -1 + (2 * i + 1) / N; sum += F.faseHG(0.7, mu) * (2 / N); }
  prop(sum / 2, 1, 1e-3, '∫P');
});
t('a contrallum la pols brilla més que el cel; d\'esquena al sol, no', () => {
  const sol = F.posicioSol(SEGRE);
  const davant = F.aparenca(SEGRE, 1, sol.az, sol.alt - 4).C;
  const darrere = F.aparenca(SEGRE, 1, (sol.az + 180) % 360, 15).C;
  assert.ok(davant > 0.3 && darrere < davant);
});
t('fum gruixut de costat al sol: el blanc és més clar que el cel, el taronja és taronja però més fosc', () => {
  const sol = F.posicioSol(SEGRE), az = (sol.az - 150 + 360) % 360;
  const blanc = F.aparenca(amb({ trac: 1 }), 10, az, 10), taronja = F.aparenca(amb({ trac: 3 }), 10, az, 10);
  assert.ok(blanc.C > 0.1 && !blanc.taronja, JSON.stringify(blanc.C));
  assert.ok(taronja.taronja && taronja.C < 0, JSON.stringify(taronja.C));
});

/* Disseny invers i comparació amb l'observació.
   Escena real: el testimoni és a +Z, a 900 m, i camina cap a −Z (cap a l'anell)
   a 5 km/h durant 90 s; el vent bufa cap a +Z (dirW = 0, cap al testimoni). */
const sol = F.posicioSol(SEGRE);
const ESC = { d_obs: 900, v_obs: 5, t_cam: 90 };
const BASE = amb(Object.assign({ dirW: 0, aot: 0.1, az_vis: sol.az - 3 }, ESC));
const OBJ = { D: 25, tub: 3, n: 4, Trot: 7, sentit: 1, h: 25, Umax: 1, vida: 180, contrast: 2 };
const ok = (ev, nom) => ev.files.find(x => x.nom === nom).ok;
const ENC = "s'encongeix 30 s i desapareix";
t('testimoni: comença a +Z (900 m), camina 90 s a 5 km/h cap a −Z i s\'atura', () => {
  prop(F.posicioTestimoni(BASE, 0).z, 900, 1e-12, 'z0');
  prop(F.posicioTestimoni(BASE, 90).z, 900 - 125, 1e-12, 'z90');
  prop(F.posicioTestimoni(BASE, 1e4).z, 900 - 125, 1e-12, 'zfi');
  assert.ok(F.ventXZ(BASE).z > 0);                       // el vent va cap al testimoni
});
t('a 900 m l\'anell es veu a ~2° sobre l\'horitzó, uns 20° per sota del sol: la pols no el fa més brillant que el cel', () => {
  const d = F.dissenya(BASE, Object.assign({ prioritat: 'deriva' }, OBJ));
  assert.ok(d.psi > 15 && d.cMax < 0.3, JSON.stringify({ psi: d.psi, cMax: d.cMax }));
});
t('disseny (prioritat deriva): creix en apropar-se, però el gir no és de 7 s i no s\'encongeix', () => {
  const d = F.dissenya(BASE, Object.assign({ prioritat: 'deriva' }, OBJ));
  const ev = F.avaluaObservacio(d.cfg);
  assert.ok(ok(ev, 'creix una mica (0–1.5 min)'));
  assert.ok(!ok(ev, '1 volta ≈ 7 s') && !ok(ev, ENC));
  assert.ok(d.viable && d.conflicte > 1);
  prop(2 * ev.tr[Math.floor(ev.tr.length / 2)].ev.R, 25, 0.01, 'diàmetre al mig');
});
t('hipòtesi brisa de 0.5 km/h: creix i després és estable; un anell de vòrtex es dispersa, no implosiona', () => {
  const b = amb(Object.assign({ W: 0.5, dirW: 45, aot: 0.1, az_vis: sol.az - 5 }, ESC));
  const d = F.dissenya(b, Object.assign({ prioritat: 'deriva', passiu: true }, OBJ));
  const ev = F.avaluaObservacio(d.cfg, { passiu: true });
  assert.ok(ok(ev, 'creix una mica (0–1.5 min)') && ok(ev, 'estable ~1.0 min'));
  assert.ok(!ok(ev, ENC) && !ok(ev, '1 volta ≈ 7 s'));
  assert.ok(d.cfg.turb < 0.03 && d.f < 0.01, JSON.stringify({ turb: d.cfg.turb, f: d.f }));
});
t('disseny (prioritat gir): aconsegueix 7 s però perd la deriva lenta', () => {
  const d = F.dissenya(BASE, Object.assign({ prioritat: 'rotacio' }, OBJ));
  const ev = F.avaluaObservacio(d.cfg);
  assert.ok(ok(ev, '1 volta ≈ 7 s') && !ok(ev, 'deriva lenta (U < 1.67 m/s)'));
});
t('assaig real 1:10 amb fum blanc (a 90 m): només fallen el color i la implosió', () => {
  const s = amb({ W: 1, dirW: 0, aot: 0.05, d_obs: 90, v_obs: 0.5, t_cam: 15, trac: 1, h_pont: 1, a_riu: 10, vmt: 0, vcat: 0, az_vis: (sol.az - 100 + 360) % 360 });
  const o = { D: 2.5, tub: 0.3, n: 4, Trot: 7, sentit: 1, h: 3, Umax: 0.5, vida: 30, contrast: 0.3, prioritat: 'deriva' };
  const d = F.dissenya(s, o);
  const ev = F.avaluaObservacio(d.cfg, { D: 2.5, tub: 0.3, h: 3, nodes: 4, Trot: 7, sentit: 1, durada: 30, Umax: 0.5 });
  assert.deepStrictEqual(ev.files.filter(x => !x.ok).map(x => x.nom), ["s'encongeix 5 s i desapareix", 'color taronja']);
  assert.ok(d.L < 120 && d.f < 20);   // infrasò i nivell assolible amb un pistó
});
/* Formació al punt mig entre S₁ i S₂ (l'anell no surt de cap font) */
const P25 = { x: 0, y: 25 };   // punt fix del pla mitjà per a les proves del camp
const MIG = amb(Object.assign({ dirW: 0, aot: 0.1, az_vis: sol.az - 3, form: 1, h_src: 5, so: 27.5, sx_off: 0,
  f1: 0.07, f2: 0.07, db1: 178, db2: 178, phi: 0, D_ap: 20 }, ESC));
t('punt mig: la pressió se suma en fase i s\'anul·la en antifase; la velocitat no s\'anul·la (direccions diferents)', () => {
  const m0 = F.puntMig(MIG, P25), m180 = F.puntMig(Object.assign({}, MIG, { phi: 180 }), P25);
  prop(m0.r[0], Math.hypot(13.75, 20), 1e-12, 'r');
  prop(m0.pM, m0.p[0] + m0.p[1], 1e-6, 'pressió en fase');
  assert.ok(m180.pM < 1e-6 * m0.pM);
  const mig = m0.angleCreu / 2;
  prop(m0.uM, 2 * m0.u[0] * Math.cos(mig), 1e-6, 'velocitat en fase');
  prop(m180.uM, 2 * m0.u[0] * Math.sin(mig), 1e-6, 'velocitat en antifase');
});
t('camp proper: en infrasò la velocitat d\'un monopol és p/(ρc)·√(1 + 1/(kr)²)', () => {
  const m = F.puntMig(MIG, P25), k = 2 * Math.PI * 0.07 / F.cSo(MIG), r = m.r[0];
  prop(m.u[0], m.p[0] / (F.rho(MIG) * F.cSo(MIG)) * Math.sqrt(1 + 1 / (k * r) ** 2), 1e-12, 'u');
});
t('la diferència de fase produeix la rotació: Δφ = −90° ↺, +90° ↻, 0° i 180° no giren', () => {
  const eps = phi => F.puntMig(Object.assign({}, MIG, { phi }), P25).eps;
  const sinT = Math.sin(F.puntMig(MIG, P25).angleCreu);
  prop(eps(-90), sinT, 1e-9, 'ε(−90°)'); prop(eps(90), -sinT, 1e-9, 'ε(+90°)');
  assert.ok(Math.abs(eps(0)) < 1e-12 && Math.abs(eps(180)) < 1e-12);
  const rot = phi => { const a = F.anellPrincipalFont(Object.assign({}, MIG, { phi })).an; return F.rotacioNodes(MIG, a).sentit; };
  assert.strictEqual(rot(-90), 1); assert.strictEqual(rot(90), -1);
});
t('freqüències diferents: Δφ avança al ritme del batec, el gir s\'inverteix (de mitjana zero) i es forma un anell per batec', () => {
  const m = F.puntMig(Object.assign({}, MIG, { f2: 0.08 }), P25);
  prop(m.fBat, 0.01, 1e-9, 'batec'); prop(m.ritme, 0.01, 1e-9, 'ritme');
  assert.strictEqual(m.eps, 0);
  prop(m.pM, m.p[0] + m.p[1], 1e-12, 'màxim de pressió');
});
t('on neix l\'anell ho decideix la física: dues fonts iguals → sobre el punt mig, a (separació/2)/√3 en camp proper i /√2 en camp llunyà', () => {
  const base = Object.assign({}, MIG, { db1: 153, db2: 153, phi: -90 });
  const p = F.posicioFormacio(base);
  assert.ok(p.valid && Math.abs(p.x) < 0.05, JSON.stringify(p));
  prop(p.y - 5, 13.75 / Math.sqrt(3), 0.005, 'camp proper');
  const ll = F.millorPuntFormacio(Object.assign({}, base, { f1: 2000, f2: 2000, db1: 100, db2: 100 }));   // nivell baix: sense saturació no lineal
  prop(ll.y - 5, 13.75 / Math.SQRT2, 0.01, 'camp llunyà');   // l'absorció del camí el desplaça una mica
  // una font més feble desplaça el punt cap a ella; separar les fonts l'apuja
  assert.ok(F.posicioFormacio(Object.assign({}, base, { db2: 147 })).x > 2);
  assert.ok(F.millorPuntFormacio(Object.assign({}, base, { so: 60 })).y > p.y + 5);
  // si al màxim no s'hi arriba, es forma al punt següent més favorable on sí
  const lluny = F.posicioFormacio(Object.assign({}, base, { so: 60 }));
  assert.ok(lluny.valid && lluny.rank > 0);
});
t('disseny entre els feixos: la física situa l\'anell a 25 m amb les fonts a ~69 m; ~161 dB desfasades −90° el fan antihorari; el gir de 7 s és impossible', () => {
  const d = F.dissenya(MIG, Object.assign({ prioritat: 'deriva' }, OBJ));
  const pr = F.anellPrincipalFont(d.cfg);
  assert.ok(pr.src.mig && Math.abs(pr.src.x) < 0.05 && Math.abs(pr.src.y - 25) < 0.3 && pr.an.es_forma, JSON.stringify(pr.src));
  assert.strictEqual(d.cfg.db1, d.cfg.db2); assert.strictEqual(d.cfg.phi, -90);
  assert.ok(Math.abs(d.cfg.so - 69.3) < 1, String(d.cfg.so));
  assert.ok(Math.abs(d.L - 161.2) < 0.5 && d.viable, String(d.L));
  assert.strictEqual(F.rotacioNodes(d.cfg, pr.an).sentit, 1);
  const ev = F.avaluaObservacio(d.cfg);
  assert.ok(ok(ev, 'anell format') && ok(ev, 'sentit antihorari') && ok(ev, 'creix una mica (0–1.5 min)') && ok(ev, 'deriva lenta (U < 1.67 m/s)'));
  const r = F.dissenya(MIG, Object.assign({ prioritat: 'rotacio' }, OBJ));
  assert.ok(r.L > F.dbMax(MIG) && !r.viable, String(r.L));
});
t('camp a la posició de l\'anell: a M és el mateix que al punt mig i s\'afebleix quan el vent l\'allunya', () => {
  const m0 = F.puntMig(MIG, P25), mM = F.puntMig(MIG, { x: 0, y: 25, z: 0 }), m30 = F.puntMig(MIG, { x: 0, y: 25, z: 30 });
  prop(mM.uM, m0.uM, 1e-12, 'mateix punt');
  assert.ok(m30.uM < 0.5 * m0.uM, String(m30.uM / m0.uM));
  // amb el nivell just del disseny, a 30 m ja no compleix el criteri: l'anell queda lliure
  const d = F.dissenya(MIG, Object.assign({ prioritat: 'deriva' }, OBJ));
  const viu = z => { const m = F.puntMig(d.cfg, { x: 0, y: 25, z }); return F.anellVelocitat(d.cfg, m.f, m.uM).es_forma; };
  assert.ok(viu(0) && !viu(30));
});
t('feixos: obertura de 0° (tancat) a 180° (altaveu convencional); l\'alçada on es creuen mou el punt on neix l\'anell', () => {
  const b = Object.assign({}, MIG, { so: 69.2, f1: 0.0714, f2: 0.0714, db1: 161.2, db2: 161.2, phi: -90, n_inj: 4 });
  const y = (feix, h_creu) => F.posicioFormacio(Object.assign({}, b, { feix, h_creu })).y;
  // sense feix definit (font puntual omnidireccional) C no hi influeix
  prop(F.posicioFormacio(Object.assign({}, b, { h_creu: 25 })).y, F.posicioFormacio(Object.assign({}, b, { h_creu: 60 })).y, 1e-9, 'omni');
  assert.ok(y(60, 60) > y(60, 25) + 3);
  // a α = obertura/2 de l'eix el feix cau a la meitat (−6 dB)
  const bb = Object.assign({}, b, { feix: 60, h_creu: 25 }), q = F.fonts(bb)[0];
  const eix = Math.atan2(34.6, 20), al = eix + 30 * Math.PI / 180;
  prop(F.guanyFeix(bb, q, q.x + 100 * Math.sin(al), q.y + 100 * Math.cos(al), 0), 0.5, 1e-3, 'g(α½)');
  // boca necessària: ~5 km per ±30° a 0.07 Hz; ~1 cm a 40 kHz
  assert.ok(F.bocaFeix(bb, 0.0714) > 4000 && F.bocaFeix(bb, 40000) < 0.02);
});
t('absorció atmosfèrica ISO 9613-1: ~0.005 dB/m a 1 kHz i ~1.3 dB/m a 40 kHz (20 °C, 50 %)', () => {
  const a = f => F.alfaAbs(f, { T: 20, H: 50, P: 1013.25 }) * 8.686;
  assert.ok(Math.abs(a(1000) - 0.0047) < 0.0008, String(a(1000)));
  assert.ok(Math.abs(a(40000) - 1.32) < 0.15, String(a(40000)));
});
t('l\'ultrasò (> 20 kHz) no és audible', () => {
  const b = amb({ f1: 30000, f2: 30000, db1: 140, db2: 140, d_obs: 60 });
  assert.strictEqual(F.harmonicsAudibles(b).length, 0);
  assert.ok(F.harmonicsAudibles(Object.assign({}, b, { f1: 5000, f2: 5000 })).length > 0);
});
t('pressió de radiació sobre el contrast: el fum o l\'aire calent de l\'anell reben empenta directa, que creix amb la freqüència', () => {
  const b = Object.assign({}, MIG, { so: 69.2, f1: 0.0714, f2: 0.0714, db1: 161.2, db2: 161.2, phi: -90 });
  const net = F.correntAcustic(Object.assign({}, b, { aer: 0, dT0: 0 }), { x: 0, y: 25 });
  const fum = F.correntAcustic(Object.assign({}, b, { aer: 500, trac: 1, dT0: 0 }), { x: 0, y: 25 });
  const calent = F.correntAcustic(Object.assign({}, b, { aer: 0, dT0: 10 }), { x: 0, y: 25 });
  assert.strictEqual(net.Fcon, 0); assert.ok(fum.Fcon > 0 && calent.Fcon > fum.Fcon);
  // en règim lineal (nivell moderat) creix amb la freqüència
  const baix = F.correntAcustic(Object.assign({}, b, { aer: 0, dT0: 10, db1: 120, db2: 120 }), { x: 0, y: 25 });
  const alt = F.correntAcustic(Object.assign({}, b, { aer: 0, dT0: 10, db1: 120, db2: 120, f1: 714, f2: 714 }), { x: 0, y: 25 });
  assert.ok(alt.Fcon > baix.Fcon, String(alt.Fcon / baix.Fcon));
});
t('saturació no lineal: passat el xoc, a 40 m arriba la mateixa pressió per molts dB que posis a la font', () => {
  const b = Object.assign({}, MIG, { so: 69.2, f1: 5000, f2: 5000, phi: 0, refl: 0, rfont: 0.3 });
  const p = L => F.fasorsFonts(Object.assign({}, b, { db1: L, db2: L }), 0, 25, 0)[0].p;
  assert.ok(p(180) / p(160) < 1.2, String(p(180) / p(160)));          // +20 dB a la font, < +1.6 dB a 40 m
  const c = F.cSo(b), rh = F.rho(b), r = F.fasorsFonts(b, 0, 25, 0)[0].r;
  const psat = rh * c ** 3 / (1.2 * 2 * Math.PI * 5000 * r * Math.log(r / 0.3));
  assert.ok(Math.abs(p(190) / psat - 1) < 0.25, String(p(190) / psat));   // p = p_lin/(1+σ) → p_sat quan σ ≫ 1
  // en infrasò no hi ha saturació: +10 dB a la font són +10 dB a 40 m
  const q = L => F.fasorsFonts(Object.assign({}, b, { f1: 0.07, f2: 0.07, db1: L, db2: L }), 0, 25, 0)[0].p;
  prop(q(160) / q(150), Math.pow(10, 0.5), 0.01, 'lineal');
  // distància de xoc esfèrica
  assert.ok(F.distanciaXocEsferica(b, 5000, 160) < 1 && F.distanciaXocEsferica(b, 0.07, 160) === Infinity);
});
t('d\'on surt el gir: en infrasò, el so dona una Γ ~10⁴–10⁶ vegades massa petita', () => {
  const d = F.dissenya(MIG, Object.assign({ prioritat: 'deriva' }, OBJ));
  const an = F.anellPrincipalFont(d.cfg).an, ca = F.correntAcustic(d.cfg, null, an.Gamma);
  assert.ok(!ca.suficient && ca.factor > 1e4 && ca.factor < 1e7, String(ca.factor));
  const ev = F.avaluaObservacio(d.cfg);
  assert.strictEqual(ok(ev, 'el so empeny prou l\'aire per fer el gir'), false);
  // la part d'absorció creix com f²: a 2 kHz el mateix nivell empeny ~10⁸ vegades més
  const a = F.correntAcustic(Object.assign({}, d.cfg, { f1: 0.07, f2: 0.07 }), { x: 0, y: 25 }).Fabs;
  const bF = F.correntAcustic(Object.assign({}, d.cfg, { f1: 2000, f2: 2000 }), { x: 0, y: 25 }).Fabs;
  assert.ok(bF / a > 1e6, String(bF / a));   // amb la saturació del xoc
});
t('freqüència òptima per empènyer: ~1 kHz; amb la saturació del xoc no n\'hi ha prou; l\'ultrasò s\'absorbeix pel camí', () => {
  const b = Object.assign({}, MIG, { so: 69.2, db1: 161.2, db2: 161.2, phi: -90, aer: 500, trac: 1, feix: 180, h_creu: 25 });
  const G = f => F.correntAcustic(Object.assign({}, b, { f1: f, f2: f }), { x: 0, y: 25 }, 40).G;
  // amb la saturació del xoc, l'òptim queda prop d'1 kHz i, tot i així, molt lluny del que cal
  assert.ok(G(1000) > 10 * G(0.0714) && G(1000) > 10 * G(40000) && G(1000) < 1);
});
t('a kHz, amb la saturació del xoc, l\'empenta del so no forma l\'anell al Segre ni al límit físic', () => {
  const b = Object.assign({}, MIG, { so: 69.2, phi: -90, aer: 500, trac: 1, feix: 180, h_creu: 25, n_inj: 4, f1: 5000, f2: 5000, refl: 1, rfont: 0.3 });
  for (const L of [170, 191]) assert.ok(!F.anellPrincipalFont(Object.assign({}, b, { db1: L, db2: L })).an.es_forma, String(L));
});
t('reflex de l\'aigua: la font imatge (x, −h) dobla el camp a prop de l\'aigua en infrasò i abaixa el nivell necessari', () => {
  const b = Object.assign({}, MIG, { so: 69.2, phi: -90, n_inj: 4, f1: 0.07, f2: 0.07, db1: 150, db2: 150 });
  const sense = F.fasorsFonts(Object.assign({}, b, { refl: 0 }), 0, 1, 0)[0], amb_ = F.fasorsFonts(Object.assign({}, b, { refl: 1 }), 0, 1, 0)[0];
  assert.ok(amb_.p / sense.p > 1.8 && amb_.p / sense.p < 2.05, String(amb_.p / sense.p));   // directa + reflectida gairebé en fase
  assert.ok(!F.anellPrincipalFont(Object.assign({}, b, { refl: 0 })).an.es_forma);
  assert.ok(F.anellPrincipalFont(Object.assign({}, b, { refl: 1 })).an.es_forma);
  // sense reflex (refl = 0) el resultat és el de sempre
  prop(F.fasorsFonts(Object.assign({}, b, { refl: 0 }), 0, 25, 0)[0].u, F.puntMig(Object.assign({}, b, { refl: 0 }), { x: 0, y: 25 }).u[0], 1e-12, 'u');
});
t('soroll de les línies: a 25 kV no hi ha corona (cap espetec); a 400 kV amb un conductor prim sí', () => {
  const b = amb({ vmt: 25, vcat: 25 });
  assert.ok(F.sorollCorona(b, 1).every(k => !k.actiu));
  const c = F.sorollCorona(amb({ vmt: 400, vcat: 0, hmt: 12 }), 1)[0];
  assert.ok(c.actiu && c.AN > 60 && c.brunzit === 100, JSON.stringify(c));
  // BPA: −11.4 dB per dècada de distància
  prop(F.sorollCorona(amb({ vmt: 400, vcat: 0, hmt: 12 }), 10)[0].AN, c.AN - 11.4, 1e-9, 'distància');
});
/* Paràmetres dels generadors recuperats de la versió original */
t('forma del senyal: el fonamental porta el 100 % (sinus), ~81 % (quadrada) i ~99 % (triangular) de l\'energia', () => {
  const fr = (forma, nharm) => F.formaOna({ forma, nharm }).frac ** 2;
  prop(fr(0, 9), 1, 1e-12, 'sinus');
  prop(fr(1, 400), 8 / Math.PI ** 2, 0.002, 'quadrada');
  prop(fr(2, 400), 96 / Math.PI ** 4, 1e-4, 'triangular');
  const v = F.formaOna({ forma: 1, nharm: 9 }).val; let pic = 0; for (let i = 0; i < 256; i++) pic = Math.max(pic, Math.abs(v(i / 256 * 2 * Math.PI)));
  prop(pic, 1, 1e-12, 'pic normalitzat');
});
t('harmònics: una quadrada de 3.57 Hz a 120 dB fa sentir harmònics ≥ 20 Hz al testimoni; la sinusoïdal no', () => {
  const b = amb({ f1: 3.5714, f2: 3.5714, db1: 120, db2: 120, d_obs: 60, h_src: 5, so: 10 });
  assert.strictEqual(F.harmonicsAudibles(b).length, 0);
  const q = F.harmonicsAudibles(Object.assign({}, b, { forma: 1, nharm: 9 }));
  assert.ok(q.length > 0 && q.every(h => h.f >= 20), JSON.stringify(q[0]));
});
t('β: la distància de xoc és inversament proporcional al coeficient de no-linealitat', () => {
  const x1 = F.distanciaXoc(amb({ beta: 1.2 }), 3.57, 150), x2 = F.distanciaXoc(amb({ beta: 2.4 }), 3.57, 150);
  prop(x1 / x2, 2, 1e-12, 'β');
  prop(F.distanciaXoc(amb({}), 3.57, 150), x1, 1e-12, 'per defecte β = 1.2');
});
t('ionització residual: fixa la densitat electrònica mínima i fa conductor l\'aire', () => {
  const N = 2.4e25, a = F.plasma(amb({ IR: 0 }), 0.01, N, 100), b = F.plasma(amb({ IR: 1 }), 0.01, N, 100);
  prop(b.ne, 0.01 * N, 1e-12, 'ne'); assert.ok(b.pJoule > 1e6 * a.pJoule);
});
/* Model B: nodes emissors */
const EMIS = amb(Object.assign({ W: 0.5, dirW: 0, az_vis: (sol.az - 90 + 360) % 360,
  e_n: 4, e_D: 25, e_cap: 3, e_T: 7, e_sent: 1, e_tau: 1.3, e_P: 1.5, e_tipus: 1, e_Temp: 2000, e_h: 25, e_vida: 150, e_ext: 30, e_impl: 1 }, ESC));
t('nodes emissors: 4 nodes, 25 m, 7 s → 11.2 m/s i 1.03 g', () => {
  const e = F.emissors(EMIS);
  prop(e.v, 2 * Math.PI * 12.5 / 7, 1e-9, 'v');
  prop(e.g, e.v * e.v / 12.5 / 9.81, 1e-9, 'g');
  assert.ok(Math.abs(e.g - 1.03) < 0.01);
});
t('eficàcia lluminosa: sodi ≈ 540 lm/W, cos negre de 2000 K ≈ 1.6 lm/W', () => {
  assert.ok(Math.abs(F.eficaciaEmissio(1) - 538) < 5);
  assert.ok(Math.abs(F.eficaciaEmissio(0, 2000) - 1.6) < 0.3);
});
t('emissió de sodi: color taronja; 1.5 kW per node la fa visible de dia', () => {
  const a = F.avaluaEmissors(EMIS);
  assert.ok(a.e.taronja && a.C > 0.3, JSON.stringify({ C: a.C, h: a.e.hue }));
  assert.deepStrictEqual(a.files.filter(f => f.ok === false).map(f => f.nom), ['forat amb un to diferent']);
});
t('nodes emissors: creix en apropar-s\'hi, estable 1 min, i amb implosió l\'òrbita es tanca en 30 s', () => {
  const a = F.avaluaEmissors(EMIS);
  assert.ok(ok(a, 'creix una mica (0–1.5 min)') && ok(a, 'estable ~1.0 min'));
  assert.strictEqual(F.factorRadiEmissors(EMIS, 150), 1);
  prop(F.factorRadiEmissors(EMIS, 165), 0.5, 1e-12, 'meitat');
  assert.strictEqual(F.factorRadiEmissors(EMIS, 180), 0);
  assert.strictEqual(ok(F.avaluaEmissors(Object.assign({}, EMIS, { e_impl: 0 })), ENC), false);
});
t('incandescència a 2000 K: cal ~300 vegades més potència que el sodi', () => {
  const a = F.avaluaEmissors(EMIS), b = F.avaluaEmissors(Object.assign({}, EMIS, { e_tipus: 0 }));
  const r = b.e.potenciaPerL(b.Lsky) / a.e.potenciaPerL(a.Lsky);
  assert.ok(r > 250 && r < 400, String(r));
});
/* Model C: patró acústic rotatiu */
const PAT = amb({ W: 0.5, dirW: 90, d_obs: 40, az_vis: (sol.az - 3 + 360) % 360,
  c_D: 25, c_m: 4, c_T: 7, c_K: 8, c_fc: 13.7, c_L: 172, c_r: 40, c_cap: 3, c_h: 25 });
t('patró de so: Δf = m/T = 0.571 Hz, 11.2 m/s i portadora de 13.7 Hz per a R = 12.5 m', () => {
  const p = F.patroAcustic(PAT);
  prop(p.df, 4 / 7, 1e-9, 'Δf');
  prop(p.v, 2 * Math.PI * 12.5 / 7, 1e-9, 'v');
  assert.ok(Math.abs(p.fcRadi - 13.7) < 0.1, String(p.fcRadi));
});
t('condensació acústica: cal ~178 dB al node; a 172 dB de mitjana (×8) fa boira', () => {
  const p = F.patroAcustic(PAT);
  assert.ok(Math.abs(p.Lcond - 177.6) < 0.5 && p.condensa && p.lwc > 0);
  assert.ok(!F.patroAcustic(amb(Object.assign({}, PAT, { c_L: 160 }))).condensa);
});
t('la cua de 1.75 s demana gotes de ~40 µm; les de 5 µm s\'evaporen en ~20 ms', () => {
  const p = F.patroAcustic(PAT);
  assert.ok(Math.abs(p.rPerCua(0.25) - 40) < 5);
  assert.ok(F.patroAcustic(Object.assign({}, PAT, { c_r: 5 })).tEv < 0.03);
});
t('el testimoni rebria un nivell perillós i la boira és blanca', () => {
  const a = F.avaluaPatro(PAT);
  assert.ok(a.p.Lobs > 140 && a.p.percep);
  assert.ok(!a.ap.taronja);
});
/* Estàtica, soroll del gir, volum desplaçat i mapa de viabilitat */
t('estàtica: amb boira densa el camp no arriba a la ruptura; sense partícules, zero', () => {
  const boira = F.estaticaAnell(amb({ aer: 5000, trac: 1 }), 39, 1.43, 180), net = F.estaticaAnell(amb({ aer: 0 }), 39, 1.43, 180);
  assert.ok(boira.E > 0 && boira.ratio < 1 && !boira.espurnes, `E ${boira.E}`);
  assert.strictEqual(net.E, 0);
  prop(boira.tau, 8.854e-12 / 2e-14, 1e-9, 'τ de descàrrega');
});
t('estàtica: més partícules i més temps, més camp', () => {
  const a = F.estaticaAnell(amb({ aer: 500 }), 39, 1.43, 60), b = F.estaticaAnell(amb({ aer: 3600 }), 39, 1.43, 60), c = F.estaticaAnell(amb({ aer: 500 }), 39, 1.43, 180);
  assert.ok(b.E > a.E && c.E > a.E);
});
t('soroll del gir (Lighthill): ∝ v⁸ → +24 dB per doblar Γ; el de Segre és inaudible', () => {
  const a = F.sorollAnell(SEGRE, 39, 1.43, 900), b = F.sorollAnell(SEGRE, 78, 1.43, 900);
  prop(b.L - a.L, 80 * Math.log10(2), 1e-6, 'ΔL');
  assert.ok(a.L1 < 20);
});
t('volum per cicle: ∝ 1/f² i ∝ p (a 0.07 Hz i 150 dB, ~10⁵–10⁶ m³)', () => {
  const v = F.volumFont(SEGRE, 0.07, 150);
  prop(F.volumFont(SEGRE, 0.14, 150), v / 4, 1e-9, '1/f²');
  prop(F.volumFont(SEGRE, 0.07, 156.0206), 2 * v, 1e-4, '∝ p');
  assert.ok(v > 1e5 && v < 1e6, `V ${v}`);
});
t('posició de l\'anell arrodonida al centímetre; per sobre de 191 dB és impossible', () => {
  const p = F.posicioFormacio(MIG);
  assert.strictEqual(Math.round(p.y * 100) / 100, p.y);
  assert.ok(F.viabilitat(MIG, 0.07, 200).impossible && !F.viabilitat(MIG, 0.07, 200).forma);
});
console.log(`\n${n} proves superades`);
