/* ═══════════════════════════════════════════════════════════════════════════
   Velo Toroide · nucli de física · V042
   ---------------------------------------------------------------------------
   Totes les funcions són PURES: reben l'estat `s` (paràmetres en unitats de la
   interfície) i retornen magnituds en SI. No toquen el DOM ni l'estat global,
   de manera que es poden provar amb Node (tests/fisica.test.js).

   Principi d'aquesta versió: només física establerta i publicada. Cap factor
   d'amplificació ajustat a mà. Si una condició no es compleix, el simulador ho
   mostra en lloc d'amagar-ho.

   Unitats de `s`:
     T [°C] · P [hPa] · H [%] · W [km/h] · dirW [° respecte a la mirada:
     0 = s'allunya del testimoni, 90 = cap a la dreta] · turb [m/s]
     aer [mg/m³] · trac [0 pols, 1 fum, 2 boira, 3 fum taronja] · aot [β d'Ångström]
     hmt,hcat,sl,h_pont,h_src,so,sx_off,a_riu,D_ap,d_obs [m] · rc [cm]
     vmt,vcat [kV eficaços] · ph,phi,elev,az_eix,az_vis [°] · f1,f2,f_mt [Hz]
     db1,db2 [dB SPL a 1 m sobre l'eix] · tau [µs] · aR, swirl [adimensional]
     npols [empentes d'aire de l'emissor; 0 = continu] · n_inj [0 = nodes espontanis] · kdir [±1] · dT0 [K]
     mes, dia, hora [local], tz [h], lat, lon [°]
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
  // Traçadors: radi, densitat, albedo RGB i funció de fase de Henyey-Greenstein
  // de dos termes (Kattawar 1975): f·HG(g1) + (1−f)·HG(g2). El primer terme
  // representa el pic de difracció de les partícules grans.
  TRACADORS: [
    { nom: 'pols',  r: 2.5e-6, rho: 2600, alb: [0.80, 0.62, 0.42], f: 0.35, g1: 0.96, g2: 0.55 }, // llim de riu sec
    { nom: 'fum',   r: 0.5e-6, rho: 1000, alb: [0.93, 0.93, 0.93], f: 0,    g1: 0.6,  g2: 0.60 }, // glicol / fum blanc
    { nom: 'boira', r: 5e-6,   rho: 1000, alb: [0.99, 0.99, 0.99], f: 0.40, g1: 0.97, g2: 0.70 }, // gotes d'aigua
    { nom: 'fum taronja', r: 0.5e-6, rho: 1200, alb: [0.90, 0.50, 0.15], f: 0, g1: 0.65, g2: 0.65 }, // pot de fum de senyalització
  ],
  CONTRAST_MIN: 0.02,   // llindar de contrast visual (Koschmieder)
  HOLMAN_K: 0.16,       // criteri de formació de jet sintètic axisimètric
  F_FORMACIO: 4.0,      // nombre de formació màxim (Gharib et al. 1998)
  R_SOBRE_D: 0.6,       // radi de l'anell / diàmetre de l'obertura
  KA_WIDNALL: 2.5,      // k·a del mode inestable de Widnall (nucli de Rankine)
  ALFA_ENT: 0.01,       // dR/dx d'un anell turbulent (Glezer & Coles 1990)
  SWIRL_MAX: 0.5,       // swirl màxim abans del trencament del vòrtex (~0.6)
  HOLMAN_DISSENY: 0.17, // marge de disseny just per sobre del criteri de Holman
  E_SOL_LUX: 128000,    // il·luminància solar extraterrestre [lux]
};
const D2R = Math.PI / 180, R2D = 180 / Math.PI;

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
/** Vent en m/s i components lateral (x) i en la línia de visió (z) */
function vent(s) { return s.W / 3.6; }
function ventXZ(s) { const d = (s.dirW == null ? 90 : s.dirW) * Math.PI / 180; return { x: vent(s) * Math.sin(d), z: vent(s) * Math.cos(d) }; }

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
    { x: s.sx_off - s.so / 2, y: s.h_src, f: s.f1, L: s.db1, ph: 0 },
    { x: s.sx_off + s.so / 2, y: s.h_src, f: s.f2, L: s.db2, ph: s.phi * Math.PI / 180 },
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
  const nWidnall = Math.max(1, Math.round(K.KA_WIDNALL * R / a));
  return {
    u, uE: 2 * u / Math.PI, mach: u / c, L0, F, holman, es_forma, Gamma, R, a, Uself,
    ReG: Gamma / nu,
    nWidnall,
    // Nodes: si hi ha n injectors de traçador (o una obertura de n costats) el
    // mode n queda sembrat; si no, apareix el mode inestable de Widnall.
    nodes: s.n_inj > 0 ? Math.round(s.n_inj) : nWidnall,
    lineal: u / c < 0.1,                     // acústica lineal raonable
    viable: pAmpDeDb(L) < pAtm(s),           // rarefacció per sobre del buit
  };
}

