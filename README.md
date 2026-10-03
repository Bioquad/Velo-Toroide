# Velo Toroide - Plasma Ring

![Descripció](./assets/View_001.jpg)

**🌐 [Simulador web](https://bioquad.github.io/Velo-Toroide/)**

---

## Projecte: Observació i anàlisi del fenomen del riu Segre (2022)

### Descripció

Aquest repositori conté la documentació factual i l'anàlisi teòrica basada en l'observació d'un fenomen lluminós toroïdal registrat el 18 de setembre de 2022 a Lleida (pont del Príncep de Viana). L'objectiu és proporcionar dades precises a la comunitat científica i a les persones interessades en fenòmens atmosfèrics anòmals.

### Estructura del repositori

```
.
├── assets/                 Plànols, esbós i representació del toroide
├── docs/                   Documents d'observació i de simulació (català i anglès)
│   ├── Explicacio_observacio_toroide_cat.docx
│   ├── Explicacio_simulacio_toroide_cat.docx
│   ├── Observation_toroid_plasma_explanation_eng.docx
│   └── Simulation_toroid_plasma_explanation_eng.docx
├── simulation/
│   ├── v041/               Simulador actual (física establerta)
│   │   ├── index.html
│   │   ├── fisica.js       Nucli de física: funcions pures i testejables
│   │   ├── ui.js           Interfície, integració temporal i dibuix
│   │   └── estil.css
│   └── toroide_plasma_simulacio_V040_59.html   Model anterior (el que descriuen els documents)
├── tests/fisica.test.js    Proves del nucli de física
├── index.html              Redirecció al simulador
└── LICENSE.txt             GNU GPL v3 (codi)
```

### El simulador V042: què fa i què no fa

El simulador (carpeta `simulation/v041/`, versió V042) fa servir només **física establerta i publicada**: no hi ha cap factor ajustat a mà. Si una condició no es compleix, el simulador ho mostra. El panell «comparació amb l'observació» avalua 16 característiques del fenomen. El **disseny invers** construeix, a partir d'un objectiu (diàmetre, tub, nodes, gir, alçada, deriva, durada i contrast), la configuració física que el produiria i indica quins objectius són incompatibles.

| Bloc | Model físic | Referència |
|---|---|---|
| So | Pistó amb pantalla (fórmula exacta a l'eix), font imatge a l'aigua, absorció atmosfèrica, distància de xoc | Kinsler & Frey; Blackstock |
| Formació de l'anell | Jet sintètic: criteri de Holman (U₀/ωD > 0.16), model de «slug» Γ = πu²/4ω, nombre de formació ≤ 4 | Holman et al. 2005; Gharib et al. 1998 |
| Evolució de l'anell | Anell turbulent: impuls conservat, R = R₀(1+t/t₀)^¼; perd la coherència quan Γ/4πR < σ_w i es dispersa en un temps de remolí | Glezer & Coles 1990; Maxworthy 1974 |
| Nodes i gir | Mode sembrat per n injectors (o Widnall espontani); gir per ones de Kelvin (LIA) i per swirl a l'obertura | Widnall & Tsai 1977; Kelvin 1880 |
| Sol i cel | Posició del sol (NOAA), transmissió Rayleigh + aerosols (Ångström), cel clar CIE amb lluminància de Krochmann | NOAA; CIE S 011 |
| Visibilitat | Dispersió de la llum solar pel traçador: fase de Henyey-Greenstein de dos termes i dispersió múltiple de dos fluxos; condensació al nucli | Kattawar 1975; Koschmieder |
| Camp elèctric | Línies amb conductor imatge, superposició fasorial, ruptura per E/N ≈ 120 Td, efecte corona de Peek, balanç de plasma | Raizer; Peek 1929 |
| Trampa acústica | Força de Gor'kov sobre aire calent: Λ = v²k/2g > 1 per quedar atrapat a λ/2 | Gor'kov 1962 |

**Paràmetres nous respecte a la V040:** data, hora i coordenades (posició del sol), terbolesa d'aerosols, direcció de la mirada i distància del testimoni, direcció del vent, turbulència ambient, alçada de l'emissor (separada del pont), orientació de l'eix de l'anell, nombre de polsos, injectors de traçador, swirl, sentit de l'ona de Kelvin, excés de temperatura de l'aire emès i tipus de traçador (pols, fum blanc, boira o fum taronja).

**Model A: anell de vòrtex** (configuració «🏆 Segre: millor compromís»): **15 de 17 característiques** observades es reprodueixen amb física coneguda.

- Un únic pols d'infrasò (0.07 Hz, ~118 dB a 1 m) per una obertura de ~20 m a 25 m d'alçada, amb 4 injectors de traçador, genera un anell de 25 m amb un tub de 3 m i 4 nodes antihoraris. És inaudible.
- L'anell avança a ~1 m/s **contra la brisa** de 3 km/h. Per al testimoni gairebé no es mou i no canvia de mida aparent.
- Amb pols de riu (~500 mg/m³) i el sol de les 18:00 (22° d'altura) **3° al costat de l'anell**, la dispersió cap endavant el fa **el doble de brillant que el cel**. Això encaixa amb la primera impressió del testimoni («un reflex del sol»). El color, però, és un préssec pàl·lid, no el taronja intens observat (el to es calcula en sRGB, com el percep l'ull).
- Amb una turbulència ambient de ~0.2 m/s, dura ~3 min i s'extingeix gradualment.
- **Forma de cometa dels nodes:** darrere de cada node l'anell té el gruix del node i s'aprima fins al node següent. El model ho explica com a matèria que cada node deixa enrere i que es dispersa en un temps de remolí τ = a/σ_w. Amb la configuració de compromís, el gruix arriba al node següent amb un ~30 % del gruix inicial.
- **Hipòtesi alternativa (configuració «🍃 Segre: arrossegat per la brisa»):** l'anell no té velocitat pròpia i el porta una brisa molt fluixa (0.5 km/h), com un globus. També dona 15/17, però exigeix condicions extremes: aire gairebé immòbil (turbulència ≤ 0.02 m/s) i un pols d'aire extremadament lent (~0.005 Hz, uns 2 minuts d'empenta). Amb aquesta circulació tan petita, el gir dels nodes passa a ~8 min per volta.
- **El que no es pot reproduir:** que els nodes facin una volta cada 7 s. Amb la circulació compatible amb una deriva lenta, el gir és de ~35 s. Fer-lo de 7 s demana ~24 vegades més circulació, i llavors l'anell s'allunyaria a més de 3 m/s.
- **Les línies de 25 kV no hi intervenen:** el camp a l'altura de l'anell és ~10⁴–10⁵ vegades inferior al de ruptura.
- Els valors de la geometria del testimoni (distància, mirada) i del vent no es van mesurar: són els que fan compatible el fenomen amb l'observació.

**Model B: nodes emissors** (configuracions «✴ Segre: nodes emissors»). Segons el testimoni, els nodes es movien com objectes que generaven l'anell. En aquest model, l'anell és el rastre lluminós de 4 fonts que orbiten:

- Els nodes van a **11.2 m/s (40 km/h)**, amb una acceleració cap al centre d'**1.03 g**: cada objecte necessita una força cap al centre igual al seu pes.
- La llum del rastre ha de durar **τ ≈ 1.1–1.5 s** perquè la cua s'aprimi fins al node següent (1.75 s entre nodes).
- Per ser visible de dia cal radiar ~**1.5 kW per node si l'emissió és de sodi** (589 nm, el color de la làmpada de sodi amb què el testimoni el compara), o ~**500 kW per node si és incandescència** a 2000 K: unes 300 vegades més.
- Encaixa amb la forma de cometa, el gir de 7 s, la deriva amb la brisa i el color. No explica el to diferent del forat, i el model no diu res sobre què eren els objectes ni sobre el so.

**Model C: patró acústic rotatiu** (configuració «🔊 Segre: patró acústic rotatiu»). Hipòtesi: els nodes són màxims d'energia d'un camp de so que gira, com les rodes d'un tren sobre una via ondulada. No es mou cap material.

- Es fa amb K feixos acústics de vòrtex amb freqüències separades Δf. Per a 4 nodes i una volta cada 7 s, **Δf = 0.571 Hz**. Per a un anell de 25 m, la portadora ha de ser de **13.7 Hz** (infrasò).
- Els nodes van a 11.2 m/s **sense cap força centrípeta**, perquè no hi ha matèria que giri. Els «esglaons» (K ones) concentren l'energia als nodes un factor K.
- Visibilitat per **condensació acústica**: a la rarefacció l'aire es refreda i forma boira. Amb les condicions del Segre cal **~178 dB al node**. La cua de cometa encaixa si les gotes són de ~40 µm i s'evaporen en ~1.2 s.
- **Problemes:** la boira és **blanca**, el patró no es mouria amb la brisa (està lligat a l'emissor) i el testimoni hauria rebut **~160 dB d'infrasò**, molt per sobre del llindar de percepció (~94 dB) i del de perill (140 dB).

**Reproducció real:** la configuració «🧪 Assaig real a escala 1:10» (anell de 2.5 m, fum blanc, sol de costat, emissor a 3 m) compleix tots els objectius escalats menys el color, inclòs el gir de 7 s, perquè els anells petits giren més ràpid. L'única excepció és el color: el fum blanc no és taronja, i el fum taronja de senyalització és més fosc que el cel de dia.

### Execució de les proves

```
node tests/fisica.test.js
```

### Llicències

- Codi del simulador: **GNU GPL v3** (vegeu `LICENSE.txt`).
- Document de simulació: **GNU FDL v1.3**.
- Document d'observació: distribució lliure amb atribució.

### Nota

Els models presentats són hipòtesis de treball i no s'han validat experimentalment.

---

## Project: Observation and Analysis of the Segre River Phenomenon (2022)

This repository contains factual documentation and theoretical analysis of a toroidal luminous phenomenon observed on 18 September 2022 in Lleida (Prince of Viana Bridge).

**Simulator V042** (folder `simulation/v041/`) replaces the hand-tuned factors of V040 (resonant amplification k = 25, a "synchronism" factor that lowered the breakdown threshold, arbitrary heating constants) with established, published physics. This covers synthetic-jet vortex ring formation (Holman, Gharib), Saffman ring velocity, the Widnall instability, line-charge electrostatics with image conductors, the reduced-field breakdown criterion (E/N ≈ 120 Td), Peek's corona law, a Drude/Joule plasma balance, optical visibility of tracers and the Gor'kov acoustic radiation force. A built-in panel compares each configuration with the observation, point by point.

Key results for the Segre geometry (preset "Segre: best compromise"): 15 of the 16 observed features are reproduced with known physics. A single infrasonic pulse (0.07 Hz, ~118 dB at 1 m) through a ~20 m aperture at 25 m height, with 4 tracer injectors, produces a 25 m ring with a 3 m tube and 4 anticlockwise nodes. The ring moves at ~1 m/s against the 3 km/h breeze, so it appears almost stationary. With river dust lit by the low sun 3° from the line of sight, it looks orange and twice as bright as the sky. It lasts ~3 min and fades gradually. The 7 s node rotation cannot be reproduced together with the slow drift (it would need ~24 times more circulation). The 25 kV lines play no role: the field at the ring is 10⁴–10⁵ times below breakdown. A 1:10 field-test preset reproduces 15/16 scaled targets, including the 7 s rotation, with white smoke.

Run the tests with `node tests/fisica.test.js`.

Licences: simulator code GNU GPL v3 (`LICENSE.txt`); simulation document GNU FDL v1.3; observation document free distribution with attribution.

*The physical models are working hypotheses and have not been experimentally validated.*
