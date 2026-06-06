const SYMBOL_FONT_ATTR = "data-symbol-font";
const SYMBOL_FONT_NAME = "Material Symbols";
const SYMBOL_FONT_TEST = "close";
const SYMBOL_FONT_TIMEOUT = 5000;
const SYMBOL_FONT_REGISTER_TIMEOUT = 10_000;

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

    const sync = (): boolean => {
        const ready = document.fonts.check(`400 24px "${SYMBOL_FONT_NAME}"`, SYMBOL_FONT_TEST);
        html.setAttribute(SYMBOL_FONT_ATTR, ready ? "ready" : "failed");
        return ready;
    };

    document.fonts.addEventListener("loadingdone", sync);
    document.fonts.addEventListener("loadingerror", sync);

    void waitForSymbolFontFace().then(() => Promise.race([
        document.fonts.load(`400 24px "${SYMBOL_FONT_NAME}"`, SYMBOL_FONT_TEST),
        new Promise<FontFace[]>(resolve => window.setTimeout(() => resolve([]), SYMBOL_FONT_TIMEOUT)),
    ])).then(sync, () => {
        html.setAttribute(SYMBOL_FONT_ATTR, "failed");
    });
}

function waitForSymbolFontFace(): Promise<void> {
    return new Promise(resolve => {
        const startedAt = Date.now();
        const tick = () => {
            if (hasSymbolFontFace() || Date.now() - startedAt >= SYMBOL_FONT_REGISTER_TIMEOUT) {
                resolve();
                return;
            }
            requestAnimationFrame(tick);
        };
        tick();
    });
}

function hasSymbolFontFace(): boolean {
    return [...document.fonts].some(font => font.family.replace(/^["']|["']$/g, "") === SYMBOL_FONT_NAME);
}
