# Escombrat: on i amb quines freqüències es formaria el toroide

Generat amb `node tests/escombrat.js` (mateix motor físic que el simulador). Escena del Segre: fonts a 5 m d'alçada, separades 69.2 m, zona de formació de 20 m, fum (500 mg/m³), turbulència σ_w = 0.2 m/s, testimoni a 900 m. Si no es diu el contrari: senyal sinusoïdal, φ = −90° (gir ↺), feix de 180° (altaveu convencional) creuant-se a 25 m.

Límit físic del nivell (la rarefacció arriba al buit): **191 dB**. Per sobre, la configuració és impossible.

## 1. Nivell mínim per formar l'anell, segons la freqüència i la forma del senyal

| freqüència | nivell mínim sinus | via | on neix (x, h) | Γ (m²/s) | avança | 1 volta | quadrada (N = 9) | triangular | audible al testimoni (sinus) | xoc abans d'arribar |
|---|---|---|---|---|---|---|---|---|---|---|
| 0.02 Hz | **132.8 dB** | oscil·lació | (-8.7, 12.8) m | 10.4 | 0.27 m/s | 3.1 min ↺ | 133.6 | 132.9 | no | no |
| 0.07 Hz | **154.6 dB** | oscil·lació | (-8.7, 12.8) m | 36.4 | 0.95 m/s | 53.1 s ↺ | 155.4 | 154.6 | no | no |
| 0.5 Hz | **188.4 dB** | oscil·lació | (-8.7, 12.8) m | 259.6 | 6.80 m/s | 7.4 s ↺ | 189.2 | 188.5 | no | no |
| 3.57 Hz | ~~210.8~~ impossible | empenta del so | (-19.5, 22.1) m | 30.4 | 0.80 m/s | 10.9 s ↻ | ~~203.7~~ ♪ | ~~210.3~~ ♪ | no | ⚠ a 1.8 m |
| 13.7 Hz | ~~199.7~~ impossible | empenta del so | (17.3, 12.8) m | 34.1 | 0.89 m/s | 49.9 s ↻ | ~~191.7~~ ♪ | ~~199.0~~ ♪ | no | ⚠ a 1.7 m |
| 50 Hz | **188.9 dB** | empenta del so | (17.3, 12.8) m | 34.0 | 0.89 m/s | 1.2 min ↺ | 182.4 ♪ | 188.3 ♪ | ♪ sí (50 Hz) | ⚠ a 1.6 m |
| 200 Hz | **177.5 dB** | empenta del so | (17.3, 12.8) m | 34.0 | 0.89 m/s | 1.0 min ↺ | 174.6 ♪ | 177.3 ♪ | ♪ sí (200 Hz) | ⚠ a 1.5 m |
| 1 kHz | **169.4 dB** | empenta del so | (17.3, 12.8) m | 34.0 | 0.89 m/s | 1.2 min ↺ | 167.2 ♪ | 169.3 ♪ | ♪ sí (1 kHz) | ⚠ a 75 cm |
| 2 kHz | **167.8 dB** | empenta del so | (-19.5, 19.0) m | 33.7 | 0.88 m/s | 1.3 min ↺ | 165.8 ♪ | 167.6 ♪ | ♪ sí (2 kHz) | ⚠ a 45 cm |
| 5 kHz | **163.6 dB** | empenta del so | (17.3, 19.0) m | 31.0 | 0.81 m/s | 1.3 min ↻ | 163.3 ♪ | 163.5 ♪ | ♪ sí (5 kHz) | ⚠ a 29 cm |
| 10 kHz | **162.5 dB** | empenta del so | (-13.0, 19.0) m | 32.2 | 0.84 m/s | 1.3 min ↻ | 163.3 ♪ | 162.6 ♪ | ♪ sí (10 kHz) | ⚠ a 17 cm |
| 20 kHz | **170.4 dB** | empenta del so | (-6.5, 15.9) m | 33.8 | 0.89 m/s | 1.3 min ↻ | 171.2 ♪ | 170.5 ♪ | ♪ sí (20 kHz) | ⚠ a 3 cm |
| 40 kHz | ~~202.6~~ impossible | empenta del so | (-2.2, 9.7) m | 31.4 | 0.82 m/s | 1.4 min ↺ | ~~203.4~~ | ~~202.6~~ | no | ⚠ a 0 cm |

## 2. Mapa freqüència × nivell (sinus)

O = es forma per oscil·lació de l'aire · E = es forma per l'empenta estable del so · — = no es forma · ♪ = audible al testimoni · entre parèntesis, l'alçada on neix

| freqüència | 130 dB | 140 dB | 150 dB | 160 dB | 170 dB | 180 dB | 190 dB |
|---|---|---|---|---|---|---|---|
| 0.02 Hz | — | O (25 m) | O (25 m) | O (25 m) | O (25 m) | O (25 m) | O (25 m) |
| 0.07 Hz | — | — | — | O (24 m) | O (25 m) | O (25 m) | O (25 m) |
| 0.5 Hz | — | — | — | — | — | — | O (19 m) |
| 3.57 Hz | — | — | — | — | — | — | — |
| 13.7 Hz | — | — | — | — | — | — | — |
| 50 Hz | — ♪ | — ♪ | — ♪ | — ♪ | — ♪ | — ♪ | E (22 m) ♪ |
| 200 Hz | — ♪ | — ♪ | — ♪ | — ♪ | — ♪ | E (25 m) ♪ | E (29 m) ♪ |
| 1 kHz | — ♪ | — ♪ | — ♪ | — ♪ | E (16 m) ♪ | E (29 m) ♪ | E (29 m) ♪ |
| 2 kHz | — ♪ | — ♪ | — ♪ | — ♪ | E (25 m) ♪ | E (29 m) ♪ | E (29 m) ♪ |
| 5 kHz | — ♪ | — ♪ | — ♪ | — ♪ | E (28 m) ♪ | E (28 m) ♪ | E (28 m) ♪ |
| 10 kHz | — ♪ | — ♪ | — ♪ | — ♪ | E (26 m) ♪ | E (26 m) ♪ | E (26 m) ♪ |
| 20 kHz | — ♪ | — ♪ | — ♪ | — ♪ | — ♪ | E (22 m) ♪ | E (22 m) ♪ |
| 40 kHz | — | — | — | — | — | — | — |

