# Velo Toroide - Plasma Ring

![Descripció](./assets/View_001.jpg)

**🌐 [Simulador web](https://bioquad.github.io/Velo-Toroide/)**

---

## Estat del projecte · som a mig camí

Aquest simulador reprodueix, **amb física establerta i publicada**, una part del fenomen observat sobre el riu Segre el 18-09-2022. La part que **no** es pot reproduir queda documentada honestament, sense amagar-la.

**El que la física coneguda explica:**
- La **forma** d'un anell toroïdal de ~25 m amb 4 nodes.
- El **gir** dels nodes (model B, objectes que orbiten; model C, patró de so).
- La **forma de cometa** de la cua darrere de cada node.
- El **color taronja** i la visibilitat de dia, amb emissió tipus sodi.

**El que la física coneguda NO explica (i on queda el camí per recórrer):**
- **Si el so greu pot empènyer prou per fer girar l'anell.** El so empeny l'aire de dues maneres: quan s'absorbeix (corrent acústic d'Eckart, espín absorbit) i, directament, on hi ha un contrast —gotes, fum, una bombolla, aire més calent— per pressió de radiació (Gor'kov), i si un costat rep més empenta que l'altre, gira. En infrasò (0.07 Hz, ~161 dB) totes dues són massa febles: falta un factor ~10⁴ (amb fum) a ~10⁶ (aire net). Cap als 5 kHz i ~170 dB el so sí que pot formar l'anell per empenta estable; a 40 kHz s'absorbeix pel camí abans d'arribar-hi.
- Un **mecanisme de confinament** que mantingui el toroide estable durant 3 minuts sense parets. Cap model de plasma conegut ho fa en aire lliure a pressió atmosfèrica.
- Que les **línies de 25 kV** ionitzin l'aire: el seu camp a l'altura de l'anell és ~10⁴ vegades inferior al de ruptura (~3 MV/m).
- Les tres característiques alhora: cap configuració compleix els 19 criteris.
- L'**encongiment final** (els darrers ~30 s l'anell es va fer petit fins a desaparèixer, com una implosió): un anell de vòrtex es dispersa i s'eixampla, no s'encongeix.

**Càlculs que aquest treball deixa oberts expressament.** L'assistent que ha fet el simulador (Claude, d'Anthropic) **no proporciona** el disseny de com mantenir un arc elèctric tret de línies d'alta tensió, ni com ionitzar i confinar aire amb ràdio o microones d'alta potència, ni tan sols com a simulació. Són procediments que, portats a la pràctica, són perillosos o letals, i per això queden fora d'aquest treball. Per tant, **el model del confinament actiu del plasma resta sense resoldre** i s'ofereix a qui tingui els mitjans i l'entorn segur per estudiar-lo.

> *En resum: la cinemàtica (forma, gir, aparença) és reproduïble; la dinàmica del confinament, no. Estem a mig camí.*

---

### Project status · halfway there (English)

This simulator reproduces **part** of the toroidal luminous phenomenon observed over the Segre river (Lleida, 18 Sep 2022) using **established, published physics**, and documents openly the part it cannot.

- **Reproducible:** the ~25 m toroidal shape, the 4 orbiting nodes and their rotation, the comet-tail trail, and the orange daytime appearance (sodium-type emission).
- **Not reproducible with known physics:** a wall-less **confinement mechanism** keeping the torus stable for ~3 min; ionisation of air by the 25 kV lines (their field at ring height is ~10⁴× below the ~3 MV/m breakdown threshold); and all features at once.
- **Deliberately out of scope:** the AI assistant that built this simulator (Claude, by Anthropic) **does not provide** designs for drawing an electric arc from high-voltage lines, nor for ionising/confining air with high-power RF or microwaves — not even as a simulation — because, if carried out, they are dangerous or lethal. The **active plasma-confinement model therefore remains unsolved** and is offered to anyone with the means and a safe environment to study it.

> *Kinematics (shape, rotation, appearance) is reproducible; confinement dynamics is not. We are halfway there.*

### 项目状态 · 完成一半（简体中文）

本模拟器用**已确立的、公开发表的物理学**再现了 2022 年 9 月 18 日塞格雷河上空环形发光现象的**一部分**，并如实记录无法再现的部分。可再现：约 25 米的环形、4 个绕行节点及其旋转、彗尾状拖尾、日间橙色外观（钠发射型）。已知物理无法解释：维持环体约 3 分钟稳定的**无壁约束机制**；25 kV 线路对空气的电离（环高处场强比约 3 MV/m 击穿阈值低约 10⁴ 倍）。**明确不涉及**：构建此模拟器的 AI 助手（Anthropic 的 Claude）**不提供**从高压线引弧、或用大功率射频/微波电离并约束空气的设计方案（即便仅作模拟），因为付诸实践会造成危险或致命后果。因此**等离子体主动约束模型仍未解决**。

