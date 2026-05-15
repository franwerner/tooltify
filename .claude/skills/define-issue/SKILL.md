---
name: define-issue
description: MANUAL-ONLY skill for writing or refining well-scoped software development issues/tickets in markdown that will later be executed by an agent (especially Claude Code) or a developer. ONLY trigger when the user EXPLICITLY asks to define, scope, write, draft, or refine an issue/ticket/task — for example "ayudame a definir una issue", "armemos un ticket", "escribamos la tarea para Claude Code", "scopeemos esto", "refiná la issue 047", "draft an issue for X", or any near-equivalent. Do NOT trigger proactively: if the user is just discussing work, brainstorming, asking for advice on what to build, or describing a problem without explicitly invoking issue-writing, this skill stays off. When in doubt about whether the user wants an issue *written* vs. just discussed, do NOT invoke this skill — answer normally and let the user explicitly ask. Before doing anything else, the skill reads the project's `CLAUDE.md` looking for a `## Issues` section with a `**Root:** <path>` field; if present, that path is the issues root and the skill uses it directly (skipping the monorepo `.claude/` scan). When invoked WITHOUT an argument the skill creates a new issue; when invoked WITH an issue name/slug as argument it locates the matching file in the issues root and switches to refine-existing mode.
---
# Define Issue


El objetivo de esta skill es producir una issue en markdown que **otro agente (Claude Code) pueda ejecutar de punta a punta sin tener que volver a preguntarle al usuario**. Toda fricción que se evite acá se evita después multiplicada por la cantidad de veces que el agente tiene que parar a pedir contexto.

La skill no es un cuestionario rígido: es un marco de fases con reglas claras de cuándo profundizar y cuándo saltear. La meta es **issue completa con la mínima cantidad de preguntas posible**.

---

## Principio rector

Una buena issue para un agente ejecutor tiene tres propiedades:

1. **Está dimensionada** — el ejecutor sabe si esto son 10 minutos o 2 días, y por dónde empezar.
2. **Es verificable** — hay criterios objetivos para saber cuándo está terminada.
3. **Tiene fronteras claras** — qué hacer y, sobre todo, qué *no* hacer (los agentes tienden a expandir el scope).

Si una issue te falla en alguna de esas tres, no está lista.

---

## Setup — leer `CLAUDE.md` y detectar modo

**Antes de hacer cualquier pregunta o escribir nada**, hacé dos cosas en este orden.

### 1. Resolver el `issues_root` desde `CLAUDE.md`

Buscá en el `CLAUDE.md` (de la raíz del repo y, en monorepos, también en el `CLAUDE.md` del workspace donde estés) una sección con este formato exacto:

```markdown
## Issues

**Root:** <path al directorio de issues>
```

- Si la encontrás → ese path es el `issues_root` para esta invocación. **No hagas scan de carpetas `.claude/` ni preguntes ubicación.** Saltá toda la sub-sección "Elegir el `.claude/issues/` correcto" de más abajo.
- Si NO la encontrás → no hay root declarado. Cuando llegue el momento de escribir, aplicá la lógica monorepo-aware de "Convención de archivos" como fallback.
- En monorepos, si varios `CLAUDE.md` declaran `## Issues`, priorizá el más cercano al directorio actual (workspace antes que raíz). Si hay ambigüedad real, listá los roots encontrados y pedile al usuario que elija.

### 2. Detectar modo: CREAR vs. REFINAR

Mirá si la skill se invocó con un argumento (nombre o slug de issue):

- **Sin argumento → modo CREAR.** Seguís el flujo normal de fases (1–5) y al final escribís un archivo nuevo en el `issues_root` resuelto.

