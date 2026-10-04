# Escombrat: on, a quina alçada i amb quins valors es forma el toroide

Generat amb `node tests/escombrat.js` (mateix motor físic que el simulador). Escena del Segre: fonts a 5.00 m d'alçada sobre l'aigua, zona de formació de 20.00 m (anell de 24.00 m), fum 500 mg/m³, turbulència σ_w = 0.2 m/s, senyal sinusoïdal, φ = −90.0°, reflex de l'aigua (coeficient 1), saturació no lineal i xoc inclosos.

**Només es llisten valors que formen l'anell** amb nivell ≤ 191 dB per font (límit físic: la rarefacció arriba al buit). Precisió: distàncies al cm, freqüències a 0.1 Hz (0.01 / 0.001 Hz per sota d'1 / 0.1 Hz), nivells a 0.1 dB, angles a 0.1°. L'audibilitat no és criteri.

Condicions per formar-se (totes alhora): (1) criteri de formació —oscil·lació (Holman) o circulació sostinguda per l'empenta del so que venç la turbulència—; (2) les dues ones arriben comparables (cap per sota d'1/3 de l'altra); (3) l'anell cap per sobre de l'aigua (alçada ≥ radi).

## 1. Bandes de freqüència que formen l'anell, per separació de les fonts (feix 180.0°)