### プロジェクトの現状 · 道半ば（日本語）

本シミュレーターは、**確立された公開の物理**を用いて、2022 年 9 月 18 日にセグレ川上空で観測されたトーラス状発光現象の**一部**を再現し、再現できない部分も隠さず記録します。再現可能：約 25 m のトーラス形状、4 つの周回ノードとその回転、彗星の尾状の軌跡、日中のオレンジ色の外観（ナトリウム型発光）。既知の物理では説明不可：壁なしで約 3 分間トーラスを安定に保つ**閉じ込め機構**、25 kV 送電線による空気の電離（リング高度での電界は絶縁破壊閾値 約 3 MV/m より約 10⁴ 倍低い）。**意図的に対象外**：本シミュレーターを作成した AI アシスタント（Anthropic の Claude）は、高圧線からアークを引き出す設計や、大電力の RF・マイクロ波で空気を電離・閉じ込める設計を、シミュレーションであっても**提供しません**。実行すれば危険または致命的だからです。したがって**プラズマの能動的閉じ込めモデルは未解決**のままです。

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
│   ├── original/           Simulació original V040_59, exactament com era abans de la V041
│   └── toroide_plasma_simulacio_V040_59.html   Model anterior amb els errors de programació corregits
├── tests/fisica.test.js    Proves del nucli de física
├── index.html              Portada: tria entre la simulació original i la nova
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

