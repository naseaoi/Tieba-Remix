// document-start 给 <html> 上 inline !important 样式锁定遮罩与滚动条占位；
// 旧版/新版判定与百度安全验证拦截页都在此模块统一处理。

import { hideCloakIndicator, showCloakIndicator } from "./cloak-indicator";
import { GM_getValue } from "./monkey";
import { installEarlyThreadImageLoading } from "./tieba-components/thread-image-loading";

const LEGACY_SWITCH_ATTEMPT_KEY = "tiebaRemix:legacySwitchAttempt";
const LEGACY_SWITCH_ATTEMPT_TTL_MS = 30_000;
const SWITCH_SAFETY_RELOAD_MS = 5000;
const SECURITY_PAGE_TITLE = "百度安全验证";
const CLOAK_SAFETY_MS = 8000;
export const THREAD_LAYOUT_STATUS_ATTR = "data-tbr-thread-layout";
export const THREAD_LAYOUT_STATUS_LOADING = "loading";
export const THREAD_LAYOUT_STATUS_READY = "ready";
const THREAD_AGREE_COUNT_ATTR = "data-tbr-thread-agree-count";
const THREAD_AGREE_COUNT_ENABLED = "enabled";
const THREAD_AGREE_COUNT_MODULE_ID = "thread-agree-count";
const THREAD_LOADING_LAYOUT_STYLE_ID = "tieba-remix-thread-loading-layout";
const THREAD_LOADING_LAYOUT_STYLE = `
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] {
    --content-max: 982px;
}

html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .head_inner,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .card_top_wrap,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .nav_wrap,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .p_thread,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .core_title_wrap_bright,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .right_section,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .pb_footer,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .post-foot-send-gift-container,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .head_ad_pop,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .plat_head,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .star_nav_wrap {
    display: none !important;
}

html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .wrap1,
html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .wrap2 {
    background: none !important;
    background-color: transparent !important;
}

html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] #container {
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: var(--content-max, 982px) !important;
    margin-top: 86px !important;
    transition: none !important;
}

html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"][data-nav-bar-mode="alwaysFold"] #container {
    margin-top: 16px !important;
}

html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] #container .content {
    width: 100% !important;
    border-radius: 8px !important;
    background: transparent !important;
}

html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] #container .content::before {
    display: block !important;
    height: 70px !important;
    margin: 16px 0 !important;
    content: "" !important;
}

html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_READY}"] #container .content::before {
    content: none !important;
}

html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] #pb_content {
    position: relative !important;
    box-sizing: border-box !important;
    width: 100% !important;
    padding: 24px 48px !important;
    border-top: 2px solid var(--tieba-theme-color, #589afe) !important;
    border-radius: 4px 4px 0 0 !important;
    background-color: var(--default-background, #fff) !important;
}

html[${THREAD_LAYOUT_STATUS_ATTR}="${THREAD_LAYOUT_STATUS_LOADING}"] .left_section {
    width: 100% !important;
    background: none !important;
}

html[${THREAD_AGREE_COUNT_ATTR}="${THREAD_AGREE_COUNT_ENABLED}"] .post-tail-wrap:not(:has(.floor-agree-count-badge))::after,
html[${THREAD_AGREE_COUNT_ATTR}="${THREAD_AGREE_COUNT_ENABLED}"] .core_reply_tail:not(.clearfix):not(:has(.floor-agree-count-badge))::after {
    display: inline-flex !important;
    flex: 0 0 42px !important;
    height: 24px !important;
    order: 100 !important;
    margin-left: auto !important;
    content: "" !important;
}

html[${THREAD_AGREE_COUNT_ATTR}="${THREAD_AGREE_COUNT_ENABLED}"] .lzl_content_reply:not(:has(.lzl-agree-count-badge))::after {
    display: inline-flex !important;
    flex: 0 0 42px !important;
    height: 24px !important;
    order: 100 !important;
    margin-left: auto !important;
    content: "" !important;
}

html[${THREAD_AGREE_COUNT_ATTR}="${THREAD_AGREE_COUNT_ENABLED}"] .post-tail-wrap:not(:has(.floor-agree-count-badge)) .p_reply,
html[${THREAD_AGREE_COUNT_ATTR}="${THREAD_AGREE_COUNT_ENABLED}"] .core_reply_tail:not(.clearfix):not(:has(.floor-agree-count-badge)) .p_reply,
html[${THREAD_AGREE_COUNT_ATTR}="${THREAD_AGREE_COUNT_ENABLED}"] .post-tail-wrap:not(:has(.floor-agree-count-badge)) .tbr-floor-menu,
html[${THREAD_AGREE_COUNT_ATTR}="${THREAD_AGREE_COUNT_ENABLED}"] .lzl_content_reply:not(:has(.lzl-agree-count-badge)) .lzl_s_r,
html[${THREAD_AGREE_COUNT_ATTR}="${THREAD_AGREE_COUNT_ENABLED}"] .lzl_content_reply:not(:has(.lzl-agree-count-badge)) .tbr-floor-menu {
    margin-left: 0 !important;
}

#j_p_postlist {
    display: flex !important;
    box-sizing: border-box !important;
    flex-direction: column !important;
    gap: 16px !important;
}

#j_p_postlist:not(.content-wrapper) .d_author {
    display: none !important;
}

#j_p_postlist .save_face_bg {
    display: none !important;
}

#j_p_postlist .l_post_bright {
    border: none !important;
}

#j_p_postlist .l_post_bright .d_post_content_main {
    width: 100% !important;
    padding: 0 !important;
    background-color: transparent !important;
}

#j_p_postlist .l_post_bright .d_post_content_main .p_content {
    min-height: 0 !important;
    padding: 0 !important;
    margin-bottom: -42px !important;
    background-color: transparent !important;
}

#j_p_postlist .l_post_bright .d_post_content_main .d_post_content {
    padding: 0 !important;
    background-color: transparent !important;
    font-size: 16px !important;
}

#j_p_postlist .l_post_bright .d_post_content_main .replace_div {
    width: auto !important;
}

#j_p_postlist .l_post_bright .d_post_content_main .BDE_Smiley {
    width: 24px !important;
    height: 24px !important;
    vertical-align: text-bottom !important;
}

#j_p_postlist .l_post_bright .d_post_content_main .BDE_Image {
    display: flex !important;
    width: auto !important;
    max-width: min(100%, 320px) !important;
    height: auto !important;
    max-height: 400px !important;
    border-radius: 4px !important;
    margin: 6px auto !important;
    object-fit: contain !important;
}
`;