/** Viscositat turbulenta efectiva a l'escala de l'anell [m²/s] */
function nuEfectiva(s, R) {
  return nuAir(s) + 0.1 * Math.max(s.turb, 0) * R;   // σ_w: turbulència ambient
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
function tracador(s) { return K.TRACADORS[Math.min(K.TRACADORS.length - 1, Math.max(0, Math.round(s.trac || 0)))]; }
function profOptica(s, a, dilucio) {
  const C = s.aer * 1e-6 * (dilucio == null ? 1 : dilucio); // kg/m³
  const t = tracador(s);
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

/* ── Evolució d'un anell turbulent ─────────────────────────────────────────
   Anell turbulent (Re_Γ > 10⁴), Glezer & Coles (1990), Maxworthy (1974):
   l'impuls I = ρπR²Γ es conserva i l'anell engloba aire (dR/dx = α), de
   manera que R = R₀(1+t/t₀)^¼, Γ = Γ₀(R₀/R)², U = U₀(R₀/R)³, a/R constant,
   amb t₀ = R₀/(4αU₀). La concentració del traçador dins la bombolla baixa
   com (R₀/R)³ i l'excés de temperatura també.
   L'anell es manté coherent mentre la seva velocitat induïda Γ/(4πR) supera
   la turbulència ambient σ_w. Després es dispersa en un temps de remolí
   R/σ_w (extinció gradual). Règim laminar: difusió del nucli fins a a = R.
   ─────────────────────────────────────────────────────────────────────────── */
function t0Turbulent(an) { return an.R / (4 * K.ALFA_ENT * Math.max(an.Uself, 1e-9)); }
function evolucio(s, an, t) {
  if (!an || !an.es_forma) return null;
  const turbulent = an.ReG > 1e4;
  const x = turbulent ? Math.pow(1 + Math.max(t, 0) / t0Turbulent(an), 0.25) : 1;
  const R = an.R * x, Gamma = an.Gamma / (x * x);
  const a = turbulent ? an.a * x : Math.min(Math.sqrt(an.a * an.a + 4 * nuEfectiva(s, an.R) * Math.max(t, 0)), R);
  const lg = Math.log(8 * R / Math.max(a, 1e-6)) - 0.25;
  return { R, a, Gamma, U: Gamma / (4 * Math.PI * R) * Math.max(lg, 0), vInd: Gamma / (4 * Math.PI * R), x, dil: 1 / (x * x * x), turbulent };
}
/** Durada: fase coherent + extinció (dispersió en un temps de remolí) */
function vidaAnell2(s, an) {
  if (!an || !an.es_forma) return { tCoh: 0, tFade: 0, total: 0, Rend: 0 };
  const sig = Math.max(s.turb, 1e-3);
  let tCoh, Rend;
  if (an.ReG > 1e4) {
    const r = (an.Gamma / (4 * Math.PI * an.R)) / sig;
    tCoh = r > 1 ? t0Turbulent(an) * (Math.pow(r, 4 / 3) - 1) : 0;
    Rend = an.R * Math.pow(Math.max(r, 1), 1 / 3);
  } else {
    tCoh = vidaAnell(s, an.R, an.a); Rend = an.R;
  }
  const tFade = Rend / sig;
  return { tCoh, tFade, total: tCoh + tFade, Rend };
}

/* ── Gir dels nodes ─────────────────────────────────────────────────────────
   Dos mecanismes físics (es sumen):
   (1) Ones de Kelvin: una deformació de n lòbuls que viatja pel nucli del
       vòrtex. Aproximació de filament (LIA) amb k = n/R:
       ω = Γk²/(4π)·[ln(2/(ka)) − γ_E + ¼]; el patró gira a ω/n.
   (2) Swirl: si l'aire surt de l'obertura amb velocitat tangencial
       (àleps, injecció tangencial), el moment angular r·w es conserva:
       w(R) = swirl·u_e·(D/2)/R i Ω = w(R)/R.
   Sentit positiu = antihorari tal com el veu el testimoni.
   ─────────────────────────────────────────────────────────────────────────── */
function rotacioNodes(s, an, ev) {
  const e = ev || { R: an.R, a: an.a, Gamma: an.Gamma };
  const n = an.nodes, k = n / e.R;
  const LK = Math.max(Math.log(2 / (k * e.a)) - 0.5772 + 0.25, 0.05);
  const omK = n > 1 ? e.Gamma * k * k / (4 * Math.PI) * LK / n : 0;
  const omS = (s.swirl || 0) * an.uE * (s.D_ap / 2) / (e.R * e.R);
  const om = (s.kdir || 1) * omK + omS;
  return { omK, omS, om, T: Math.abs(om) > 1e-9 ? 2 * Math.PI / Math.abs(om) : Infinity, sentit: Math.sign(om), LK };
}

/* ── Forma de cometa dels nodes ─────────────────────────────────────────────
   Observació: darrere de cada node l'anell té el gruix del node i es va
   aprimant fins al node següent. Model: cada node concentra traçador i, en
   avançar, deixa enrere matèria que es dispersa. L'edat de la matèria a una
   distància s darrere el cap és s/(Ω·R); el gruix visible decau com
   exp(−edat/τ), amb τ = a/σ_w (temps de remolí a l'escala del tub).
   Entre dos nodes passa un temps Δt = T_volta/n.
   ─────────────────────────────────────────────────────────────────────────── */
function cuaNodes(s, an, ev, rot) {
  const e = ev || { a: an.a };
  const r = rot || rotacioNodes(s, an, ev);
  const n = Math.max(1, an.nodes);
  const dtNodes = isFinite(r.T) ? r.T / n : Infinity;            // temps entre caps
  const tau = e.a / Math.max(s.turb, 1e-3);                      // dispersió del rastre
  const fFinal = isFinite(dtNodes) ? Math.exp(-dtNodes / tau) : 1; // gruix relatiu al node següent
  return { n, dtNodes, tau, fFinal, factor: u => isFinite(dtNodes) ? Math.exp(-u * dtNodes / tau) : 1 };
}

/* ── Sol, cel i aparença òptica ─────────────────────────────────────────────
   Posició del sol: algorisme de la NOAA (precisió ~0.5°).
   Transmissió: Rayleigh + aerosols (β d'Ångström, exponent 1.3) amb la massa
   d'aire de Kasten-Young. Cel: distribució CIE de cel clar amb la lluminància
   zenital de Krochmann. Anell: dispersió simple de la llum solar pel
   traçador (fase de Henyey-Greenstein) sobre el fons del cel atenuat.
   ─────────────────────────────────────────────────────────────────────────── */
const LAMBDA_RGB = [0.62, 0.54, 0.46];     // µm
const CEL_RGB = [0.75, 0.88, 1.15].map(v => v / 0.871);   // cromaticitat del cel blau (lluminància 1)
function lum(c) { return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function diaAny(m, d) { return [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][Math.min(12, Math.max(1, Math.round(m))) - 1] + Math.round(d); }
function posicioSol(s) {
  const g = 2 * Math.PI / 365 * (diaAny(s.mes, s.dia) - 1 + (s.hora - s.tz - 12) / 24);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const tst = s.hora * 60 + eqt + 4 * s.lon - 60 * s.tz;
  const ha = (tst / 4 - 180) * D2R, lat = s.lat * D2R;
  const cz = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha);
  const alt = 90 - Math.acos(Math.max(-1, Math.min(1, cz))) * R2D;
  const az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)) * R2D + 180;
  return { alt, az: (az + 360) % 360 };
}
function massaAire(alt) { return alt <= -0.5 ? Infinity : 1 / (Math.sin(Math.max(alt, 0) * D2R) + 0.50572 * Math.pow(alt + 6.07995, -1.6364)); }
function transSol(s, alt) {
  const m = massaAire(alt);
  return LAMBDA_RGB.map(l => Math.exp(-(0.0088 * Math.pow(l, -4.05) * s.P / 1013 + s.aot * Math.pow(l, -1.3)) * m));
}
function iluminanciaSol(s, alt) { return alt <= 0 ? 0 : K.E_SOL_LUX * lum(transSol(s, alt)); }
function angleEntre(az1, el1, az2, el2) {
  const c = Math.sin(el1 * D2R) * Math.sin(el2 * D2R) + Math.cos(el1 * D2R) * Math.cos(el2 * D2R) * Math.cos((az1 - az2) * D2R);
  return Math.acos(Math.max(-1, Math.min(1, c)));
}
/** Lluminància del cel clar en una direcció [cd/m²] (CIE + Krochmann) */
function luminanciaCel(s, sol, az, el) {
  if (sol.alt <= 0) return 0.05;
  const TL = 2.5 + 12 * s.aot;                                   // terbolesa de Linke (aprox.)
  const Lz = 1000 * ((1.376 * TL - 1.81) * Math.tan(Math.min(sol.alt, 60) * D2R) + 0.38);
  const f = x => 0.91 + 10 * Math.exp(-3 * x) + 0.45 * Math.cos(x) ** 2;
  const ph = z => 1 - Math.exp(-0.32 / Math.max(Math.cos(z), 0.01));
  const Z = (90 - Math.max(el, 0.5)) * D2R, Zs = (90 - sol.alt) * D2R;
  return Lz * f(angleEntre(az, el, sol.az, sol.alt)) * ph(Z) / (f(Zs) * ph(0));
}
function faseHG(g, cosT) { return (1 - g * g) / Math.pow(1 + g * g - 2 * g * cosT, 1.5); } // normalitzada a 1 (isòtrop = 1)
function faseTracador(tr, cosT) { return tr.f * faseHG(tr.g1, cosT) + (1 - tr.f) * faseHG(tr.g2, cosT); }
/** Taronja: to 15–45° (inclou el de la làmpada de sodi, la referència del testimoni) i saturat */
function esTaronja(hs) { return hs.h >= 15 && hs.h <= 45 && hs.sat >= 0.5; }
function gammaSRGB(v) { return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; }
/** To i saturació percebuts (HSV sobre sRGB amb gamma, no sobre valors lineals) */
function toHue(cLin) {
  const mxL = Math.max(...cLin, 1e-30), c = cLin.map(v => gammaSRGB(Math.max(v, 0) / mxL));
  const mx = Math.max(...c), mn = Math.min(...c), d = mx - mn;
  if (d <= 1e-12) return { h: 0, sat: 0 };
  let h = mx === c[0] ? ((c[1] - c[2]) / d) % 6 : mx === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4;
  return { h: (h * 60 + 360) % 360, sat: d / mx };
}
/**
 * Aparença d'un objecte de profunditat òptica τ vist en la direcció (az, el).
 * Retorna color RGB lineal (cd/m² per canal), lluminància, contrast amb el cel
 * (C = L/L_cel − 1) i to.
 */
