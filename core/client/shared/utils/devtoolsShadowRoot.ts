// Singleton del shadow root de la devtools. entry.tsx lo setea al montar;
// DevtoolsPortal lo lee para crear su contenedor dentro del shadow.
let shadowRoot: ShadowRoot | null = null;

export const setDevtoolsShadowRoot = (root: ShadowRoot): void => {
  shadowRoot = root;
};

export const getDevtoolsShadowRoot = (): ShadowRoot => {
  if (!shadowRoot) {
    throw new Error(
      "Devtools shadow root no inicializado: entry.tsx debe montar primero"
    );
  }
  return shadowRoot;
};