- **Con argumento (ej. `047-redirect-unauth`, `redirect-unauth`, o sólo `redirect`) → modo REFINAR.**
  1. Listá el contenido del `issues_root` y buscá archivos cuyo nombre matchee el argumento. Aceptá, en orden de preferencia: match exacto del nombre completo (`047-redirect-unauth.md`), match del slug sin número (`redirect-unauth`), o match parcial inequívoco (`redirect` cuando un solo archivo contiene esa palabra).
  2. Si encontrás **un solo archivo** → leelo y mostrale al usuario un resumen breve (título, tipo, tamaño, criterios actuales, fuera de alcance, `[TODO]`s pendientes). Después preguntale qué quiere refinar: ¿agregar criterios? ¿cerrar TODOs? ¿ajustar scope? ¿marcar criterios como hechos? Aplicá las fases SOLO sobre lo que pida.
  3. Si encontrás **múltiples archivos que matchean** → listalos numerados y pedile que elija uno.
  4. Si NO encontrás ningún archivo → decile que no existe y ofrecé crear una nueva con ese argumento como slug. Si acepta, seguí en modo CREAR usando ese slug.
  5. Si hay argumento pero NO hay `issues_root` declarado → preguntale al usuario en qué `.claude/issues/` buscar, o (en monorepos) scaneá todos los `.claude/issues/` que existan y reportá dónde encontraste el match.

**En modo REFINAR, no rehagas la issue de cero.** Empezá desde el contenido existente y cerrá gaps. No sobrescribas secciones que ya están completas a menos que el usuario te lo pida explícitamente.

---

## Antes de empezar a preguntar

**Leé lo que el usuario ya dijo.** Si en la conversación previa ya mencionó archivos, librerías, comportamiento esperado, restricciones — extraé eso y NO lo vuelvas a preguntar. Re-preguntar lo que ya se dijo es la forma más rápida de que el usuario abandone la skill.

**No preguntes más de 2-3 cosas por turno.** Aunque te queden 8 huecos por llenar, mandá las 3 más importantes y esperá. Las demás van a quedar más claras con las respuestas.

**Si el usuario está apurado o el tema es chico, saltá fases.** Mejor una issue 80% completa marcada con `[TODO: confirmar X]` que ninguna issue.

---

## Fase 0 — Triage de tamaño

Antes de cualquier otra pregunta, decidí (o preguntá si no es obvio) cuál es el tamaño aproximado:

- **XS** — fix puntual, una función, < 1h. *Ejemplo: corregir un typo en un mensaje, ajustar un margen, sumar un campo a una respuesta.*
- **S** — cambio acotado, 1-3 archivos. *Ejemplo: agregar un endpoint sencillo, refactor de una función, fix de bug con causa identificada.*
- **M** — feature mediano, varios archivos, posiblemente tests nuevos. *Ejemplo: agregar autenticación a un módulo, integrar una librería nueva, migrar un schema.*
- **L** — feature grande o cambio que cruza capas. *Ejemplo: rediseñar el sistema de notificaciones, agregar i18n al proyecto.*

**Regla de profundidad por tamaño:**

| Tamaño | Fases que recorrés |
|--------|--------------------|
| XS | 1, 3 (criterios mínimos), saltás 2/4/5 si no aplican |
| S | 1, 2, 3, 4 — restricciones (5) sólo si las hay |
| M | Todas |
| L | Todas + considerá proponer **partir en sub-issues** antes de seguir |

Si te dicen "L" o detectás L, **considerá seriamente sugerir descomponerla**. Una issue L mal partida es la causa #1 de que el agente ejecutor se pierda.

---

## Fase 1 — Intent (qué y por qué)

Esto siempre se llena. Necesitás saber:

- **Tipo**: feature / bug / refactor / chore / investigación / docs.
- **Problema o motivación**: ¿qué pasa hoy que no debería, o qué falta? Una línea o dos.
- **Resultado esperado**: ¿qué cambia para el usuario final, el dev, o el sistema, una vez hecho?

Si el usuario sólo te dice *qué* sin *por qué*, preguntá el por qué — sin eso el ejecutor no sabe cuándo está tomando una buena decisión de implementación.

