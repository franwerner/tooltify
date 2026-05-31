import { apiJson } from "./serverUrl";

export const openSource = (source: string) => {
  apiJson(`/editor/open?source=${encodeURIComponent(source)}`)
    .catch((err) => console.error("[tracker] open-source:", err instanceof Error ? err.message : err));
};
