# Escombrat: on, a quina alçada i amb quins valors es forma el toroide

Generat amb `node tests/escombrat.js` (mateix motor físic que el simulador). Escena del Segre: fonts a 5.00 m d'alçada sobre l'aigua, zona de formació de 20.00 m (anell de 24.00 m), fum 500 mg/m³, turbulència σ_w = 0.2 m/s, senyal sinusoïdal, φ = −90.0°, reflex de l'aigua (coeficient 1), saturació no lineal i xoc inclosos.

**Només es llisten valors que formen l'anell** amb nivell ≤ 191 dB per font (límit físic: la rarefacció arriba al buit). Precisió: distàncies al cm, freqüències a 0.1 Hz (0.01 / 0.001 Hz per sota d'1 / 0.1 Hz), nivells a 0.1 dB, angles a 0.1°. L'audibilitat no és criteri.

Condicions per formar-se (totes alhora): (1) criteri de formació —oscil·lació (Holman) o circulació sostinguda per l'empenta del so que venç la turbulència—; (2) les dues ones arriben comparables (cap per sota d'1/3 de l'altra); (3) l'anell cap per sobre de l'aigua (alçada ≥ radi).

## 1. Bandes de freqüència que formen l'anell, per separació de les fonts (feix 180.0°)

| separació | banda (≤ 191 dB) | freqüència | nivell mínim | on neix x · **alçada** | amb +6.0 dB: x · alçada | via | 1 volta (4 nodes) | volum/cicle per font | emissor | estàtica (3 min) | soroll del gir a 1 m |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 5.00 m | ≤ 0.005 Hz – 2.3 Hz | 0.005 Hz | **95.7 dB** | 0.00 · **12.00 m** | 0.00 · 12.00 m | oscil·lació | 1.1 min ↺ | 3.8·10^4 m³ | 🔴 improbable | 1.9 kV/m | -8.8 dB |
|  |  | 0.040 Hz | **122.8 dB** | 0.00 · **12.00 m** | 0.00 · 12.00 m | oscil·lació | 49.1 s ↺ | 1.4·10^4 m³ | 🔴 improbable | 1.9 kV/m | -8.7 dB |
|  |  | 0.32 Hz | **157.1 dB** | 0.00 · **12.00 m** | 0.00 · 12.00 m | oscil·lació | 8.6 s ↺ | 1.1·10^4 m³ | 🔴 improbable | 23.0 kV/m | 49.0 dB |
|  |  | 2.3 Hz | **191.0 dB** | 0.00 · **12.00 m** | 0.00 · 12.00 m | oscil·lació | 1.2 s ↺ | 1.1·10^4 m³ | 🔴 improbable | 440.5 kV/m | 117.4 dB |
| 5.00 m | 10.5 Hz – 4.6547 kHz | 10.5 Hz | **191.0 dB** | 0.00 · **12.00 m** | 0.00 · 12.00 m | empenta del so | 8.3 s ↺ | 506.0 m³ | 🟠 extrem | 1.8 kV/m | -10.6 dB |
|  |  | 79.2 Hz | **175.2 dB** | 0.00 · **12.00 m** | 0.00 · 12.00 m | empenta del so | 38.4 s ↺ | 1.4 m³ | 🟠 extrem | 1.7 kV/m | -10.7 dB |
|  |  | 629.5 Hz | **159.6 dB** | -0.15 · **19.52 m** | -0.54 · 12.00 m | empenta del so ⚠ xoc | 53.2 s ↺ | 3.8 L | 🟢 assolible | 3.2 kV/m | 3.3 dB |
|  |  | 4.6547 kHz | **183.3 dB** | 0.03 · **12.00 m** | 0.03 · 12.00 m | empenta del so ⚠ xoc | 1.3 min ↻ | 1.1 L | 🟠 extrem | 1.8 kV/m | -9.7 dB |
| 10.00 m | ≤ 0.005 Hz – 2.1 Hz | 0.005 Hz | **97.3 dB** | -2.61 · **12.01 m** | 0.00 · 12.01 m | oscil·lació | 1.2 min ↺ | 4.6·10^4 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.040 Hz | **124.4 dB** | -2.60 · **12.01 m** | 0.00 · 12.01 m | oscil·lació | 51.5 s ↺ | 1.6·10^4 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.32 Hz | **158.7 dB** | -2.63 · **12.01 m** | 0.00 · 12.01 m | oscil·lació | 8.9 s ↺ | 1.3·10^4 m³ | 🔴 improbable | 19.5 kV/m | 45.2 dB |
|  |  | 99.8 Hz | **174.3 dB** | -6.87 · **29.85 m** | 0.09 · 12.01 m | empenta del so ⚠ xoc | 32.1 s ↻ | 819.0 L | 🟠 extrem | 7.0 kV/m | 21.4 dB |
|  |  | 629.5 Hz | **159.5 dB** | 0.00 · **19.55 m** | -0.67 · 12.01 m | empenta del so ⚠ xoc | 1.1 min ↺ | 3.7 L | 🟢 assolible | 2.3 kV/m | -4.7 dB |
|  |  | 3.8075 kHz | **182.6 dB** | 3.94 · **12.01 m** | -3.94 · 12.01 m | empenta del so ⚠ xoc | 1.3 min ↺ | 1.5 L | 🟠 extrem | 1.8 kV/m | -10.6 dB |
| 20.00 m | ≤ 0.005 Hz – 1.6 Hz | 0.005 Hz | **101.9 dB** | -3.42 · **12.00 m** | 0.00 · 12.01 m | oscil·lació | 1.2 min ↺ | 7.8·10^4 m³ | 🔴 improbable | 1.6 kV/m | -12.6 dB |
|  |  | 0.032 Hz | **126.1 dB** | -3.41 · **12.00 m** | 0.00 · 12.01 m | oscil·lació | 54.3 s ↺ | 3.1·10^4 m³ | 🔴 improbable | 1.6 kV/m | -12.6 dB |
|  |  | 0.25 Hz | **159.0 dB** | -3.44 · **12.00 m** | 0.00 · 12.01 m | oscil·lació | 11.6 s ↺ | 2.2·10^4 m³ | 🔴 improbable | 13.5 kV/m | 36.7 dB |
|  |  | 1.6 Hz | **190.9 dB** | -3.45 · **12.00 m** | -3.36 · 12.00 m | oscil·lació | 1.8 s ↺ | 2.2·10^4 m³ | 🔴 improbable | 218.3 kV/m | 101.2 dB |
|  |  | 79.2 Hz | **175.4 dB** | -13.06 · **43.99 m** | 0.00 · 13.90 m | empenta del so ⚠ xoc | 1.1 min ↻ | 1.5 m³ | 🟠 extrem | 2.2 kV/m | -5.2 dB |
|  |  | 397.2 Hz | **163.0 dB** | 0.00 · **21.66 m** | 1.45 · 12.02 m | empenta del so ⚠ xoc | 57.1 s ↺ | 14.1 L | 🟢 assolible | 2.6 kV/m | -1.5 dB |
|  |  | 2.4305 kHz | **153.6 dB** | -8.75 · **12.65 m** | -6.88 · 12.80 m | empenta del so ⚠ xoc | 1.4 min ↻ | 0.1 L | 🟢 assolible | 1.6 kV/m | -12.6 dB |
| 27.50 m | ≤ 0.005 Hz – 1.2 Hz | 0.005 Hz | **106.4 dB** | -2.84 · **12.00 m** | 0.00 · 12.13 m | oscil·lació | 1.1 min ↺ | 1.3·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.032 Hz | **130.7 dB** | -2.73 · **12.03 m** | 0.00 · 12.13 m | oscil·lació | 52.3 s ↺ | 5.3·10^4 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.20 Hz | **159.6 dB** | -3.02 · **12.17 m** | 0.00 · 12.14 m | oscil·lació | 13.9 s ↺ | 3.8·10^4 m³ | 🔴 improbable | 9.6 kV/m | 28.8 dB |
|  |  | 1.2 Hz | **190.4 dB** | -2.88 · **12.09 m** | -2.02 · 12.00 m | oscil·lació | 2.3 s ↺ | 3.6·10^4 m³ | 🔴 improbable | 141.5 kV/m | 91.1 dB |
| 27.50 m | 12.2 Hz – 2.0032 kHz | 12.2 Hz | **191.0 dB** | -17.32 · **64.12 m** | -17.32 · 64.12 m | empenta del so ⚠ xoc | 10.7 s ↻ | 374.8 m³ | 🟠 extrem | 36.2 kV/m | 59.5 dB |
|  |  | 62.9 Hz | **177.0 dB** | 0.37 · **60.86 m** | -7.49 · 13.66 m | empenta del so ⚠ xoc | 1.2 min ↺ | 2.8 m³ | 🟠 extrem | 1.8 kV/m | -10.3 dB |
|  |  | 397.2 Hz | **163.0 dB** | -2.11 · **16.24 m** | -1.70 · 12.61 m | empenta del so ⚠ xoc | 1.2 min ↻ | 14.1 L | 🟢 assolible | 1.8 kV/m | -10.0 dB |
|  |  | 2.0032 kHz | **162.7 dB** | -8.17 · **13.23 m** | -8.24 · 13.27 m | empenta del so ⚠ xoc | 1.3 min ↻ | 0.5 L | 🟢 assolible | 1.9 kV/m | -9.0 dB |
| 40.00 m | ≤ 0.005 Hz – 1.0 Hz | 0.005 Hz | **110.1 dB** | -5.24 · **13.16 m** | 0.00 · 14.47 m | oscil·lació | 1.2 min ↺ | 2.0·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.032 Hz | **134.3 dB** | -5.14 · **13.06 m** | 0.00 · 14.47 m | oscil·lació | 56.1 s ↺ | 8.0·10^4 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.20 Hz | **163.3 dB** | -5.47 · **13.39 m** | 0.00 · 14.49 m | oscil·lació | 15.1 s ↺ | 5.7·10^4 m³ | 🔴 improbable | 9.6 kV/m | 28.9 dB |
|  |  | 1.0 Hz | **190.9 dB** | -4.98 · **13.04 m** | -4.86 · 13.09 m | oscil·lació | 2.9 s ↺ | 5.5·10^4 m³ | 🔴 improbable | 107.7 kV/m | 84.8 dB |
|  |  | 50.0 Hz | **178.8 dB** | -27.80 · **48.55 m** | 0.00 · 18.31 m | empenta del so ⚠ xoc | 1.0 min ↺ | 5.5 m³ | 🟠 extrem | 2.2 kV/m | -4.9 dB |
|  |  | 250.6 Hz | **166.5 dB** | 0.06 · **19.96 m** | 0.00 · 13.99 m | empenta del so ⚠ xoc | 48.9 s ↺ | 52.9 L | 🟢 assolible | 3.2 kV/m | 3.3 dB |
|  |  | 1.0912 kHz | **164.6 dB** | -10.11 · **14.06 m** | -10.11 · 14.06 m | empenta del so ⚠ xoc | 59.8 s ↺ | 2.2 L | 🟢 assolible | 2.6 kV/m | -1.5 dB |
| 50.00 m | ≤ 0.005 Hz – 0.83 Hz | 0.005 Hz | **113.7 dB** | -6.00 · **15.42 m** | 0.00 · 16.49 m | oscil·lació | 1.2 min ↺ | 3.0·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.025 Hz | **134.7 dB** | -5.37 · **14.79 m** | 0.00 · 16.49 m | oscil·lació | 57.3 s ↺ | 1.4·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.16 Hz | **163.1 dB** | -5.15 · **14.57 m** | 0.00 · 16.50 m | oscil·lació | 18.3 s ↺ | 8.8·10^4 m³ | 🔴 improbable | 6.9 kV/m | 21.1 dB |
| 50.00 m | 11.0 Hz – 995.9 Hz | 11.0 Hz | **191.0 dB** | -37.62 · **107.88 m** | -37.62 · 107.88 m | empenta del so ⚠ xoc | 44.6 s ↻ | 461.1 m³ | 🟠 extrem | 3.4 kV/m | 4.9 dB |
|  |  | 50.0 Hz | **179.0 dB** | -22.13 · **37.44 m** | 0.00 · 22.02 m | empenta del so ⚠ xoc | 38.3 s ↻ | 5.6 m³ | 🟠 extrem | 4.6 kV/m | 11.5 dB |
|  |  | 199.1 Hz | **168.0 dB** | 0.00 · **25.44 m** | 0.00 · 15.92 m | empenta del so ⚠ xoc | 1.1 min ↺ | 99.6 L | 🟢 assolible | 2.0 kV/m | -7.5 dB |
|  |  | 995.9 Hz | **181.6 dB** | -14.77 · **16.88 m** | -14.77 · 16.88 m | empenta del so ⚠ xoc | 1.2 min ↺ | 19.1 L | 🟠 extrem | 1.9 kV/m | -8.2 dB |
| 66.00 m | ≤ 0.005 Hz – 0.75 Hz | 0.005 Hz | **115.6 dB** | -11.33 · **16.77 m** | 0.00 · 20.03 m | oscil·lació | 1.2 min ↺ | 3.8·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.025 Hz | **136.6 dB** | -11.27 · **16.77 m** | 0.00 · 20.03 m | oscil·lació | 1.0 min ↺ | 1.7·10^5 m³ | 🔴 improbable | 1.6 kV/m | -12.7 dB |
|  |  | 0.13 Hz | **161.3 dB** | -11.50 · **16.83 m** | 0.00 · 20.07 m | oscil·lació | 25.6 s ↺ | 1.1·10^5 m³ | 🔴 improbable | 5.0 kV/m | 13.9 dB |
|  |  | 50.0 Hz | **178.7 dB** | 23.82 · **43.85 m** | 0.00 · 28.33 m | empenta del so ⚠ xoc | 1.0 min ↺ | 5.4 m³ | 🟠 extrem | 1.9 kV/m | -9.1 dB |
|  |  | 199.1 Hz | **168.4 dB** | 16.40 · **30.15 m** | 0.00 · 20.85 m | empenta del so ⚠ xoc | 1.4 min ↻ | 104.3 L | 🟢 assolible | 1.6 kV/m | -12.7 dB |
|  |  | 664.3 Hz | **161.3 dB** | 19.99 · **14.58 m** | 19.89 · 14.59 m | empenta del so ⚠ xoc | 1.2 min ↺ | 4.1 L | 🟢 assolible | 2.1 kV/m | -6.5 dB |

