/* ═══════════════════════════════════════════════════════════════════════════
   Velo Toroide · nucli de física · V041
   ---------------------------------------------------------------------------
   Totes les funcions són PURES: reben l'estat `s` (paràmetres en unitats de la
   interfície) i retornen magnituds en SI. No toquen el DOM ni l'estat global,
   de manera que es poden provar amb Node (tests/fisica.test.js).

   Principi d'aquesta versió: només física establerta i publicada. Cap factor
   d'amplificació ajustat a mà. Si una condició no es compleix, el simulador ho
   mostra en lloc d'amagar-ho.

   Unitats de `s`:
     T [°C] · P [hPa] · H [%] · W [km/h, + cap a la dreta] · turb [m/s]
     aer [mg/m³] · hmt,hcat,sl,h_pont,so,sx_off,a_riu,D_ap [m] · rc [cm]
     vmt,vcat [kV eficaços] · ph,phi,elev [°] · f1,f2,f_mt [Hz]
     db1,db2 [dB SPL a 1 m sobre l'eix] · tau [µs] · aR [adimensional]
   ═══════════════════════════════════════════════════════════════════════════ */
(function (root) {
'use strict';

const K = {
  R_AIR: 287.05,        // J/(kg·K)
  GAMMA: 1.4,
  CP: 1005,             // J/(kg·K)
  KB: 1.380649e-23,     // J/K
  EPS0: 8.8541878128e-12,
  QE: 1.602176634e-19,
  ME: 9.1093837e-31,
  G: 9.81,
  P_REF: 20e-6,         // Pa, referència SPL (valor eficaç)
  ETD_CRIT: 120e-21,    // V·m² — camp reduït crític de l'aire, E/N ≈ 120 Td
  N_STP: 2.504e25,      // m⁻³ a 25 °C i 1 atm
  NU_M_STP: 2.0e12,     // s⁻¹ — freqüència de col·lisió electró-neutre a STP
  ATTACH_STP: 1.0e8,    // s⁻¹ — captura electrònica per O₂ (3 cossos) a STP
  BETA_REC: 2.0e-13,    // m³/s — recombinació dissociativa e⁻ + ion
  S_COSMIC: 1.0e7,      // m⁻³·s⁻¹ — ionització natural (raigs còsmics + radó)
  KAPPA_TH: 2.2e-5,     // m²/s — difusivitat tèrmica de l'aire
  PEEK_M: 0.85,         // factor de superfície (conductor trenat envellit)
  Q_EXT: 2.0,           // eficiència d'extinció (partícules ≳ λ de la llum)
  // Traçadors: 0 = pols mineral (r ≈ 2.5 µm, 2600 kg/m³),
  //            1 = fum / boira de glicol (r ≈ 0.5 µm, 1000 kg/m³)
  TRACADORS: [{ r: 2.5e-6, rho: 2600 }, { r: 0.5e-6, rho: 1000 }],
  CONTRAST_MIN: 0.02,   // llindar de contrast visual (Koschmieder)
  HOLMAN_K: 0.16,       // criteri de formació de jet sintètic axisimètric
  F_FORMACIO: 4.0,      // nombre de formació màxim (Gharib et al. 1998)
  R_SOBRE_D: 0.6,       // radi de l'anell / diàmetre de l'obertura
  KA_WIDNALL: 2.5,      // k·a del mode inestable de Widnall (nucli de Rankine)
};

/* ── Aire ────────────────────────────────────────────────────────────────── */
function Tk(s) { return s.T + 273.15; }
function pAtm(s) { return s.P * 100; }
function rho(s) { return pAtm(s) / (K.R_AIR * Tk(s)); }
/** Velocitat del so en aire sec, c = 331.3·√(T/273.15) [m/s] */
function cSo(s) { return 331.3 * Math.sqrt(Tk(s) / 273.15); }
/** Viscositat dinàmica, llei de Sutherland [Pa·s] */
function muSuth(T) { return 1.716e-5 * Math.pow(T / 273.15, 1.5) * (273.15 + 110.4) / (T + 110.4); }
/** Viscositat cinemàtica [m²/s] */
function nuAir(s) { return muSuth(Tk(s)) / rho(s); }
/** Densitat numèrica de molècules N = p/(kT) [m⁻³] */
function nDens(p, T) { return p / (K.KB * T); }
/** Punt de rosada, fórmula de Magnus [°C] */
function puntRosada(s) {
  const g = Math.log(Math.max(s.H, 0.1) / 100) + 17.62 * s.T / (243.12 + s.T);
  return 243.12 * g / (17.62 - g);
}
/** Vent en m/s (amb signe) */
function vent(s) { return s.W / 3.6; }

/* ── Acústica lineal ─────────────────────────────────────────────────────── */
/** Amplitud de pressió a partir del nivell SPL (eficaç) [Pa] */
function pAmpDeDb(L) { return Math.SQRT2 * K.P_REF * Math.pow(10, L / 20); }
/** Nivell SPL màxim abans que la rarefacció arribi al buit (p_amp = P_atm) */
function dbMax(s) { return 20 * Math.log10(pAtm(s) / (Math.SQRT2 * K.P_REF)); }
function lambda(s, f) { return cSo(s) / Math.max(f, 1e-6); }
/** Absorció atmosfèrica aproximada (clàssica + relaxació, humitat mitjana) [Np/m] */
function alfaAbs(f) { return 5.8e-10 * f * f; }

/** Altura del primer node de pressió sobre una superfície rígida (aigua): λ/4 */
function hNodePressio(s, f) { return lambda(s, f) / 4; }
/** Altura del primer node de velocitat (antinode de pressió) sobre l'aigua: λ/2 */
function hNodeVelocitat(s, f) { return lambda(s, f) / 2; }

/** Posicions de les fonts (coordenades del riu: x horitzontal, y alçada) */
function fonts(s) {
  return [
    { x: s.sx_off - s.so / 2, y: s.h_pont, f: s.f1, L: s.db1, ph: 0 },
    { x: s.sx_off + s.so / 2, y: s.h_pont, f: s.f2, L: s.db2, ph: s.phi * Math.PI / 180 },
  ];
}

/**
 * Pressió acústica en un punt: font + font imatge (l'aigua és un reflector
 * rígid, R≈1, perquè Z_aigua/Z_aire ≈ 3600). Retorna un fasor {re,im}.
 * Font sobre la plataforma del pont: radiació a semiespai (+6 dB inclosos al
 * nivell de referència a 1 m).
 */
function fasorFont(s, src, x, y) {
  const p1 = pAmpDeDb(src.L);
  const k = 2 * Math.PI * src.f / cSo(s), al = alfaAbs(src.f);
  let re = 0, im = 0;
  for (const yy of [src.y, -src.y]) {
    const r = Math.max(Math.hypot(x - src.x, y - yy), 0.5);
    const a = p1 / r * Math.exp(-al * r);
    re += a * Math.cos(src.ph - k * r);
    im += a * Math.sin(src.ph - k * r);
  }
  return { re, im };
}

/** Amplitud màxima de pressió acústica en un punt (envolupant de S₁ i S₂) */
function pAcPunt(s, x, y) {
  const [a, b] = fonts(s);
  const fa = fasorFont(s, a, x, y), fb = fasorFont(s, b, x, y);
  if (Math.abs(a.f - b.f) < 1e-6) {
    return Math.hypot(fa.re + fb.re, fa.im + fb.im); // mateixa freqüència: interferència
  }
  // Freqüències diferents: l'envolupant oscil·la a f_bat; el màxim és la suma
  return Math.hypot(fa.re, fa.im) + Math.hypot(fb.re, fb.im);
}

/** Distància de formació d'ona de xoc x = ρc³/(βωp) (β=1.2 per a l'aire) */
function distanciaXoc(s, f, L) {
  const p = pAmpDeDb(L);
  if (p <= 0) return Infinity;
  return rho(s) * Math.pow(cSo(s), 3) / (1.2 * 2 * Math.PI * f * p);
}

/** Freqüència de batement i sentit de desplaçament de les franges */
function fBat(s) { return Math.abs(s.f1 - s.f2); }
function sentitBat(s) { return s.f1 === s.f2 ? 0 : (s.f1 > s.f2 ? 1 : -1); }

/* ── Generació d'anells de vòrtex per so (dinàmica de fluids) ───────────────
   Un camp acústic lineal és irrotacional (∇×v = 0): dues fonts en camp lliure
   NO creen vorticitat, sigui quin sigui el desfasament. La vorticitat neix a
   la vora d'una obertura quan el flux oscil·lant se separa: és el principi del
   "jet sintètic" i dels canons de vòrtex. Per això cal una obertura de
   diàmetre D_ap (boca de l'altaveu, port reflex, cavitat o estructura).
   Referències: Holman et al. (2005) AIAA J. 43; Gharib, Rambod & Shariff
   (1998) JFM 360; Saffman (1970); Widnall & Tsai (1977).
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Velocitat del flux a l'obertura d'un pistó amb pantalla (fórmula exacta a
 * l'eix): p(z) = 2ρc·u·|sin(k/2·(√(z²+a²) − z))|, invertida a z = 1 m.
 */
function factorPisto(s, f) {
  const a = s.D_ap / 2, k = 2 * Math.PI * f / cSo(s);
  const arg = k / 2 * (Math.sqrt(1 + a * a) - 1);
  // Primer lòbul: fórmula exacta. Més enllà (camp proper amb zeros a l'eix,
  // ka > π) s'evita la divisió per zero amb un mínim del 5 %.
  return arg < Math.PI / 2 ? Math.max(Math.sin(arg), 1e-12) : Math.max(Math.abs(Math.sin(arg)), 0.05);
}
function velocitatObertura(s, f, L) {
  const p1 = pAmpDeDb(L);
  if (p1 <= 0) return 0;
  return p1 / (2 * rho(s) * cSo(s) * factorPisto(s, f));
}

/** Nivell (dB a 1 m) necessari per tenir velocitat u a l'obertura */
function dbPerVelocitat(s, f, u) {
  const p1 = u * 2 * rho(s) * cSo(s) * factorPisto(s, f);
  return 20 * Math.log10(p1 / (Math.SQRT2 * K.P_REF));
}

/**
 * Propietats de l'anell que emet una font (f, L) per l'obertura D_ap.
 * Model de "slug": carrera L₀ = 2u/ω, circulació Γ = ½∫u²dt = πu²/(4ω).
 */
function anellFont(s, f, L) {
  const w = 2 * Math.PI * f, D = s.D_ap, c = cSo(s);
  const u = velocitatObertura(s, f, L);
  const L0 = 2 * u / w;
  const F = L0 / D;                          // nombre de formació
  const holman = (u / Math.PI) / (w * D);    // Re/S² de Holman
  const es_forma = u > 0 && holman > K.HOLMAN_K;
  const frac = F > K.F_FORMACIO ? K.F_FORMACIO / F : 1; // excés → jet de cua
  const Gamma = es_forma ? Math.PI * u * u / (4 * w) * frac : 0;
  const R = K.R_SOBRE_D * D;
  const a = Math.max(s.aR, 0.02) * R;
  const Uself = Gamma > 0 ? Gamma / (4 * Math.PI * R) * (Math.log(8 * R / a) - 0.25) : 0;
  const nu = nuAir(s);
  return {
    u, mach: u / c, L0, F, holman, es_forma, Gamma, R, a, Uself,
    ReG: Gamma / nu,
    nWidnall: Math.max(1, Math.round(K.KA_WIDNALL * R / a)),
    lineal: u / c < 0.1,                     // acústica lineal raonable
    viable: pAmpDeDb(L) < pAtm(s),           // rarefacció per sobre del buit
  };
}

/** Viscositat turbulenta efectiva a l'escala de l'anell [m²/s] */
function nuEfectiva(s, R) {
  const sigma = s.turb + 0.1 * Math.abs(vent(s)); // intensitat turbulenta
  return nuAir(s) + 0.1 * sigma * R;
}
/** Vida de l'anell: el nucli creix com a² = a₀² + 4ν_ef·t fins a a = R */
function vidaAnell(s, R, a) { return Math.max(R * R - a * a, 0) / (4 * nuEfectiva(s, R)); }

/**
 * Caiguda de pressió i temperatura al nucli (vòrtex de Rankine):
 * Δp = ρ(Γ/2πa)², expansió adiabàtica → ΔT.
 */
function nucliTermo(s, Gamma, a) {
  const v = Gamma / (2 * Math.PI * Math.max(a, 1e-3));
  const dp = Math.min(rho(s) * v * v, 0.99 * pAtm(s));
  const Tn = Tk(s) * Math.pow(1 - dp / pAtm(s), (K.GAMMA - 1) / K.GAMMA);
  return { vNucli: v, dp, Tnucli: Tn - 273.15, condensa: Tn - 273.15 <= puntRosada(s) };
}

/** Profunditat òptica del traçador (pols) a través del tub de l'anell */
function profOptica(s, a, dilucio) {
  const C = s.aer * 1e-6 * (dilucio == null ? 1 : dilucio); // kg/m³
  const t = K.TRACADORS[s.trac ? 1 : 0];
  return 3 * K.Q_EXT * C * (2 * a) / (4 * t.rho * t.r);
}

/**
 * Força de radiació acústica sobre una bombolla d'aire calent (Gor'kov) en
 * una ona estacionària plana sobre l'aigua. Per a un gas ideal la
 * compressibilitat no depèn de T (f₁=0); el contrast de densitat dona f₂<0 i
 * la força empeny cap als nodes de velocitat (λ/2). Relació amb la flotació:
 * Λ = v²k/(2g) — independent de quant calenta sigui la bombolla.
 * Λ > 1 → l'anell calent queda atrapat a l'altura λ/2.
 */
function levitacio(s, f, y) {
  const k = 2 * Math.PI * f / cSo(s);
  const [a, b] = fonts(s);
  const src = Math.abs(a.f - f) < 1e-9 ? a : b;
  const r = Math.max(Math.abs(y - src.y), 0.5);
  const pInc = pAmpDeDb(src.L) / r;            // ona incident
  const vAmp = 2 * pInc / (rho(s) * cSo(s));   // ona estacionària: v = 2p_i/ρc
  return { vAmp, Lambda: vAmp * vAmp * k / (2 * K.G), hTrampa: hNodeVelocitat(s, f) };
}

/* ── Camp elèctric de les línies (electrostàtica 2D amb imatges) ───────────
   Cada conductor és una línia infinita a altura h, radi r_c. L'aigua/terra és
   un pla conductor → conductor imatge a −h amb càrrega oposada.
   λ/(2πε₀) = V/ln(2h/r_c).
   MT: 25 kV entre fases → V_fase,pic = V·√2/√3 (model d'un sol conductor:
   és una COTA SUPERIOR; en una línia trifàsica real els camps es compensen).
   Catenària: 25 kV fase-terra → V_pic = V·√2.
   ─────────────────────────────────────────────────────────────────────────── */
function conductors(s) {
  return [
    { nom: 'MT',  x: -s.sl / 2, y: s.hmt,  V: s.vmt * 1e3 * Math.sqrt(2 / 3), ph: 0 },
    { nom: 'Cat', x:  s.sl / 2, y: s.hcat, V: s.vcat * 1e3 * Math.SQRT2,      ph: s.ph * Math.PI / 180 },
  ];
}

/** Valor de pic de |E| en un punt [V/m] (solució analítica de l'el·lipse) */
function campEPic(s, x, y) {
  const rc = s.rc / 100;
  let zrx = 0, zry = 0, zix = 0, ziy = 0;  // fasor vectorial Z = Zr + iZi
  for (const c of conductors(s)) {
    if (c.y <= rc) continue;
    const q = c.V / Math.log(2 * c.y / rc);       // λ/(2πε₀)
    const dx = x - c.x, dy1 = y - c.y, dy2 = y + c.y;
    const r1 = Math.max(dx * dx + dy1 * dy1, rc * rc), r2 = dx * dx + dy2 * dy2;
    const ex = q * (dx / r1 - dx / r2), ey = q * (dy1 / r1 - dy2 / r2);
    const cs = Math.cos(c.ph), sn = Math.sin(c.ph);
    zrx += ex * cs; zry += ey * cs; zix += ex * sn; ziy += ey * sn;
  }
  const A = (zrx * zrx + zry * zry), B = (zix * zix + ziy * ziy), Cc = zrx * zix + zry * ziy;
  return Math.sqrt((A + B) / 2 + Math.sqrt(((A - B) / 2) ** 2 + Cc * Cc));
}

/** Camp a la superfície del conductor i llindar d'efecte corona (Peek) */
function corona(s) {
  const rc = s.rc / 100, d = (pAtm(s) / 101325) * (293.15 / Tk(s));
  const Ec = 3.0e6 * K.PEEK_M * d * (1 + 0.0301 / Math.sqrt(d * rc)); // V/m pic
  return conductors(s).map(c => {
    const Es = c.y > rc ? c.V / (rc * Math.log(2 * c.y / rc)) : 0;
    return { nom: c.nom, Es, Ec, ratio: Es / Ec, actiu: Es >= Ec };
  });
}

/** Camp de ruptura E_bd = (E/N)_crit · N amb la rarefacció acústica local */
function campRuptura(s, pAc) {
  const P = pAtm(s);
  const pmin = Math.max(P - pAc, 0.01 * P);
  const Tmin = Tk(s) * Math.pow(pmin / P, (K.GAMMA - 1) / K.GAMMA);
  const Nmin = nDens(pmin, Tmin);
  return { Ebd: K.ETD_CRIT * Nmin, Ebd0: K.ETD_CRIT * nDens(P, Tk(s)), N: Nmin };
}

/**
 * Sincronisme ac↔EM. Només té sentit si f_ac és un submúltiple de f_EM: llavors
 * la rarefacció arriba sempre a la mateixa fase del camp. Si no ho és, la
 * coincidència es dona tard o d'hora (dins d'un període de batement) i el
 * pitjor cas per a la seguretat — el millor per a la ionització — és el pic.
 */
function sincronisme(s, yNode) {
  const tv = Math.max(yNode - s.h_pont, 0) / cSo(s);       // temps de viatge
  const n = s.f_mt / Math.max(s.f1, 1e-6);
  const comensurable = Math.abs(n - Math.round(n)) < 0.01 && Math.round(n) >= 1;
  const fase = 2 * Math.PI * s.f_mt * (tv + s.tau * 1e-6);
  const q = comensurable ? Math.abs(Math.cos(fase)) : 1;
  return { tv, comensurable, n: Math.round(n), fase: ((fase * 180 / Math.PI) % 360 + 360) % 360, q };
}

/** Rati de ruptura en un punt: E_pic·q / E_bd(rarefacció). ≥1 → allau */
function ratiRuptura(s, x, y) {
  const E = campEPic(s, x, y);
  const pAc = pAcPunt(s, x, y);
  const rb = campRuptura(s, pAc);
  const sy = sincronisme(s, y);
  return { E, pAc, Ebd: rb.Ebd, Ebd0: rb.Ebd0, N: rb.N, q: sy.q, X: E * sy.q / rb.Ebd };
}

/* ── Plasma (només si X ≥ 1) ───────────────────────────────────────────────
   Balanç d'electrons quasi-estacionari:
     X < 1 : n_e = S_còsmic/ν_captura   (≈0.1 m⁻³, no conductor)
     X ≥ 1 : allau, saturada per recombinació  n_e ≈ ν_net/β
   Conductivitat de Drude σ = n_e e²/(m_e ν_m). Escalfament Joule σE²_ef.
   Refredament per difusió turbulenta a l'escala del tub.
   ─────────────────────────────────────────────────────────────────────────── */
function plasma(s, X, N, Eef) {
  const nr = N / K.N_STP;
  let ne;
  if (X < 1) ne = K.S_COSMIC / (K.ATTACH_STP * nr * nr);
  else ne = Math.min(1e9 * nr * (X - 1) / K.BETA_REC + 1e14, 1e23);
  const nu_m = K.NU_M_STP * nr;
  const sigma = ne * K.QE * K.QE / (K.ME * nu_m);
  return { ne, sigma, pJoule: sigma * Eef * Eef };
}
/** dT/dt del tub de l'anell [K/s] */
function dTdt(s, T, pJoule, a, R) {
  const tauRef = (a * a) / (4 * (K.KAPPA_TH + nuEfectiva(s, R) - nuAir(s)));
  return pJoule / (rho(s) * K.CP) - (T - Tk(s)) / Math.max(tauRef, 1e-3);
}

/** Color d'un cos negre aproximat (per a T > 1000 K) → "r,g,b" */
function colorCosNegre(T) {
  const t = Math.max(0, Math.min(1, (T - 1000) / 5500));
  const g = Math.round(60 + 180 * Math.pow(t, 0.7)), b = Math.round(10 + 230 * Math.pow(t, 1.6));
  return `255,${g},${b}`;
}

/* ── Problema invers: què caldria per reproduir l'observació ──────────────── */
/**
 * Donat un anell objectiu (diàmetre Dr, nodes n, període de rotació Trot,
 * sentit) i la freqüència f1 actual, retorna la configuració que el produiria
 * segons la física anterior, i si és viable.
 */
function requisits(s, obj) {
  const D_ap = obj.D / (2 * K.R_SOBRE_D);
  const aR = K.KA_WIDNALL / Math.max(obj.n, 1);
  const fb = obj.n / Math.max(obj.Trot, 0.01);
  const f1 = obj.h != null ? cSo(s) / (2 * obj.h) : s.f1;      // trampa a λ/2
  const f2 = Math.max(0.1, f1 - obj.sentit * fb);
  const w = 2 * Math.PI * f1;
  const u = 3 * D_ap * w / 2;                                   // F = 3 (òptim)
  const sTmp = Object.assign({}, s, { D_ap, f1 });
  const L = dbPerVelocitat(sTmp, f1, u);
  const fMaxLineal = 0.1 * cSo(s) / (3 * D_ap * Math.PI);       // u/c = 0.1
  return {
    D_ap, aR, fb, f1, f2, u, L, mach: u / cSo(s), fMaxLineal,
    viable: L <= dbMax(s) && u / cSo(s) < 0.3,
    audible: f1 >= 20 || f2 >= 20,
  };
}

const API = {
  K, Tk, pAtm, rho, cSo, muSuth, nuAir, nDens, puntRosada, vent,
  pAmpDeDb, dbMax, lambda, alfaAbs, hNodePressio, hNodeVelocitat, fonts, fasorFont, pAcPunt,
  distanciaXoc, fBat, sentitBat, velocitatObertura, dbPerVelocitat, anellFont, nuEfectiva,
  vidaAnell, nucliTermo, profOptica, levitacio, conductors, campEPic, corona, campRuptura,
  sincronisme, ratiRuptura, plasma, dTdt, colorCosNegre, requisits,
};
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else root.FIS = API;
})(typeof window !== 'undefined' ? window : globalThis);
