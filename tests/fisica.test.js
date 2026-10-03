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

/* Disseny invers i comparació amb l'observació */
const sol = F.posicioSol(SEGRE);
const BASE = amb({ dirW: 180, aot: 0.1, d_obs: 40, az_vis: sol.az - 3 });
const OBJ = { D: 25, tub: 3, n: 4, Trot: 7, sentit: 1, h: 25, Umax: 1, vida: 180, contrast: 2 };
t('disseny (prioritat deriva): 15/16 i només falla el gir de 7 s', () => {
  const d = F.dissenya(BASE, Object.assign({ prioritat: 'deriva' }, OBJ));
  const ev = F.avaluaObservacio(d.cfg);
  const falla = ev.files.filter(f => !f.ok).map(f => f.nom);
  assert.deepStrictEqual(falla, ['1 volta ≈ 7 s'], falla.join(', '));
  assert.ok(d.viable && d.conflicte > 1);
  prop(2 * ev.tr[Math.floor(ev.tr.length / 2)].ev.R, 25, 0.01, 'diàmetre al mig');
});
t('disseny (prioritat gir): aconsegueix 7 s però perd la deriva lenta', () => {
  const d = F.dissenya(BASE, Object.assign({ prioritat: 'rotacio' }, OBJ));
  const ev = F.avaluaObservacio(d.cfg);
  const f = nom => ev.files.find(x => x.nom === nom).ok;
  assert.ok(f('1 volta ≈ 7 s') && !f('deriva lenta (U < 1.67 m/s)'));
});
t('assaig real 1:10 amb fum blanc: 15/16 (només falla el color)', () => {
  const s = amb({ W: 1, dirW: 180, aot: 0.05, d_obs: 15, trac: 1, h_pont: 1, a_riu: 10, vmt: 0, vcat: 0, az_vis: (sol.az - 100 + 360) % 360 });
  const o = { D: 2.5, tub: 0.3, n: 4, Trot: 7, sentit: 1, h: 3, Umax: 0.5, vida: 30, contrast: 0.3, prioritat: 'deriva' };
  const d = F.dissenya(s, o);
  const ev = F.avaluaObservacio(d.cfg, { D: 2.5, tub: 0.3, h: 3, nodes: 4, Trot: 7, sentit: 1, durada: 30, Umax: 0.5 });
  assert.deepStrictEqual(ev.files.filter(x => !x.ok).map(x => x.nom), ['color taronja']);
  assert.ok(d.L < 120 && d.f < 20);   // infrasò i nivell assolible amb un pistó
});
console.log(`\n${n} proves superades`);
