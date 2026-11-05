// 遮罩期的加载指示：html 上的伪元素不受 html 自身 visibility:hidden 影响，
// 因此无需等 <body>、无需插入任何 DOM 节点即可绘制。

import { GM_getValue } from "./monkey";

const INDICATOR_STYLE_ID = "tieba-remix-cloak-indicator";
const SPINNER_DELAY_MS = 250;

const LIGHT_BACKDROP = "#fafafa";
const LIGHT_TRACK = "rgb(0 0 0 / 12%)";
const DARK_BACKDROP = "#0a0a0a";
const DARK_TRACK = "rgb(255 255 255 / 16%)";

function indicatorStyle(): string {
    return `
html {
    --tbr-cloak-backdrop: ${LIGHT_BACKDROP};
    --tbr-cloak-track: ${LIGHT_TRACK};
}

html[data-tbr-cloak-theme="dark"] {
    --tbr-cloak-backdrop: ${DARK_BACKDROP};
    --tbr-cloak-track: ${DARK_TRACK};
}

html[data-tbr-cloak="on"]::before,
html[data-tbr-cloak="on"]::after {
    visibility: visible !important;
    position: fixed !important;
    z-index: 2147483647 !important;
    content: "" !important;
}

html[data-tbr-cloak="on"]::before {
    inset: 0 !important;
    background-color: var(--tbr-cloak-backdrop) !important;
}

html[data-tbr-cloak="on"]::after {
    top: 50% !important;
    left: 50% !important;
    box-sizing: border-box !important;
    width: 34px !important;
    height: 34px !important;
    border: 3px solid var(--tbr-cloak-track) !important;
    border-top-color: var(--tieba-theme-color, #589afe) !important;
    border-radius: 50% !important;
    margin: -17px 0 0 -17px !important;
    animation: kf-cloak-spinner-appear 160ms ease-out ${SPINNER_DELAY_MS}ms both, kf-cloak-spin 720ms linear infinite !important;
}

@keyframes kf-cloak-spin {
    to { transform: rotate(360deg); }
}

@keyframes kf-cloak-spinner-appear {
    from { opacity: 0; }
    to { opacity: 1; }
}
`;
}

function prefersDark(): boolean {
    const theme = GM_getValue<"auto" | "dark" | "light">("themeType", "auto");
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function showCloakIndicator(): void {
    const html = document.documentElement;
    if (!html) return;

    html.dataset.tbrCloakTheme = prefersDark() ? "dark" : "light";
    html.dataset.tbrCloak = "on";

    if (document.getElementById(INDICATOR_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = INDICATOR_STYLE_ID;
    style.textContent = indicatorStyle();
    (document.head ?? html).appendChild(style);
}

export function hideCloakIndicator(): void {
    const html = document.documentElement;
    if (!html) return;
    delete html.dataset.tbrCloak;
    delete html.dataset.tbrCloakTheme;
    document.getElementById(INDICATOR_STYLE_ID)?.remove();
}
