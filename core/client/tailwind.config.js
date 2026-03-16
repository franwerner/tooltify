/** @type {import('tailwindcss').Config} */
export default {
  prefix: "tfy-",
  corePlugins: {
    preflight: false,
  },
  content: ["./**/*.{ts,tsx}", "!./node_modules/**"],
  theme: {
    extend: {
      colors: {
        // COLORS palette
        bg: "rgba(22,27,34,0.95)",
        border: "#30363d",
        text: "#e6edf3",
        muted: "#8b949e",
        accent: "#58a6ff",
        green: "#3fb950",
        red: "#f85149",
        orange: "#d29922",
        purple: "#bc8cff",
        tag: "#1f6feb33",
        input: "#0d1117",
        hover: "#21262d",
        // TERM palette (editor)
        "term-bg": "#0d1117",
        "term-surface": "#161b22",
        "term-border": "#21262d",
        // Tool accents
        co: "#da7756",
        "co-dim": "#da775640",
        "co-med": "#da7756a0",
        ide: "#3fb950",
        // Panel surface
        surface: "#1a1d23",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
    },
  },
};
