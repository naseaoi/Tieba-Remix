import { GM_addStyle } from "$";
import "@/stylesheets/main/animations.scss";
import baseStyle from "@/stylesheets/main/base.scss?inline";
import "@/stylesheets/main/material-symbols.css";
import "@/stylesheets/main/palette.scss";
import "@/stylesheets/main/palette-vercel.scss";
import universalStyle from "@/stylesheets/main/universal.scss?inline";
import "@/stylesheets/main/variables.scss";
import tiebaErrorStyle from "@/stylesheets/tieba/tieba-error.scss?inline";
import tiebaForumStyle from "@/stylesheets/tieba/tieba-forum.scss?inline";
import tiebaHomeStyle from "@/stylesheets/tieba/tieba-home.scss?inline";
import tiebaMainStyle from "@/stylesheets/tieba/tieba-main.scss?inline";
import tiebaThreadStyle from "@/stylesheets/tieba/tieba-thread.scss?inline";
import vercelErrorStyle from "@/stylesheets/tieba-vercel/tieba-error.scss?inline";
import vercelForumStyle from "@/stylesheets/tieba-vercel/tieba-forum.scss?inline";
import vercelHomeStyle from "@/stylesheets/tieba-vercel/tieba-home.scss?inline";
import vercelMainStyle from "@/stylesheets/tieba-vercel/tieba-main.scss?inline";
import vercelSettingsStyle from "@/stylesheets/tieba-vercel/settings.scss?inline";
import vercelThreadStyle from "@/stylesheets/tieba-vercel/tieba-thread.scss?inline";
import _ from "lodash";
import { getResource } from "../api/remixed";
import { domrd } from "../elemental";
import { injectCSSRule, overwriteCSS, parseMultiCSS } from "../elemental/styles";
import { scrollbarWidth } from "../render";
import { customBackground, customStyle, fontWeights, monospaceFonts, themeColor, userFonts } from "../user-values";
import { waitUntil } from "../utils";
import { hexToRGBA, rgbaToHSLA } from "../utils/color";

export const darkPrefers = matchMedia("(prefers-color-scheme: dark)");

/** 主题色专用 style 元素，可反复替换内容 */
let themeColorStyleEl: HTMLStyleElement | undefined;

/** 实时应用主题色到 CSS 变量（同时覆盖 dark/light 两种模式） */
export function applyThemeColor() {
    const theme = themeColor.get();
    const darkRGBA = hexToRGBA(theme.dark);
    const lightRGBA = hexToRGBA(theme.light);
    const darkHSLA = rgbaToHSLA(darkRGBA);
    const lightHSLA = rgbaToHSLA(lightRGBA);

    const css = parseMultiCSS({
        "html.dark-theme": {
            "--tieba-theme-color": theme.dark,
            "--trans-tieba-theme-color": `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 80%)`,
            "--tieba-theme-hover": `hsl(${darkHSLA.h}deg ${parseInt(darkHSLA.s) + 40}% ${parseInt(darkHSLA.l) + 10}%)`,
            "--tieba-theme-active": `hsl(${darkHSLA.h}deg ${parseInt(darkHSLA.s) + 50}% ${parseInt(darkHSLA.l) + 20}%)`,
            "--tieba-theme-background": `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 24%)`,
            "--tieba-theme-fore": `hsl(${darkHSLA.h}deg 100% 75%)`,
        },
        "html.light-theme": {
            "--tieba-theme-color": theme.light,
            "--trans-tieba-theme-color": `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 80%)`,
            "--tieba-theme-hover": `hsl(${lightHSLA.h}deg ${parseInt(lightHSLA.s) - 40}% ${parseInt(lightHSLA.l) - 10}%)`,
            "--tieba-theme-active": `hsl(${lightHSLA.h}deg ${parseInt(lightHSLA.s) - 50}% ${parseInt(lightHSLA.l) - 20}%)`,
            "--tieba-theme-background": `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 24%)`,
            "--tieba-theme-fore": `hsl(${lightHSLA.h}deg 60% 32%)`,
        },
    });

    if (!themeColorStyleEl) {
        themeColorStyleEl = document.createElement("style");
        themeColorStyleEl.id = "remixed-theme-color";
        document.head.appendChild(themeColorStyleEl);
    }
    themeColorStyleEl.textContent = css;
}

/** 动态样式 */
export async function loadDynamicCSS() {
    const dynCSS = parseMultiCSS({
        ":root": {
            "--content-max": "982px",
            "--code-zh": `${_.join(userFonts.get(), ",")}`,
            "--code-monospace": `${_.join(monospaceFonts.get(), ",")}`,
            "--font-weight-normal": `${fontWeights.get().normal}`,
            "--font-weight-bold": `${fontWeights.get().bold}`,
        },
    });

    GM_addStyle(dynCSS);

    // 主题色通过独立 <style> 标签注入，支持实时替换
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

    const customCSS = customStyle.get();
    if (customCSS !== "") GM_addStyle(customCSS);
}

export async function loadMainCSS() {
    overwriteCSS(
        baseStyle,
        universalStyle,
        tiebaErrorStyle,
        tiebaForumStyle,
        tiebaHomeStyle,
        tiebaMainStyle,
        tiebaThreadStyle,
        // Vercel 主题样式（仅 html.style-vercel 时通过选择器作用域生效）
        vercelMainStyle,
        vercelForumStyle,
        vercelThreadStyle,
        vercelHomeStyle,
        vercelErrorStyle,
        vercelSettingsStyle,
    );

    document.addEventListener("DOMContentLoaded", function () {
        document.head.appendChild(domrd("link", {
            type: "image/icon",
            rel: "shortcut icon",
            href: getResource("/assets/images/main/favicon32.ico"),
        }));
    }, { once: true });
}

/**
 * 设置样式风格主题（Remixed / Vercel）
 * 通过切换 <html> 的 class 控制 CSS 选择器作用域，无需重新加载
 */
export function setStyleTheme(value: "remixed" | "vercel") {
    const html = document.documentElement;
    html.classList.toggle("style-vercel", value === "vercel");
    html.classList.toggle("style-remixed", value === "remixed");
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

    waitUntil(() => !_.isNil(document.body)).then(function () {
        if (customBackground.get()) {
            document.body.classList.add("custom-background");
        } else {
            document.body.classList.remove("custom-background");
        }
    });
}
