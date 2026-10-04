# Escombrat: on i amb quines freqüències es formaria el toroide

Generat amb `node tests/escombrat.js` (mateix motor físic que el simulador). Escena del Segre: fonts a 5 m d'alçada, separades 69.2 m, zona de formació de 20 m, fum (500 mg/m³), turbulència σ_w = 0.2 m/s, testimoni a 900 m. Si no es diu el contrari: **senyal sinusoïdal**, φ = −90° (gir ↺), feix de 180° (altaveu convencional) creuant-se a 25 m, i **reflex del so a l'aigua** (font imatge sota la superfície, coeficient 1).

Límit físic del nivell (la rarefacció arriba al buit): **191 dB**. Per sobre, la configuració és impossible.

## 1. Nivell mínim per formar l'anell, segons la freqüència i la forma del senyal

| freqüència | **sinusoïdal**: nivell mínim | via | on neix (x, h) | Γ (m²/s) | avança | 1 volta | quadrada (N = 9) | triangular | so al testimoni (sinus) | xoc abans d'arribar |
|---|---|---|---|---|---|---|---|---|---|---|
| 0.02 Hz | **128.6 dB** | oscil·lació | (-10.8, 12.8) m | 11.2 | 0.29 m/s | 2.7 min ↺ | 129.4 | 128.6 | 71 dB (per sota del llindar) | no |
| 0.07 Hz | **150.3 dB** | oscil·lació | (-10.8, 12.8) m | 39.2 | 1.03 m/s | 46.5 s ↺ | 151.1 | 150.4 | 93 dB (per sota del llindar) | no |
| 0.5 Hz | **184.2 dB** | oscil·lació | (-10.8, 12.8) m | 281.8 | 7.38 m/s | 6.4 s ↺ | 185.0 | 184.2 | 127 dB (per sota del llindar) | no |
| 3.57 Hz | ~~206.2~~ impossible | empenta del so | (-21.6, 19.0) m | 30.5 | 0.80 m/s | 7.1 s ↻ | ~~199.6~~ ♪ | ~~205.8~~ ♪ | 149 dB (se sentiria, infrasò) | ⚠ a 3.0 m |
| 13.7 Hz | ~~196.5~~ impossible | empenta del so | (-30.3, 15.9) m | 31.1 | 0.82 m/s | 10.7 s ↺ | 188.9 ♪ | ~~196.0~~ ♪ | 139 dB (se sentiria, infrasò) | ⚠ a 2.4 m |
| 50 Hz | **189.4 dB** | empenta del so | (-8.7, 25.2) m | 30.3 | 0.79 m/s | 24.9 s ↺ | 183.1 ♪ | 188.9 ♪ | 132 dB (se sentiria) | ⚠ a 1.5 m |
| 200 Hz | **174.8 dB** | empenta del so | (-36.8, 12.8) m | 32.2 | 0.84 m/s | 1.2 min ↺ | 171.9 ♪ | 174.6 ♪ | 117 dB (se sentiria) | ⚠ a 2.0 m |
| 1 kHz | **167.1 dB** | empenta del so | (-23.8, 12.8) m | 33.9 | 0.89 m/s | 1.2 min ↻ | 164.5 ♪ | 167.0 ♪ | 104 dB (se sentiria) | ⚠ a 97 cm |
| 2 kHz | **163.3 dB** | empenta del so | (-19.5, 12.8) m | 34.0 | 0.89 m/s | 1.2 min ↻ | 161.1 ♪ | 163.1 ♪ | 96 dB (se sentiria) | ⚠ a 75 cm |
| 5 kHz | **160.4 dB** | empenta del so | (-26.0, 15.9) m | 34.0 | 0.89 m/s | 1.2 min ↻ | 159.6 ♪ | 160.2 ♪ | 70 dB (se sentiria) | ⚠ a 42 cm |
| 10 kHz | **159.4 dB** | empenta del so | (-10.8, 12.8) m | 33.9 | 0.89 m/s | 1.3 min ↺ | 160.1 | 159.4 | absorbit pel camí  | ⚠ a 24 cm |
| 20 kHz | **169.4 dB** | empenta del so | (-4.3, 15.9) m | 32.3 | 0.85 m/s | 1.3 min ↻ | 170.2 | 169.5 | absorbit pel camí  | ⚠ a 4 cm |
| 40 kHz | ~~203.8~~ impossible | empenta del so | (-2.2, 12.8) m | 34.0 | 0.89 m/s | 1.3 min ↺ | ~~204.6~~ | ~~203.9~~ | absorbit pel camí  | ⚠ a 0 cm |

## 2. Mapa freqüència × nivell (sinus)