No es forma (amb cap nivell ≤ 191 dB) fora de les bandes llistades. «≤ 0.005 Hz»: la banda continua per sota (límit de l'escombrat).

Emissor: 🟢 assolible = ≤ 170.0 dB a 1 m i ≤ 10 m³ per cicle (sirenes i pistons molt grans) · 🟠 extrem = fins al límit físic i ≤ 1000 m³ (només explosions o motors de coet) · 🔴 improbable = cal moure més de 1000 m³ d'aire per cicle (cap emissor conegut). En infrasò, el nivell en dB a 1 m enganya: el que costa és el volum d'aire que s'ha de moure.

### Per què no es forma fora de les bandes (separació 66.00 m, al límit de 191 dB, al punt més favorable)

| freqüència | motiu |
|---|---|
| 1.0 Hz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 3.4e-1 m²/s) no venç la turbulència |
| 3.5 Hz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 5.3e-1 m²/s) no venç la turbulència |
| 7.0 Hz | al punt més favorable sí, però les dues ones no hi arriben comparables o l'anell no hi cap per sobre de l'aigua |
| 1.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 2.4e+0 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |
| 2.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 7.7e-1 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |
| 5.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 1.1e-1 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |
| 10.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 2.6e-2 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |
| 20.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 7.9e-4 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |
| 40.0000 kHz | l'aire oscil·la massa poc (criteri de Holman) i l'empenta del so (Γ = 9.9e-8 m²/s) no venç la turbulència · l'ona fa xoc abans d'arribar-hi |

