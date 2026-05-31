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

```bash
# Vite
npm i -D @tooltify/integration-vite

# Rspack
npm i -D @tooltify/integration-rspack
```

Las integraciones traen `@tooltify/core` (server, agente y la CLI `tooltify`) como dependencia.

## Quick start

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { viteTooltify, Runtime } from "@tooltify/integration-vite";

export default defineConfig(({ command }) => ({
  plugins: [
    viteTooltify({
      runtime: { type: Runtime.REACT },
      enabled: command === "serve", // solo en desarrollo
    }),
  ],
}));
```

### Rspack

```ts
// rspack.config.ts
import { rspackTooltify, Runtime } from "@tooltify/integration-rspack";

export default {
  plugins: [
    rspackTooltify({
      runtime: { type: Runtime.REACT },
      enabled: process.env.NODE_ENV !== "production",
    }),
  ],
};
```

Creá un `tooltify.config.json` en la raíz del proyecto:

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

| Opción del plugin | Descripción |
|---|---|
| `enabled` | Activa Tooltify (normalmente `true` solo en dev). |
| `runtime` | `{ type: Runtime.REACT \| Runtime.VUE, shouldInjectSource? }`. `shouldInjectSource` filtra qué nodos reciben metadata de origen. |
| `publicUrl` | Opcional. URL pública del server si no es `http://localhost:<port>`. |

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
| `editorPathMap` | Opcional `{ from, to }`. Remapeo de rutas cuando el server corre en contenedor y el editor abre en el host. |

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
- **Runtimes.** React y Vue, sobre Vite o Rspack.
