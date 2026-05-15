---
name: project-architecture-bootstrap
description: Entrevista interactiva por fases para capturar decisiones arquitectónicas al iniciar un proyecto y materializarlas como ADRs (Architecture Decision Records) en .claude/adr/. Soporta single-package y multi-package (monorepos, monolitos modulares, microservicios) con un cuestionario completo y autónomo por paquete. Usá esta skill SIEMPRE que el usuario inicie un proyecto nuevo, clone un repo vacío, mencione "arrancar un proyecto / empezar un proyecto / setup inicial", agregue un paquete/servicio nuevo a un monorepo existente, pida ayuda con la arquitectura inicial, hable de "definir capas, estructura, convenciones", quiera revisar o actualizar decisiones arquitectónicas existentes, o cuando detectes un repo (o paquete) sin .claude/adr/ ni CLAUDE.md y el usuario esté por escribir código que toca estructura. También dispará si el usuario menciona "ADR", "decisión arquitectónica", "convenciones del proyecto", "manejo de errores", "capas", "acoplamiento", "estructura de carpetas", "monorepo", "workspace", "microservicio nuevo".
---

# Project Architecture Bootstrap

Entrevista al usuario por fases para capturar las decisiones arquitectónicas y de convenciones del proyecto, y las materializa como ADRs estructurados que Claude consultará en futuras sesiones via `.claude/adr/INDEX.md`.

El objetivo es que las decisiones queden **registradas y verificables**, no implícitas en la cabeza del autor. Eso le permite a Claude (y a cualquier nuevo dev) trabajar respetando las convenciones sin volver a preguntarlas.

---

## Cuándo correr esta skill

- Proyecto nuevo (greenfield) sin `.claude/adr/` ni `CLAUDE.md`
- Repo existente que el usuario quiere "ordenar"
- El usuario pide explícitamente revisar/actualizar decisiones de arquitectura
- Detectás que vas a tocar estructura/capas/auth/errores y no hay convenciones documentadas
- En un monorepo / monolito modular / microservicios: cada vez que se agrega un paquete nuevo o se quiere documentar las convenciones de un paquete que aún no las tiene

Si `.claude/adr/INDEX.md` ya existe con contenido (en raíz o en el paquete relevante): **NO rehagas todo**. Andá al modo `update` (final del documento).

---

## Reglas de UX que aplican a TODAS las fases

Estas reglas son la diferencia entre una skill que la gente usa y una que abandona en el tercer turno.

**Una pregunta por turno.** Nunca dumpees una lista de 8 preguntas. Hacé una, esperá la respuesta, leéla, recién ahí formulá la siguiente. Si tenés que hacer varias en una fase, separalas en turnos.

**Opciones concretas con default sugerido.** Mal: "¿cómo manejás errores?". Bien: "¿Excepciones (default para Python/Java/Node), Result types (default para Rust/Go), o mix pragmático? Para tu stack te recomiendo X porque Y."

**Siempre incluí "no sé, recomendame".** Mucha gente no tiene opinión formada todavía. Cuando elijan esa opción, proponé con justificación de 2 líneas y pedí confirmación.

**Una línea de "por qué importa" antes de cada pregunta.** Sin sermones. Solo el contexto mínimo para que el usuario sepa qué decide.

**Adaptate al contexto del Pre-flight.** Si es un script de 200 líneas, no insistas con Clean Architecture. Si ya está decidido NestJS, no preguntes si va a haber DI manual. Saltá fases enteras cuando no apliquen, pero siempre **pedí permiso para saltar** y **registrá el motivo** (ver siguiente regla).

**Nunca omitas en silencio.** Si una fase o subtema se salta — por elección del usuario, por atajo basado en contexto, o porque "no aplica" — generá igualmente el archivo del ADR con `Status` apropiado (`Not Applicable`, `Pending`, `Deferred`) y una **razón breve de 1-2 líneas**. Una omisión sin justificación es una decisión perdida; en 6 meses nadie va a recordar si fue olvido o decisión consciente. Ver sección "Cómo manejar fases omitidas" más abajo.

**Permití aplazar explícitamente.** Cualquier subtema puede quedar como `Status: Pending` con la razón ("lo definimos cuando llegue el feature de pagos", "esperamos a tener equipo para decidir"). Mejor un ADR honesto con "pendiente + por qué" que una decisión inventada o un hueco silencioso.

**Registrá tecnologías concretas a medida que aparecen.** Cada vez que en cualquier fase el usuario menciona o confirma una tecnología concreta (lenguaje, framework, DB, ORM, librería de logging, test framework, container de DI, etc.), creá inmediatamente su mini-ADR en `.claude/adr/tech/<nombre>.md` con tecnología, versión, por qué (1-2 líneas) y alternativas descartadas. **No esperes a la materialización final** — el catálogo se construye intercalado con la conversación. Ver sección "Catálogo de tecnologías" más abajo.

---

## Pre-flight (siempre primero)

Antes de la primera pregunta, hacé una inspección rápida del repo:

```bash
ls -la
test -f CLAUDE.md && echo "--- CLAUDE.md existe ---" && cat CLAUDE.md
test -d .claude/adr && echo "--- ADRs existentes en raíz ---" && ls .claude/adr/
test -d .claude/adr/tech && echo "--- Tech ya registrada ---" && ls .claude/adr/tech/
test -f package.json && echo "--- package.json ---" && head -50 package.json
test -f pyproject.toml && echo "--- pyproject.toml ---" && head -50 pyproject.toml
test -f go.mod && echo "--- go.mod ---" && cat go.mod
test -f Cargo.toml && echo "--- Cargo.toml ---" && head -30 Cargo.toml
test -f composer.json && echo "--- composer.json ---" && head -30 composer.json
test -f Gemfile && echo "--- Gemfile ---" && cat Gemfile
```

**Después** corré el bloque de detección de paquetes descrito en la sección "Multi-paquete" para saber si trabajás en raíz o en un sub-paquete.