| separació | banda (≤ 191 dB) | freqüència | nivell mínim | on neix x · **alçada** | amb +6.0 dB: x · alçada | via | 1 volta (4 nodes) | volum/cicle per font | emissor | estàtica (3 min) | soroll del gir a 1 m |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 10.00 m | ≤ 0.005 Hz – 2.0 Hz | 0.005 Hz | **97.7 dB** | -2.07 · **12.00 m** | 0.01 · 12.00 m | oscil·lació | 1.1 min ↺ | 4.8·10^4 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.040 Hz | **124.8 dB** | -2.06 · **12.00 m** | 0.01 · 12.00 m | oscil·lació | 49.5 s ↺ | 1.7·10^4 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.32 Hz | **159.1 dB** | -2.09 · **12.00 m** | 0.01 · 12.00 m | oscil·lació | 8.5 s ↺ | 1.4·10^4 m³ | 🔴 improbable | 19.5 kV/m | 45.2 dB |
|  |  | 2.0 Hz | **190.6 dB** | -2.17 · **12.00 m** | -1.67 · 12.00 m | oscil·lació | 1.4 s ↺ | 1.3·10^4 m³ | 🔴 improbable | 305.7 kV/m | 109.0 dB |
| 10.00 m | 16.8 Hz – 3.8075 kHz | 16.8 Hz | **191.0 dB** | 0.01 · **12.00 m** | 0.01 · 12.00 m | empenta del so | 10.6 s ↺ | 197.7 m³ | 🟠 extrem | 1.6 kV/m | -12.5 dB |
|  |  | 99.8 Hz | **175.8 dB** | -2.79 · **12.00 m** | 0.08 · 12.00 m | empenta del so | 42.5 s ↺ | 973.4 L | 🟠 extrem | 1.6 kV/m | -12.7 dB |
|  |  | 629.5 Hz | **160.1 dB** | -3.35 · **13.38 m** | -0.71 · 12.00 m | empenta del so ⚠ xoc | 39.2 s ↺ | 4.0 L | 🟢 assolible | 4.6 kV/m | 12.0 dB |
|  |  | 3.8075 kHz | **182.6 dB** | -3.35 · **12.00 m** | -3.35 · 12.00 m | empenta del so ⚠ xoc | 1.2 min ↺ | 1.5 L | 🟠 extrem | 1.9 kV/m | -9.0 dB |
| 27.50 m | ≤ 0.005 Hz – 1.2 Hz | 0.005 Hz | **106.4 dB** | -2.85 · **12.02 m** | 0.00 · 12.13 m | oscil·lació | 1.1 min ↺ | 1.3·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.032 Hz | **130.7 dB** | -2.71 · **12.01 m** | 0.00 · 12.13 m | oscil·lació | 52.3 s ↺ | 5.3·10^4 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.20 Hz | **159.7 dB** | -2.79 · **12.02 m** | 0.00 · 12.14 m | oscil·lació | 13.8 s ↺ | 3.8·10^4 m³ | 🔴 improbable | 9.6 kV/m | 28.9 dB |
|  |  | 1.2 Hz | **190.5 dB** | -2.70 · **12.01 m** | -2.04 · 12.01 m | oscil·lació | 2.3 s ↺ | 3.7·10^4 m³ | 🔴 improbable | 141.8 kV/m | 91.2 dB |
| 27.50 m | 14.3 Hz – 2.0032 kHz | 14.3 Hz | **191.0 dB** | -15.12 · **13.87 m** | -15.12 · 13.87 m | empenta del so ⚠ xoc | 0.3 s ↺ | 272.8 m³ | 🟠 extrem | 6.18 MV/m ⚡ | 178.6 dB |
|  |  | 79.2 Hz | **176.1 dB** | -15.47 · **14.48 m** | -8.40 · 12.01 m | empenta del so ⚠ xoc | 13.6 s ↻ | 1.6 m³ | 🟠 extrem | 24.5 kV/m | 50.5 dB |
|  |  | 397.2 Hz | **163.0 dB** | 0.08 · **18.65 m** | -1.70 · 12.61 m | empenta del so ⚠ xoc | 1.2 min ↺ | 14.1 L | 🟢 assolible | 1.8 kV/m | -10.0 dB |
|  |  | 2.0032 kHz | **162.7 dB** | -7.97 · **12.51 m** | -7.97 · 12.51 m | empenta del so ⚠ xoc | 1.0 min ↺ | 0.5 L | 🟢 assolible | 2.5 kV/m | -2.5 dB |
| 50.00 m | ≤ 0.005 Hz – 0.83 Hz | 0.005 Hz | **113.8 dB** | -4.75 · **14.26 m** | 0.00 · 16.49 m | oscil·lació | 1.2 min ↺ | 3.1·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.025 Hz | **134.7 dB** | -4.87 · **14.23 m** | 0.00 · 16.49 m | oscil·lació | 57.3 s ↺ | 1.4·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.16 Hz | **163.2 dB** | -4.71 · **14.33 m** | 0.00 · 16.50 m | oscil·lació | 18.2 s ↺ | 8.9·10^4 m³ | 🔴 improbable | 6.9 kV/m | 21.1 dB |
|  |  | 50.0 Hz | **179.1 dB** | -20.22 · **34.30 m** | 0.00 · 22.02 m | empenta del so ⚠ xoc | 34.3 s ↻ | 5.7 m³ | 🟠 extrem | 5.6 kV/m | 16.4 dB |
|  |  | 199.1 Hz | **168.0 dB** | 0.00 · **25.44 m** | 0.00 · 15.91 m | empenta del so ⚠ xoc | 1.1 min ↺ | 99.6 L | 🟢 assolible | 2.0 kV/m | -7.5 dB |
|  |  | 995.9 Hz | **181.6 dB** | -12.54 · **14.31 m** | -12.54 · 14.31 m | empenta del so ⚠ xoc | 1.1 min ↻ | 19.1 L | 🟠 extrem | 2.3 kV/m | -4.8 dB |
| 69.20 m | ≤ 0.005 Hz – 0.72 Hz | 0.005 Hz | **116.3 dB** | -11.98 · **17.45 m** | 0.00 · 20.79 m | oscil·lació | 1.2 min ↺ | 4.1·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.025 Hz | **137.3 dB** | -11.87 · **17.40 m** | 0.00 · 20.79 m | oscil·lació | 1.1 min ↺ | 1.8·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.13 Hz | **162.1 dB** | -11.99 · **17.58 m** | 0.00 · 20.80 m | oscil·lació | 25.5 s ↺ | 1.2·10^5 m³ | 🔴 improbable | 5.0 kV/m | 13.9 dB |
| 69.20 m | 11.9 Hz – 718.7 Hz | 11.9 Hz | **191.0 dB** | -40.99 · **17.01 m** | -40.99 · 17.01 m | empenta del so ⚠ xoc | 2.9 s ↺ | 394.0 m³ | 🟠 extrem | 239.9 kV/m | 103.3 dB |
|  |  | 50.0 Hz | **178.8 dB** | -19.29 · **40.73 m** | 0.00 · 29.87 m | empenta del so ⚠ xoc | 51.1 s ↻ | 5.5 m³ | 🟠 extrem | 2.6 kV/m | -1.7 dB |
|  |  | 199.1 Hz | **168.4 dB** | -8.53 · **16.60 m** | 0.00 · 21.87 m | empenta del so ⚠ xoc | 55.3 s ↺ | 104.3 L | 🟢 assolible | 2.7 kV/m | -0.8 dB |
| 100.00 m | ≤ 0.005 Hz – 0.51 Hz | 0.005 Hz | **122.3 dB** | -16.68 · **23.70 m** | 0.00 · 28.27 m | oscil·lació | 1.2 min ↺ | 8.2·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.025 Hz | **143.2 dB** | -16.90 · **23.70 m** | 0.00 · 28.31 m | oscil·lació | 1.0 min ↺ | 3.6·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.13 Hz | **168.0 dB** | -16.95 · **23.88 m** | 0.00 · 28.37 m | oscil·lació | 25.4 s ↺ | 2.3·10^5 m³ | 🔴 improbable | 5.0 kV/m | 13.9 dB |
|  |  | 0.51 Hz | **191.0 dB** | -19.18 · **25.67 m** | -19.18 · 25.67 m | oscil·lació | 6.3 s ↺ | 2.1·10^5 m³ | 🔴 improbable | 39.2 kV/m | 61.4 dB |
| 100.00 m | 11.2 Hz – 314.9 Hz | 11.2 Hz | **191.0 dB** | -56.25 · **25.52 m** | -56.25 · 25.52 m | empenta del so ⚠ xoc | 10.0 s ↻ | 444.7 m³ | 🟠 extrem | 36.8 kV/m | 59.9 dB |
|  |  | 31.5 Hz | **182.4 dB** | -35.17 · **20.37 m** | -34.42 · 19.10 m | empenta del so ⚠ xoc | 45.3 s ↺ | 20.9 m³ | 🟠 extrem | 3.1 kV/m | 2.7 dB |
|  |  | 99.8 Hz | **173.5 dB** | -15.43 · **29.91 m** | -22.68 · 27.94 m | empenta del so ⚠ xoc | 1.1 min ↺ | 746.9 L | 🟠 extrem | 2.1 kV/m | -6.5 dB |
|  |  | 314.9 Hz | **166.4 dB** | -33.73 · **19.35 m** | -41.80 · 21.27 m | empenta del so ⚠ xoc | 1.0 min ↻ | 33.1 L | 🟢 assolible | 2.5 kV/m | -2.3 dB |
|  |  | 397.2 Hz | **173.3 dB** | -28.88 · **21.77 m** | -28.88 · 21.77 m | empenta del so ⚠ xoc | 1.1 min ↻ | 46.1 L | 🟠 extrem | 2.2 kV/m | -5.0 dB |
|  |  | 398.5 Hz | **186.3 dB** | -23.57 · **13.45 m** | -23.57 · 13.45 m | empenta del so ⚠ xoc | 55.6 s ↻ | 204.5 L | 🟠 extrem | 2.9 kV/m | 1.3 dB |

