import { currentPageType, getResource } from "../api/remixed";
import { GM_addStyle } from "@/lib/monkey";
import { domrd } from "../elemental";
import { injectCSSRule, overwriteCSS, parseMultiCSS } from "../elemental/styles";
import { scrollbarWidth } from "../render";
import { customBackground, customStyle, fontWeights, monospaceFonts, themeColor, userFonts } from "../user-values";
import { waitUntil } from "../utils";
import { hexToRGBA, rgbaToHSLA } from "../utils/color";

export const darkPrefers = matchMedia("(prefers-color-scheme: dark)");

type InlineStyleModule = { default: string };
type StyleBucketLoader = () => Promise<string[]>;

const loadedStyleBuckets = new Map<string, Promise<HTMLStyleElement[]>>();

const inlineStyleLoaders = {
    "base": () => import("@/stylesheets/main/base.scss?inline"),
    "universal": () => import("@/stylesheets/main/universal.scss?inline"),
    "animations": () => import("@/stylesheets/main/animations.scss?inline"),
    "palette": () => import("@/stylesheets/main/palette.scss?inline"),
    "variables": () => import("@/stylesheets/main/variables.scss?inline"),
    "tieba-error": () => import("@/stylesheets/tieba/tieba-error.scss?inline"),
    "tieba-forum": () => import("@/stylesheets/tieba/tieba-forum.scss?inline"),
    "tieba-forum-search": () => import("@/stylesheets/tieba/tieba-forum-search.scss?inline"),
    "tieba-home": () => import("@/stylesheets/tieba/tieba-home.scss?inline"),
    "tieba-main": () => import("@/stylesheets/tieba/tieba-main.scss?inline"),
    "tieba-search": () => import("@/stylesheets/tieba/tieba-search.scss?inline"),
    "tieba-thread": () => import("@/stylesheets/tieba/tieba-thread.scss?inline"),
    "vercel-error": () => import("@/stylesheets/tieba-vercel/tieba-error.scss?inline"),
    "vercel-forum": () => import("@/stylesheets/tieba-vercel/tieba-forum.scss?inline"),
    "vercel-home": () => import("@/stylesheets/tieba-vercel/tieba-home.scss?inline"),
    "vercel-main": () => import("@/stylesheets/tieba-vercel/tieba-main.scss?inline"),
    "vercel-search": () => import("@/stylesheets/tieba-vercel/tieba-search.scss?inline"),
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

        case "search":
            return "page:search";

        default:
            return "page:error";
    }
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
        "variables",
        "base",
        "universal",
        "palette",
    ]));
}

async function ensurePageCSS() {
    const pageType = currentPageType();

    if (pageType === "index") {
        return ensureStyleBucket(pageBucketKey(), () => loadInlineStyles([
            "tieba-main",
            "tieba-home",
            "vercel-main",
            "vercel-home",
        ]));
    }

    if (pageType === "forum") {
        return ensureStyleBucket(pageBucketKey(), () => loadInlineStyles([
            "tieba-main",
            "tieba-forum",
            "tieba-forum-search",
            "vercel-main",
            "vercel-forum",
        ]));
    }

    if (pageType === "thread") {
        return ensureStyleBucket(pageBucketKey(), () => loadInlineStyles([
            "tieba-main",
            "tieba-thread",
            "vercel-main",
            "vercel-thread",
        ]));
    }

    if (pageType === "search") {
        return ensureStyleBucket(pageBucketKey(), () => loadInlineStyles([
            "tieba-search",
            "vercel-main",
            "vercel-search",
        ]));
    }

    return ensureStyleBucket(pageBucketKey(), () => loadInlineStyles([
        "tieba-error",
        "vercel-error",
    ]));
}

export async function ensureSettingsCSS() {
    return ensureStyleBucket("settings", () => loadInlineStyles([
        "vercel-settings",
    ]));
}

const userThemeAliases = {
    "--user-theme": "var(--tieba-theme-color)",
    "--user-theme-transp": "var(--trans-tieba-theme-color)",
    "--user-theme-hover": "var(--tieba-theme-hover)",
    "--user-theme-active": "var(--tieba-theme-active)",
    "--user-theme-back": "var(--tieba-theme-background)",
    "--user-theme-fore": "var(--tieba-theme-fore)",
};

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
            ...userThemeAliases,
        },
        "html.light-theme": {
            "--tieba-theme-color": theme.light,
            "--trans-tieba-theme-color": lightTransp,
            "--tieba-theme-hover": lightHover,
            "--tieba-theme-active": lightActive,
            "--tieba-theme-background": lightBack,
            "--tieba-theme-fore": lightFore,
            ...userThemeAliases,
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

    const applyScrollbarWidth = () => {
        GM_addStyle(
            parseMultiCSS({
                ":root": {
                    "--scrollbar-width": `${scrollbarWidth()}px`,
                },
            })
        );
    };
    // bootstrap 可能晚于 load 事件执行，此时监听器永远不会触发
    if (document.readyState === "complete") {
        applyScrollbarWidth();
    } else {
        window.addEventListener("load", applyScrollbarWidth, { once: true });
    }

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

    // 先注入基础与调色板，再注入页面样式；各 bucket 内的覆盖样式排在基础样式之后。
    await ensureBaseCSS();
    await ensurePageCSS();
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
