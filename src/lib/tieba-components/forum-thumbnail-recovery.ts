import { currentPageType } from "@/lib/api/remixed";
import { dom } from "@/lib/elemental";
import { forumThreadsObserver } from "@/lib/observers";

let installed = false;
let pendingRestoreTimer: Maybe<number>;
let pageObserver: Maybe<MutationObserver>;
let rootObserver: Maybe<MutationObserver>;
let observedRoot: Maybe<Element>;

const ROOT_SELECTOR = "#pagelet_frs-list\\/pagelet\\/thread";
const IMAGE_SELECTOR = ".threadlist_media img";
const URL_ATTRS = [
    "data-original",
    "data-src",
    "data-url",
    "original",
    "bpic",
    "attr",
    "src",
];
const OBSERVED_ATTRS = [...URL_ATTRS, "style", "srcset"];

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

function markImageVisible(img: HTMLImageElement): void {
    img.dataset.trexThumbnailRestored = "1";
    img.style.opacity = "1";
    img.style.visibility = "visible";
}

function clearBackgroundFallback(img: HTMLImageElement): void {
    img.style.removeProperty("background-image");
    img.style.removeProperty("background-repeat");
    img.style.removeProperty("background-position");
    img.style.removeProperty("background-size");
}

function getImageUrl(img: HTMLImageElement): Maybe<string> {
    const current = normalizeImageUrl(img.currentSrc || img.src);
    if (current && !isPlaceholderUrl(current)) return current;

    for (const attr of URL_ATTRS) {
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

    const url = getImageUrl(img);
    const current = normalizeImageUrl(img.currentSrc || img.getAttribute("src"));
    const loaded = img.complete && img.naturalWidth > 0;

    if (!url && !loaded) return;

    markImageVisible(img);

    if (url && (!current || isPlaceholderUrl(current)) && img.getAttribute("src") !== url) {
        img.src = url;
    }

    if (loaded || !url) {
        clearBackgroundFallback(img);
        return;
    }

    const quotedUrl = url.replaceAll("\"", "%22");
    img.style.backgroundImage = `url("${quotedUrl}")`;
    img.style.backgroundRepeat = "no-repeat";
    img.style.backgroundPosition = "center";
    img.style.backgroundSize = "cover";
}

function restoreAll(): void {
    dom<"img">(IMAGE_SELECTOR, []).forEach(restoreImage);
}

function observeRoot(): void {
    const root = dom(ROOT_SELECTOR);
    if (!root || root === observedRoot) return;

    observedRoot = root;
    rootObserver?.disconnect();
    rootObserver = new MutationObserver(() => scheduleRestore(16));
    rootObserver.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: OBSERVED_ATTRS,
    });
}

function scheduleRestore(delay = 0): void {
    if (pendingRestoreTimer != null) {
        window.clearTimeout(pendingRestoreTimer);
    }

    pendingRestoreTimer = window.setTimeout(() => {
        pendingRestoreTimer = undefined;
        observeRoot();
        restoreAll();
    }, delay);
}

function startObservers(): void {
    observeRoot();
    if (!document.body || pageObserver) return;

    pageObserver = new MutationObserver(() => scheduleRestore(16));
    pageObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

export function installForumThumbnailRecovery(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    forumThreadsObserver.addEvent(() => scheduleRestore(0));

    const start = () => {
        startObservers();
        scheduleRestore(0);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }

    window.addEventListener("load", () => {
        scheduleRestore(200);
        scheduleRestore(1200);
        window.setTimeout(() => scheduleRestore(0), 2500);
    }, { once: true });
}