function aparenca(s, tau, az, el) {
  const sol = posicioSol(s), tr = tracador(s);
  const Lsky = luminanciaCel(s, sol, az, el);
  const psi = angleEntre(az, el, sol.az, sol.alt);
  const P = faseTracador(tr, Math.cos(psi));
  const En = iluminanciaSol(s, sol.alt);
  const T = transSol(s, sol.alt), lT = lum(T) || 1;
  const t = Math.max(tau, 0), e = Math.exp(-t);
  // Dispersió simple en una capa: amb el sol darrere l'objecte la llum
  // dispersada endavant també s'atenua dins la capa (τ·e^−τ, màxim a τ=1); amb
  // el sol darrere del testimoni satura com ½(1 − e^−2τ). Entremig s'interpola
  // amb el pes (1 − cos ψ)/2.
  const wB = (1 - Math.cos(psi)) / 2;          // 0 = sol darrere l'objecte, 1 = sol darrere el testimoni
  const capa = (1 - wB) * t * e + wB * 0.5 * (1 - Math.exp(-2 * t));
  // Dispersió múltiple (aproximació de dos fluxos, conservativa): un núvol
  // gruixut reflecteix R = x/(1+x), x = (√3/2)(1−g)τ, i transmet de forma
  // difusa la resta. Radiància quasi lambertiana E·R/π (amb μ₀ ≈ ½).
  const gEf = tr.f * tr.g1 + (1 - tr.f) * tr.g2, xs = 0.866 * (1 - gEf) * t;
  const Rdf = xs / (1 + xs), Tdf = Math.max(1 - Rdf - e, 0);
  const ms = ((1 - wB) * Tdf + wB * Rdf) * 0.5 / Math.PI;
  const rgb = [0, 1, 2].map(i => Lsky * CEL_RGB[i] * e + En * (T[i] / lT) * tr.alb[i] * Math.max(P / (4 * Math.PI) * capa, ms));
  const Y = lum(rgb), hs = toHue(rgb);
  const C = Y / Math.max(Lsky, 1e-6) - 1;
  return { rgb, Y, Lsky, C, psi: psi * R2D, P, En, sol, hue: hs.h, sat: hs.sat,
    taronja: esTaronja(hs) };
}
/** Geometria del testimoni: és a la plataforma del pont, a d_obs de l'origen de l'anell */
function geometriaVisio(s, x, y, z) {
  const dz = z + s.d_obs, hO = s.h_pont + 1.6;
  return { az: (s.az_vis + Math.atan2(x, dz) * R2D + 360) % 360, el: Math.atan2(y - hO, Math.hypot(dz, x)) * R2D, dist: Math.hypot(x, y - hO, dz) };
}