let bootstrapped = false;
let redirectTriggered = false;
let securityHandled = false;
let cloakRemoved = false;
let cloakApplied = false;

export interface BootstrapSignal {
    onReady: () => void;
}

export function setupLegacyRedirect(bootstrap: (signal: BootstrapSignal) => void): void {
    if (location.hostname.toLowerCase() !== "tieba.baidu.com") {
        bootstrapped = true;
        bootstrap({ onReady: () => { /* 非贴吧域名无需遮罩，no-op */ } });
        return;
    }

    installThreadLoadingLayoutStyle();
    installEarlyThreadImageLoading();

    // 生产构建经 System.import 异步求值，到这里 readyState 常已是 interactive，
    // 只有 complete 才说明原生页面已完整绘制、此时遮罩已无意义
    if (document.readyState !== "complete") {
        applyCloak();
        window.setTimeout(removeCloak, CLOAK_SAFETY_MS);
    }

    // 早期：仅处理「百度安全验证」拦截页
    waitForBody(() => { handleSecurityPage(); });

    // 最终版本判定：等 DOMContentLoaded，确保 body class、PageData 都已就位
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", finalize, { once: true });
    } else {
        finalize();
    }

    function finalize() {
        if (bootstrapped || redirectTriggered) return;
        if (handleSecurityPage()) return;

        const isNewVersion = document.body?.classList.contains("cos-tieba") === true
            || isForumPageWithoutPageData();

        if (isNewVersion) {
            if (hasRecentLegacySwitchAttempt()) {
                removeCloak();
                return;
            }
            markLegacySwitchAttempt();
            redirectTriggered = true;
            void redirectToLegacy();
            return;
        }

        clearLegacySwitchAttempt();
        bootstrapped = true;
        bootstrap({ onReady: removeCloak });
    }
}

function isForumPageWithoutPageData(): boolean {
    return location.pathname.toLowerCase() === "/f" && typeof PageData === "undefined";
}

function applyCloak(): void {
    if (cloakRemoved) return;
    // document-start 下 <html> 可能尚未建立，重试到安全阀置起 cloakRemoved 为止
    if (!document.documentElement) {
        window.setTimeout(applyCloak, 0);
        return;
    }
    installThreadLoadingLayoutStyle();
    cloakApplied = true;
    showCloakIndicator();
    document.documentElement.style.setProperty("overflow-y", "scroll", "important");
    document.documentElement.style.setProperty("scrollbar-gutter", "stable", "important");
    document.documentElement.style.setProperty("visibility", "hidden", "important");
    waitForBody(() => {
        document.body.style.setProperty("overflow", "visible", "important");
    });
}