**Ejemplo de pregunta combinada:** *"¿Esto es un bug o una feature nueva? ¿Y cuál es el problema concreto que querés resolver con este cambio?"*

---

## Fase 2 — Contexto del código

Esta es la fase de mayor palanca para Claude Code: cada path concreto que le pases le ahorra una ronda de búsqueda. Cubrí, en orden de importancia:

1. **Archivos / módulos / carpetas afectados.** Si los conocés: listalos. Si no los conocés con precisión, dale pistas ("algo en el módulo de auth", "la pantalla de checkout").
2. **Patrones existentes a seguir.** Si hay código similar ya en el repo, mencionalo: *"hacelo igual que el endpoint X en `services/foo.ts`"*. Esto vale oro.
3. **Referencias externas**: docs de la librería, RFC, issue/PR previos relacionados, link a un mockup, ejemplo en otro repo.
4. **Comandos clave** del proyecto que el agente debería saber: cómo correr tests, cómo levantar el dev server, cómo hacer build.

**Si el usuario no sabe los archivos:** está bien, no insistas. Marcá la issue con `[TODO: el agente debe localizar el módulo X]` y seguí.

**Pregunta tipo:** *"¿Sabés qué archivos/módulos van a tocarse? ¿Hay algún patrón parecido ya en el repo que querrías que siga?"*

---

## Fase 3 — Criterios de aceptación

Acá es donde la mayoría de las issues fallan. Un criterio de aceptación bueno es **observable**: alguien (humano o test) puede mirar el sistema y decir sí/no.

Mal:
- "Que funcione bien"
- "Que sea rápido"
- "Que esté bien testeado"

Bien:
- "Cuando un usuario no logueado entra a `/dashboard` lo redirige a `/login` con un query param `?redirect=/dashboard`"
- "El endpoint responde en menos de 200ms para payloads de hasta 1MB"
- "Existen tests unitarios para los 3 casos: input válido, input vacío, input con caracteres especiales"

Apuntá a entre **3 y 7 criterios** para una issue M. Menos de 3 suele ser ambiguo, más de 7 suele significar que la issue es en realidad varias.

**Pregunta tipo:** *"¿Cómo vas a saber que está terminada? Tirame 3-5 cosas que tendrían que cumplirse para darla por cerrada."*

Si el usuario te tira criterios vagos, ofrecé reformularlos en versión observable y pedile confirmación.

---

## Fase 4 — Edge cases y fuera de alcance

**Edge cases:** input vacío, input gigante, errores de red, permisos, concurrencia, navegación con back, datos viejos vs nuevos. No hace falta listar 20 — pedí los 2-3 que más le preocupen al usuario, e indicá que el resto los maneje el ejecutor con sentido común.

**Fuera de alcance (más importante de lo que parece):** los agentes tienden a "ya que estoy" — refactorizar de paso, agregar tests donde no había, mejorar el styling. Si hay cosas que *parecen* relacionadas pero que NO querés que se toquen en esta issue, listalas. Ejemplos:

- "No tocar el sistema de logging existente, aunque sea viejo."
- "No agregar tests para el módulo `legacy/`, está deprecated."
- "No cambiar la estructura de la base de datos."

**Pregunta tipo:** *"¿Hay algo cercano a esto que NO querés que se toque, aunque parezca tentador? Y de los edge cases, ¿hay alguno que te preocupe especialmente?"*

---

## Fase 5 — Restricciones

Sólo preguntá si el usuario no las mencionó y la issue es M o L. Cubrí las que apliquen:

- **Stack / librerías**: "usar la librería X", "no agregar dependencias nuevas", "esto tiene que ser server-side puro".
- **Performance / recursos**: límites concretos.
- **Seguridad**: handling de secretos, validación de input, autenticación.
- **Compatibilidad**: navegadores, versiones de Node/Python, mobile.
- **Estilo / convenciones**: linter, formatter, naming.
- **Workflow**: si tiene que abrir PR, branchear de algo específico, no commitear todavía, etc.

---