/* ── Trajectòria (integració a pas fix, també per a l'avaluació) ──────────── */
function anellPrincipalFont(s) {
  const fs = fonts(s), ans = fs.map(f => anellFont(s, f.f, f.L));
  const i = ans[0].Gamma >= ans[1].Gamma ? 0 : 1;
  return { an: ans[i], src: fs[i], i, ans, fs };
}
function velocitatAnell(s, an, ev, dTexces) {
  const el = s.elev * D2R, az = s.az_eix * D2R, Ta = Tk(s);
  const wb = dTexces !== 0 ? Math.sign(dTexces) * 0.5 * Math.sqrt(K.G * ev.R * Math.abs(dTexces) / Ta) : 0;
  const w = ventXZ(s);
  return {
    vx: w.x + ev.U * Math.cos(el) * Math.sin(az),
    vy: ev.U * Math.sin(el) + wb,
    vz: w.z + ev.U * Math.cos(el) * Math.cos(az),
  };
}
/**
 * Estat de l'anell a l'instant t, incloent-hi la fase d'extinció: un cop
 * perduda la coherència, el tub es dispersa (a creix a ritme σ_w) i, com que
 * la massa de traçador per unitat de longitud es conserva, τ ∝ 1/a.
 */
function estatAnell(s, an, t, vida) {
  const v = vida || vidaAnell2(s, an);
  const ev = Object.assign({}, evolucio(s, an, Math.min(t, v.tCoh)));
  ev.dilTub = 1;
  if (t > v.tCoh) {
    const aEnd = ev.a, aF = aEnd + Math.max(s.turb, 1e-3) * (t - v.tCoh);
    ev.dilTub = aEnd / aF; ev.U = 0; ev.disp = true;
  }
  return ev;
}
function trajectoria(s, an, src, tmax, dt) {
  const pts = []; let x = src.x, y = src.y, z = 0;
  const vida = vidaAnell2(s, an);
  for (let t = 0; t <= tmax + 1e-9; t += dt) {
    const ev = estatAnell(s, an, t, vida);
    pts.push({ t, x, y, z, ev });
    const v = velocitatAnell(s, an, ev, s.dT0 * ev.dil);
    x += v.vx * dt; y = Math.max(y + v.vy * dt, ev.R * 0.1); z += v.vz * dt;
  }
  return pts;
}

/** Profunditat òptica del tub en un punt de la trajectòria (pas de llum 2a, cara a cara) */
function tauPunt(s, p) { return profOptica(s, p.ev.a / (p.ev.dilTub || 1), p.ev.dil * (p.ev.dilTub || 1) * (p.ev.dilTub || 1)); }
/** Corba de contrast vist pel testimoni al llarg de tota la vida */
function corbaContrast(s, an, src) {
  const v = vidaAnell2(s, an);
  const tEnd = v.tCoh + 4 * v.tFade;
  const tr = trajectoria(s, an, src, tEnd, Math.max(tEnd / 400, 0.05));
  return tr.map(p => { const g = geometriaVisio(s, p.x, p.y, p.z); return { t: p.t, C: aparenca(s, tauPunt(s, p), g.az, g.el).C }; });
}

/* ── Comparació amb l'observació (18-09-2022) ──────────────────────────────── */
function fmtDur(t) { return t >= 60 ? (t / 60).toFixed(1) + ' min' : t.toFixed(0) + ' s'; }
/** Valors de l'observació (els objectius del disseny invers per defecte) */
const OBS = { D: 25, tub: 3, h: 25, nodes: 4, Trot: 7, sentit: 1, durada: 180, Umax: 1 };
function avaluaObservacio(s, objectiu) {
  const o = Object.assign({}, OBS, objectiu || {});
  const fd = o.durada / 180;        // l'extinció observada (20–30 s) escala amb la durada
  const { an, src } = anellPrincipalFont(s);
  const files = [];
  const fila = (nom, valor, ok) => files.push({ nom, valor, ok: !!ok });
  fila('anell format', an.es_forma ? 'sí' : 'no', an.es_forma);
  if (!an.es_forma) return { files, n: files.filter(f => f.ok).length, total: 17, an };
  const vida = vidaAnell2(s, an);
  const tObs = Math.min(o.durada, Math.max(vida.tCoh, 1));
  const tr = trajectoria(s, an, src, tObs, Math.max(tObs / 60, 0.05));
  const mig = tr[Math.floor(tr.length / 2)], ini = tr[0], fi = tr[tr.length - 1];
  const D = 2 * mig.ev.R, tub = 2 * mig.ev.a;
  const nf = (v, d) => +v.toFixed(d);
  fila(`diàmetre ≈ ${nf(o.D, 1)} m`, D.toFixed(1) + ' m', Math.abs(D - o.D) <= 0.3 * o.D);
  fila(`tub ≈ ${nf(o.tub, 2)} m`, tub.toFixed(2) + ' m', Math.abs(tub - o.tub) <= 0.5 * o.tub);
  const ys = tr.map(p => p.y), yMin = Math.min(...ys), yMax = Math.max(...ys);
  fila(`alçada ${nf(0.8 * o.h, 1)}–${nf(1.2 * o.h, 1)} m`, yMin.toFixed(1) + '–' + yMax.toFixed(1) + ' m', yMin >= 0.72 * o.h && yMax <= 1.28 * o.h);
  fila(`${o.nodes} nodes`, String(an.nodes), an.nodes === o.nodes);
  const rot = rotacioNodes(s, an, mig.ev);
  fila(`1 volta ≈ ${nf(o.Trot, 1)} s`, isFinite(rot.T) ? rot.T.toFixed(1) + ' s' : 'quiets', Math.abs(rot.T - o.Trot) <= 0.3 * o.Trot);
  fila(`sentit ${o.sentit > 0 ? 'antihorari' : 'horari'}`, rot.sentit > 0 ? '↺' : rot.sentit < 0 ? '↻' : '—', rot.sentit === o.sentit);
  if (o.passiu) {
    // Hipòtesi: l'anell no té velocitat pròpia apreciable i el porta la brisa
    const vw = vent(s);
    fila('arrossegat per la brisa (U < ½·vent)', mig.ev.U.toFixed(3) + ' / ' + (0.5 * vw).toFixed(3) + ' m/s', vw > 0 && mig.ev.U <= 0.5 * vw * 1.001);
  } else {
    const Ulim = Math.max(1.5, 1.67 * o.Umax);
    fila(`deriva lenta (U < ${nf(Ulim, 2)} m/s)`, mig.ev.U.toFixed(2) + ' m/s', mig.ev.U < Ulim);
  }
  const g0 = geometriaVisio(s, ini.x, ini.y, ini.z), g1 = geometriaVisio(s, fi.x, fi.y, fi.z);
  const ratio = (2 * fi.ev.R / g1.dist) / (2 * ini.ev.R / g0.dist);
  fila('mida aparent constant', '×' + ratio.toFixed(2), ratio > 0.75 && ratio < 1.33);
  // Durada i extinció tal com les veuria el testimoni: lluminós mentre és
  // almenys un 10 % més brillant que el cel ("es va fondre amb el cel")
  const corba = corbaContrast(s, an, src);
  const vis = corba.filter(p => p.C >= 0.1);
  const tVis = vis.length ? vis[vis.length - 1].t : 0;
  const Cref = Math.abs(corba[Math.min(corba.length - 1, corba.findIndex(p => p.t >= tObs / 2))].C);
  let tIni = 0;
  for (const p of corba) if (p.t <= tVis && p.C >= Math.max(0.5 * Cref, 0.1)) tIni = p.t;
  const tExt = tVis - tIni;
  fila(`durada ≈ ${fmtDur(o.durada)}`, fmtDur(tVis), tVis >= 0.67 * o.durada && tVis <= 1.67 * o.durada);
  fila(`extinció gradual ${nf(20 * fd, 0)}–${nf(30 * fd, 0)} s`, tExt.toFixed(0) + ' s', tExt >= 10 * fd && tExt <= 45 * fd);
  const gm = geometriaVisio(s, mig.x, mig.y, mig.z);
  const tau = tauPunt(s, mig);
  const ap = aparenca(s, tau, gm.az, gm.el);
  fila('lluminós de dia (C > 0.3)', 'C = ' + ap.C.toFixed(2), ap.C > 0.3);
  fila('color taronja', Math.round(ap.hue) + '°', ap.taronja);
  const apF = aparenca(s, 0.1 * tau, gm.az, gm.el);          // vel de traçador dins la bombolla
  const dh = Math.abs(apF.C);
  fila('forat amb un to diferent', (dh * 100).toFixed(1) + ' %', dh >= 0.01 && dh <= 0.3);
  const audible = [[s.f1, s.db1], [s.f2, s.db2]].some(([f, L]) => L > 0 && f >= 20);
  fila('sense so audible', audible ? 'audible' : 'infrasò', !audible);
  const cua = cuaNodes(s, an, mig.ev, rot);
  fila('cua de cometa fins al node següent', isFinite(cua.dtNodes) ? Math.round(cua.fFinal * 100) + ' % del gruix' : 'sense cua',
    cua.fFinal >= 0.05 && cua.fFinal <= 0.4);
  fila('un sol anell', s.npols === 1 ? '1 empenta' : s.npols === 0 ? 'continu' : s.npols + ' empentes', s.npols === 1);
  return { files, n: files.filter(f => f.ok).length, total: files.length, an, vida, rot, cua, ap, tr, corba, tVis, tExt };
}