No es forma (amb cap nivell ≤ 191 dB) fora de les bandes llistades. «≤ 0.005 Hz»: la banda continua per sota (límit de l'escombrat).

Emissor: 🟢 assolible = ≤ 170.0 dB a 1 m i ≤ 10 m³ per cicle (sirenes i pistons molt grans) · 🟠 extrem = fins al límit físic i ≤ 1000 m³ (només explosions o motors de coet) · 🔴 improbable = cal moure més de 1000 m³ d'aire per cicle (cap emissor conegut). En infrasò, el nivell en dB a 1 m enganya: el que costa és el volum d'aire que s'ha de moure.

### Per què no es forma fora de les bandes (separació 69.20 m, al límit de 191 dB, al punt més favorable)

| freqüència | motiu |
|---|---|
| 1.0 Hz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 2.9e-1 m²/s) no venç la turbulència |
| 3.5 Hz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 4.9e-1 m²/s) no venç la turbulència |
| 7.0 Hz | al punt més favorable sí, però les dues ones no hi arriben comparables o l'anell no hi cap per sobre de l'aigua |
| 1.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 1.8e+0 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |
| 2.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 4.7e-1 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |
| 5.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 1.0e-1 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |
| 10.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 2.1e-2 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |
| 20.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 5.9e-4 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |
| 40.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 5.1e-8 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |

## 2. Obertura del feix i alçada on es creuen (separació 69.20 m)

| feix | creuament | banda | freqüència | nivell mínim | on neix x · **alçada** | via |
|---|---|---|---|---|---|---|
| 180.0° | 25.00 m | ≤ 0.005 Hz – 0.72 Hz | 0.063 Hz | 149.5 dB | -11.91 · **17.41 m** | oscil·lació |
|  |  | 11.9 Hz – 718.7 Hz | 99.8 Hz | 173.3 dB | -15.55 · **19.42 m** | empenta del so |
| 120.0° | 15.00 m | ≤ 0.005 Hz – 0.70 Hz | 0.063 Hz | 150.1 dB | -11.85 · **17.14 m** | oscil·lació |
|  |  | 12.0 Hz – 685.9 Hz | 99.8 Hz | 173.4 dB | -14.66 · **19.58 m** | empenta del so |
| 120.0° | 25.00 m | ≤ 0.005 Hz – 0.66 Hz | 0.063 Hz | 150.7 dB | -12.23 · **17.82 m** | oscil·lació |
|  |  | 12.0 Hz – 522.8 Hz | 79.2 Hz | 175.2 dB | -15.89 · **25.28 m** | empenta del so |
| 120.0° | 40.00 m | ≤ 0.005 Hz – 0.61 Hz | 0.050 Hz | 148.9 dB | -11.20 · **17.39 m** | oscil·lació |
|  |  | 12.0 Hz – 302.1 Hz | 62.9 Hz | 177.2 dB | -10.78 · **28.48 m** | empenta del so |
| 90.0° | 15.00 m | ≤ 0.005 Hz – 0.66 Hz | 0.063 Hz | 151.2 dB | -12.28 · **17.50 m** | oscil·lació |
|  |  | 12.1 Hz – 620.0 Hz | 79.2 Hz | 175.2 dB | -15.73 · **23.98 m** | empenta del so |
| 90.0° | 25.00 m | ≤ 0.005 Hz – 0.62 Hz | 0.050 Hz | 148.6 dB | -11.58 · **17.46 m** | oscil·lació |
|  |  | 12.0 Hz – 390.7 Hz | 62.9 Hz | 177.2 dB | -11.41 · **26.91 m** | empenta del so |
| 90.0° | 40.00 m | ≤ 0.005 Hz – 0.51 Hz | 0.050 Hz | 154.2 dB | -5.14 · **23.80 m** | oscil·lació |
|  |  | 12.0 Hz – 277.9 Hz | 62.9 Hz | 177.2 dB | -0.01 · **42.46 m** | empenta del so |
| 60.0° | 15.00 m | ≤ 0.005 Hz – 0.60 Hz | 0.050 Hz | 149.2 dB | -11.69 · **16.36 m** | oscil·lació |
|  |  | 12.2 Hz – 557.0 Hz | 79.2 Hz | 175.5 dB | -5.57 · **19.69 m** | empenta del so |
| 60.0° | 25.00 m | ≤ 0.005 Hz – 0.50 Hz | 0.050 Hz | 152.1 dB | -8.91 · **21.79 m** | oscil·lació |
|  |  | 12.2 Hz – 331.9 Hz | 62.9 Hz | 177.4 dB | -5.20 · **26.93 m** | empenta del so |
| 60.0° | 40.00 m | ≤ 0.005 Hz – 0.43 Hz | 0.050 Hz | 154.6 dB | -8.33 · **27.91 m** | oscil·lació |
|  |  | 11.9 Hz – 250.6 Hz | 50.0 Hz | 179.0 dB | 0.00 · **50.57 m** | empenta del so |
| 45.5° | 15.00 m | ≤ 0.005 Hz – 0.57 Hz | 0.050 Hz | 150.0 dB | -10.58 · **15.75 m** | oscil·lació |
|  |  | 12.4 Hz – 410.7 Hz | 79.2 Hz | 175.6 dB | -3.47 · **19.67 m** | empenta del so |
| 45.5° | 25.00 m | ≤ 0.005 Hz – 0.50 Hz | 0.050 Hz | 152.3 dB | -9.97 · **22.60 m** | oscil·lació |
|  |  | 12.2 Hz – 313.0 Hz | 62.9 Hz | 177.4 dB | -5.09 · **27.09 m** | empenta del so |
| 45.5° | 40.00 m | ≤ 0.005 Hz – 0.43 Hz | 0.050 Hz | 156.4 dB | -5.66 · **30.48 m** | oscil·lació |
|  |  | 11.9 Hz – 231.0 Hz | 50.0 Hz | 179.0 dB | 0.00 · **50.57 m** | empenta del so |
| 30.0° | 15.00 m | ≤ 0.005 Hz – 0.55 Hz | 0.050 Hz | 150.7 dB | -8.62 · **14.79 m** | oscil·lació |
|  |  | 12.6 Hz – 294.2 Hz | 62.9 Hz | 177.4 dB | -8.97 · **17.81 m** | empenta del so |
| 30.0° | 25.00 m | ≤ 0.005 Hz – 0.48 Hz | 0.050 Hz | 152.9 dB | -7.79 · **22.08 m** | oscil·lació |
|  |  | 12.4 Hz – 234.0 Hz | 50.0 Hz | 179.2 dB | -11.21 · **26.89 m** | empenta del so |
| 30.0° | 40.00 m | ≤ 0.005 Hz – 0.38 Hz | 0.040 Hz | 154.2 dB | -5.55 · **32.87 m** | oscil·lació |
|  |  | 11.8 Hz – 157.1 Hz | 39.7 Hz | 180.9 dB | -8.70 · **47.88 m** | empenta del so |