## Qué tan específico ser — heurística

Esta es la pregunta de calibración. La regla corta:

> **Especificá lo que es caro revertir. Dejá libre lo barato.**

| Tipo de decisión | Especificalo en la issue | Dejalo al ejecutor |
|------------------|--------------------------|---------------------|
| Elección de librería externa | ✅ | |
| Forma del schema / API pública | ✅ | |
| Convenciones que ya existen en el repo | ✅ (linkealas) | |
| Nombres de variables internos | | ✅ |
| Estructura interna de una función | | ✅ |
| Valores exactos de CSS (paddings, colores) | sólo si hay diseño/brand | ✅ default |
| Mensajes de UI visibles al usuario | ✅ | |
| Logs internos | | ✅ |
| Order of operations cuando importa (transacciones, side effects) | ✅ | |

**Regla de pulgar:** si dudás entre especificar o no, considerá: *"si el agente toma la decisión opuesta, ¿cuánto cuesta cambiarlo después?"* Si la respuesta es "5 minutos", dejalo libre. Si es "rehacer medio módulo", especificalo.

**Anti-patrón a evitar:** sobreespecificar para sentirse seguro. Una issue de 2000 palabras para una tarea S genera más confusión que claridad y le saca margen al ejecutor para hacer cosas razonables.

---

## Template del issue final

Generá el archivo con este template. Las secciones marcadas con `(opcional)` se omiten si están vacías — no las dejes con "N/A".

```markdown
---
title: <título corto en imperativo>
type: feature | bug | refactor | chore | investigation | docs
size: XS | S | M | L
status: ready | in-progress | done | blocked
created: YYYY-MM-DD
---

# <Título>

## Contexto y motivación

<2-4 líneas: qué pasa hoy y por qué este cambio>

## Resultado esperado

<2-4 líneas: cómo se ve el sistema después del cambio>

## Archivos / áreas afectadas

- `path/al/archivo.ts` — <qué se hace acá>
- `path/al/otro.ts` — <qué se hace acá>
- (o, si no se sabe) **A localizar:** <descripción del módulo>

## Patrones a seguir (opcional)

- Imitá el estilo de `path/de/referencia.ts`
- <otras pistas>

## Referencias (opcional)

- [Doc oficial de X](url)
- Issue relacionada: #123
- <link a mockup, RFC, etc.>

## Criterios de aceptación

- [ ] <criterio observable 1>
- [ ] <criterio observable 2>
- [ ] <criterio observable 3>

## Edge cases a manejar (opcional)

- <caso 1>
- <caso 2>

## Fuera de alcance

- <cosa que NO se debe tocar>
- <cosa que NO se debe hacer aunque parezca tentador>

## Restricciones (opcional)

- <librería obligatoria, prohibida, límite de performance, etc.>

## Comandos del proyecto (opcional)

- Tests: `<comando>`
- Dev server: `<comando>`
- Build: `<comando>`

## Notas (opcional)

<cualquier cosa que no encaje arriba: dudas pendientes marcadas como [TODO], decisiones tomadas, alternativas descartadas y por qué>
```

---

## Convención de archivos

- Carpeta base: **siempre dentro de un `.claude/issues/`** (no usar `issues/` en la raíz pelado, ni cualquier otra ubicación).
- Nombre: `NNN-slug-corto.md` donde `NNN` es un número correlativo de 3 dígitos (`001`, `002`, ...) y `slug` es 3-5 palabras en kebab-case.
- Ejemplo: `.claude/issues/047-redirect-unauth-to-login.md`.
- Si no podés averiguar el último número usado en ese `.claude/issues/`, usá la fecha: `YYYY-MM-DD-slug.md`.

### Elegir el `.claude/issues/` correcto (monorepo-aware)

**Esta lógica aplica SOLO si no resolviste un `issues_root` en el Setup inicial.** Si el `CLAUDE.md` declara `## Issues` con `**Root:** <path>`, usá ese path directamente y saltá toda esta sub-sección.

