import { currentPageType, getResource } from "../api/remixed";
import { GM_addStyle } from "@/lib/monkey";
import { domrd } from "../elemental";
import { injectCSSRule, overwriteCSS, parseMultiCSS } from "../elemental/styles";
import { scrollbarWidth } from "../render";
import { customBackground, customStyle, fontWeights, monospaceFonts, styleTheme, themeColor, userFonts } from "../user-values";
import { waitUntil } from "../utils";
import { hexToRGBA, rgbaToHSLA } from "../utils/color";

export const darkPrefers = matchMedia("(prefers-color-scheme: dark)");

type ThemeStyle = "remixed" | "vercel";
type InlineStyleModule = { default: string };
type StyleBucketLoader = () => Promise<string[]>;

const loadedStyleBuckets = new Map<string, Promise<HTMLStyleElement[]>>();

const inlineStyleLoaders = {
    "base": () => import("@/stylesheets/main/base.scss?inline"),
    "universal": () => import("@/stylesheets/main/universal.scss?inline"),
    "animations": () => import("@/stylesheets/main/animations.scss?inline"),
    "material-symbols": () => import("@/stylesheets/main/material-symbols.css?inline"),
    "palette": () => import("@/stylesheets/main/palette.scss?inline"),
    "palette-vercel": () => import("@/stylesheets/main/palette-vercel.scss?inline"),
    "variables": () => import("@/stylesheets/main/variables.scss?inline"),
    "tieba-error": () => import("@/stylesheets/tieba/tieba-error.scss?inline"),
    "tieba-forum": () => import("@/stylesheets/tieba/tieba-forum.scss?inline"),
    "tieba-forum-search": () => import("@/stylesheets/tieba/tieba-forum-search.scss?inline"),
    "tieba-home": () => import("@/stylesheets/tieba/tieba-home.scss?inline"),
    "tieba-main": () => import("@/stylesheets/tieba/tieba-main.scss?inline"),
    "tieba-thread": () => import("@/stylesheets/tieba/tieba-thread.scss?inline"),
    "vercel-error": () => import("@/stylesheets/tieba-vercel/tieba-error.scss?inline"),
    "vercel-forum": () => import("@/stylesheets/tieba-vercel/tieba-forum.scss?inline"),
    "vercel-home": () => import("@/stylesheets/tieba-vercel/tieba-home.scss?inline"),
    "vercel-main": () => import("@/stylesheets/tieba-vercel/tieba-main.scss?inline"),
    "vercel-settings": () => import("@/stylesheets/tieba-vercel/settings.scss?inline"),
    "vercel-thread": () => import("@/stylesheets/tieba-vercel/tieba-thread.scss?inline"),
} satisfies Record<string, () => Promise<InlineStyleModule>>;

function pageBucketKey() {
    switch (currentPageType()) {
        case "index":
            return "page:index";

        case "forum":
            return "page:forum";

        case "thread":
            return "page:thread";

        default:
            return "page:error";
    }
}

function themeBucketKey(theme: ThemeStyle) {
    return `theme:${theme}:${pageBucketKey()}`;
}

async function loadInlineStyles(keys: Array<keyof typeof inlineStyleLoaders>) {
    const styles = await Promise.all(keys.map(key => inlineStyleLoaders[key]()));
    return styles.map(style => style.default);
}

function ensureStyleBucket(key: string, loader: StyleBucketLoader) {
    const cached = loadedStyleBuckets.get(key);
    if (cached) return cached;

    const pending = loader().then(style => overwriteCSS(...style));
    loadedStyleBuckets.set(key, pending);
    return pending;
}

async function ensureBaseCSS() {
    return ensureStyleBucket("base", () => loadInlineStyles([
        "animations",
        "material-symbols",
        "palette",
        "variables",
        "base",
        "universal",
    ]));
}

async function ensureThemePaletteCSS(theme: ThemeStyle) {
    if (theme !== "vercel") return [];

    return ensureStyleBucket(`theme-palette:${theme}`, () => loadInlineStyles([
        "palette-vercel",
    ]));
}