O = es forma per oscil·lació de l'aire · E = es forma per l'empenta estable del so · — = no es forma · ♪ = audible al testimoni · entre parèntesis, l'alçada on neix

| freqüència | 130 dB | 140 dB | 150 dB | 160 dB | 170 dB | 180 dB | 190 dB |
|---|---|---|---|---|---|---|---|
| 0.02 Hz | O (16 m) | O (21 m) | O (21 m) | O (21 m) | O (21 m) | O (21 m) | O (21 m) |
| 0.07 Hz | — | — | — | O (21 m) | O (21 m) | O (21 m) | O (21 m) |
| 0.5 Hz | — | — | — | — | — | — | O (21 m) |
| 3.57 Hz | — | — | — | — | — | — | — |
| 13.7 Hz | — | — | — | — | — | — | — |
| 50 Hz | — ♪ | — ♪ | — ♪ | — ♪ | — ♪ | — ♪ | E (25 m) ♪ |
| 200 Hz | — ♪ | — ♪ | — ♪ | — ♪ | — ♪ | E (22 m) ♪ | E (22 m) ♪ |
| 1 kHz | — ♪ | — ♪ | — ♪ | — ♪ | E (19 m) ♪ | E (31 m) ♪ | E (31 m) ♪ |
| 2 kHz | — ♪ | — ♪ | — ♪ | — ♪ | E (31 m) ♪ | E (31 m) ♪ | E (31 m) ♪ |
| 5 kHz | — ♪ | — ♪ | — ♪ | — ♪ | E (23 m) ♪ | E (23 m) ♪ | E (23 m) ♪ |
| 10 kHz | — | — | — | E (13 m) | E (22 m) | E (22 m) | E (22 m) ♪ |
| 20 kHz | — | — | — | — | E (16 m) | E (16 m) | E (16 m) |
| 40 kHz | — | — | — | — | — | — | — |

## 3. Separació de les fonts (sinus)

| separació | f | nivell mínim | on neix (x, h) | via |
|---|---|---|---|---|
| 10 m | 0.07 Hz | 132.0 | (-3.1, 12.2) m | oscil·lació |
| 10 m | 5 kHz | 152.2 | (0.0, 12.2) m | empenta del so |
| 30 m | 0.07 Hz | 140.9 | (-4.7, 12.1) m | oscil·lació |
| 30 m | 5 kHz | 154.0 | (-12.2, 12.1) m | empenta del so |
| 69.2 m | 0.07 Hz | 150.3 | (-10.8, 12.8) m | oscil·lació |
| 69.2 m | 5 kHz | 160.4 | (-26.0, 15.9) m | empenta del so |
| 150 m | 0.07 Hz | 162.3 | (-18.8, 13.4) m | oscil·lació |
| 150 m | 5 kHz | 168.5 | (-28.1, 19.8) m | empenta del so |

## 4. Obertura del feix i alçada on es creuen (5 kHz)

| obertura | creuament C | nivell mínim | on neix (x, h) | boca necessària |
|---|---|---|---|---|
| 180° | 25 m | 160.4 | (-26.0, 15.9) m | altaveu |
| 180° | 45 m | 161.3 | (17.3, 12.8) m | altaveu |
| 90° | 25 m | 162.2 | (17.3, 12.8) m | 5.1 cm |
| 90° | 45 m | 166.0 | (-15.1, 25.2) m | 5.1 cm |
| 60° | 25 m | 165.0 | (-13.0, 19.0) m | 7.2 cm |
| 60° | 45 m | 167.3 | (-15.1, 31.3) m | 7.2 cm |
| 30° | 25 m | 166.9 | (-8.7, 19.0) m | 13.9 cm |
| 30° | 45 m | 169.3 | (-8.7, 34.4) m | 13.9 cm |

## 5. Desfasament S₁→S₂ (0.07 Hz, 161 dB): el gir