## 2. Obertura del feix i alçada on es creuen (separació 66.00 m)

| feix | creuament | banda | freqüència | nivell mínim | on neix x · **alçada** | via |
|---|---|---|---|---|---|---|
| 180.0° | 25.00 m | ≤ 0.005 Hz – 0.75 Hz | 0.063 Hz | 148.8 dB | -11.43 · **16.93 m** | oscil·lació |
|  |  | 10.7 Hz – 664.3 Hz | 99.8 Hz | 173.3 dB | -15.09 · **18.66 m** | empenta del so |
| 120.0° | 15.00 m | ≤ 0.005 Hz – 0.73 Hz | 0.063 Hz | 149.2 dB | -11.72 · **16.59 m** | oscil·lació |
|  |  | 10.9 Hz – 688.4 Hz | 99.8 Hz | 173.3 dB | -15.13 · **18.53 m** | empenta del so |
| 120.0° | 25.00 m | ≤ 0.005 Hz – 0.69 Hz | 0.063 Hz | 150.0 dB | -11.56 · **17.12 m** | oscil·lació |
|  |  | 10.9 Hz – 664.2 Hz | 99.8 Hz | 173.5 dB | -0.72 · **31.00 m** | empenta del so |
| 120.0° | 40.00 m | ≤ 0.005 Hz – 0.63 Hz | 0.063 Hz | 151.4 dB | -10.52 · **16.35 m** | oscil·lació |
|  |  | 10.7 Hz – 389.9 Hz | 62.9 Hz | 177.2 dB | 12.47 · **28.31 m** | empenta del so |
|  |  | 497.2 Hz – 504.9 Hz | 500.0 Hz | 174.1 dB | 15.96 · **14.51 m** | empenta del so |
| 90.0° | 15.00 m | ≤ 0.005 Hz – 0.69 Hz | 0.063 Hz | 150.1 dB | -10.92 · **15.67 m** | oscil·lació |
|  |  | 11.3 Hz – 725.9 Hz | 99.8 Hz | 173.5 dB | -13.50 · **18.17 m** | empenta del so |
| 90.0° | 25.00 m | ≤ 0.005 Hz – 0.65 Hz | 0.063 Hz | 151.0 dB | -10.72 · **16.19 m** | oscil·lació |
|  |  | 11.0 Hz – 507.1 Hz | 79.2 Hz | 175.4 dB | -12.91 · **23.62 m** | empenta del so |
| 90.0° | 40.00 m | ≤ 0.005 Hz – 0.53 Hz | 0.050 Hz | 151.3 dB | -9.46 · **21.81 m** | oscil·lació |
|  |  | 10.7 Hz – 304.5 Hz | 62.9 Hz | 177.1 dB | 0.00 · **47.94 m** | empenta del so |
| 60.0° | 15.00 m | ≤ 0.005 Hz – 0.63 Hz | 0.063 Hz | 151.5 dB | -10.75 · **15.50 m** | oscil·lació |
|  |  | 12.2 Hz – 560.9 Hz | 79.2 Hz | 175.4 dB | -11.14 · **20.23 m** | empenta del so |
| 60.0° | 25.00 m | ≤ 0.005 Hz – 0.53 Hz | 0.050 Hz | 151.1 dB | -9.15 · **21.24 m** | oscil·lació |
|  |  | 11.5 Hz – 361.4 Hz | 62.9 Hz | 177.3 dB | -9.92 · **26.61 m** | empenta del so |
| 60.0° | 40.00 m | ≤ 0.005 Hz – 0.46 Hz | 0.050 Hz | 153.8 dB | -8.38 · **27.28 m** | oscil·lació |
|  |  | 10.9 Hz – 267.0 Hz | 62.9 Hz | 177.1 dB | 0.00 · **47.94 m** | empenta del so |
| 45.5° | 15.00 m | ≤ 0.005 Hz – 0.61 Hz | 0.050 Hz | 148.9 dB | -10.41 · **15.16 m** | oscil·lació |
|  |  | 12.5 Hz – 445.4 Hz | 79.2 Hz | 175.6 dB | -5.38 · **19.25 m** | empenta del so |
| 45.5° | 25.00 m | ≤ 0.005 Hz – 0.53 Hz | 0.050 Hz | 151.3 dB | -10.30 · **22.12 m** | oscil·lació |
|  |  | 12.0 Hz – 332.6 Hz | 62.9 Hz | 177.3 dB | -9.92 · **26.61 m** | empenta del so |
| 45.5° | 40.00 m | ≤ 0.005 Hz – 0.40 Hz | 0.050 Hz | 155.9 dB | -4.95 · **29.11 m** | oscil·lació |
|  |  | 11.3 Hz – 225.3 Hz | 50.0 Hz | 179.0 dB | 0.00 · **51.75 m** | empenta del so |
| 30.0° | 15.00 m | ≤ 0.005 Hz – 0.59 Hz | 0.050 Hz | 149.5 dB | -9.62 · **14.65 m** | oscil·lació |
|  |  | 12.7 Hz – 354.3 Hz | 79.2 Hz | 175.7 dB | -2.98 · **18.11 m** | empenta del so |
| 30.0° | 25.00 m | ≤ 0.005 Hz – 0.48 Hz | 0.050 Hz | 153.1 dB | -6.16 · **22.96 m** | oscil·lació |
|  |  | 12.5 Hz – 271.6 Hz | 62.9 Hz | 177.4 dB | -6.73 · **26.94 m** | empenta del so |
| 30.0° | 40.00 m | ≤ 0.005 Hz – 0.39 Hz | 0.040 Hz | 153.7 dB | -4.95 · **31.52 m** | oscil·lació |
|  |  | 11.8 Hz – 163.3 Hz | 50.0 Hz | 179.2 dB | -3.54 · **40.26 m** | empenta del so |