## 3. Alçada de les fonts sobre l'aigua (separació 69.20 m, 199.1 Hz)

| alçada fonts | nivell mínim | on neix x · **alçada** |
|---|---|---|
| 0.50 m | 169.4 dB | 28.61 · **15.44 m** |
| 2.00 m | 168.1 dB | -5.86 · **15.72 m** |
| 5.00 m | 168.4 dB | -8.53 · **16.60 m** |
| 10.00 m | 168.6 dB | 17.39 · **32.82 m** |
| 20.00 m | 168.7 dB | 16.80 · **37.83 m** |

## 4. Desfasament S₁→S₂ (199.1 Hz, 69.20 m): sentit i període de gir

| φ | nivell mínim | sentit dels nodes | 1 volta |
|---|---|---|---|
| 0.0° | 168.4 dB | ↺ antihorari | 57.3 s |
| -45.0° | 168.4 dB | ↺ antihorari | 54.1 s |
| -90.0° | 168.4 dB | ↺ antihorari | 55.3 s |
| -135.0° | 168.4 dB | ↻ horari | 1.0 min |
| 180.0° | 168.4 dB | ↻ horari | 54.9 s |
| 90.0° | 168.4 dB | ↻ horari | 57.6 s |

## 5. Què porta l'aire: nivell mínim i electricitat estàtica als 3 min (0.07 Hz i 199.1 Hz)

| contingut | 0.07 Hz: nivell · camp | 199.1 Hz: nivell · camp | espurnes? |
|---|---|---|---|
| aire net | 151.5 dB · 0.0 V/m | 168.4 dB · 0.0 V/m | no (per sota de 2.86 MV/m) |
| fum 500 mg/m³ | 151.5 dB · 2.0 kV/m | 168.4 dB · 2.7 kV/m | no (per sota de 2.86 MV/m) |
| fum 3600 mg/m³ | 151.5 dB · 103.3 kV/m | 168.4 dB · 139.4 kV/m | no (per sota de 2.86 MV/m) |
| boira 5000 mg/m³ | 151.5 dB · 1.99 MV/m | 168.4 dB · 2.70 MV/m | no (per sota de 2.86 MV/m) |
| aire +10.0 °C | 147.9 dB · 0.0 V/m | 151.8 dB · 0.0 V/m | no (per sota de 2.86 MV/m) |