Si no hay root declarado, antes de escribir el archivo decidí en qué `.claude/issues/` va. **El paso es obligatorio** — no asumas la raíz por default.

1. **Escaneá el repo** para listar todos los `.claude/` existentes. Mirá:
   - `.claude/` en la raíz del repo.
   - `apps/*/.claude/`, `packages/*/.claude/`, `services/*/.claude/`, `libs/*/.claude/` y patrones equivalentes según el layout del monorepo.
   - Cualquier otro `.claude/` que encuentres (algunos repos lo tienen junto a un workspace específico).
2. **Decidí según lo que encontraste:**
   - **0 carpetas `.claude/`**: el repo no usa convención `.claude/`. Preguntale al usuario: *"No encontré ningún `.claude/` en el repo. ¿Lo creo en la raíz o adentro de algún paquete/app específico?"* — y dejá que decida.
   - **1 sola carpeta `.claude/`**: usala directamente sin preguntar, pero confirmá en el mensaje final dónde quedó el archivo.
   - **2 o más carpetas `.claude/`** (caso monorepo típico): **PREGUNTÁ al usuario en cuál colocarla**. Mostrale la lista numerada con un hint de a qué paquete/app pertenece cada una. Ejemplo:
     ```
     Encontré varios `.claude/` en el repo. ¿En cuál ponemos la issue?
       1. .claude/issues/           (raíz — issues que cruzan paquetes)
       2. apps/web/.claude/issues/  (frontend Next.js)
       3. apps/api/.claude/issues/  (backend NestJS)
       4. packages/ui/.claude/issues/  (design system)
     ```
     Si el contexto del issue lo hace obvio (ej.: el usuario ya dijo "esto es del frontend"), sugerí cuál te parece la más razonable como default, pero igual confirmá antes de escribir.
3. **Si el `.claude/issues/` elegido no existe todavía**, creá la carpeta `issues/` dentro del `.claude/` correspondiente. No crees un `.claude/` nuevo sin confirmación explícita del usuario.

**Por qué este paso importa:** en un monorepo, ubicar la issue en el paquete/app correcto le da al agente ejecutor pistas implícitas sobre el scope (qué `CLAUDE.md`, qué convenciones, qué tooling aplica). Ponerla en la raíz cuando es de un sub-paquete diluye ese contexto y el agente tiene que adivinar.

---

## `INDEX.md` — registro de issues existentes

Dentro del `issues_root` resuelto (sea el declarado en `CLAUDE.md` o el `.claude/issues/` elegido) **siempre se mantiene un `INDEX.md`** que lista todas las issues existentes con su estado actual. Es la vista de un vistazo para humanos y para agentes que necesitan ubicar trabajo previo o en curso sin abrir uno por uno los archivos.

### Estados válidos

El campo `status` del frontmatter de cada issue es la **fuente de verdad**. Los valores aceptados son:

- **`ready`** — escrita, scopeada y lista para que un agente o dev la tome.
- **`in-progress`** — alguien (humano o agente) está trabajando en ella ahora.
- **`done`** — terminada y verificada contra sus criterios de aceptación.
- **`blocked`** — escrita pero parada por una dependencia externa o decisión pendiente. Si está bloqueada, debería haber una nota en la sección **Notas** explicando por qué.

Si una issue tiene un `status` distinto a esos cuatro, normalizá al más cercano y avisá al usuario.

### Formato del archivo

`INDEX.md` vive en la raíz del `issues_root` (al lado de los archivos `NNN-slug.md`). Es una **tabla única ordenada por número de issue ascendente**.

```markdown
# Issues

Última actualización: YYYY-MM-DD

| #   | Título                          | Tipo    | Tamaño | Estado      |
|-----|---------------------------------|---------|--------|-------------|
| 001 | Redirigir a /login sin sesión   | feature | S      | ready       |
| 002 | Fix typo en mensaje de error    | bug     | XS     | done        |
| 003 | Migrar schema de usuarios       | refactor| M      | in-progress |
| 004 | Agregar i18n al checkout        | feature | L      | blocked     |
```