/* ── Disseny invers: configuració física que reprodueix l'observació ──────────
   Paràmetres fixats per l'observació: D, tub → D_ap i a/R; nodes → injectors;
   alçada → emissor a aquella alçada amb l'eix horitzontal.
   Γ queda determinat per una de dues prioritats, que són incompatibles:
     · 'deriva':  U = Γ·(ln(8R/a) − ¼)/(4πR) ≤ U_max
     · 'rotacio': Ω_Kelvin + Ω_swirl(swirl màxim) = 2π/T
   Amb Γ, el criteri de Holman fixa ω i u; el nivell surt de la fórmula del
   pistó. La terbolesa i el traçador es busquen per bisecció per complir la
   durada i el contrast (són les dues incògnites ambientals).
   ─────────────────────────────────────────────────────────────────────────── */
function bisecta(fn, lo, hi, it) {
  let flo = fn(lo);
  for (let i = 0; i < (it || 60); i++) {
    const mid = Math.sqrt(lo * hi), fm = fn(mid);
    if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else hi = mid;
  }
  return Math.sqrt(lo * hi);
}
const SEP_S2 = 1.1, DB_S2 = 20;  // separació de S₂ (fracció del diàmetre de l'anell, sense solapar obertures) i atenuació en dB
function dissenya(s, obj) {
  const D_ap0 = obj.D / (2 * K.R_SOBRE_D), aR = Math.min(Math.max(obj.tub / obj.D, 0.02), 0.8);
  const R = obj.D / 2, a = aR * R, lg = Math.log(8 * R / a) - 0.25, h = K.HOLMAN_DISSENY;
  const n = Math.max(1, Math.round(obj.n)), k = n / R;
  const LK = Math.max(Math.log(2 / (k * a)) - 0.5772 + 0.25, 0.05);
  const cK = n > 1 ? n * LK / (4 * Math.PI * R * R) : 0;           // Ω_K = cK·Γ
  const cS = 4 / (Math.pow(Math.PI, 3) * h * R * R);              // Ω_S = swirl·cS·Γ
  // Moviment passiu (arrossegat per la brisa): la velocitat pròpia ha de ser
  // com a màxim la meitat del vent.
  const Umax = obj.passiu ? 0.5 * vent(s) : obj.Umax;
  const GamDeriva = 4 * Math.PI * R * Math.max(Umax, 1e-4) / lg;
  const GamRot0 = (2 * Math.PI / obj.Trot) / (cK + K.SWIRL_MAX * cS);
  const base = Object.assign({}, s, {
    D_ap: D_ap0, aR, phi: 0, npols: 1, n_inj: n, swirl: obj.sentit * K.SWIRL_MAX,
    // Dues fonts: S₁ (a x = 0) forma l'anell; S₂, a 1.1·D i 20 dB per sota,
    // no arriba al criteri de Holman i no en forma cap altre.
    kdir: obj.sentit, h_src: obj.h, elev: 0, az_eix: 0, dT0: 0, so: SEP_S2 * obj.D, sx_off: SEP_S2 * obj.D / 2,
  });
  // Construeix la configuració per a una Γ donada (amb la terbolesa que dona la durada)
  function construeix(Gamma) {
    const D_ap = base.D_ap;
    const w = 4 * Gamma / (Math.pow(Math.PI, 3) * h * h * D_ap * D_ap);
    const f = w / (2 * Math.PI), u = h * Math.PI * w * D_ap;
    const cfg = Object.assign({}, base, { f1: f, f2: f });
    cfg.db1 = dbPerVelocitat(cfg, f, u);
    cfg.db2 = cfg.db1 - DB_S2;
    const an0 = anellFont(cfg, f, cfg.db1);
    // Es busca σ_w dins la branca coherent (σ_w < Γ/4πR): l'anell ha d'existir com a anell
    const vInd = an0.Gamma / (4 * Math.PI * an0.R);
    cfg.turb = bisecta(sig => vidaAnell2(Object.assign({}, cfg, { turb: sig }), an0).total - obj.vida, 1e-4, Math.max(vInd * 0.999, 2e-4));
    const an = anellFont(cfg, f, cfg.db1);
    const tObs = Math.min(obj.vida, Math.max(vidaAnell2(cfg, an).tCoh, 1));
    const tr = trajectoria(cfg, an, fonts(cfg)[0], tObs, Math.max(tObs / 60, 0.05));
    return { cfg, f, u, an, mig: tr[Math.floor(tr.length / 2)] };
  }
  let Gamma = obj.prioritat === 'rotacio' ? GamRot0 : GamDeriva, c = construeix(Gamma);
  // L'anell turbulent creix: es redueix l'obertura perquè el diàmetre al mig de
  // l'observació sigui l'observat (a/R es manté).
  for (let it = 0; it < 8; it++) {
    const Dm = 2 * c.mig.ev.R;
    if (Math.abs(Dm / obj.D - 1) < 1e-3) break;
    base.D_ap *= obj.D / Dm;
    c = construeix(Gamma);
  }
  let GamRot = GamRot0;
  // El patró gira més lent a mesura que l'anell creix: s'ajusta Γ perquè el
  // període sigui l'observat al mig de l'observació.
  for (let it = 0; it < 12; it++) {
    const T = rotacioNodes(c.cfg, c.an, c.mig.ev).T;
    if (!isFinite(T) || Math.abs(T / obj.Trot - 1) < 1e-3) break;
    GamRot *= T / obj.Trot;
    if (obj.prioritat === 'rotacio') {
      Gamma = GamRot; c = construeix(Gamma);
      for (let j = 0; j < 4; j++) { base.D_ap *= obj.D / (2 * c.mig.ev.R); c = construeix(Gamma); }
    }
    else break;
  }
  const { cfg, f, u, mig } = c;
  // Traçador: la concentració mínima que dona el contrast demanat al mig de
  // l'observació. El contrast no és monòton amb τ (a contrallum té un màxim),
  // per això primer es busca el τ òptim en una graella logarítmica.
  const gm = geometriaVisio(cfg, mig.x, mig.y, mig.z);
  const tauU = profOptica(Object.assign({}, cfg, { aer: 1 }), mig.ev.a, mig.ev.dil);   // τ per 1 mg/m³
  const contrastTau = t => aparenca(cfg, t, gm.az, gm.el).C;
  let tauBest = 0.01, cMax = -Infinity;
  for (let lt = -2; lt <= 1.5; lt += 0.05) { const cc = contrastTau(Math.pow(10, lt)); if (cc > cMax) { cMax = cc; tauBest = Math.pow(10, lt); } }
  const tauReq = cMax > obj.contrast ? bisecta(t => contrastTau(t) - obj.contrast, 1e-4, tauBest) : tauBest;
  cfg.aer = Math.min(tauReq / Math.max(tauU, 1e-30), 20000);
  return {
    cfg, Gamma, GamDeriva, GamRot, f, u, mach: u / cSo(s), L: cfg.db1, cMax, psi: aparenca(cfg, 0, gm.az, gm.el).psi,
    vInd: c.an.Gamma / (4 * Math.PI * c.an.R),   // la turbulència real ha de ser inferior a això
    conflicte: GamRot / GamDeriva, Umax,          // > 1: no es pot complir gir i deriva alhora
    viable: cfg.db1 <= dbMax(s) && u / cSo(s) < 0.3,
  };
}