Con eso ya sabés:
- Si hay decisiones previas (`.claude/adr/INDEX.md` existe → modo update)
- Stack y framework principal (para defaults inteligentes)
- Si el repo es greenfield o tiene código existente

Mostrale al usuario un resumen breve de lo detectado antes de empezar a preguntar:
> "Detecté Python con FastAPI, no hay ADRs previos, repo nuevo. Si te parece bien arrancamos por la Fase 0 (contexto). ¿Vamos?"

---

## Multi-paquete (monorepo / monolito modular / microservicios)

Esta skill soporta repos con múltiples paquetes/módulos/servicios. **Cada paquete tiene su propio `.claude/adr/` autónomo** — no hay decisiones "globales" heredadas. Si dos paquetes comparten convención, cada uno lo registra explícitamente en su propio ADR (puede ser idéntico o no).

### Detección de paquetes

Como parte del pre-flight, después de `ls -la`, buscá manifests recursivamente (max-depth 4 para evitar nodear/venv/dist):

```bash
# Manifests típicos por ecosistema
find . -maxdepth 4 \( \
  -name "package.json" -o \
  -name "pyproject.toml" -o \
  -name "go.mod" -o \
  -name "Cargo.toml" -o \
  -name "composer.json" -o \
  -name "Gemfile" -o \
  -name "build.gradle" -o \
  -name "build.gradle.kts" -o \
  -name "pom.xml" -o \
  -name "*.csproj" \
\) -not -path "*/node_modules/*" -not -path "*/.venv/*" -not -path "*/venv/*" \
  -not -path "*/vendor/*" -not -path "*/dist/*" -not -path "*/build/*" \
  -not -path "*/target/*" -not -path "*/.next/*"

# Workspaces explícitos (señal fuerte de monorepo)
test -f pnpm-workspace.yaml && echo "--- pnpm workspaces ---" && cat pnpm-workspace.yaml
test -f lerna.json && echo "--- lerna ---" && cat lerna.json
test -f turbo.json && echo "--- turborepo ---" && cat turbo.json
test -f nx.json && echo "--- nx ---" && cat nx.json
grep -l "workspaces" package.json 2>/dev/null && echo "--- npm/yarn workspaces detectados ---"
```

### Reglas de ramificación según lo detectado

**Caso A: Un solo paquete (1 manifest, o todos los manifests están en raíz).**
→ Asumí ese paquete. No preguntes nada sobre paquetes. Generá ADRs en `.claude/adr/` (en raíz). Comportamiento idéntico al modo single-package descrito en el resto del documento.

**Caso B: Múltiples paquetes (varios manifests en distintos directorios).**
→ Mostrá la lista detectada y preguntá cuál tocar. Una sola pregunta:

> "Detecté estos paquetes:
>  - `packages/api` (Node, package.json)
>  - `packages/worker` (Python, pyproject.toml)
>  - `services/billing` (Go, go.mod)
>
> ¿Sobre cuál querés trabajar ahora?
>  - [paquete 1]
>  - [paquete 2]
>  - [paquete 3]
>  - Todos secuencialmente (uno después del otro)
>  - Otro / no detectado (decime el path)"

→ Una vez elegido, **todo el flujo posterior opera dentro de ese paquete**: `<paquete>/.claude/adr/`, no en la raíz. El `CLAUDE.md` se escribe en la raíz del paquete (`<paquete>/CLAUDE.md`), no en la raíz del repo.

**Caso C: Workspace declarado pero sin paquetes aún (ej: `pnpm-workspace.yaml` sin nada en `packages/`).**
→ Es greenfield monorepo. Avisá: "veo que esto es un monorepo pero todavía no hay paquetes. Te recomiendo crear el primer paquete antes de correr la skill, o decime el path donde lo vas a crear y arranco ahí."

### CLAUDE.md raíz en multi-paquete

En modo multi-paquete, el `CLAUDE.md` de la raíz del repo cumple un rol distinto: es un **router de paquetes**, no contiene convenciones propias. Al terminar de procesar cualquier paquete, **actualizá el `CLAUDE.md` raíz** para listar todos los paquetes con sus ADRs (si ya existe, hacé merge, no sobrescribas).

Template del `CLAUDE.md` raíz en multi-paquete:

```markdown
# Project — Multi-package conventions

Este repo contiene múltiples paquetes, cada uno con sus propias decisiones arquitectónicas independientes.

**Antes de trabajar en código de un paquete específico:**
1. Identificá en qué paquete estás (mirá el path del archivo).
2. Leé `<paquete>/.claude/adr/INDEX.md` para las convenciones de ese paquete.
3. Leé `<paquete>/.claude/adr/tech/INDEX.md` antes de instalar dependencias en ese paquete.

**Importante:** las convenciones NO se heredan entre paquetes. Lo que vale en `packages/api` no necesariamente vale en `packages/worker`.

## Paquetes registrados

| Paquete | Stack | Convenciones |
|---|---|---|
| [packages/api](packages/api/.claude/adr/INDEX.md) | Node + NestJS | ver INDEX |
| [packages/worker](packages/worker/.claude/adr/INDEX.md) | Python + Celery | ver INDEX |
| [services/billing](services/billing/.claude/adr/INDEX.md) | Go | ver INDEX |

## Paquetes sin ADRs

| Paquete | Estado |
|---|---|
| `packages/web` | Pendiente de bootstrap |

Para crear/actualizar las convenciones de un paquete, usá la skill `project-architecture-bootstrap` desde el directorio raíz del paquete (o decile a Claude qué paquete tocar).
```

### Modo "todos secuencialmente"

Si el usuario eligió procesar todos los paquetes de una, hacelo **uno a la vez en serie, no mezclados**: terminá las 6 fases del paquete 1, luego arrancá el paquete 2 desde Fase 0. Al final de cada paquete, confirmá antes de pasar al siguiente ("¿seguimos con `packages/worker` o paramos acá?"). Esto evita conversaciones donde el usuario pierde el hilo de en qué paquete está respondiendo.

### Detección del paquete actual desde cwd

