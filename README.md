# Tooltify

Overlay de desarrollo que conecta lo que ves en el navegador con el archivo fuente que lo genera — para abrirlo en tu editor o pasarle esa ubicación como contexto a una IA.

## Por qué existe

Cuando trabajás en una UI, mirás el resultado en el navegador pero el cambio hay que hacerlo en el código. Encontrar *qué archivo* (y *qué línea*) produce ese pedazo de pantalla es un ida y vuelta constante: buscar el componente, adivinar la ruta, abrirlo. Y si querés que una IA te ayude con ese componente, primero tenés que decirle **dónde está** — contexto que hoy se arma a mano.

Tooltify elimina ese paso: desde el elemento renderizado llegás directo a su origen en el código.

## Qué hace

Inyecta un overlay en tu app durante el desarrollo. El plugin del bundler agrega metadata de origen a los componentes, así que desde la UI podés:

- **Identificar el archivo fuente** (y la línea) detrás de cualquier elemento que ves en pantalla.
- **Abrirlo en tu editor** en esa línea exacta (VS Code / Antigravity, local o remoto vía WSL/SSH).
- **Copiar su ubicación** para dársela a una IA como contexto preciso ("este componente vive en `src/...:NN`"), sin tener que rastrearlo a mano.

Además trae herramientas de apoyo en el mismo overlay:

- **Autoría de archivos** — quién editó cada archivo (útil en equipo).
- **Monitor de build** — estado de rebuilds y errores, con atribución del cambio.
- **Editor embebido** — leer/editar el fuente desde el navegador.

## Instalación

Elegí la integración de tu bundler. Cada una documenta su instalación, runtimes soportados, opciones del plugin y los gotchas propios:

- **[Vite](integrations/vite/README.md)** — `npm i -D @tooltify/integration-vite` (React y Vue).
- **[Rspack](integrations/rspack/README.md)** — `npm i -D @tooltify/integration-rspack` (solo React).

Las integraciones traen `@tooltify/core` (server, agente y la CLI `tooltify`) como dependencia. El resto de esta página es común a todos los bundlers.

## Después de instalar

Una vez registrado el plugin (ver el README de tu bundler), creá un `tooltify.config.json` en la raíz del proyecto:

```json
{
  "packagesDir": "./src",
  "port": 4100
}
```

Después registrás tu sesión y arrancás el agente:

```bash
npx tooltify   # → Start agent
```

## Configuración

### Por proyecto — `tooltify.config.json`

```json
{
  "packagesDir": "./src",
  "port": 4100
}
```

| Campo | Descripción |
|---|---|
| `packagesDir` | Carpeta de código a rastrear, relativa a la raíz del proyecto. |
| `port` | Puerto del server de ese proyecto. Único por proyecto si corrés varios a la vez. |

Si el server corre en el host, con eso alcanza: las rutas que resuelve ya son las que abre el editor.

#### Server en container — `TOOLTIFY_HOST_ROOT`

Cuando el server corre en un container, las rutas que resuelve (bajo su cwd, ej. `/app/src/App.tsx`) no existen en el host, donde el agente abre el editor (ahí sería `/home/user/projects/myapp/src/App.tsx`). El remapeo se hace **solo por env**: exportás la raíz del proyecto en el host en `TOOLTIFY_HOST_ROOT` y Tooltify deriva el mapeo `from` = cwd del server (la raíz dentro del container) → `to` = `TOOLTIFY_HOST_ROOT`.

```yaml
# docker-compose.yml — pasás el host path con interpolación de compose
environment:
  TOOLTIFY_HOST_ROOT: ${PWD}/app/web
```

Cada dev resuelve su propia ruta vía `${PWD}`, así que el `tooltify.config.json` queda sin rutas fijas y commiteable. Sin el env (server en el host) no hay remapeo: las rutas se usan tal cual.

### Auth del proyecto — `<proyecto>/.tooltify/` (gitignored)

Store de credenciales del proyecto (`salt`/`secret`/`users`), creado por el server. **No se commitea** (va al `.gitignore`). El acceso a esta carpeta es el límite de confianza: quien puede trabajar el código es colaborador.

### Global del usuario — `~/.tooltify/`

Settings de máquina (`ideType`, `remote`, `agentPort`) y, en `~/.tooltify/tokens/`, un token de sesión por proyecto que el agente usa para conectarse. Privado de cada usuario.

## Arquitectura

Tres piezas:

- **Cliente** — overlay inyectado en la página. Habla con el server de su proyecto.
- **tooltifyServer (uno por proyecto)** — corre dentro del proceso del bundler, en su puerto. Expone las rutas/WS del overlay y actúa de **hub**: mantiene un mapa `usuario → conexión` de agentes y rutea cada comando (ej. abrir editor) al usuario que lo pidió.
- **Agente (uno por usuario de máquina)** — un cliente que ejecuta las acciones de máquina (abrir el editor). Es **multi-conexión**: un solo agente se conecta a todos los servers de los proyectos en los que participás (descubre los proyectos por los tokens en `~/.tooltify/tokens/`).

Esto cubre dos modos, sin configuración extra:

- **Solitario** — un usuario, varios proyectos: su agente se conecta a los N servers.
- **Grupal** — varios usuarios sobre un mismo proyecto (en la misma máquina): cada uno trae su agente al server compartido, que rutea cada "abrir en editor" al editor del usuario correcto.

La identidad se resuelve con login por password contra el server del proyecto, que emite un token de sesión; el agente lo presenta para conectarse como vos.

## Alcance

- **Solo desarrollo.** Se activa con `enabled` y no va a producción.
- **Multiplataforma.** Linux, macOS y Windows (editor local o remoto WSL/SSH).
- **Multi-usuario en la misma máquina.** El modo grupal asume que los usuarios comparten el host (ej. un box de dev por SSH); no es colaboración entre máquinas distintas.
- **Runtimes.** Vite: React y Vue. Rspack: solo React.
