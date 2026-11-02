import { currentPageType } from "@/lib/api/remixed";
import { dom } from "@/lib/elemental";
import { onWindowLoaded } from "@/lib/elemental/ready";
import { addCoalescedObserverEvent, forumThreadsObserver } from "@/lib/observers";

let installed = false;
let pendingRestoreTimer: Maybe<number>;
let lastRestoreTime = 0;
let rootObserver: Maybe<MutationObserver>;
let observedRoot: Maybe<Element>;

const ROOT_SELECTOR = "#pagelet_frs-list\\/pagelet\\/thread";
const IMAGE_SELECTOR = ".threadlist_media img";
const REAL_URL_ATTRS = [
    "data-original",
    "data-src",
    "data-url",
    "original",
    "bpic",
];
const OBSERVED_ATTRS = [...REAL_URL_ATTRS, "src", "style", "srcset"];
const RESTORE_DEBOUNCE_MS = 16;
const RESTORE_MAX_WAIT_MS = 300;

function isPlaceholderUrl(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes("blank.gif") ||
        lower.includes("transparent") ||
        lower.startsWith("data:image/gif;base64,r0lgodlhaq");
}

function normalizeImageUrl(value: Maybe<string | null>): Maybe<string> {
    const text = value?.trim();
    if (!text) return undefined;

    try {
        if (!/^[a-z][a-z\d+.-]*:/i.test(text) && !text.startsWith("//") && !text.startsWith("/")) {
            return undefined;
        }

        const url = new URL(text, location.href);
        if (url.protocol === "http:" || url.protocol === "https:") return url.href;
        if (url.protocol === "data:" && url.href.startsWith("data:image/")) return url.href;
    } catch (error) {
        return undefined;
    }

    return undefined;
}

function markRestored(img: HTMLImageElement): void {
    img.dataset.trexThumbnailRestored = "1";
}

function setBackgroundFallback(img: HTMLImageElement, url: string): void {
    const quotedUrl = url.replaceAll("\"", "%22");
    img.style.backgroundImage = `url("${quotedUrl}")`;
    img.style.backgroundRepeat = "no-repeat";
    img.style.backgroundPosition = "center";
    img.style.backgroundSize = "cover";
}

function clearBackgroundFallback(img: HTMLImageElement): void {
    img.style.removeProperty("background-image");
    img.style.removeProperty("background-repeat");
    img.style.removeProperty("background-position");
    img.style.removeProperty("background-size");
}

function getRealImageUrl(img: HTMLImageElement): Maybe<string> {
    for (const attr of REAL_URL_ATTRS) {
        const url = normalizeImageUrl(img.getAttribute(attr));
        if (url && !isPlaceholderUrl(url)) return url;
    }
    return undefined;
}

function bindImage(img: HTMLImageElement): void {
    if (img.dataset.trexThumbnailBound === "1") return;
    img.dataset.trexThumbnailBound = "1";
    img.addEventListener("load", () => restoreImage(img));
    img.addEventListener("error", () => {
        window.setTimeout(() => restoreImage(img), 0);
    });
}

function restoreImage(img: HTMLImageElement): void {
    bindImage(img);
    markRestored(img);

    const real = getRealImageUrl(img);

    if (real && img.getAttribute("src") !== real) {
        img.src = real;
        setBackgroundFallback(img, real);
        return;
    }

    if (img.complete && img.naturalWidth > 0) {
        clearBackgroundFallback(img);
    }
}

function restoreAll(): void {
    if (!observedRoot) return;
    dom<"img">(IMAGE_SELECTOR, observedRoot, []).forEach(restoreImage);
}

function connectRoot(): void {
    if (!observedRoot || !rootObserver) return;
    rootObserver.observe(observedRoot, {
        subtree: true,
        attributes: true,
        attributeFilter: OBSERVED_ATTRS,
    });
}

function observeRoot(): void {
    const pagelet = dom(ROOT_SELECTOR);
    const root = pagelet ? dom("#thread_list", pagelet) ?? pagelet : undefined;
    if (root === observedRoot) return;

    // 原生 AJAX 翻页会替换列表根，属性监听随共享结构事件重新绑定。
    rootObserver?.disconnect();
    observedRoot = root;
    if (!root) return;
    rootObserver ??= new MutationObserver(records => {
        if (records.some(({ target }) => target instanceof HTMLImageElement && target.matches(IMAGE_SELECTOR))) {
            scheduleRestore();
        }
    });
    connectRoot();
}

function runRestore(): void {
    pendingRestoreTimer = undefined;
    lastRestoreTime = performance.now();
    observeRoot();

    rootObserver?.disconnect();
    restoreAll();
    connectRoot();
}

function scheduleRestore(): void {
    if (pendingRestoreTimer != null) {
        window.clearTimeout(pendingRestoreTimer);
        pendingRestoreTimer = undefined;
    }

    if (performance.now() - lastRestoreTime >= RESTORE_MAX_WAIT_MS) {
        runRestore();
        return;
    }

    pendingRestoreTimer = window.setTimeout(runRestore, RESTORE_DEBOUNCE_MS);
}

function flushRestore(): void {
    if (pendingRestoreTimer != null) {
        window.clearTimeout(pendingRestoreTimer);
        pendingRestoreTimer = undefined;
    }
    runRestore();
}

export function installForumThumbnailRecovery(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    addCoalescedObserverEvent(flushRestore, forumThreadsObserver);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", flushRestore, { once: true });
    }

    onWindowLoaded(() => {
        window.setTimeout(flushRestore, 200);
        window.setTimeout(flushRestore, 1200);
        window.setTimeout(flushRestore, 2500);
    });
}