Si el usuario corre la skill estando dentro de un subdirectorio de paquete (ej: cwd = `packages/api`), **asumí ese paquete sin preguntar** y avisá: "estás en `packages/api`, arranco con ese". Si quería otro, lo va a decir.

---

## Cómo manejar fases / subtemas omitidos

Cuando el usuario dice "saltemos esta fase", "no aplica", "esto no me interesa", o vos proponés un atajo y lo acepta: **NO te saltes el archivo, solo cambiá el status y registrá el motivo.**

### Flujo cuando se omite algo

Hacé una pregunta corta para clasificar el motivo. Ofrecé estas opciones:

1. **No aplica al tipo de proyecto** → Status: `Not Applicable`. Ej: "Es un script CLI sin red, no necesita auth."
2. **Lo decidimos después** → Status: `Pending` (con trigger esperado opcional). Ej: "Definimos auth cuando llegue el milestone de usuarios públicos."
3. **No me interesa documentarlo / lo manejamos ad-hoc** → Status: `Not Applicable` con motivo honesto. Ej: "Equipo de 1, decisiones de logging se toman cuando aparecen."
4. **Otra razón** → Status: el que aplique, motivo libre.

Después creá igualmente el archivo (`<nn>-<tema>.md`), con el `Status` correspondiente y la razón en una sección dedicada (ver template más abajo).

### Status posibles

Normalizá los status a este conjunto cerrado, así el INDEX y las revisiones futuras son consistentes:

- **`Accepted`** — Decisión tomada y vigente.
- **`Pending`** — Sabemos que hay que decidirlo, todavía no es el momento. Incluye trigger ("cuando…") si se conoce.
- **`Not Applicable`** — Decisión consciente de que este tema no aplica al proyecto. Lleva razón obligatoria.
- **`Deferred`** — Postergado deliberadamente con fecha o condición de revisión.
- **`Superseded`** — Reemplazado por otro ADR. Lleva referencia al que lo sustituye.

### Aplica también a la Fase 5 y al catálogo `tech/`

- **Subtemas de Fase 5 no elegidos** en el setup inicial → crear `<nn>-<tema>.md` con `Status: Not Applicable` y motivo ("el usuario no marcó este subtema en el cuestionario inicial; revisar más adelante si surge la necesidad"). Esto cambia la regla anterior de "no crear archivos para subtemas no elegidos" — sí se crean, pero como omisiones documentadas, no como decisiones huecas.
- **Catálogo `tech/`** → si una categoría queda sin tecnologías (ej: no hay auth porque la fase está `Not Applicable`), la sección en `tech/INDEX.md` lleva una nota: `_No aplica — ver 10-auth.md_` o `_Pendiente de decidir_`.

### Re-visitar omisiones después

Cuando el usuario corre la skill de nuevo en modo `update`, listá explícitamente las fases con status `Pending`, `Deferred` y `Not Applicable` y preguntá si alguna cambió de estado. Es la única forma de que el "lo decidimos después" no se pierda en el tiempo.

---

## Las fases

### Fase 0 — Contexto del proyecto

Cuatro preguntas, una por turno:

1. **Tipo de proyecto.** API REST, API GraphQL, CLI, librería, app web SPA, app web SSR, microservicio, monolito modular, script/automatización, otro.
2. **Stack principal.** Si el pre-flight ya lo detectó, mostralo y pedí confirmación. Sino, preguntá lenguaje + framework.
3. **Tamaño del equipo esperado.** Solo, 2-3, 4-10, 10+.
4. **Greenfield o sobre código existente.**

**Atajo importante:** si en (1) dijo "script chico" o "automatización" y en (3) dijo "solo", proponé saltar las Fases 1-3 e ir directo a Fase 4 + subset mínimo de Fase 5. Pedí permiso explícito para el atajo.

**Tech a registrar en esta fase:** lenguaje y framework principal (ej: `python.md`, `fastapi.md`, `node.md`, `nestjs.md`). Pedí versión (intentá detectarla del manifest si no la dice) y "por qué" en 1-2 líneas.

→ Materializa en `00-context.md`.

---

### Fase 1 — Estilo arquitectónico y acoplamiento

Dos preguntas, una por turno.

**1.1 Patrón arquitectónico.** Ofrecé estas opciones con una línea de "cuándo conviene" cada una:

- **Clean / Hexagonal / Ports & Adapters** — cuando la lógica de negocio es rica y querés que sea testeable e independiente de framework/DB.
- **Layered N-tier clásica** (Controller → Service → Repository) — pragmática, fácil de entender, default razonable para CRUD-heavy.
- **Vertical Slice / Feature folders** — cuando los features son independientes y querés cohesión por feature en lugar de por capa.
- **MVC simple** — apps web tradicionales, prototipos.
- **Event-driven / CQRS** — sistemas con muchos side effects, alta escala de lectura, o auditoría fuerte.
- **Sin patrón formal** (lo más simple posible) — scripts, prototipos, librerías chicas.
- **No sé, recomendame.**

**1.2 Nivel de acoplamiento buscado.**

- **Alto desacople** — interfaces y DI por todos lados. Mejor para test-driven, peor para velocidad inicial.
- **Pragmático** — interfaces solo en bordes I/O (DB, HTTP externo, filesystem). Resto concreto. Buen balance.
- **Acoplamiento directo** — sin interfaces. Código más simple, menos testeable, ok para prototipos.
- **No sé, recomendame.**

→ Materializa en `01-architecture-style.md`.

---

### Fase 2 — Capas y reglas de dependencia

Esta fase tiene dos partes y es probablemente la más importante. Las reglas que se acuerden acá las va a respetar Claude en futuras sesiones, así que **escribilas verificables**.

**2.1 Definir capas.** Basándote en lo elegido en Fase 1, **proponé las capas con nombres concretos** y pedí confirmación. Ejemplo si eligió Clean:

> Te propongo estas capas:
> - `domain/` — entidades, value objects, lógica pura de negocio
> - `application/` — casos de uso, orquestación, interfaces de repos
> - `infrastructure/` — implementaciones concretas (DB, HTTP clients, filesystem)
> - `presentation/` — controllers, CLI handlers, schemas/DTOs de API
>
> ¿Confirmás, querés renombrar, o agregar/quitar alguna?

