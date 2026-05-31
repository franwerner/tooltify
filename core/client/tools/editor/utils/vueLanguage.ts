type Monaco = typeof import("monaco-editor")

// Registra un lenguaje "vue" en Monaco con un tokenizer Monarch que embebe
// el lenguaje real de cada bloque del SFC: html en <template>, js/ts en
// <script> (según lang), css/scss en <style>. Solo highlighting (paridad con
// lo que da React vía typescript/javascript built-in); sin language service.
export function registerVueLanguage(monaco: Monaco): void {
    const id = "vue"
    if (monaco.languages.getLanguages().some((l) => l.id === id)) return

    monaco.languages.register({ id, extensions: [".vue"] })

    monaco.languages.setLanguageConfiguration(id, {
        comments: { blockComment: ["<!--", "-->"] },
        brackets: [["<", ">"], ["{", "}"], ["(", ")"], ["[", "]"]],
        autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "(", close: ")" },
            { open: "[", close: "]" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
        ],
    })

    monaco.languages.setMonarchTokensProvider(id, {
        defaultToken: "",
        tokenizer: {
            root: [
                [/<template[^>]*>/, { token: "tag", next: "@inTemplate", nextEmbedded: "html" }],
                [/<script[^>]*\blang=["']ts["'][^>]*>/, { token: "tag", next: "@inScript", nextEmbedded: "typescript" }],
                [/<script[^>]*>/, { token: "tag", next: "@inScript", nextEmbedded: "javascript" }],
                [/<style[^>]*\blang=["']s[ca]ss["'][^>]*>/, { token: "tag", next: "@inStyle", nextEmbedded: "scss" }],
                [/<style[^>]*>/, { token: "tag", next: "@inStyle", nextEmbedded: "css" }],
                [/[^<]+/, ""],
                [/</, "delimiter"],
            ],
            inTemplate: [[/<\/template>/, { token: "tag", next: "@pop", nextEmbedded: "@pop" }]],
            inScript: [[/<\/script>/, { token: "tag", next: "@pop", nextEmbedded: "@pop" }]],
            inStyle: [[/<\/style>/, { token: "tag", next: "@pop", nextEmbedded: "@pop" }]],
        },
    })
}