| φ | ε (gir de l'aire) | sentit dels nodes | 1 volta |
|---|---|---|---|
| 0° | 0.00 | ↺ antihorari | 36.1 s |
| -45° | 0.60 | ↺ antihorari | 27.7 s |
| -90° | 0.84 | ↺ antihorari | 14.2 s |
| -135° | 0.60 | ↺ antihorari | 9.9 s |
| 180° | 0.00 | ↺ antihorari | 10.9 s |
| 90° | -0.84 | ↻ horari | 14.2 s |

## 6. Què porta l'aire on neix (pressió de radiació sobre el contrast)

| contingut | 1 kHz | 5 kHz | 0.07 Hz |
|---|---|---|---|
| aire net | 167.2 | 160.4 | 150.3 |
| fum 500 mg/m³ | 167.1 | 160.4 | 150.3 |
| aire +10 °C | 143.7 | 137.5 | 146.7 |
| boira 5000 mg/m³ | 166.8 | 160.1 | 150.3 |

## 7. Reflex de l'aigua (sinusoïdal)

| freqüència | sense reflex | amb reflex (aigua) | on neix amb reflex (x, h) |
|---|---|---|---|
| 0.02 Hz | 133.2 | 128.6 | (-10.8, 12.8) m |
| 0.07 Hz | 154.9 | 150.3 | (-10.8, 12.8) m |
| 1 kHz | 169.4 | 167.1 | (-23.8, 12.8) m |
| 5 kHz | 163.6 | 160.4 | (-26.0, 15.9) m |
| 10 kHz | 162.7 | 159.4 | (-10.8, 12.8) m |

## 8. Soroll de les línies (efecte corona, fórmula BPA amb pluja)

| línia | gradient al conductor | corona | soroll a 1 m | al testimoni (900 m) |
|---|---|---|---|---|
| MT 25 kV (Segre) | 1.9 kV/cm | no | — | — |
| MT 66 kV | 5.1 kV/cm | no | — | — |
| AT 132 kV | 10.2 kV/cm | no | — | — |
| MAT 400 kV, un conductor | 32.5 kV/cm | sí | 135 dB(A) * | 101 dB(A) |

\* fora del rang de validesa de la fórmula (10–25 kV/cm): orientatiu. Amb temps sec, uns 25 dB menys.

## Què en surt

- Freqüències on l'anell és **físicament possible** (≤ 191 dB): 0.02 Hz (129 dB, oscil·lació), 0.07 Hz (150 dB, oscil·lació), 0.5 Hz (184 dB, oscil·lació), 50 Hz (189 dB, empenta del so), 200 Hz (175 dB, empenta del so), 1 kHz (167 dB, empenta del so), 2 kHz (163 dB, empenta del so), 5 kHz (160 dB, empenta del so), 10 kHz (159 dB, empenta del so), 20 kHz (169 dB, empenta del so).
- Com hauria sonat al testimoni (a ~900 m): 0.02 Hz → 71 dB (per sota del llindar), 0.07 Hz → 93 dB (per sota del llindar), 0.5 Hz → 127 dB (per sota del llindar), 50 Hz → 132 dB (se sentiria), 200 Hz → 117 dB (se sentiria), 1 kHz → 104 dB (se sentiria), 2 kHz → 96 dB (se sentiria), 5 kHz → 70 dB (se sentiria), 10 kHz → absorbit pel camí, 20 kHz → absorbit pel camí.
- **Compatibles amb «no vaig sentir res»** (formen l'anell i al testimoni no arriben per sobre del llindar): 0.02 Hz (129 dB, oscil·lació), 0.07 Hz (150 dB, oscil·lació), 0.5 Hz (184 dB, oscil·lació), 10 kHz (159 dB, empenta del so), 20 kHz (169 dB, empenta del so). Són dues finestres: l'infrasò molt greu, que l'oïda no capta, i els ~10–20 kHz, que l'aire absorbeix en els ~900 m fins al testimoni (a prop de les fonts, però, seria un so fortíssim i perillós).
- El nivell més baix: **0.02 Hz a 128.6 dB** per font, neix a (-10.8, 12.8) m per oscil·lació.
- Les columnes «quadrada» i «triangular» marquen amb ♪ quan algun harmònic (3f, 5f…) arribaria audible al testimoni. Ratllat = per sobre del límit físic.
- **Soroll de les línies:** a 25 kV el camp al conductor (2–4 kV/cm) és molt lluny del llindar de corona (~30 kV/cm): no fan espetec. Fins i tot línies que sí fan corona en fan d'un ordre de 50–100 dB(A) a 1 m, molt per sota dels 133–165 dB que caldrien a cada font per formar l'anell amb so.
- **Sentit de gir a kHz:** amb λ de pocs centímetres, la fase amb què arriba cada ona depèn del punt exacte on neix l'anell; fora del centre el sentit pot sortir invertit. Només en infrasò el desfasament φ controla el sentit de manera robusta.
- **L'anell ha de cabre per sobre de l'aigua:** neix com a mínim a l'alçada del seu radi (12 m per a un anell de 25 m).
- **Al llindar, l'anell neix més avall i desplaçat** (un dels dos punts simètrics): al màxim de l'energia del gir encara no hi arriba prou; amb uns quants dB més, neix al centre (taula 2).
- **Aire més calent dins la zona de formació** abaixa molt el nivell necessari a kHz (pressió de radiació sobre el contrast); fum o boira, en canvi, gairebé no hi influeixen.