/* ═══ MODEL B: NODES EMISSORS ══════════════════════════════════════════════
   Hipòtesi del testimoni: els nodes es movien com objectes que generaven
   l'anell. L'anell és el RASTRE lluminós de n fonts que orbiten:
     · velocitat dels nodes v = 2πR/T i acceleració centrípeta a = v²/R
       (cada objecte necessita una força cap al centre de m·a);
     · el rastre emet llum que decau amb un temps τ; entre dos nodes passa
       Δt = T/n, i el gruix visible al node següent és exp(−Δt/τ);
     · cada node radia una potència P. Amb una eficàcia lluminosa K (lm/W),
       la lluminància del cap és L₀ = P·K / (4π·w·v·τ·(1 − e^{−Δt/τ})),
       on w és el gruix del cap (balanç de flux del rastre, emissió isòtropa
       i òpticament prima).
   Emissió: 0 = incandescència de cos negre a T; 1 = línia D del sodi (589 nm).
   ─────────────────────────────────────────────────────────────────────────── */
function planck(l, T) { return 1 / (Math.pow(l, 5) * (Math.exp(14388 / (l * T)) - 1)); }   // l en µm (relativa)
function Vlum(l) { return 1.019 * Math.exp(-285.4 * (l - 0.559) * (l - 0.559)); }             // CIE V(λ), ajust gaussià
/** Eficàcia lluminosa de la radiació emesa [lm/W] */
function eficaciaEmissio(tipus, T) {
  if (tipus === 1) return 683 * Vlum(0.589);
  let a = 0, b = 0;
  for (let l = 0.2; l < 40; l += 0.002) { const B = planck(l, T); a += B * Vlum(l); b += B; }
  return 683 * a / b;
}
/** Color lineal RGB de l'emissió (normalitzat al màxim) */
function colorEmissio(tipus, T) {
  // 589 nm → cromaticitat CIE (0.575, 0.424) → sRGB lineal
  const c = tipus === 1 ? [2.76, 0.59, 0] : LAMBDA_RGB.map(l => planck(l, T));
  const mx = Math.max(...c);
  return c.map(v => Math.max(v, 0) / mx);
}
function emissors(s) {
  const R = s.e_D / 2, n = Math.max(1, Math.round(s.e_n)), T = s.e_T, tau = Math.max(s.e_tau, 1e-3);
  const v = 2 * Math.PI * R / T, ac = v * v / R, dt = T / n;
  const fFinal = Math.exp(-dt / tau);
  const K_ = eficaciaEmissio(s.e_tipus, s.e_Temp);
  const L0 = s.e_P * 1000 * K_ / (4 * Math.PI * s.e_cap * v * tau * (1 - fFinal));
  const rgb = colorEmissio(s.e_tipus, s.e_Temp), hs = toHue(rgb);
  return { R, n, v, ac, g: ac / K.G, inclinacio: Math.atan(ac / K.G) * R2D, dt, tau, fFinal, eff: K_, L0, rgb, hue: hs.h, sat: hs.sat,
    taronja: esTaronja(hs), factor: u => Math.exp(-u * dt / tau),
    tauPerFinal: f => dt / Math.log(1 / f),                   // τ que dona un gruix f al node següent
    potenciaPerL: L => L * 4 * Math.PI * s.e_cap * v * tau * (1 - fFinal) / K_ / 1000 };   // kW per node
}
/** Posició del centre al temps t (només l'arrossega el vent) */
function posicioEmissors(s, t) { const w = ventXZ(s); return { x: s.sx_off + w.x * t, y: s.e_h, z: w.z * t }; }
/** Envolupant de brillantor: present durant e_vida i extinció lineal en e_ext */
function envolupantEmissors(s, t) { return t < 0 ? 0 : t <= s.e_vida ? 1 : Math.max(0, 1 - (t - s.e_vida) / Math.max(s.e_ext, 1e-3)); }

