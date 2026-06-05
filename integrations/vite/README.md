# @tooltify/integration-vite

Integración de [Tooltify](https://github.com/franwerner/tooltify) para Vite. Inyecta el overlay y agrega metadata de origen a tus componentes durante el desarrollo.

Para qué sirve Tooltify, la configuración común (`tooltify.config.json`, auth, agente) y la arquitectura, ver el [README raíz](../../README.md).

## Runtimes soportados

React y Vue.

## Instalación

```bash
npm i -D @tooltify/integration-vite
```

Trae `@tooltify/core` como dependencia. Necesitás además, según tu runtime:

- **Vite** (`^5 || ^6 || ^7 || ^8`) — peerDependency.
- **React** → `@vitejs/plugin-react`.
- **Vue** → `@vitejs/plugin-vue`.

`viteTooltify` instancia ese plugin del framework por vos (ver la nota de abajo), pero tiene que estar instalado en el proyecto.

## Uso

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

> **No agregues `react()` / `vue()` por tu cuenta.** Según el `runtime`, `viteTooltify` instancia internamente el plugin del framework (`@vitejs/plugin-react` o `@vitejs/plugin-vue`) — tanto en dev como cuando está deshabilitado. Si además lo registrás en `plugins`, el plugin corre dos veces. Quitá `react()`/`vue()` del config y dejá que lo traiga Tooltify. Para pasarle opciones, usá `reactOptions` / `vueOptions` dentro del `runtime`.

Después creá el `tooltify.config.json` y arrancá el agente — ver [Configuración común](../../README.md#configuración) y [Quick start](../../README.md#después-de-instalar).

## Opciones del plugin

| Opción | Descripción |
|---|---|
| `enabled` | Activa Tooltify (normalmente `true` solo en dev). |
| `runtime` | `{ type: Runtime.REACT \| Runtime.VUE, shouldInjectSource? }`. `shouldInjectSource` filtra qué nodos reciben metadata de origen. |
| `runtime.reactOptions` | Opciones que se pasan a `@vitejs/plugin-react` (solo runtime React). |
| `runtime.vueOptions` | Opciones que se pasan a `@vitejs/plugin-vue` (solo runtime Vue). |
| `publicUrl` | Opcional. URL pública del server si no es `http://localhost:<port>`. |
