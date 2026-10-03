// Proves del nucli de física (sense dependències): node tests/fisica.test.js
'use strict';
const assert = require('assert');
const F = require('../simulation/v041/fisica.js');

const SEGRE = { T: 35, P: 1013, H: 30, W: 3, turb: 0.2, aer: 0, trac: 0, hmt: 18, hcat: 11, sl: 24,
  vmt: 25, vcat: 25, ph: 90, rc: 0.9, f_mt: 50, h_pont: 5, so: 10, sx_off: 0, a_riu: 30,
  D_ap: 0.5, elev: 0, aR: 0.12, f1: 3.5714, f2: 3.0, db1: 100, db2: 100, phi: 0, tau: 0 };
const amb = o => Object.assign({}, SEGRE, o);
const prop = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol * Math.abs(b), `${msg}: ${a} vs ${b}`);
let n = 0;
function t(nom, fn) { fn(); n++; console.log('✓', nom); }

t('velocitat del so a 35 °C ≈ 352 m/s', () => prop(F.cSo(SEGRE), 351.9, 0.002, 'c'));
t('densitat de l\'aire a 35 °C ≈ 1.145 kg/m³', () => prop(F.rho(SEGRE), 1.145, 0.005, 'ρ'));
t('node λ/4 a 3.5714 Hz ≈ 24.6 m', () => prop(F.hNodePressio(SEGRE, 3.5714), 24.63, 0.005, 'h'));
t('nivell màxim físic ≈ 191 dB', () => prop(F.dbMax(SEGRE), 191.1, 0.002, 'dB'));
t('punt de rosada (35 °C, 30 %) ≈ 14.8 °C', () => prop(F.puntRosada(SEGRE), 14.8, 0.02, 'Td'));
t('camp de ruptura a STP ≈ 3 MV/m', () => {
  const r = F.campRuptura(amb({ T: 20 }), 0);
  prop(r.Ebd, 3.0e6, 0.03, 'E_bd');
});
t('la rarefacció acústica baixa el llindar, però com a màxim fins a ~1 %', () => {
  const a = F.campRuptura(SEGRE, 0).Ebd, b = F.campRuptura(SEGRE, 0.5 * F.pAtm(SEGRE)).Ebd;
  assert.ok(b < a && b > 0.4 * a);
});
t('camp d\'una línia aïllada: coincideix amb la fórmula analítica sota el conductor', () => {
  const s = amb({ vcat: 0, sl: 0, hmt: 10 });
  const V = 25e3 * Math.sqrt(2 / 3), rc = 0.009, h = 10, y = 5;
  const E = V / Math.log(2 * h / rc) * (1 / (h - y) + 1 / (h + y));
  prop(F.campEPic(s, 0, y), E, 1e-6, 'E');
});
t('desfasament 0° amb tensions iguals i conductors coincidents: el camp es duplica', () => {
  const s = amb({ sl: 0, hmt: 10, hcat: 10, vmt: 25 * Math.sqrt(3), vcat: 25, ph: 0 });
  const s1 = amb({ sl: 0, hmt: 10, hcat: 10, vmt: 0, vcat: 25, ph: 0 });
  prop(F.campEPic(s, 0, 5), 2 * F.campEPic(s1, 0, 5), 1e-6, 'E');
});
t('Segre: les línies de 25 kV queden molt lluny de la ruptura (X < 1e-3)', () => {
  assert.ok(F.ratiRuptura(SEGRE, 0, 24.6).X < 1e-3);
});
t('Segre: 25 kV no produeix corona; 400 kV amb el mateix conductor sí', () => {
  assert.ok(F.corona(SEGRE).every(c => !c.actiu));
  assert.ok(F.corona(amb({ vmt: 400, hmt: 12 }))[0].actiu);
});
t('Segre real (100 dB, obertura 0.5 m): no es forma cap anell', () => {
  assert.strictEqual(F.anellFont(SEGRE, 3.5714, 100).es_forma, false);
});
t('canó de vòrtex de laboratori (D = 10 cm, 15 Hz, 100 dB): sí que forma anell', () => {
  const a = F.anellFont(amb({ D_ap: 0.1, aR: 0.2, T: 20 }), 15, 100);
  assert.ok(a.es_forma && a.Gamma > 0 && a.Uself > 0);
});
t('velocitat de Saffman: Γ/(4πR)·(ln(8R/a) − 1/4)', () => {
  const a = F.anellFont(amb({ D_ap: 0.1, aR: 0.2, T: 20 }), 15, 100);
  prop(a.Uself, a.Gamma / (4 * Math.PI * a.R) * (Math.log(8 / 0.2) - 0.25), 1e-9, 'U');
});
t('inversió coherent: dbPerVelocitat ∘ velocitatObertura = identitat', () => {
  const s = amb({ D_ap: 3 });
  const u = F.velocitatObertura(s, 2, 150);
  prop(F.dbPerVelocitat(s, 2, u), 150, 1e-9, 'L');
});
t('requisits de l\'anell observat: viable amb infrasò per sota de f_màx lineal', () => {
  const r0 = F.requisits(SEGRE, { D: 25, n: 4, Trot: 7, sentit: 1 });
  assert.strictEqual(r0.viable, false);            // a 3.57 Hz caldria Mach ~2
  const r = F.requisits(amb({ f1: 0.8 * r0.fMaxLineal }), { D: 25, n: 4, Trot: 7, sentit: 1 });
  assert.ok(r.viable && !r.audible && r.L < F.dbMax(SEGRE));
  prop(r.fb, 4 / 7, 1e-9, 'f_bat');
  const s = amb({ D_ap: r.D_ap, aR: r.aR });
  const a = F.anellFont(s, r.f1, r.L);
  assert.ok(a.es_forma);
  prop(2 * a.R, 25, 1e-6, 'diàmetre');
  assert.strictEqual(a.nWidnall, 4);
});
t('la vida de l\'anell creix amb R² i baixa amb la turbulència', () => {
  const a = F.vidaAnell(amb({ turb: 0.1 }), 10, 1), b = F.vidaAnell(amb({ turb: 1 }), 10, 1);
  assert.ok(a > b && b > 0);
});
t('un aire calent necessita Λ > 1 per quedar atrapat; 100 dB no hi arriba', () => {
  assert.ok(F.levitacio(SEGRE, 3.5714, 24.6).Lambda < 1);
});
t('sense camp, el plasma no conductor (n_e ≈ ionització natural)', () => {
  const p = F.plasma(SEGRE, 0.001, F.K.N_STP, 100);
  assert.ok(p.ne < 1 && p.pJoule < 1e-12);
});
t('amb X > 1 hi ha allau i escalfament Joule', () => {
  const p = F.plasma(SEGRE, 1.2, F.K.N_STP, 3e6);
  assert.ok(p.ne > 1e18 && p.pJoule > 1e6);
});
t('la profunditat òptica del fum supera la de la pols per a la mateixa massa', () => {
  assert.ok(F.profOptica(amb({ aer: 100, trac: 1 }), 1) > F.profOptica(amb({ aer: 100, trac: 0 }), 1));
});
t('sincronisme: amb f no submúltiple de 50 Hz el factor és 1', () => {
  assert.strictEqual(F.sincronisme(amb({ f1: 3.3 }), 24).q, 1);
  assert.ok(F.sincronisme(amb({ f1: 50 / 14 }), 24).comensurable);
});
console.log(`\n${n} proves superades`);
