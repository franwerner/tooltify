import { apiFetch } from "./serverUrl";

export const openSource = (source: string) => {
  apiFetch(`/editor/open?source=${encodeURIComponent(source)}`)
    .then((r) => r.json())
    .then((res) => {
      if (!res.ok) console.error("[tracker] open-source:", res.error);
    })
    .catch((err) => console.error("[tracker] open-source:", err));
};