**2.2 Reglas de dependencia.** Mostrá las reglas como matriz o lista en formato verificable (paths/globs):

> Reglas que voy a escribir:
> - `src/domain/**` solo puede importar de `src/domain/**`
> - `src/application/**` puede importar de `src/domain/**` y `src/application/**`
> - `src/infrastructure/**` puede importar de cualquier capa (implementa interfaces)
> - `src/presentation/**` puede importar de `src/application/**` y `src/domain/**`
> - Prohibido: `src/presentation/**` → `src/infrastructure/**` directo
> - Prohibido: `src/domain/**` → cualquier framework externo
>
> ¿Querés ajustar alguna?

Importante: **las reglas tienen que ser ejecutables**. Escribilas en formato glob/path para que después se puedan enforce con import-linter (Python), dependency-cruiser (JS/TS), ArchUnit (Java), etc. Mencioná esa posibilidad al usuario al final de la fase.

→ Materializa en `02-layers-and-dependencies.md`.

---

### Fase 3 — Comunicación entre capas

Cuatro preguntas, una por turno:

**3.1 DTOs vs entidades en los bordes.** ¿Las capas externas (controllers, infra) ven entidades de dominio crudas, o se mapean siempre a DTOs/schemas/view models?

- DTOs siempre en bordes (default para Clean estricta)
- Entidades pueden cruzar (más simple, ok para apps chicas)
- Mix: entrada con DTOs, salida puede ser entidad

**3.2 Sync vs async + eventos de dominio.** 

- Toda comunicación directa síncrona (default simple)
- Eventos de dominio in-process (mediator pattern)
- Message bus externo (Kafka/RabbitMQ/SQS) para desacople real

**3.3 Dirección de dependencias.** ¿Dónde se declaran las interfaces de repositorios y servicios externos?

- En `domain/` (Hexagonal estricto)
- En `application/` (Clean clásica, default recomendado)
- No usamos interfaces (depende de implementación concreta)

**3.4 Validación.** ¿Dónde vive?

- Solo en el borde (DTO/schema con pydantic/zod/joi/etc.)
- Solo en el dominio (constructores estrictos, value objects)
- Ambos (defensa en profundidad, default robusto)

→ Materializa en `03-inter-layer-communication.md`.

---

### Fase 4 — Manejo de errores

Cinco preguntas:

**4.1 Estilo de errores.**

