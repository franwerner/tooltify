# @tooltify/integration-rspack

Integración de [Tooltify](https://github.com/franwerner/tooltify) para Rspack. Inyecta el overlay y agrega metadata de origen a tus componentes durante el desarrollo.

Para qué sirve Tooltify, la configuración común (`tooltify.config.json`, auth, agente) y la arquitectura, ver el [README raíz](../../README.md).

## Runtimes soportados

Solo React.

## Instalación

```bash
npm i -D @tooltify/integration-rspack
```

Trae `@tooltify/core` como dependencia. Necesitás además:

- **`@rspack/core`** (`^1.7.8`) — peerDependency.

A diferencia de Vite, esta integración **no instancia ningún plugin del framework**: convive con tu setup de React de Rspack (loaders, React Refresh). No quites nada de tu config.

## Uso

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

Después creá el `tooltify.config.json` y arrancá el agente — ver [Configuración común](../../README.md#configuración) y [Quick start](../../README.md#después-de-instalar).

## Opciones del plugin

| Opción | Descripción |
|---|---|
| `enabled` | Activa Tooltify (normalmente `true` solo en dev). |
| `runtime` | `{ type: Runtime.REACT, shouldInjectSource? }`. `shouldInjectSource` filtra qué nodos reciben metadata de origen. |
| `publicUrl` | Opcional. URL pública del server si no es `http://localhost:<port>`. |
