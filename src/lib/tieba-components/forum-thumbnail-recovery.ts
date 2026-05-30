import { currentPageType } from "@/lib/api/remixed";
import { dom } from "@/lib/elemental";
import { forumThreadsObserver } from "@/lib/observers";

let installed = false;

const IMAGE_SELECTOR = ".threadlist_media .vpic_wrap img:not([style]):not([data-trex-thumbnail-restored])";
const URL_ATTRS = [
    "data-original",
    "data-src",
    "data-url",
    "original",
    "bpic",
    "attr",
    "src",
];

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

function getImageUrl(img: HTMLImageElement): Maybe<string> {
    const current = normalizeImageUrl(img.currentSrc || img.src);
    if (current && !isPlaceholderUrl(current)) return current;

    for (const attr of URL_ATTRS) {
        const url = normalizeImageUrl(img.getAttribute(attr));
        if (url && !isPlaceholderUrl(url)) return url;
    }

    return undefined;
}

function restoreImage(img: HTMLImageElement): void {
    const url = getImageUrl(img);
    if (!url) return;

    const quotedUrl = url.replaceAll("\"", "%22");
    img.dataset.trexThumbnailRestored = "1";
    img.style.opacity = "1";
    img.style.backgroundImage = `url("${quotedUrl}")`;
    img.style.backgroundRepeat = "no-repeat";
    img.style.backgroundPosition = "center";
    img.style.backgroundSize = "cover";

    const src = normalizeImageUrl(img.getAttribute("src"));
    if (!src || isPlaceholderUrl(src)) {
        img.src = url;
    }
}

function restoreAll(): void {
    dom<"img">(IMAGE_SELECTOR, []).forEach(restoreImage);
}

export function installForumThumbnailRecovery(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    forumThreadsObserver.addEvent(restoreAll);
    window.addEventListener("load", () => {
        window.setTimeout(restoreAll, 1500);
    }, { once: true });
}