## 6. Soroll de les línies (efecte corona, fórmula BPA amb pluja)

| línia | gradient al conductor | corona | soroll a 1 m | a 900 m |
|---|---|---|---|---|
| MT 25 kV (Segre) | 1.9 kV/cm | no | — | — |
| MT 66 kV | 5.1 kV/cm | no | — | — |
| AT 132 kV | 10.2 kV/cm | no | — | — |
| MAT 400 kV, un conductor | 32.5 kV/cm | sí | 135.1 dB(A) * | 101.4 dB(A) |

\* fora del rang de validesa de la fórmula (10–25 kV/cm): orientatiu.

## Resum: valors probables que formen el toroide (🟢 i 🟠)

| separació | freqüència | nivell mínim | alçada on neix (al llindar · +6.0 dB) | via | 1 volta | emissor |
|---|---|---|---|---|---|---|
| 10.00 m | 629.5 Hz | 160.1 dB | **13.38 m** · 12.00 m | empenta del so (amb xoc) | 39.2 s | 🟢 assolible |
| 27.50 m | 2.0032 kHz | 162.7 dB | **12.51 m** · 12.51 m | empenta del so (amb xoc) | 1.0 min | 🟢 assolible |
| 27.50 m | 397.2 Hz | 163.0 dB | **18.65 m** · 12.61 m | empenta del so (amb xoc) | 1.2 min | 🟢 assolible |
| 100.00 m | 314.9 Hz | 166.4 dB | **19.35 m** · 21.27 m | empenta del so (amb xoc) | 1.0 min | 🟢 assolible |
| 50.00 m | 199.1 Hz | 168.0 dB | **25.44 m** · 15.91 m | empenta del so (amb xoc) | 1.1 min | 🟢 assolible |
| 69.20 m | 199.1 Hz | 168.4 dB | **16.60 m** · 21.87 m | empenta del so (amb xoc) | 55.3 s | 🟢 assolible |
| 100.00 m | 397.2 Hz | 173.3 dB | **21.77 m** · 21.77 m | empenta del so (amb xoc) | 1.1 min | 🟠 extrem |
| 100.00 m | 99.8 Hz | 173.5 dB | **29.91 m** · 27.94 m | empenta del so (amb xoc) | 1.1 min | 🟠 extrem |
| 10.00 m | 99.8 Hz | 175.8 dB | **12.00 m** · 12.00 m | empenta del so | 42.5 s | 🟠 extrem |
| 27.50 m | 79.2 Hz | 176.1 dB | **14.48 m** · 12.01 m | empenta del so (amb xoc) | 13.6 s | 🟠 extrem |
| 69.20 m | 50.0 Hz | 178.8 dB | **40.73 m** · 29.87 m | empenta del so (amb xoc) | 51.1 s | 🟠 extrem |
| 50.00 m | 50.0 Hz | 179.1 dB | **34.30 m** · 22.02 m | empenta del so (amb xoc) | 34.3 s | 🟠 extrem |
| 50.00 m | 995.9 Hz | 181.6 dB | **14.31 m** · 14.31 m | empenta del so (amb xoc) | 1.1 min | 🟠 extrem |
| 100.00 m | 31.5 Hz | 182.4 dB | **20.37 m** · 19.10 m | empenta del so (amb xoc) | 45.3 s | 🟠 extrem |
| 10.00 m | 3.8075 kHz | 182.6 dB | **12.00 m** · 12.00 m | empenta del so (amb xoc) | 1.2 min | 🟠 extrem |
| 100.00 m | 398.5 Hz | 186.3 dB | **13.45 m** · 13.45 m | empenta del so (amb xoc) | 55.6 s | 🟠 extrem |
| 10.00 m | 16.8 Hz | 191.0 dB | **12.00 m** · 12.00 m | empenta del so | 10.6 s | 🟠 extrem |
| 27.50 m | 14.3 Hz | 191.0 dB | **13.87 m** · 13.87 m | empenta del so (amb xoc) | 0.3 s | 🟠 extrem |
| 69.20 m | 11.9 Hz | 191.0 dB | **17.01 m** · 17.01 m | empenta del so (amb xoc) | 2.9 s | 🟠 extrem |
| 100.00 m | 11.2 Hz | 191.0 dB | **25.52 m** · 25.52 m | empenta del so (amb xoc) | 10.0 s | 🟠 extrem |