## 3. Alçada de les fonts sobre l'aigua (separació 66.00 m, 199.1 Hz)

| alçada fonts | nivell mínim | on neix x · **alçada** |
|---|---|---|
| 0.50 m | 169.1 dB | 17.26 · **12.12 m** |
| 2.00 m | 168.2 dB | 15.70 · **25.31 m** |
| 5.00 m | 168.4 dB | 16.40 · **30.15 m** |
| 10.00 m | 168.6 dB | -4.97 · **22.99 m** |
| 20.00 m | 168.7 dB | 16.15 · **36.35 m** |

## 4. Desfasament S₁→S₂ (199.1 Hz, 66.00 m): sentit i període de gir

| φ | nivell mínim | sentit dels nodes | 1 volta |
|---|---|---|---|
| 0.0° | 168.4 dB | ↻ horari | 1.2 min |
| -45.0° | 168.4 dB | ↻ horari | 1.3 min |
| -90.0° | 168.4 dB | ↻ horari | 1.4 min |
| -135.0° | 168.4 dB | ↺ antihorari | 1.3 min |
| 180.0° | 168.4 dB | ↺ antihorari | 1.2 min |
| 90.0° | 168.4 dB | ↺ antihorari | 1.3 min |

## 5. Què porta l'aire: nivell mínim i electricitat estàtica als 3 min (0.07 Hz i 199.1 Hz)