**Paràmetres de la V040 que es conserven, ara amb física:** freqüència i nivell (dB) de cada generador, desfasament S₁→S₂ (dona el sentit de gir), **forma del senyal** (sinusoïdal, quadrada o triangular) i **nombre d'harmònics** (els harmònics k·f poden fer audible el so; el fonamental és el que forma l'anell), separació i posició lateral de les fonts, alçada de les fonts, **convergència θ dels feixos** (enllaçada amb l'alçada on es creuen), **coeficient de no-linealitat β** (distància de xoc), **ionització residual** (densitat electrònica mínima, suposada mantinguda), línies elèctriques (alçades, separació, tensions, desfasament, freqüència de xarxa) i retard de sincronisme τ. El panell comença pels generadors i la geometria; l'observació (testimoni, lloc i hora) i el disseny invers queden plegats al final.

**Paràmetres nous respecte a la V040:** data, hora i coordenades (posició del sol), terbolesa d'aerosols, direcció de la mirada i distància del testimoni, direcció del vent, turbulència ambient, alçada de l'emissor (separada del pont), orientació de l'eix de l'anell, nombre de polsos, injectors de traçador, swirl, sentit de l'ona de Kelvin, excés de temperatura de l'aire emès i tipus de traçador (pols, fum blanc, boira o fum taronja).

**Geometria de l'observació** (la que fa servir el simulador): les línies elèctriques van al llarg de X i l'anell hi és paral·lel (pla X–Y). El vent bufava cap a +Z, transversal a les línies, i portava l'anell cap al testimoni. El testimoni era a 800–1000 m, a +Z, i caminava cap a −Z, cap a l'anell. Per això el va veure **créixer una mica** durant el primer minut i mig, **estable** el minut següent (quan s'atura de caminar, `t_cam` = 90 s) i, als darrers **30 s, encongir-se** fins a desaparèixer. Aquestes tres fases són criteris de la comparació. A 900 m, un anell a 25 m d'alçada es veu només ~2° per sobre de l'horitzó.

**Model A: anell de vòrtex** (configuració «🏆 Segre: millor compromís»): **12 de 19 característiques** observades es reprodueixen amb física coneguda.

- **L'anell neix entre els feixos de les dues fonts, on el situa la física**, no en un punt triat. Neix on les velocitats de S₁ i S₂ es creuen amb més força i amb més angle: el màxim de l'energia de la part del moviment que gira (espín acústic), 2|A×B|²/(|A|²+|B|²), i on a més es compleix el criteri de formació. Amb dues fonts iguals cau sobre el punt mig, a (separació/2)/√3 per sobre de les fonts en camp proper i a (separació/2)/√2 en camp llunyà. Si una font és més feble, el punt es desplaça cap a ella. Si al punt més favorable les ones no hi arriben prou, l'anell es forma al punt següent on sí; si no s'hi arriba enlloc, no es forma. Per tenir l'anell a 25 m d'alçada amb les fonts a 5 m, cal separar-les ~69 m. Al simulador cada feix es dibuixa com la sinusoide del seu so, amb un fasor a la font que gira a la seva pròpia freqüència, com a l'oscil·loscopi.
- **Alçada on es creuen els feixos (seleccionable) i obertura del feix.** Cada font apunta el seu feix al punt de creuament C (`h_creu`). L'obertura (`feix`) va de 0° (feix tancat) a 180° (com un altaveu convencional, que radia cap endavant en mig espai). El so sempre surt de la font; fora de l'eix n'arriba menys, i per això C mou el punt on neix l'anell. El simulador indica la boca que caldria per fer aquest feix: a 0.07 Hz, un feix de 60° demana ~5 km; a 5 kHz, uns 14 cm.
- **Què empeny l'aire on neix l'anell.** (1) Absorció: força F = 2α·I/c i parell τ = 2α·c·s de l'espín de les ones creuades, amb l'absorció atmosfèrica real (ISO 9613-1: ~0.005 dB/m a 1 kHz, ~1.3 dB/m a 40 kHz). (2) Pressió de radiació sobre el contingut de l'anell (fum, gotes, aire calent), F ≈ Φ·E·max(k, 1/r). Amb la viscositat turbulenta de l'aire sostenen Γ ≈ U·W + Ω·W². L'anell es forma per una de dues vies: l'**oscil·lació** de l'aire (criteri de Holman, domina en infrasò) o l'**empenta estable del so** (domina a kHz; cal Γ/4πR > σ_w), sempre entre les ones: les dues fonts hi han d'arribar comparables. Si el so fa xoc abans d'arribar a l'anell, el simulador ho avisa (el model lineal no compta la dissipació del xoc). La freqüència va de 0.0005 Hz a 40 kHz (control logarítmic) i l'ultrasò no compta com a audible.
- **Camp proper:** en infrasò (kr ≪ 1) la velocitat de l'aire d'una font és molt més gran que la de l'ona llunyana: |u| = p/(ρc)·√(1 + 1/(kr)²). Per això, amb les fonts a ~69 m l'una de l'altra, n'hi ha prou amb **~161 dB a 1 m a cada font** (0.07 Hz, inaudible) per moure ~4.8 m/s d'aire on neix l'anell i complir el criteri de formació.
- **La diferència de fase produeix la rotació:** a M les velocitats de S₁ i S₂ tenen direccions diferents (els feixos es creuen a 69°). Desfasades, la velocitat resultant dibuixa una el·lipse i l'aire gira al pla de l'anell (espín acústic). Amb Δφ = −90° gira en sentit antihorari, amb +90° en sentit horari, i amb 0° o 180° oscil·la sense girar. Aquest gir és el swirl de l'anell. Amb freqüències diferents, Δφ avança al ritme del batec: el gir s'inverteix cada mig batec (de mitjana, zero) i l'anell es forma als màxims del batec.
- En antifase la pressió s'anul·la a M, però la velocitat no: les components horitzontals se sumen.
- **Simulador en viu:** l'anell no és una pel·lícula. A cada instant es calcula el camp de S₁ i S₂ allà on és l'anell. Mentre les ones hi compleixen el criteri de formació, el **sostenen** (la circulació segueix el nivell, la freqüència i la fase actuals, i el gir segueix Δφ) i no envelleix. Quan deixen de complir-lo (menys dB, antifase, fonts separades o perquè el vent l'ha allunyat), queda **lliure**: creix, es dispersa i s'extingeix. Tocar les fonts amb el so en marxa compta com un intent nou. Tots els paràmetres queden visibles en canviar de model (els que no l'afecten, atenuats) i conserven el valor.
- **Hipòtesi oberta:** el criteri de formació (Holman) és el d'una obertura, on la vorticitat neix a la vora. Al punt mig no hi ha cap vora: el model suposa que l'aire que mouen les dues ones juntes s'hi comporta igual, però no calcula el mecanisme no lineal (corrent acústic) que hi generaria la vorticitat. El mode antic, amb l'anell sortint de l'obertura d'una font, es conserva per al canó de taula.
- L'anell avança a ~1 m/s cap al testimoni, que s'hi apropa caminant: el veu créixer una mica, com es va observar. Però com que l'anell continua avançant, el minut següent continua creixent (×1.15) en lloc de quedar estable.
- **Brillantor:** a 900 m l'anell es veu ~2° sobre l'horitzó, ~20° per sota del sol de les 18:00. A aquest angle la pols o el fum dispersen massa poca llum: l'anell no seria més brillant que el cel (C ≈ 0.1). Un traçador passiu il·luminat pel sol **no explica** un anell lluminós de dia a aquesta distància.
- Amb una turbulència ambient de ~0.2 m/s, dura ~3 min i s'extingeix gradualment.
- **Forma de cometa dels nodes:** darrere de cada node l'anell té el gruix del node i s'aprima fins al node següent. El model ho explica com a matèria que cada node deixa enrere i que es dispersa en un temps de remolí τ = a/σ_w. Amb la configuració de compromís, el gruix arriba al node següent amb un ~30 % del gruix inicial.
- **Hipòtesi alternativa (configuració «🍃 Segre: arrossegat per la brisa»):** l'anell no té velocitat pròpia i el porta una brisa molt fluixa (0.5 km/h), com un globus. També dona el creixement i l'estabilitat, però exigeix condicions extremes: aire gairebé immòbil (turbulència ≤ 0.02 m/s) i un pols d'aire extremadament lent (~0.005 Hz, uns 2 minuts d'empenta). Amb aquesta circulació tan petita, el gir dels nodes passa a ~8 min per volta.
- **El que no es pot reproduir:** l'encongiment final (un anell de vòrtex es dispersa, no implosiona), la brillantor de dia a 900 m i que els nodes facin una volta cada 7 s. Amb la circulació compatible amb una deriva lenta, el gir és de ~35 s. Fer-lo de 7 s demana ~24 vegades més circulació: ~202 dB a cada font, per sobre del màxim físic de ~191 dB, i l'anell avançaria a més de 3 m/s.
- **Les línies de 25 kV no hi intervenen:** el camp a l'altura de l'anell és ~10⁴–10⁵ vegades inferior al de ruptura.
- Els valors de la geometria del testimoni (distància, mirada) i del vent no es van mesurar: són els que fan compatible el fenomen amb l'observació.

**Model B: nodes emissors** (configuracions «✴ Segre: nodes emissors»). Segons el testimoni, els nodes es movien com objectes que generaven l'anell. En aquest model, l'anell és el rastre lluminós de 4 fonts que orbiten:

- Els nodes van a **11.2 m/s (40 km/h)**, amb una acceleració cap al centre d'**1.03 g**: cada objecte necessita una força cap al centre igual al seu pes.
- La llum del rastre ha de durar **τ ≈ 1.1–1.5 s** perquè la cua s'aprimi fins al node següent (1.75 s entre nodes).
- Per ser visible de dia cal radiar ~**1.5 kW per node si l'emissió és de sodi** (589 nm, el color de la làmpada de sodi amb què el testimoni el compara), o ~**500 kW per node si és incandescència** a 2000 K: unes 300 vegades més.
- Encaixa amb la forma de cometa, el gir de 7 s, la deriva amb la brisa, el creixement en apropar-s'hi, l'estabilitat i el color. L'**implosió final** es pot imposar (opció `e_impl`: l'òrbita es tanca en 30 s), però el model no diu quina força la produiria. No explica el to diferent del forat, i no diu res sobre què eren els objectes ni sobre el so.

**Model C: patró acústic rotatiu** (configuració «🔊 Segre: patró acústic rotatiu»). Hipòtesi: els nodes són màxims d'energia d'un camp de so que gira, com les rodes d'un tren sobre una via ondulada. No es mou cap material.

- Es fa amb K feixos acústics de vòrtex amb freqüències separades Δf. Per a 4 nodes i una volta cada 7 s, **Δf = 0.571 Hz**. Per a un anell de 25 m, la portadora ha de ser de **13.7 Hz** (infrasò).
- Els nodes van a 11.2 m/s **sense cap força centrípeta**, perquè no hi ha matèria que giri. Els «esglaons» (K ones) concentren l'energia als nodes un factor K.
- Visibilitat per **condensació acústica**: a la rarefacció l'aire es refreda i forma boira. Amb les condicions del Segre cal **~178 dB al node**. La cua de cometa encaixa si les gotes són de ~40 µm i s'evaporen en ~1.2 s.
- **Problemes:** la boira és **blanca**, el patró no es mouria amb la brisa (està lligat a l'emissor), el radi el fixa la portadora (encongir-lo voldria pujar-ne la freqüència) i el testimoni hauria rebut **~136 dB d'infrasò** fins i tot a ~775 m, molt per sobre del llindar de percepció (~94 dB) i del de perill (140 dB).

**Reproducció real:** la configuració «🧪 Assaig real a escala 1:10» (anell de 2.5 m, fum blanc, sol de costat, emissor a 3 m) vist a 90 m compleix tots els objectius escalats menys dos, inclòs el gir de 7 s, perquè els anells petits giren més ràpid. Les excepcions són el color (el fum blanc no és taronja, i el fum taronja de senyalització és més fosc que el cel de dia) i l'encongiment final.

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