- La columna **#** es el `NNN` del nombre de archivo. Si la issue usa fallback con fecha (`YYYY-MM-DD-slug.md`), poné la fecha completa en esa columna.
- **Título**, **Tipo**, **Tamaño** y **Estado** se leen del frontmatter de cada archivo. No los infieras del nombre del archivo.
- Si el título es muy largo, truncalo a ~60 caracteres con `…` al final.
- No agregues columnas extras (autor, fechas, links). El INDEX es para ubicar rápido, no para reemplazar el contenido del issue.

### Cómo mantener el `INDEX.md` (editar, no regenerar)

**El `INDEX.md` se edita incrementalmente**, no se regenera de cero. Cada invocación de la skill toca una sola issue: agregás una fila, actualizás una fila, listo. No releas el directorio completo ni reescribís el archivo entero salvo que sea estrictamente necesario.

**Modo CREAR — agregar fila nueva:**

1. Abrí el `INDEX.md` (si no existe, creálo con el header y la tabla vacía).
2. Insertá una fila nueva en la posición correcta para mantener el orden ascendente por `#`.
3. Actualizá la línea `Última actualización: YYYY-MM-DD` con la fecha del día.

**Modo REFINAR — actualizar la fila existente:**

1. Abrí el `INDEX.md` y buscá la fila correspondiente a esa issue (por `#` o slug).
2. Si cambió título, tipo, tamaño o estado en el frontmatter del archivo de issue, actualizá esa fila específica. El resto de las filas no se tocan.
3. Actualizá la línea `Última actualización: YYYY-MM-DD`.

**Si la fila no existe en el INDEX (por ejemplo, una issue creada manualmente fuera de la skill):** agregala como en modo CREAR. No regeneres todo — sólo agregás la que falta.

**Si detectás desincronización** (la fila del INDEX dice un estado distinto al frontmatter de la issue): el frontmatter es la fuente de verdad. Leelo y actualizá esa fila puntual del INDEX. Sólo esa fila — no audites el resto.

**Si el `INDEX.md` no existía**, creálo con header, fecha y la tabla con la única fila correspondiente a la issue que acabás de crear o refinar. No salgas a leer todas las otras issues del directorio para poblarlo retroactivamente — eso lo hacen las próximas invocaciones cuando toquen cada una.

### Cambios de estado en modo REFINAR

En modo REFINAR el usuario puede pedirte explícitamente durante el flujo: *"marcala como done"*, *"está en progreso"*, *"bloqueala porque falta X"*. Aun así, **no escribas el cambio todavía** — guardalo como intención y confirmalo en el paso 6 del **Cierre** (preguntá si querés que aplique el cambio de `status` y, en paralelo, si querés que sincronice el `INDEX.md`).

Cuando el usuario confirma en el cierre:

1. Actualizá el campo `status` en el frontmatter del archivo de issue.
2. Si pasa a `blocked`, agregá (o pedile) una línea en **Notas** explicando el bloqueo.
3. Si pasa a `done`, verificá rápido que los criterios de aceptación estén tildados (`- [x]`). Si quedan sueltos, preguntale al usuario si están realmente cumplidos antes de cerrarla.
4. Si también confirmó actualizar el `INDEX.md`, sincronizá la fila correspondiente. Si NO confirmó, dejá el INDEX como está y avisale que va a quedar desincronizado con el frontmatter.

**No cambies el `status` por inferencia.** Sólo lo modificás si el usuario lo pide explícitamente Y confirma en el cierre.

---

## Ejemplos

### Versión mala (de referencia, NO generar así)

```markdown
# Mejorar el login

Hay que arreglar el login que está medio raro. Cuando el usuario no está logueado debería ir a otra parte. Que sea rápido y bien testeado.
```