## Què en surt

- Configuracions que formen l'anell: 38 punts representatius; vies: oscil·lació, empenta del so.
- Nivell més baix amb un emissor possible: **160.1 dB** a 629.5 Hz amb les fonts a 10.00 m; neix a **13.38 m** d'alçada.
- Nivell més baix de tots (però 🔴 improbable pel volum d'aire): **97.7 dB** a 0.005 Hz amb les fonts a 10.00 m; neix a **12.00 m** d'alçada.
- Amb l'alçada observada (20–30 m): 50.00 m · 199.1 Hz · 168.0 dB → 25.44 m; 100.00 m · 11.2 Hz · 191.0 dB → 25.52 m; 100.00 m · 31.5 Hz · 182.4 dB → 20.37 m; 100.00 m · 99.8 Hz · 173.5 dB → 29.91 m; 100.00 m · 397.2 Hz · 173.3 dB → 21.77 m.
- **L'alçada la fixa sobretot la geometria** (separació, alçada de les fonts, feix i creuament). Just al llindar l'anell neix al primer punt on n'hi ha prou, sovint més avall i a un costat; amb uns dB més es desplaça cap al màxim de l'energia del gir (columna «+6.0 dB») i allà s'hi queda.
- **Condicions que abans faltaven:** l'anell ha de ser més fort que la turbulència (Γ/4πR > σ_w) i el corrent que el forma, més ràpid que la brisa. Sense aquestes condicions sortien anells «possibles» a 0.005 Hz amb 87 dB, que la brisa s'hauria endut.
- **La finestra dels 10–20 kHz de l'escombrat anterior era un error**: no es modelava la saturació no lineal (l'ona es converteix en dent de serra i es dissipa en el xoc). Amb el xoc inclòs, a kHz no arriba prou ona al punt de formació ni al límit físic.
- **Preu de l'infrasò:** el volum que ha de moure cada font per cicle creix com 1/f²: a 0.005–0.5 Hz són de 10⁴ a 10⁶ m³ per cicle. La física de l'anell hi funciona (fins i tot amb pocs dB a 1 m), però cap emissor conegut mou tant d'aire: tota la via de l'oscil·lació en infrasò queda com a 🔴 improbable.
- **La via probable és l'empenta del so entre ~12 Hz i uns centenars d'Hz** (fins a ~3.8 kHz amb les fonts a 10 m): l'ona arriba al punt de formació ja en xoc (dent de serra) i és justament aquesta dissipació la que empeny i fa girar l'aire. Demana 160–180 dB a 1 m per font.
- **Electricitat estàtica:** el fregament del fum o la boira dins el nucli carrega l'anell (de kV/m a ~2–2.7 MV/m amb boira densa), però per sota de la ruptura de l'aire (2.86 MV/m): no hi ha espurnes, excepte amb anells extremadament forts (27.50 m · 14.3 Hz · 191.0 dB), on el camp estimat la supera i hi hauria espetecs. Estimació d'ordre de magnitud (incerta ×10–100). El soroll del gir (Lighthill) és inaudible als valors probables.
- **Gir dels nodes (observat: 1 volta cada ~7 s):** compatible a 100.00 m · 11.2 Hz · 191.0 dB (10.0 s); als altres valors probables, el gir és d'una volta cada 14 s a ~1 min. Amb més dB (més Γ) gira més de pressa.
- **Línies de 25 kV:** el camp al conductor és molt lluny del llindar de corona: no fan soroll ni intervenen.