function avaluaEmissors(s) {
  const e = emissors(s), files = [];
  // ok: true/false = conseqüència física avaluada; null = valor imposat pel paràmetre (no compta)
  const fila = (nom, valor, ok) => files.push({ nom, valor, ok });
  fila('diàmetre ≈ 25 m', (2 * e.R).toFixed(1) + ' m (imposat)', null);
  fila('tub ≈ 3 m', s.e_cap.toFixed(1) + ' m (imposat)', null);
  fila('alçada 20–30 m', s.e_h.toFixed(1) + ' m (imposat)', null);
  fila('4 nodes', e.n + ' (imposat)', null);
  fila('1 volta ≈ 7 s', s.e_T.toFixed(1) + ' s (imposat)', null);
  fila('cua de cometa fins al node següent', Math.round(e.fFinal * 100) + ' % del gruix', e.fFinal >= 0.05 && e.fFinal <= 0.4);
  // Mida aparent: el vent pot apropar o allunyar el centre
  const p0 = posicioEmissors(s, 0), p1 = posicioEmissors(s, s.e_vida);
  const g0 = geometriaVisio(s, p0.x, p0.y, p0.z), g1 = geometriaVisio(s, p1.x, p1.y, p1.z);
  const ratio = g0.dist / g1.dist;
  fila('mida aparent constant', '×' + ratio.toFixed(2), ratio > 0.75 && ratio < 1.33);
  fila('deriva lenta amb el vent', (vent(s) * 3.6).toFixed(1) + ' km/h', vent(s) < 2);
  // Brillantor respecte al cel, a la meitat de l'observació
  const pm = posicioEmissors(s, s.e_vida / 2), gm = geometriaVisio(s, pm.x, pm.y, pm.z);
  const sol = posicioSol(s), Lsky = luminanciaCel(s, sol, gm.az, gm.el), C = e.L0 / Math.max(Lsky, 1e-6);
  fila('lluminós de dia (C > 0.3)', 'C = ' + C.toFixed(2), C > 0.3);
  fila('color taronja', Math.round(e.hue) + '°', e.taronja);
  fila('forat amb un to diferent', 'cel net', false);
  fila('durada ≈ 3 min', (s.e_vida / 60).toFixed(1) + ' min (imposat)', null);
  fila('extinció gradual 20–30 s', s.e_ext.toFixed(0) + ' s (imposat)', null);
  fila('sense so audible', 'depèn del mecanisme', null);
  fila('un sol anell', 'sí', null);
  const aval = files.filter(f => f.ok !== null);
  return { files, n: aval.filter(f => f.ok).length, total: aval.length, e, C, Lsky, emissors: true };
}

/* ═══ MODEL C: PATRÓ ACÚSTIC ROTATIU ════════════════════════════════════════
   Hipòtesi: els nodes són màxims d'energia d'un camp de so que gira, com
   les rodes d'un tren sobre una via ondulada. No es mou cap material: el
   patró avança amb velocitat de fase, sense cap força centrípeta.
   Física (feixos acústics de vòrtex): K ones amb freqüències f_c + k·Δf i
   càrrega topològica ℓ_k = k·m (k = 0…K−1) donen m pètals que giren amb
   Ω = 2π·Δf/m → T_volta = m/Δf. Amb K ones ("esglaons" de la modulació)
   la intensitat es concentra: pic/mitjana = K i amplada angular ≈ 2π/(m·K)
   (és el mateix principi que el bloqueig de modes d'un làser).
   Radi de l'anell: primer màxim de J_ℓ amb ℓ ≈ m/2, r = j'_ℓ/k (k = 2πf_c/c).
   Visibilitat: condensació acústica. A la rarefacció del node l'aire
   s'expandeix adiabàticament; si T baixa del punt de rosada es forma boira,
   que el sol il·lumina. Quan el node passa, les gotes s'evaporen en
   t_ev = r²ρ_w / (2·D·ρ_sat·(1 − HR)): és la cua de cometa.
   ─────────────────────────────────────────────────────────────────────────── */
