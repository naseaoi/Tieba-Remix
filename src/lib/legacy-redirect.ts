// document-start 给 <html> 上 inline !important 样式锁定遮罩与滚动条占位；
// 旧版/新版判定与百度安全验证拦截页都在此模块统一处理。

const SECURITY_RETRY_KEY = "tiebaRemix:securityRetry";
const SECURITY_MAX_RETRIES = 5;
const SECURITY_RELOAD_DELAY_MS = 600;
const SWITCH_SAFETY_RELOAD_MS = 5000;
const SECURITY_PAGE_TITLE = "百度安全验证";
const CLOAK_SAFETY_MS = 8000;

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

    if (document.readyState === "loading") {
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

        const isNewVersion = document.body?.classList.contains("cos-tieba") === true;

        if (isNewVersion) {
            clearSecurityRetry();
            redirectTriggered = true;
            void redirectToLegacy();
            return;
        }

        clearSecurityRetry();
        bootstrapped = true;
        bootstrap({ onReady: removeCloak });
    }
}

function applyCloak(): void {
    if (!document.documentElement) return;
    cloakApplied = true;
    document.documentElement.style.setProperty("overflow-y", "scroll", "important");
    document.documentElement.style.setProperty("scrollbar-gutter", "stable", "important");
    document.documentElement.style.setProperty("visibility", "hidden", "important");
    waitForBody(() => {
        document.body.style.setProperty("overflow", "visible", "important");
    });
}

function removeCloak(): void {
    if (cloakRemoved || !cloakApplied) return;
    cloakRemoved = true;
    document.documentElement?.style.removeProperty("visibility");
}

function waitForBody(cb: () => void): void {
    if (document.body) { cb(); return; }
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

    const count = readSecurityRetry();
    if (count >= SECURITY_MAX_RETRIES) {
        // 已达上限，撤掉遮罩，让用户看到安全验证页手动处理
        removeCloak();
        return true;
    }
    writeSecurityRetry(count + 1);
    window.setTimeout(() => window.location.reload(), SECURITY_RELOAD_DELAY_MS);
    return true;
}

function isSecurityPage(): boolean {
    if (document.title === SECURITY_PAGE_TITLE) return true;
    const text = document.body?.textContent;
    if (text && text.includes(SECURITY_PAGE_TITLE)) return true;
    return false;
}

function readSecurityRetry(): number {
    try {
        return Number(sessionStorage.getItem(SECURITY_RETRY_KEY) ?? "0") || 0;
    } catch { return 0; }
}

function writeSecurityRetry(value: number): void {
    try { sessionStorage.setItem(SECURITY_RETRY_KEY, String(value)); } catch { /* ignore */ }
}

function clearSecurityRetry(): void {
    try { sessionStorage.removeItem(SECURITY_RETRY_KEY); } catch { /* ignore */ }
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