async function ensurePageCSS() {
    const pageType = currentPageType();

    if (pageType === "index") {
        return ensureStyleBucket(pageBucketKey(), () => loadInlineStyles([
            "tieba-main",
            "tieba-home",
        ]));
    }

    if (pageType === "forum") {
        return ensureStyleBucket(pageBucketKey(), () => loadInlineStyles([
            "tieba-main",
            "tieba-forum",
            "tieba-forum-search",
        ]));
    }

    if (pageType === "thread") {
        return ensureStyleBucket(pageBucketKey(), () => loadInlineStyles([
            "tieba-main",
            "tieba-thread",
        ]));
    }

    return ensureStyleBucket(pageBucketKey(), () => loadInlineStyles([
        "tieba-error",
    ]));
}

async function ensureThemeCSS(theme: ThemeStyle) {
    if (theme !== "vercel") return [];

    const pageType = currentPageType();

    if (pageType === "index") {
        return ensureStyleBucket(themeBucketKey(theme), () => loadInlineStyles([
            "vercel-main",
            "vercel-home",
        ]));
    }

    if (pageType === "forum") {
        return ensureStyleBucket(themeBucketKey(theme), () => loadInlineStyles([
            "vercel-main",
            "vercel-forum",
        ]));
    }

    if (pageType === "thread") {
        return ensureStyleBucket(themeBucketKey(theme), () => loadInlineStyles([
            "vercel-main",
            "vercel-thread",
        ]));
    }

    return ensureStyleBucket(themeBucketKey(theme), () => loadInlineStyles([
        "vercel-error",
    ]));
}

export async function ensureSettingsCSS() {
    if (styleTheme.get() !== "vercel") return [];

    return ensureStyleBucket("settings:vercel", () => loadInlineStyles([
        "vercel-settings",
    ]));
}

let themeColorStyleEl: HTMLStyleElement | undefined;

export function applyThemeColor() {
    const theme = themeColor.get();
    const darkRGBA = hexToRGBA(theme.dark);
    const lightRGBA = hexToRGBA(theme.light);
    const darkHSLA = rgbaToHSLA(darkRGBA);
    const lightHSLA = rgbaToHSLA(lightRGBA);

    const darkHover = `hsl(${darkHSLA.h}deg ${parseInt(darkHSLA.s) + 40}% ${parseInt(darkHSLA.l) + 10}%)`;
    const darkActive = `hsl(${darkHSLA.h}deg ${parseInt(darkHSLA.s) + 50}% ${parseInt(darkHSLA.l) + 20}%)`;
    const darkTransp = `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 80%)`;
    const darkBack = `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 24%)`;
    const darkFore = `hsl(${darkHSLA.h}deg 100% 75%)`;

    const lightHover = `hsl(${lightHSLA.h}deg ${parseInt(lightHSLA.s) - 40}% ${parseInt(lightHSLA.l) - 10}%)`;
    const lightActive = `hsl(${lightHSLA.h}deg ${parseInt(lightHSLA.s) - 50}% ${parseInt(lightHSLA.l) - 20}%)`;
    const lightTransp = `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 80%)`;
    const lightBack = `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 24%)`;
    const lightFore = `hsl(${lightHSLA.h}deg 60% 32%)`;

    const css = parseMultiCSS({
        "html.dark-theme": {
            "--tieba-theme-color": theme.dark,
            "--trans-tieba-theme-color": darkTransp,
            "--tieba-theme-hover": darkHover,
            "--tieba-theme-active": darkActive,
            "--tieba-theme-background": darkBack,
            "--tieba-theme-fore": darkFore,
            "--user-theme": theme.dark,
            "--user-theme-transp": darkTransp,
            "--user-theme-hover": darkHover,
            "--user-theme-active": darkActive,
            "--user-theme-back": darkBack,
            "--user-theme-fore": darkFore,
        },
        "html.light-theme": {
            "--tieba-theme-color": theme.light,
            "--trans-tieba-theme-color": lightTransp,
            "--tieba-theme-hover": lightHover,
            "--tieba-theme-active": lightActive,
            "--tieba-theme-background": lightBack,
            "--tieba-theme-fore": lightFore,
            "--user-theme": theme.light,
            "--user-theme-transp": lightTransp,
            "--user-theme-hover": lightHover,
            "--user-theme-active": lightActive,
            "--user-theme-back": lightBack,
            "--user-theme-fore": lightFore,
        },
    });

    if (!themeColorStyleEl) {
        themeColorStyleEl = document.createElement("style");
        themeColorStyleEl.id = "remixed-theme-color";
        document.head.appendChild(themeColorStyleEl);
    }
    themeColorStyleEl.textContent = css;
}