- Excepciones (default para Python/Java/Node/C#)
- Result/Either types (default para Rust/Go, opcional en otros lenguajes con librerías)
- Mix pragmático: excepciones para fallas inesperadas, Result para flujos esperados de error

**4.2 Boundary handling.** ¿Dónde se atrapan los errores que escapan de las capas internas?

- Middleware/interceptor global (default para frameworks web)
- Cada controller individual
- Mix: middleware para crashes, controllers para errores de negocio

**4.3 Errores de dominio custom.** ¿Definimos jerarquía propia (`UserNotFoundError`, `InsufficientFundsError`)?

- Sí, jerarquía completa con base class de dominio
- Solo para errores de negocio importantes
- No, usamos los nativos del lenguaje

**4.4 Formato de respuesta de error (solo si es API).**

- RFC 7807 Problem Details (default recomendado para REST)
- Formato custom JSON (`{error, code, details}`)
- Texto plano (no recomendado para APIs serias)

**4.5 Política de logging de errores.**

- Qué se loggea: todos / solo 5xx / nada de PII
- Nivel por tipo de error: error vs warn vs info
- Qué NUNCA se loggea: passwords, tokens, datos personales, payloads completos

→ Materializa en `04-error-handling.md`.

---

### Fase 5 — Convenciones transversales

Recorré **solo los subtemas marcados por el usuario en el setup inicial**. Para los no marcados, no creés archivo.

**5.1 Inyección de dependencias** → `05-dependency-injection.md`
- Manual (factories en composition root / main)
- Container (qué library: dependency-injector, awilix, tsyringe, etc.)
- Framework-provided (NestJS, Spring, ASP.NET DI, etc.)
- *Tech a registrar:* la librería de container si se eligió una (ej: `awilix.md`, `tsyringe.md`, `dependency-injector.md`).

**5.2 Estrategia de testing** → `06-testing-strategy.md`
- Pirámide objetivo (proporción unit/integration/e2e)
- Mocks vs fakes vs reales (testcontainers para DBs reales)
- TDD obligatorio sí/no
- Cobertura mínima (si se mide)
- *Tech a registrar:* test framework (`pytest.md`, `vitest.md`, `jest.md`), librería de mocking si es separada, testcontainers si se usa.

**5.3 Logging** → `07-logging.md`
- Estructurado JSON o texto plano
- Niveles disponibles
- Correlación de requests (request-id, trace-id)
- Librería sugerida según stack (structlog, pino, zerolog, etc.)
- *Tech a registrar:* librería de logging elegida (ej: `structlog.md`, `pino.md`, `zerolog.md`).

**5.4 Configuración y secretos** → `08-configuration-secrets.md`
- Mecanismo: env vars puras, .env, archivos config (yaml/toml), secret manager
- Validación de config al startup sí/no
- Schema de config tipado (pydantic-settings, zod, viper, etc.)
- *Tech a registrar:* librería de config tipada (`pydantic-settings.md`, `zod.md`, `viper.md`) y secret manager si se usa (`vault.md`, `aws-secrets-manager.md`).

**5.5 Acceso a datos** → `09-data-access.md`
- ORM (cuál) / query builder / raw SQL
- Patrón Repository sí/no
- Migraciones (qué herramienta)
- Transacciones: dónde se inician (controller / use case / service)
- *Tech a registrar:* motor de DB (`postgresql.md`, `mongodb.md`), ORM/query builder (`sqlalchemy.md`, `prisma.md`, `drizzle.md`), herramienta de migraciones si es separada (`alembic.md`, `flyway.md`).

**5.6 Auth** → `10-auth.md`
- Mecanismo: JWT / sessions / OAuth / API keys / mix
- Modelo de permisos: RBAC / ABAC / simple boolean
- Dónde se valida: middleware / decorator / manual
- Refresh tokens sí/no, expiración, rotación
- *Tech a registrar:* librería de auth si se usa una específica (`passport.md`, `authlib.md`, `next-auth.md`), proveedor de identidad si aplica (`auth0.md`, `keycloak.md`).

**5.7 Estructura de carpetas y naming** → `11-folder-structure.md`
- Por feature (`/users/*` con todo adentro) vs por capa (`/controllers/*`, `/services/*`)
- Convenciones de nombres por tipo (snake_case/camelCase/PascalCase)
- Sufijos/prefijos (`UserService`, `user_repository.py`, etc.)

---

### Catálogo de tecnologías (transversal a todas las fases)

Esta no es una fase en sí — es un **registro paralelo** que se construye intercalado con la conversación. Cada vez que en cualquier fase el usuario menciona o confirma una tecnología concreta, creás inmediatamente su mini-ADR.

#### Cuándo crear un mini-ADR de tecnología

Cualquiera de estas:
- El usuario nombra explícitamente una lib/framework/herramienta ("usemos Postgres", "para tests pytest", "logging con pino").
- El usuario elige una opción que implica una tecnología concreta ("ORM" → preguntar cuál → registrar).
- Vos recomendás algo y el usuario lo acepta ("¿pydantic-settings?" → "dale" → registrar).
- Detectaste la tech en pre-flight desde un manifest (package.json, pyproject.toml) y el usuario confirma seguir usándola.

**No registres** versiones internas del lenguaje, dependencias transitivas, ni herramientas de build estándar (npm, pip) salvo que el usuario explícitamente las haya elegido sobre otra (ej: pnpm sobre npm sí amerita ADR).

#### Flujo al detectar una tecnología

Tres preguntas rápidas (pueden ir en un solo turno porque son cortas):

1. **Versión.** Si el manifest la tiene, mostrala como default. Sino preguntá.
2. **Por qué (1-2 líneas).** Si el usuario no tiene una razón clara, sugerí una basada en el contexto y pedí confirmación. Ej: "diría 'estándar de facto en el ecosistema Python para validación' — ¿te sirve o ponemos otra cosa?".
3. **Alternativas descartadas (1 línea).** Listá 1-3 que se hayan considerado o que sean obvias en ese espacio. Si fue una elección sin reflexión, anotá "ninguna evaluada" — es información honesta y útil para el futuro.

Después escribí el archivo y seguí con la conversación de la fase. No detengas el flujo principal por esto.

#### Estructura de archivos

```
.claude/adr/tech/
├── INDEX.md                  # tabla con todas las tech, agrupada por categoría
├── python.md                 # ej: lenguaje
├── fastapi.md                # ej: framework web
├── postgresql.md             # ej: DB
├── sqlalchemy.md             # ej: ORM
├── pytest.md                 # ej: test framework
├── structlog.md              # ej: logging
└── ...
```

Naming: `<nombre-en-kebab-case>.md`. Sin prefijos numéricos — el orden no importa, el INDEX agrupa.

#### Template del mini-ADR de tecnología

```markdown
# <Nombre de la tecnología>

- **Categoría:** <Lenguaje | Framework web | DB | ORM | Test | Logging | DI | Config | Auth | Migraciones | Otro>
- **Versión:** <ej: 3.12 | ^0.115.0 | latest | sin pinear>
- **Status:** Accepted
- **Decidido en fase:** <0..5.x>
- **Fecha:** <YYYY-MM-DD>

## Por qué la elegimos

<1-2 líneas. Concreto, no marketing. Ej: "Estándar de facto en Python moderno para validación tipada; integra nativo con FastAPI.">

## Alternativas descartadas

- **<alternativa A>:** <1 línea con el motivo. Ej: "marshmallow: API más vieja, sin tipado nativo.">
- **<alternativa B>:** <1 línea>
- (o "Ninguna evaluada formalmente" si fue elección por defecto)

## Notas

<opcional. Restricciones, gotchas, links útiles, configuración no obvia>
```

#### Template del INDEX de tech (`.claude/adr/tech/INDEX.md`)

```markdown
# Catálogo de tecnologías

Registro vivo de las tecnologías concretas elegidas para el proyecto. Cada entrada apunta a un mini-ADR con el "por qué" y alternativas descartadas.

**Para Claude:** consultá esta tabla antes de sugerir agregar una nueva dependencia. Si lo que vas a agregar pisa con algo ya elegido, **no lo agregues sin preguntar**.

## Por categoría

### Lenguaje y runtime
| Tech | Versión | Por qué (resumen) |
|---|---|---|
| [python](python.md) | 3.12 | <1 línea> |

### Framework principal
| Tech | Versión | Por qué |
|---|---|---|
| [fastapi](fastapi.md) | ^0.115 | <1 línea> |

### Base de datos
| Tech | Versión | Por qué |
|---|---|---|

### ORM / Acceso a datos
| Tech | Versión | Por qué |
|---|---|---|

### Testing
| Tech | Versión | Por qué |
|---|---|---|

### Logging
| Tech | Versión | Por qué |
|---|---|---|

### Configuración / Secretos
| Tech | Versión | Por qué |
|---|---|---|

### Auth
| Tech | Versión | Por qué |
|---|---|---|

### Inyección de dependencias
| Tech | Versión | Por qué |
|---|---|---|

### Otros
| Tech | Versión | Por qué |
|---|---|---|

## Mantenimiento

- **Agregar tech:** crear `<nombre>.md` con el template, sumar fila en la categoría correspondiente.
- **Reemplazar tech:** marcar Status del viejo como `Superseded`, crear nuevo, sacar del INDEX el viejo (o moverlo a sección "Históricas").
- **Actualizar versión:** editar el archivo, anotar en Notas si hay breaking changes a tener en cuenta.
```

(Las categorías sin filas se dejan vacías para que se vean los huecos a llenar.)

---

### Fase 6 — Materialización

#### Paso 1: Resumir y confirmar

Antes de escribir nada, **mostrá un resumen completo** con todas las decisiones tomadas, agrupadas por fase. Pedí confirmación final. Permití editar cualquier respuesta antes de materializar.

#### Paso 2: Estructura de archivos a generar

**Variante single-package** (1 paquete o todos los manifests en raíz):

```
<root>/
├── CLAUDE.md                              # mínimo, apunta al INDEX
└── .claude/
    └── adr/
        ├── INDEX.md                        # router que dice cuándo consultar cada ADR
        ├── 00-context.md                   # Fase 0
        ├── 01-architecture-style.md        # Fase 1
        ├── 02-layers-and-dependencies.md   # Fase 2
        ├── 03-inter-layer-communication.md # Fase 3
        ├── 04-error-handling.md            # Fase 4
        ├── 05-dependency-injection.md      # Fase 5.1 (si elegida)
        ├── 06-testing-strategy.md          # Fase 5.2 (si elegida)
        ├── 07-logging.md                   # Fase 5.3 (si elegida)
        ├── 08-configuration-secrets.md     # Fase 5.4 (si elegida)
        ├── 09-data-access.md               # Fase 5.5 (si elegida)
        ├── 10-auth.md                      # Fase 5.6 (si elegida)
        ├── 11-folder-structure.md          # Fase 5.7 (si elegida)
        └── tech/                            # Catálogo transversal
            ├── INDEX.md                     # tabla por categoría
            └── <una tech>.md                # un archivo por tecnología elegida
```

**Variante multi-package** (varios paquetes detectados):

```
<root>/
├── CLAUDE.md                              # router de paquetes (NO contiene convenciones)
├── packages/
│   ├── api/
│   │   ├── CLAUDE.md                       # mínimo, apunta al INDEX local
│   │   └── .claude/adr/                    # estructura completa idéntica a single-package
│   │       ├── INDEX.md
│   │       ├── 00-context.md
│   │       ├── ... (todos los ADRs)
│   │       └── tech/
│   │           └── INDEX.md
│   └── worker/
│       ├── CLAUDE.md
│       └── .claude/adr/
│           ├── INDEX.md
│           └── ...                         # decisiones independientes de api/
└── services/
    └── billing/
        ├── CLAUDE.md
        └── .claude/adr/
            └── ...
```

**Importante:** **TODOS** los archivos de fase y subtema se crean siempre, incluso los que el usuario no eligió. La diferencia está en el `Status`: los elegidos quedan `Accepted`, los omitidos quedan `Not Applicable` / `Pending` con razón documentada. Esto evita el patrón "huecos silenciosos" donde nadie sabe si una decisión faltante es olvido o intención. La carpeta `tech/` se va llenando intercalada con la conversación, no en el final.

**En multi-package:** las convenciones de un paquete viven exclusivamente en `<paquete>/.claude/adr/`. El `CLAUDE.md` raíz solo enruta — no contiene reglas. No se generan ADRs en `<root>/.claude/adr/` cuando hay multi-package.

#### Paso 3: Templates

**`CLAUDE.md` (variante single-package — raíz del repo o del paquete único, mínimo):**

```markdown
# Project Conventions for Claude

Las decisiones arquitectónicas y de convenciones de este proyecto están en `.claude/adr/`.

**Antes de escribir código que toque arquitectura, capas, errores, auth, datos o convenciones, leé `.claude/adr/INDEX.md`** para saber qué ADR consultar.

**Antes de instalar/sugerir cualquier dependencia nueva (lib, framework, herramienta, DB), leé `.claude/adr/tech/INDEX.md`** para ver qué tecnologías ya están elegidas. Si tu sugerencia pisa con algo ya registrado, no la introduzcas sin preguntar al usuario.

Si una decisión no está documentada o algo no queda claro, **preguntá al usuario antes de inventar una convención**. Las decisiones se registran como ADR, no se improvisan.

Para crear, actualizar o revisar decisiones arquitectónicas (incluyendo agregar/cambiar tecnologías del catálogo), usá la skill `project-architecture-bootstrap`.
```

> Para la variante multi-package (CLAUDE.md raíz como router + un CLAUDE.md por paquete), ver el template en la sección "Multi-paquete" más arriba.

**`.claude/adr/INDEX.md`:**

```markdown
# Architecture Decision Records — Index

Este índice te dice qué ADR consultar según lo que estés por hacer. Leé solo los relevantes a la tarea actual.

## Cómo usar este índice

1. Identificá qué tipo de tarea estás por hacer.
2. Buscá la fila correspondiente en la tabla.
3. Leé los ADRs listados antes de escribir código.
4. Si hay contradicción entre tu plan y un ADR: pará y preguntale al usuario.

## Mapa de ADRs

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [00-context.md](00-context.md) | <status> | Contexto del proyecto | Necesites entender qué tipo de proyecto es, stack, equipo, alcance. |
| [01-architecture-style.md](01-architecture-style.md) | <status> | Estilo arquitectónico y acoplamiento | Diseñes un módulo nuevo, feature, o evalúes introducir una abstracción. |
| [02-layers-and-dependencies.md](02-layers-and-dependencies.md) | <status> | Capas y reglas de dependencia | Crees un archivo nuevo y tengas que decidir dónde va; agregues un import entre capas. |
| [03-inter-layer-communication.md](03-inter-layer-communication.md) | <status> | Comunicación entre capas | Pases datos entre controller/service/repo; decidas DTOs vs entidades; ubiques validación. |
| [04-error-handling.md](04-error-handling.md) | <status> | Manejo de errores | Tires/atrapes una excepción; definas un error custom; respondas un error desde un endpoint. |
| [05-dependency-injection.md](05-dependency-injection.md) | <status> | DI | Conectes una dependencia, instancies un servicio, agregues un módulo a la composición. |
| [06-testing-strategy.md](06-testing-strategy.md) | <status> | Testing | Escribas un test, decidas mock vs real, cuestiones cobertura. |
| [07-logging.md](07-logging.md) | <status> | Logging | Agregues un log, configures niveles, manejes información sensible. |
| [08-configuration-secrets.md](08-configuration-secrets.md) | <status> | Configuración y secretos | Agregues una env var, leas configuración, manejes secrets. |
| [09-data-access.md](09-data-access.md) | <status> | Acceso a datos | Escribas una query, definas migraciones, manejes transacciones. |
| [10-auth.md](10-auth.md) | <status> | Auth | Toques login, permisos, tokens, sesiones, middleware de autorización. |
| [11-folder-structure.md](11-folder-structure.md) | <status> | Estructura de carpetas y naming | Crees un archivo o carpeta nueva; cuestiones dónde poner algo. |
| [tech/INDEX.md](tech/INDEX.md) | — | Catálogo de tecnologías concretas | Vayas a agregar/cambiar una dependencia, lib, framework, DB, ORM, herramienta. **Consultá siempre antes de instalar algo nuevo.** |

**Leyenda de status:** `Accepted` = decisión vigente · `Pending` = decidir más adelante · `Not Applicable` = decidido conscientemente que no aplica · `Deferred` = postergado con condición de revisión · `Superseded` = reemplazado por otro ADR.

> Para los ADRs con status distinto de `Accepted`, leer la sección "Razón de omisión / aplazamiento" del archivo correspondiente para entender el motivo. **No asumas que la falta de decisión es un olvido** — está documentada.

## Estado y mantenimiento

- Última actualización: <YYYY-MM-DD>
- Cada ADR tiene su propio `Status:` (Accepted / Superseded / Pendiente / En revisión)
- **Para actualizar una decisión:** editá el ADR, agregá entrada en `Historial`, actualizá `Status` y `Última actualización`.
- **Para una decisión nueva:** creá un ADR nuevo y sumá fila en este INDEX.
- **Para deprecar una decisión:** cambiá `Status: Superseded`, referenciá el ADR que la reemplaza.
```

(Solo incluí en la tabla las filas correspondientes a las fases que el usuario eligió cubrir.)

**Template para cada ADR individual:**

```markdown
# ADR <nn> — <título>

- **Status:** <Accepted | Pending | Not Applicable | Deferred | Superseded>
- **Fecha de creación:** <YYYY-MM-DD>
- **Última actualización:** <YYYY-MM-DD>
- **Decisores:** <usuario>
- **Fase del bootstrap:** <0..5.x>

## Contexto

<por qué necesitamos tomar esta decisión, qué condicionantes hay del proyecto, qué se sabe del stack/equipo/alcance que llevó a esto>

## Decisión

<lo decidido, en imperativo. Ej: "Usamos JWT con refresh tokens y rotación; access token de 15min, refresh de 7d.">

<!-- Si Status NO es Accepted, REEMPLAZAR la sección "Decisión" por esta:

## Razón de omisión / aplazamiento

**Status:** <Pending | Not Applicable | Deferred>

<1-2 líneas con el motivo. Sé honesto y concreto.
- Si Pending: indicá el trigger esperado ("cuando llegue X feature", "cuando seamos más de N personas").
- Si Not Applicable: explicá por qué no aplica al proyecto.
- Si Deferred: indicá fecha o condición de revisión.>
-->

## Alternativas consideradas

<si Status = Accepted, listá alternativas evaluadas. Si NO se decidió, omitir esta sección.>

- **<opción A>** — <por qué no se eligió>
- **<opción B>** — <por qué no se eligió>

## Consecuencias

<si Status = Accepted, listá consecuencias. Si NO se decidió, omitir o anotar "Pendiente de evaluación cuando se tome la decisión.">

**Positivas:**
- <consecuencia>

**Negativas / trade-offs:**
- <consecuencia>

## Reglas concretas (si aplica)

<reglas verificables — paths, nombres, ejemplos de código mínimos. Solo si Status = Accepted.>

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| <YYYY-MM-DD> | <"Decisión inicial" | "Marcado como Pending — motivo X" | "Marcado como Not Applicable — motivo Y"> | <usuario> |
```

#### Paso 4: Escribir y reportar

Definí `<base>` como:
- En single-package: `.` (raíz del repo)
- En multi-package: `<path-del-paquete-elegido>` (ej: `packages/api`)

Pasos:

1. `mkdir -p <base>/.claude/adr/tech` (si no existe — crea ambos directorios de una)
2. Escribir `<base>/CLAUDE.md` (si no existe; si existe, **NO sobrescribir** — preguntar al usuario qué hacer)
3. **(Solo en multi-package)** Crear o actualizar el `CLAUDE.md` raíz como router de paquetes (ver template en sección "Multi-paquete"). Si ya existe, hacé merge para sumar el paquete actual sin pisar las entradas de los otros.
4. Escribir `<base>/.claude/adr/INDEX.md` con la columna Status reflejando el estado real de cada ADR
5. Escribir **todos** los ADRs de fase en `<base>/.claude/adr/` (los confirmados con `Status: Accepted` y contenido completo; los omitidos con `Status: Not Applicable` / `Pending` / `Deferred` y razón en la sección dedicada)
6. Escribir `<base>/.claude/adr/tech/INDEX.md` con la tabla agrupada por categoría (los archivos individuales de tech ya se fueron creando intercalados durante las fases). Las categorías sin tecnologías llevan nota explicativa (`_No aplica_` / `_Pendiente_`).
7. Reportar al usuario:
   - **(En multi-package)** Recordatorio del paquete que se procesó (ej: "Decisiones registradas para `packages/api`")
   - Lista de archivos creados (con path completo)
   - Resumen de 1 línea por ADR de fase, con su status entre corchetes (ej: `[Accepted]`, `[Pending]`, `[N/A]`)
   - Lista de tecnologías registradas en `tech/`
   - **Lista separada de ADRs `Pending` / `Deferred` con su trigger esperado**, así el usuario sabe qué quedó por decidir
   - **(En multi-package)** Si el usuario eligió "todos secuencialmente", preguntar si seguir con el próximo paquete; sino, recordarle que los otros paquetes siguen sin ADRs y se pueden bootstrap-ear después
   - Recordatorio de cómo actualizar decisiones (editar ADR + Historial + Status) y cómo agregar nueva tech
   - Sugerencia de commitear estos archivos al repo

---

## Modo `update` (cuando `.claude/adr/INDEX.md` ya existe)

Si en pre-flight detectás un INDEX existente:

**Paso 0 — Identificar paquete (en multi-package):**
- Si hay un solo `.claude/adr/INDEX.md` (en raíz o en un único paquete) → trabajar con ese.
- Si hay varios (uno por paquete) → preguntar al usuario cuál revisar. Mostrar lista con la última fecha de actualización de cada uno como ayuda visual.
- Si el usuario está en cwd dentro de un paquete específico → asumir ese sin preguntar.

**Paso 1+ — Modo update (para el paquete elegido):**

1. **Leé el INDEX y todos los ADRs** existentes del paquete.
2. **Mostrale al usuario un resumen** agrupado por status: cuáles están `Accepted`, cuáles `Pending` (con su trigger), cuáles `Not Applicable` (con su razón), cuáles `Deferred`.
3. **Preguntá explícitamente si algún `Pending` o `Deferred` ya está listo para resolverse**. Esto es lo más importante del modo update — sin esta pregunta, los "lo decidimos después" se pierden en el tiempo.
4. **Después preguntale qué más quiere hacer**:
   - **Resolver un Pending/Deferred** → recorrer las preguntas de esa fase, cambiar Status a `Accepted`, llenar Decisión/Alternativas/Consecuencias, agregar entrada en Historial.
   - **Actualizar una decisión específica** → identificar cuál ADR, editar, agregar entrada en Historial, actualizar Status y Última actualización.
   - **Agregar una decisión nueva** que no estaba cubierta → crear ADR nuevo con número siguiente, agregar fila al INDEX.
   - **Marcar como deprecated/superseded** → cambiar Status a `Superseded`, referenciar el ADR que la reemplaza si lo hay.
   - **Cambiar un `Not Applicable` a `Pending`/`Accepted`** → el contexto del proyecto cambió (ej: el script chico creció a app multiusuario y ahora sí hay que pensar auth). Actualizar Status, llenar contenido nuevo, anotar en Historial el cambio de contexto.
   - **Agregar/cambiar/quitar una tecnología** → editar `tech/INDEX.md` y el archivo individual en `tech/<nombre>.md`. Si reemplazás una tech, dejá el viejo con Status `Superseded` apuntando al nuevo.
   - **(Multi-package) Bootstrappear otro paquete que aún no tiene ADRs** → cambiar de paquete y arrancar el flujo principal desde Fase 0 para ese paquete nuevo.
   - **(Multi-package) Replicar una decisión a otro paquete** → leer el ADR origen, abrir el destino, copiar la Decisión y Reglas, dejar al usuario confirmar/ajustar (porque cada paquete es autónomo, esto es una copia explícita, no una herencia).
   - **Rehacer todo desde cero** → confirmación doble. Antes de sobrescribir, mover el directorio actual a `<base>/.claude/adr.old.<timestamp>/` para preservar historial.
5. Para actualizar/agregar, recorré solo las fases relevantes del flujo principal — no hagas todo el cuestionario otra vez.

---

## Anti-patterns que esta skill evita

- ❌ Tirar todas las preguntas en un solo turno → la gente abandona.
- ❌ Forzar Clean Architecture en un script de 200 líneas → ofrecer atajos para casos simples.
- ❌ Saltar fases sin documentar el motivo → siempre crear el ADR con `Status: Not Applicable` / `Pending` / `Deferred` y razón breve.
- ❌ Confundir "no decidido aún" con "decidido que no aplica" → son status distintos (`Pending` vs `Not Applicable`), nunca los mezcles.
- ❌ Sobrescribir ADRs existentes sin preservar historial → siempre Historial + backup.
- ❌ Inventar reglas no discutidas con el usuario en la materialización → todo lo que va al ADR fue confirmado.
- ❌ Reglas vagas tipo "tratá de no acoplar capas" → siempre verificable: paths, globs, ejemplos.
- ❌ Sobrescribir un `CLAUDE.md` existente sin permiso → preguntar y ofrecer merge.
- ❌ Asumir el stack en lugar de detectarlo en pre-flight → leer manifests primero.
- ❌ Dejar el catálogo `tech/` vacío hasta el final y volcar todo de una → registrar intercalado, en el momento de la decisión, mientras está fresca la justificación.
- ❌ Agregar una nueva dependencia en sesiones futuras sin consultar `tech/INDEX.md` → siempre revisar primero si ya hay algo elegido para ese problema.
- ❌ En modo update, no preguntar por los `Pending`/`Deferred` existentes → es la única forma de que las decisiones aplazadas no se olviden.
- ❌ En multi-package, asumir que las convenciones de un paquete aplican a otro → cada paquete es autónomo; si querés mismas reglas, replicá explícitamente y dejá registrado.
- ❌ En multi-package, generar ADRs en `.claude/adr/` de la raíz → los ADRs viven en el paquete, la raíz solo enruta vía `CLAUDE.md`.
- ❌ Hacer un cuestionario único para varios paquetes mezclados → siempre uno completo a la vez para evitar que el usuario pierda el contexto.
- ❌ Ignorar el cwd del usuario y preguntar el paquete cuando obviamente está parado en uno → si está dentro, es ese.

---

## Recordatorio final

El valor de esta skill no está en las preguntas que hace — está en que las decisiones queden **escritas, accionables y mantenidas**. Si las preguntas son geniales pero los ADRs salen vagos, fallamos. Si los ADRs son específicos y verificables, Claude (y cualquier dev) puede trabajar respetando las convenciones sin volver a preguntar.

Escribí los ADRs con la misma claridad con la que le explicarías la convención a un dev nuevo el primer día.