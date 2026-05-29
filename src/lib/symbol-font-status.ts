const SYMBOL_FONT_ATTR = "data-symbol-font";
const SYMBOL_FONT_NAME = "Material Symbols";
const SYMBOL_FONT_TEST = "close";
const SYMBOL_FONT_TIMEOUT = 5000;

let installed = false;

export function installSymbolFontStatus() {
    if (installed) return;
    installed = true;

    const html = document.documentElement;
    html.setAttribute(SYMBOL_FONT_ATTR, "loading");

    if (!document.fonts) {
        html.setAttribute(SYMBOL_FONT_ATTR, "failed");
        return;
    }

    const sync = () => {
        const ready = document.fonts.check(`400 24px "${SYMBOL_FONT_NAME}"`, SYMBOL_FONT_TEST);
        html.setAttribute(SYMBOL_FONT_ATTR, ready ? "ready" : "failed");
        return ready;
    };

    document.fonts.addEventListener("loadingdone", sync);
    document.fonts.addEventListener("loadingerror", sync);

    void Promise.race([
        document.fonts.load(`400 24px "${SYMBOL_FONT_NAME}"`, SYMBOL_FONT_TEST),
        new Promise<FontFace[]>(resolve => window.setTimeout(() => resolve([]), SYMBOL_FONT_TIMEOUT)),
    ]).then(sync, () => {
        html.setAttribute(SYMBOL_FONT_ATTR, "failed");
    });
}