let dynFontStyleEl: HTMLStyleElement | undefined;
let customStyleEl: HTMLStyleElement | undefined;

export function applyDynamicFonts() {
    const css = parseMultiCSS({
        ":root": {
            "--content-max": "982px",
            "--code-zh": `${userFonts.get().join(",")}`,
            "--code-monospace": `${monospaceFonts.get().join(",")}`,
            "--font-weight-normal": `${fontWeights.get().normal}`,
            "--font-weight-bold": `${fontWeights.get().bold}`,
        },
    });

    if (!dynFontStyleEl) {
        dynFontStyleEl = document.createElement("style");
        dynFontStyleEl.id = "remixed-dynamic-fonts";
        document.head.appendChild(dynFontStyleEl);
    }
    dynFontStyleEl.textContent = css;
}

export function applyCustomStyle() {
    const customCSS = customStyle.get();
    if (!customStyleEl) {
        customStyleEl = document.createElement("style");
        customStyleEl.id = "remixed-custom-style";
        document.head.appendChild(customStyleEl);
    }
    customStyleEl.textContent = customCSS;
}

export async function loadDynamicCSS() {
    applyDynamicFonts();
    applyThemeColor();

    window.addEventListener("load", function () {
        GM_addStyle(
            parseMultiCSS({
                ":root": {
                    "--scrollbar-width": `${scrollbarWidth()}px`,
                },
            })
        );
    }, { once: true });

    applyCustomStyle();
}

function installFavicon() {
    if (document.querySelector("#tieba-remix-favicon")) {
        return;
    }

    document.head.appendChild(domrd("link", {
        id: "tieba-remix-favicon",
        type: "image/icon",
        rel: "shortcut icon",
        href: getResource("/assets/images/main/favicon32.ico"),
    }));
}

export async function loadMainCSS() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", installFavicon, { once: true });
    } else {
        installFavicon();
    }

    await Promise.all([
        ensureBaseCSS(),
        ensurePageCSS(),
        ensureThemePaletteCSS(styleTheme.get()),
        ensureThemeCSS(styleTheme.get()),
    ]);
}

export function setStyleTheme(value: "remixed" | "vercel") {
    const html = document.documentElement;
    html.classList.toggle("style-vercel", value === "vercel");
    html.classList.toggle("style-remixed", value === "remixed");
    void ensureThemePaletteCSS(value);
    void ensureThemeCSS(value);
}

let customBackgroundElement: Maybe<HTMLStyleElement> = undefined;

export async function setCustomBackground() {
    if (customBackgroundElement) {
        document.head.removeChild(customBackgroundElement);
    }
    customBackgroundElement = injectCSSRule("body.custom-background", {
        backgroundImage: `url('${customBackground.get()}') !important`,
        backgroundRepeat: "no-repeat !important",
        backgroundAttachment: "fixed !important",
        backgroundSize: "cover !important",
    });

    waitUntil(() => !(document.body == null)).then(function () {
        if (customBackground.get()) {
            document.body.classList.add("custom-background");
        } else {
            document.body.classList.remove("custom-background");
        }
    });
}