## 3. Separació de les fonts (sinus)

| separació | f | nivell mínim | on neix (x, h) | via |
|---|---|---|---|---|
| 10 m | 0.07 Hz | 123.8 | (-1.3, 6.6) m | oscil·lació |
| 10 m | 5 kHz | 147.5 | (-3.1, 8.5) m | empenta del so |
| 30 m | 0.07 Hz | 141.2 | (-3.8, 9.2) m | oscil·lació |
| 30 m | 5 kHz | 156.1 | (-7.5, 10.6) m | empenta del so |
| 69.2 m | 0.07 Hz | 154.6 | (-8.7, 12.8) m | oscil·lació |
| 69.2 m | 5 kHz | 163.6 | (17.3, 19.0) m | empenta del so |
| 150 m | 0.07 Hz | 167.6 | (-18.8, 19.8) m | oscil·lació |
| 150 m | 5 kHz | 172.2 | (-32.8, 32.7) m | empenta del so |

## 4. Obertura del feix i alçada on es creuen (5 kHz)

| obertura | creuament C | nivell mínim | on neix (x, h) | boca necessària |
|---|---|---|---|---|
| 180° | 25 m | 163.6 | (17.3, 19.0) m | altaveu |
| 180° | 45 m | 164.1 | (-15.1, 15.9) m | altaveu |
| 90° | 25 m | 164.1 | (17.3, 19.0) m | 5.1 cm |
| 90° | 45 m | 166.1 | (17.3, 28.2) m | 5.1 cm |
| 60° | 25 m | 164.9 | (-15.1, 19.0) m | 7.2 cm |
| 60° | 45 m | 167.3 | (-15.1, 31.3) m | 7.2 cm |
| 30° | 25 m | 166.9 | (-8.7, 19.0) m | 13.9 cm |
| 30° | 45 m | 169.3 | (-8.7, 34.4) m | 13.9 cm |

## 5. Desfasament S₁→S₂ (0.07 Hz, 161 dB): el gir

| φ | ε (gir de l'aire) | sentit dels nodes | 1 volta |
|---|---|---|---|
| 0° | 0.00 | ↺ antihorari | 1.1 min |
| -45° | 0.54 | ↺ antihorari | 42.5 s |
| -90° | 0.87 | ↺ antihorari | 32.5 s |
| -135° | 0.61 | ↺ antihorari | 24.4 s |
| 180° | -0.00 | ↺ antihorari | 31.3 s |
| 90° | -0.87 | ↻ horari | 32.5 s |

## 6. Què porta l'aire on neix (pressió de radiació sobre el contrast)

| contingut | 1 kHz | 5 kHz | 0.07 Hz |
|---|---|---|---|
| aire net | 169.4 | 163.6 | 154.6 |
| fum 500 mg/m³ | 169.4 | 163.6 | 154.6 |
| aire +10 °C | 146.3 | 140.9 | 151.3 |
| boira 5000 mg/m³ | 169.1 | 163.3 | 154.6 |

## Què en surt

- Freqüències on l'anell és **físicament possible** (≤ 191 dB): 0.02 Hz (133 dB, oscil·lació), 0.07 Hz (155 dB, oscil·lació), 0.5 Hz (188 dB, oscil·lació), 50 Hz (189 dB, empenta del so), 200 Hz (178 dB, empenta del so), 1 kHz (169 dB, empenta del so), 2 kHz (168 dB, empenta del so), 5 kHz (164 dB, empenta del so), 10 kHz (162 dB, empenta del so), 20 kHz (170 dB, empenta del so).
- D'aquestes, **inaudibles** per al testimoni (com es va observar): 0.02 Hz, 0.07 Hz, 0.5 Hz.
- El nivell més baix: **0.02 Hz a 132.8 dB** per font, neix a (-8.7, 12.8) m per oscil·lació.
- Les columnes «quadrada» i «triangular» marquen amb ♪ quan algun harmònic (3f, 5f…) seria audible per al testimoni. Ratllat = per sobre del límit físic.
- **Sentit de gir a kHz:** amb λ de pocs centímetres, la fase amb què arriba cada ona depèn del punt exacte on neix l'anell; fora del centre el sentit pot sortir invertit. Només en infrasò el desfasament φ controla el sentit de manera robusta.
- **Al llindar, l'anell neix més avall i desplaçat** (un dels dos punts simètrics): al màxim de l'energia del gir encara no hi arriba prou; amb uns quants dB més, neix al centre (taula 2).
- **Aire més calent dins la zona de formació** abaixa molt el nivell necessari a kHz (pressió de radiació sobre el contrast); fum o boira, en canvi, gairebé no hi influeixen.