| contingut | 0.07 Hz: nivell · camp | 199.1 Hz: nivell · camp | espurnes? |
|---|---|---|---|
| aire net | 150.6 dB · 0.0 V/m | 168.5 dB · 0.0 V/m | no (per sota de 2.86 MV/m) |
| fum 500 mg/m³ | 150.6 dB · 2.0 kV/m | 168.4 dB · 1.6 kV/m | no (per sota de 2.86 MV/m) |
| fum 3600 mg/m³ | 150.6 dB · 103.5 kV/m | 168.4 dB · 83.3 kV/m | no (per sota de 2.86 MV/m) |
| boira 5000 mg/m³ | 150.6 dB · 2.00 MV/m | 168.4 dB · 1.61 MV/m | no (per sota de 2.86 MV/m) |
| aire +10.0 °C | 147.0 dB · 0.0 V/m | 151.5 dB · 0.0 V/m | no (per sota de 2.86 MV/m) |

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
| 20.00 m | 2.4305 kHz | 153.6 dB | **12.65 m** · 12.80 m | empenta del so (amb xoc) | 1.4 min | 🟢 assolible |
| 10.00 m | 629.5 Hz | 159.5 dB | **19.55 m** · 12.01 m | empenta del so (amb xoc) | 1.1 min | 🟢 assolible |
| 5.00 m | 629.5 Hz | 159.6 dB | **19.52 m** · 12.00 m | empenta del so (amb xoc) | 53.2 s | 🟢 assolible |
| 66.00 m | 664.3 Hz | 161.3 dB | **14.58 m** · 14.59 m | empenta del so (amb xoc) | 1.2 min | 🟢 assolible |
| 27.50 m | 2.0032 kHz | 162.7 dB | **13.23 m** · 13.27 m | empenta del so (amb xoc) | 1.3 min | 🟢 assolible |
| 20.00 m | 397.2 Hz | 163.0 dB | **21.66 m** · 12.02 m | empenta del so (amb xoc) | 57.1 s | 🟢 assolible |
| 27.50 m | 397.2 Hz | 163.0 dB | **16.24 m** · 12.61 m | empenta del so (amb xoc) | 1.2 min | 🟢 assolible |
| 40.00 m | 1.0912 kHz | 164.6 dB | **14.06 m** · 14.06 m | empenta del so (amb xoc) | 59.8 s | 🟢 assolible |
| 40.00 m | 250.6 Hz | 166.5 dB | **19.96 m** · 13.99 m | empenta del so (amb xoc) | 48.9 s | 🟢 assolible |
| 50.00 m | 199.1 Hz | 168.0 dB | **25.44 m** · 15.92 m | empenta del so (amb xoc) | 1.1 min | 🟢 assolible |
| 66.00 m | 199.1 Hz | 168.4 dB | **30.15 m** · 20.85 m | empenta del so (amb xoc) | 1.4 min | 🟢 assolible |
| 10.00 m | 99.8 Hz | 174.3 dB | **29.85 m** · 12.01 m | empenta del so (amb xoc) | 32.1 s | 🟠 extrem |
| 5.00 m | 79.2 Hz | 175.2 dB | **12.00 m** · 12.00 m | empenta del so | 38.4 s | 🟠 extrem |
| 20.00 m | 79.2 Hz | 175.4 dB | **43.99 m** · 13.90 m | empenta del so (amb xoc) | 1.1 min | 🟠 extrem |
| 27.50 m | 62.9 Hz | 177.0 dB | **60.86 m** · 13.66 m | empenta del so (amb xoc) | 1.2 min | 🟠 extrem |
| 66.00 m | 50.0 Hz | 178.7 dB | **43.85 m** · 28.33 m | empenta del so (amb xoc) | 1.0 min | 🟠 extrem |
| 40.00 m | 50.0 Hz | 178.8 dB | **48.55 m** · 18.31 m | empenta del so (amb xoc) | 1.0 min | 🟠 extrem |
| 50.00 m | 50.0 Hz | 179.0 dB | **37.44 m** · 22.02 m | empenta del so (amb xoc) | 38.3 s | 🟠 extrem |
| 50.00 m | 995.9 Hz | 181.6 dB | **16.88 m** · 16.88 m | empenta del so (amb xoc) | 1.2 min | 🟠 extrem |
| 10.00 m | 3.8075 kHz | 182.6 dB | **12.01 m** · 12.01 m | empenta del so (amb xoc) | 1.3 min | 🟠 extrem |
| 5.00 m | 4.6547 kHz | 183.3 dB | **12.00 m** · 12.00 m | empenta del so (amb xoc) | 1.3 min | 🟠 extrem |
| 5.00 m | 10.5 Hz | 191.0 dB | **12.00 m** · 12.00 m | empenta del so | 8.3 s | 🟠 extrem |
| 27.50 m | 12.2 Hz | 191.0 dB | **64.12 m** · 64.12 m | empenta del so (amb xoc) | 10.7 s | 🟠 extrem |
| 50.00 m | 11.0 Hz | 191.0 dB | **107.88 m** · 107.88 m | empenta del so (amb xoc) | 44.6 s | 🟠 extrem |