const JP = [0, 1.841, 3.054, 4.201, 5.318, 6.416, 7.501, 8.578];   // zeros de J'_ℓ
function rhoSat(Tc) { return 611.2 * Math.exp(17.62 * Tc / (243.12 + Tc)) / (461.5 * (Tc + 273.15)); }
/** Llindar aproximat de percepció d'infrasò (Møller & Pedersen 2004) [dB] */
function llindarPercepcio(f) { return f >= 20 ? 20 : 97 + 25 * Math.log10(10 / Math.max(f, 0.5)); }
function patroAcustic(s) {
  const m = Math.max(1, Math.round(s.c_m)), K = Math.max(1, Math.round(s.c_K)), R = s.c_D / 2;
  const df = m / s.c_T, v = 2 * Math.PI * R / s.c_T, c = cSo(s);
  const l = Math.min(JP.length - 1, Math.max(1, Math.round(m / 2)));
  const fcRadi = JP[l] * c / (2 * Math.PI * R);                          // portadora que fa el radi R
  const Rnat = JP[l] * c / (2 * Math.PI * s.c_fc);
  const Lpic = s.c_L + 10 * Math.log10(K), ppic = pAmpDeDb(Lpic), P = pAtm(s);
  const pmin = Math.max(P - ppic, 0.01 * P);
  const Tmin = Tk(s) * Math.pow(pmin / P, 0.4 / 1.4) - 273.15;
  const Td = puntRosada(s);
  const rhoV = s.H / 100 * rhoSat(s.T), rhoVexp = rhoV * Math.pow(pmin / P, 1 / 1.4);
  const lwc = Math.max(0, rhoVexp - rhoSat(Tmin));                       // aigua condensada [kg/m³]
  const rg = s.c_r * 1e-6;
  const tau = 3 * 2 * lwc * s.c_cap / (4 * 1000 * rg);                   // profunditat òptica al node
  const tEv = rg * rg * 1000 / (2 * 2.5e-5 * rhoSat(s.T) * Math.max(1 - s.H / 100, 0.01));
  const dt = s.c_T / m, fFinal = Math.exp(-dt / tEv);
  const pCond = P * (1 - Math.pow((Td + 273.15) / Tk(s), 3.5));
  const Lcond = 20 * Math.log10(pCond / (Math.SQRT2 * 20e-6));
  // Exposició del testimoni: el camp mitjà decau des de l'anell
  const Lobs = s.c_L - 20 * Math.log10(Math.max(s.d_obs, R) / R);
  const Lth = llindarPercepcio(s.c_fc);
  const possible = ppic < 0.9 * P;                                         // rarefacció lluny del buit
  return { m, K, R, df, v, l, fcRadi, Rnat, Lpic, ppic, possible, Tmin, Td, condensa: possible && Tmin <= Td, lwc, tau, tEv, dt, fFinal,
    Lcond, LmitjaCond: Lcond - 10 * Math.log10(K), amplada: 2 * Math.PI * R / (m * K), Lobs, Lth,
    percep: Lobs > Lth, perillos: Lobs > 140, audible: s.c_fc >= 20 || s.c_fc + (K - 1) * df >= 20,
    factor: u => Math.exp(-u * dt / tEv), rPerCua: f => Math.sqrt(dt / Math.log(1 / f) * 2 * 2.5e-5 * rhoSat(s.T) * Math.max(1 - s.H / 100, 0.01) / 1000) * 1e6 };
}
function avaluaPatro(s) {
  const p = patroAcustic(s), files = [];
  const fila = (nom, valor, ok) => files.push({ nom, valor, ok });
  fila('diàmetre ≈ 25 m', (2 * p.R).toFixed(1) + ' m (imposat)', null);
  fila('radi coherent amb la portadora', 'f_c = ' + s.c_fc.toFixed(1) + ' Hz → R = ' + p.Rnat.toFixed(1) + ' m', Math.abs(p.Rnat / p.R - 1) < 0.15);
  fila('4 nodes', p.m + ' (imposat)', null);
  fila('1 volta ≈ 7 s', s.c_T.toFixed(1) + ' s (Δf = ' + p.df.toFixed(3) + ' Hz)', null);
  fila('nivell físicament possible', p.Lpic.toFixed(0) + ' dB al node', p.possible);
  fila('nodes visibles (boira acústica)', p.condensa ? 'sí · T = ' + p.Tmin.toFixed(1) + ' °C' : 'no · cal ' + p.Lcond.toFixed(0) + ' dB al node', p.condensa);
  fila('cua de cometa fins al node següent', p.condensa ? Math.round(p.fFinal * 100) + ' % (gotes de ' + s.c_r + ' µm)' : '—', p.condensa && p.fFinal >= 0.05 && p.fFinal <= 0.4);
  const sol = posicioSol(s), g = geometriaVisio(s, s.sx_off, s.c_h, 0);
  const ap = aparenca(Object.assign({}, s, { trac: 2 }), p.condensa ? p.tau : 0, g.az, g.el);
  fila('lluminós de dia (C > 0.3)', 'C = ' + ap.C.toFixed(2), ap.C > 0.3);
  fila('color taronja', p.condensa ? Math.round(ap.hue) + '°' : '—', p.condensa && ap.taronja);
  fila('deriva amb la brisa', 'patró fix a l\'emissor', false);
  fila('sense so perceptible', p.Lobs.toFixed(0) + ' dB al testimoni (llindar ' + p.Lth.toFixed(0) + ')', !p.percep && !p.audible);
  fila('exposició segura (< 140 dB)', p.Lobs.toFixed(0) + ' dB', !p.perillos);
  const aval = files.filter(f => f.ok !== null);
  return { files, n: aval.filter(f => f.ok).length, total: aval.length, p, ap, C: ap.C, Lsky: ap.Lsky, patro: true };
}

const API = {
  K, Tk, pAtm, rho, cSo, muSuth, nuAir, nDens, puntRosada, vent,
  ventXZ, pAmpDeDb, dbMax, lambda, alfaAbs, hNodePressio, hNodeVelocitat, fonts, fasorFont, pAcPunt,
  distanciaXoc, fBat, sentitBat, velocitatObertura, dbPerVelocitat, anellFont, nuEfectiva,
  vidaAnell, nucliTermo, tracador, profOptica, levitacio, conductors, campEPic, corona, campRuptura,
  sincronisme, ratiRuptura, plasma, dTdt, colorCosNegre,
  evolucio, vidaAnell2, rotacioNodes, cuaNodes, posicioSol, massaAire, transSol, iluminanciaSol,
  luminanciaCel, faseHG, aparenca, geometriaVisio, anellPrincipalFont, velocitatAnell,
  rhoSat, llindarPercepcio, patroAcustic, avaluaPatro,
  gammaSRGB, eficaciaEmissio, colorEmissio, emissors, posicioEmissors, envolupantEmissors, avaluaEmissors, esTaronja, toHue,
  trajectoria, estatAnell, tauPunt, corbaContrast, OBS, avaluaObservacio, dissenya,
};
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else root.FIS = API;
})(typeof window !== 'undefined' ? window : globalThis);
