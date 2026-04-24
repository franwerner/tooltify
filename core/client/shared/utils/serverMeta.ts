import { apiJson } from "./serverUrl";

let cachedRoot: string | null = null;
let loadPromise: Promise<string> | null = null;

export const loadServerMeta = (): Promise<string> => {
  if (loadPromise) return loadPromise;
  loadPromise = apiJson<{ root: string }>("/editor/meta")
    .then((res) => (cachedRoot = res.data.root))
    .catch((err) => {
      console.error("[tooltify] meta:", err);
      loadPromise = null;
      return "";
    });
  return loadPromise;
};

export const buildFullPath = (source: string): string => {
  if (!cachedRoot) return source;
  const root = cachedRoot.replace(/\/+$/, "");
  const rel = source.replace(/^\/+/, "");
  return `${root}/${rel}`;
};