## Què en surt

- Configuracions que formen l'anell: 49 punts representatius; vies: oscil·lació, empenta del so.
- Nivell més baix amb un emissor possible: **153.6 dB** a 2.4305 kHz amb les fonts a 20.00 m; neix a **12.65 m** d'alçada.
- Nivell més baix de tots (però 🔴 improbable pel volum d'aire): **95.7 dB** a 0.005 Hz amb les fonts a 5.00 m; neix a **12.00 m** d'alçada.
- Amb l'alçada observada (20–30 m): 10.00 m · 99.8 Hz · 174.3 dB → 29.85 m; 20.00 m · 397.2 Hz · 163.0 dB → 21.66 m; 50.00 m · 199.1 Hz · 168.0 dB → 25.44 m.
- **L'alçada la fixa sobretot la geometria** (separació, alçada de les fonts, feix i creuament). Just al llindar l'anell neix al primer punt on n'hi ha prou, sovint més avall i a un costat; amb uns dB més es desplaça cap al màxim de l'energia del gir (columna «+6.0 dB») i allà s'hi queda.
- **Condicions que abans faltaven:** l'anell ha de ser més fort que la turbulència (Γ/4πR > σ_w) i el corrent que el forma, més ràpid que la brisa. Sense aquestes condicions sortien anells «possibles» a 0.005 Hz amb 87 dB, que la brisa s'hauria endut.
- **La finestra dels 10–20 kHz de l'escombrat anterior era un error**: no es modelava la saturació no lineal (l'ona es converteix en dent de serra i es dissipa en el xoc). Amb el xoc inclòs, a kHz no arriba prou ona al punt de formació ni al límit físic.
- **Preu de l'infrasò:** el volum que ha de moure cada font per cicle creix com 1/f²: a 0.005–0.5 Hz són de 10⁴ a 10⁶ m³ per cicle. La física de l'anell hi funciona (fins i tot amb pocs dB a 1 m), però cap emissor conegut mou tant d'aire: tota la via de l'oscil·lació en infrasò queda com a 🔴 improbable.
- **La via probable és l'empenta del so entre ~12 Hz i uns centenars d'Hz** (fins a ~3.8 kHz amb les fonts a 10 m): l'ona arriba al punt de formació ja en xoc (dent de serra) i és justament aquesta dissipació la que empeny i fa girar l'aire. Demana 160–180 dB a 1 m per font.
- **Electricitat estàtica:** el fregament del fum o la boira dins el nucli carrega l'anell (de kV/m a ~2–2.7 MV/m amb boira densa), però per sota de la ruptura de l'aire (2.86 MV/m): no hi ha espurnes. Estimació d'ordre de magnitud (incerta ×10–100). El soroll del gir (Lighthill) és inaudible als valors probables.
- **Gir dels nodes (observat: 1 volta cada ~7 s):** compatible a 5.00 m · 10.5 Hz · 191.0 dB (8.3 s); als altres valors probables, el gir és d'una volta cada 14 s a ~1 min. Amb més dB (més Γ) gira més de pressa.
- **Línies de 25 kV:** el camp al conductor és molt lluny del llindar de corona: no fan soroll ni intervenen.