function installThreadLoadingLayoutStyle(): void {
    if (!isThreadPath()) return;
    if (!threadPageExtensionEnabled()) return;
    if (!document.documentElement) {
        window.setTimeout(installThreadLoadingLayoutStyle, 0);
        return;
    }
    document.documentElement.setAttribute(THREAD_LAYOUT_STATUS_ATTR, THREAD_LAYOUT_STATUS_LOADING);
    document.documentElement.dataset.navBarMode = readNavBarHideMode();
    const agreeCountEnabled = threadAgreeCountEnabled();
    document.documentElement.toggleAttribute(THREAD_AGREE_COUNT_ATTR, agreeCountEnabled);
    if (agreeCountEnabled) {
        document.documentElement.setAttribute(THREAD_AGREE_COUNT_ATTR, THREAD_AGREE_COUNT_ENABLED);
    }
    if (document.getElementById(THREAD_LOADING_LAYOUT_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = THREAD_LOADING_LAYOUT_STYLE_ID;
    style.textContent = THREAD_LOADING_LAYOUT_STYLE;
    (document.head ?? document.documentElement).appendChild(style);
}

function isThreadPath(): boolean {
    return location.hostname.toLowerCase() === "tieba.baidu.com" && location.pathname.startsWith("/p/");
}

function threadPageExtensionEnabled(): boolean {
    const pageExtension = GM_getValue("pageExtension", { index: true, thread: true });
    return pageExtension.thread !== false;
}

function readNavBarHideMode(): string {
    const mode = GM_getValue("navBarHideMode", "fold");
    return mode === "fold" || mode === "alwaysFold" || mode === "never" ? mode : "fold";
}

function threadAgreeCountEnabled(): boolean {
    const disabledModules = GM_getValue<string[]>("disabledModules", []);
    return !Array.isArray(disabledModules) || !disabledModules.includes(THREAD_AGREE_COUNT_MODULE_ID);
}

function removeCloak(): void {
    if (cloakRemoved) return;
    cloakRemoved = true;
    if (!cloakApplied) return;
    hideCloakIndicator();
    document.documentElement?.style.removeProperty("visibility");
}

function waitForBody(cb: () => void): void {
    if (document.body) { cb(); return; }
    if (!document.documentElement) {
        window.setTimeout(() => waitForBody(cb), 0);
        return;
    }
    const obs = new MutationObserver(() => {
        if (document.body) {
            obs.disconnect();
            cb();
        }
    });
    obs.observe(document.documentElement, { childList: true, subtree: false });
}

function handleSecurityPage(): boolean {
    if (securityHandled) return true;
    if (!isSecurityPage()) return false;
    securityHandled = true;
    removeCloak();
    return true;
}

function isSecurityPage(): boolean {
    if (document.title === SECURITY_PAGE_TITLE) return true;
    const text = document.body?.textContent;
    if (text && text.includes(SECURITY_PAGE_TITLE)) return true;
    return false;
}

function hasRecentLegacySwitchAttempt(): boolean {
    try {
        const timestamp = Number(sessionStorage.getItem(LEGACY_SWITCH_ATTEMPT_KEY));
        return Number.isFinite(timestamp) && Date.now() - timestamp < LEGACY_SWITCH_ATTEMPT_TTL_MS;
    } catch { return false; }
}

function markLegacySwitchAttempt(): void {
    try { sessionStorage.setItem(LEGACY_SWITCH_ATTEMPT_KEY, String(Date.now())); } catch { /* ignore */ }
}

function clearLegacySwitchAttempt(): void {
    try { sessionStorage.removeItem(LEGACY_SWITCH_ATTEMPT_KEY); } catch { /* ignore */ }
}

async function redirectToLegacy(): Promise<void> {
    let reloaded = false;
    const reload = () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
    };

    // 兜底：接口异常或被风控时也要落地刷新，避免页面长期空挂
    const safety = window.setTimeout(reload, SWITCH_SAFETY_RELOAD_MS);

    try {
        await fetch("/c/s/pc/updateSwitch?status=0&_client_type=20", {
            credentials: "include",
            cache: "no-store",
        });
    } catch { /* ignore */ }

    window.clearTimeout(safety);
    reload();
}
