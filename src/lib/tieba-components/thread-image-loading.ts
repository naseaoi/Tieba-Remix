import { addCoalescedObserverEvent, threadFloorsObserver } from "@/lib/observers";

const IMAGE_SELECTOR = ".d_post_content .BDE_Image";
const LOADING_ATTR = "data-tbr-image-loading";
const DEFERRED_SRC_ATTR = "data-tbr-image-src";
const DEFERRED_SRCSET_ATTR = "data-tbr-image-srcset";
const EAGER_IMAGE_LIMIT = 2;
const IMAGE_VIEWPORT_MARGIN = 800;

let earlyObserver: MutationObserver | undefined;
let deferredImageObserver: IntersectionObserver | undefined;
let eagerImageCount = 0;
let installed = false;
let viewportRefreshScheduled = false;

export function installEarlyThreadImageLoading(): void {
    if (!isThreadPath() || earlyObserver || installed || !document.documentElement) return;

    processRoot(document);
    earlyObserver = new MutationObserver(records => {
        records.forEach(record => {
            record.addedNodes.forEach(node => {
                if (node instanceof Element) processRoot(node);
            });
        });
    });
    earlyObserver.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", stopEarlyObserver, { once: true });
}

export function installThreadImageLoading(): void {
    if (installed || !isThreadPath()) return;
    installed = true;
    stopEarlyObserver();
    addCoalescedObserverEvent(() => processRoot(document), threadFloorsObserver);
    window.addEventListener("scroll", scheduleViewportRefresh, { passive: true });
    window.addEventListener("resize", scheduleViewportRefresh, { passive: true });
}

export function refreshThreadImageLoading(): void {
    if (!installed || !isThreadPath()) return;
    processRoot(document);
    scheduleViewportRefresh();
}

function processRoot(root: Document | Element): void {
    if (root instanceof HTMLImageElement && root.matches(IMAGE_SELECTOR)) processImage(root);
    root.querySelectorAll<HTMLImageElement>(IMAGE_SELECTOR).forEach(processImage);
}

function processImage(image: HTMLImageElement): void {
    if (image.hasAttribute(LOADING_ATTR)) {
        if (image.dataset.tbrImageLoading === "lazy"
            && isInitialFloorImage(image)
            && eagerImageCount < EAGER_IMAGE_LIMIT) {
            promoteInitialImage(image);
            return;
        }
        if (image.hasAttribute(DEFERRED_SRC_ATTR)) observeDeferredImage(image);
        return;
    }

    prepareImage(image);
}

function prepareImage(image: HTMLImageElement): void {
    const eager = isInitialFloorImage(image) && eagerImageCount < EAGER_IMAGE_LIMIT;
    const src = image.getAttribute("src");
    const srcset = image.getAttribute("srcset");
    const restartRequest = !eager && (!image.complete || image.naturalWidth === 0) && (src !== null || srcset !== null);
    if (restartRequest) deferImageRequest(image, src, srcset);

    image.decoding = "async";
    image.loading = eager ? "eager" : "lazy";
    if (eager) {
        if (eagerImageCount === 0) image.fetchPriority = "high";
        eagerImageCount++;
    }
    image.setAttribute(LOADING_ATTR, eager ? "eager" : "lazy");

    if (restartRequest) observeDeferredImage(image);
}

function promoteInitialImage(image: HTMLImageElement): void {
    restoreDeferredImage(image);
    image.decoding = "async";
    image.loading = "eager";
    if (eagerImageCount === 0) image.fetchPriority = "high";
    eagerImageCount++;
    image.setAttribute(LOADING_ATTR, "eager");
}

function deferImageRequest(image: HTMLImageElement, src: string | null, srcset: string | null): void {
    if (src !== null) image.setAttribute(DEFERRED_SRC_ATTR, src);
    if (srcset !== null) image.setAttribute(DEFERRED_SRCSET_ATTR, srcset);
    image.removeAttribute("src");
    image.removeAttribute("srcset");
}

function observeDeferredImage(image: HTMLImageElement): void {
    if (isNearViewport(image)) {
        restoreDeferredImage(image);
        return;
    }
    if (!deferredImageObserver) {
        if (typeof IntersectionObserver === "undefined") {
            restoreDeferredImage(image);
            return;
        }
        deferredImageObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const target = entry.target;
                if (target instanceof HTMLImageElement) restoreDeferredImage(target);
            });
        }, { rootMargin: "800px 0px" });
    }
    deferredImageObserver.observe(image);
}

function isNearViewport(image: HTMLImageElement): boolean {
    if (document.documentElement.clientWidth === 0) return false;
    const rect = image.getBoundingClientRect();
    return rect.bottom >= -IMAGE_VIEWPORT_MARGIN
        && rect.top <= window.innerHeight + IMAGE_VIEWPORT_MARGIN;
}

function scheduleViewportRefresh(): void {
    if (viewportRefreshScheduled) return;
    viewportRefreshScheduled = true;
    requestAnimationFrame(() => {
        viewportRefreshScheduled = false;
        document.querySelectorAll<HTMLImageElement>(`${IMAGE_SELECTOR}[${DEFERRED_SRC_ATTR}]`).forEach(image => {
            if (isNearViewport(image)) restoreDeferredImage(image);
        });
    });
}

function restoreDeferredImage(image: HTMLImageElement): void {
    deferredImageObserver?.unobserve(image);
    const src = image.getAttribute(DEFERRED_SRC_ATTR);
    const srcset = image.getAttribute(DEFERRED_SRCSET_ATTR);
    image.removeAttribute(DEFERRED_SRC_ATTR);
    image.removeAttribute(DEFERRED_SRCSET_ATTR);
    if (srcset !== null) image.setAttribute("srcset", srcset);
    if (src !== null) image.setAttribute("src", src);
}

function isInitialFloorImage(image: HTMLImageElement): boolean {
    const floor = image.closest<HTMLElement>("#j_p_postlist > .l_post");
    return floor !== null && floor === document.querySelector("#j_p_postlist > .l_post");
}

function stopEarlyObserver(): void {
    earlyObserver?.disconnect();
    earlyObserver = undefined;
}

function isThreadPath(): boolean {
    return location.pathname.startsWith("/p/");
}