Problemas: sin tipo, sin tamaño, sin archivos, criterios no observables ("rápido", "bien testeado"), sin fuera-de-alcance (el agente puede meterse a refactorizar todo el módulo de auth).

### Versión buena (XS-S)

```markdown
---
title: Redirigir a /login cuando un usuario no logueado entra a rutas protegidas
type: feature
size: S
status: ready
created: 2025-03-14
---

# Redirigir a /login cuando un usuario no logueado entra a rutas protegidas

## Contexto y motivación

Hoy si un usuario sin sesión entra a `/dashboard` ve un error 500 del backend en vez de un flujo limpio. Queremos que se redirija a `/login` y, después de loguearse, vuelva a la ruta original.

## Resultado esperado

Cualquier ruta marcada como protegida redirige a `/login?redirect=<original>` cuando no hay sesión válida. Tras login exitoso, se honra el `redirect`.

## Archivos / áreas afectadas

- `src/middleware/auth.ts` — agregar lógica de redirect
- `src/pages/login.tsx` — leer y honrar el query param `redirect`

## Patrones a seguir

- El middleware ya tiene un patrón para manejar 401 — extender ese, no crear uno paralelo.

## Criterios de aceptación

- [ ] Entrar a `/dashboard` sin sesión redirige a `/login?redirect=/dashboard` (status 302).
- [ ] Tras login exitoso con `?redirect=/dashboard`, el usuario termina en `/dashboard`.
- [ ] Si el `redirect` apunta a un dominio externo, se ignora y se manda a `/`.
- [ ] Tests para los 3 casos anteriores en `src/middleware/auth.test.ts`.

## Edge cases a manejar

- `redirect` con caracteres URL-encoded.
- `redirect` apuntando a la propia `/login` (loop) — ignorar.

## Fuera de alcance

- No tocar el flujo de signup.
- No cambiar el provider de auth ni la estructura de la sesión.
```

---

## Cierre

Cuando termines de generar o actualizar el archivo de issue:

1. Decile al usuario el path donde lo guardaste (archivo nuevo o refinado).
2. Mostrale un resumen de 3-4 líneas de la issue (no todo el contenido — confiá en que la va a leer).
3. Marcá explícitamente cualquier `[TODO]` pendiente que haya quedado, con una pregunta directa por cada uno para que pueda cerrarlas en la misma sesión si quiere.
4. Si la issue terminó siendo L, repetí la sugerencia de descomponerla en sub-issues antes de pasársela al agente ejecutor.
5. **En modo REFINAR**: listá explícitamente qué secciones modificaste y cuáles dejaste intactas, para que el usuario pueda revisar los cambios sin tener que diffear mentalmente.
6. **Preguntá explícitamente al usuario antes de tocar el `INDEX.md` y el `status` de la issue.** No actualices nada de eso por tu cuenta. Hacé estas dos preguntas (combinadas si querés, pero claras):
   - *"¿Querés que actualice el `INDEX.md` con esta issue?"* — si dice que sí, aplicá la mecánica de la sección **Cómo mantener el `INDEX.md`** (agregar fila en CREAR, actualizar fila en REFINAR). Si dice que no, dejalo intacto.
   - *"¿Querés que cambie el `status` de la issue? (actual: `<status actual>`)"* — si dice que sí, preguntá a qué estado (`ready` / `in-progress` / `done` / `blocked`) y aplicá las reglas de **Cambios de estado en modo REFINAR** (si pasa a `blocked` pedí motivo; si pasa a `done` verificá criterios tildados). Si dice que no, dejalo intacto.
   - Si el usuario dice sí a actualizar el `status` pero no al `INDEX.md`, igual avisale que el INDEX va a quedar desincronizado con el frontmatter, para que decida con esa info.

**Regla dura:** nunca toques `INDEX.md` ni el `status` sin confirmación explícita del usuario en este turno. Esto aplica incluso si el usuario ya te pidió cambiar el estado durante la fase de refinado — confirmá igual antes de escribir.