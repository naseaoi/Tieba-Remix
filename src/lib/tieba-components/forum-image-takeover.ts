import {
    fetchThreadImages,
    imagesViewer,
    openThreadImages,
    preloadImageUrl,
    prepareImagesViewer,
} from "@/components/images-viewer";
import { currentPageType } from "@/lib/api/remixed";
import { forumThreadsObserver } from "@/lib/observers";
import { threadImageQueueScope } from "@/lib/user-values";

const INTENT_PREFETCH_DELAY = 100;
const VISIBLE_THREAD_PREFETCH_LIMIT = 3;

let installed = false;
let intentPrefetchTimer: number | undefined;
let pendingIntentKey = "";
let visiblePrefetchScheduled = false;
const prefetchedThreadIds = new Set<number>();

interface ForumImageTarget {
    tid: number;
    index: number;
    mediaList: HTMLElement;
}

export function installForumImageTakeover(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    document.addEventListener("pointerover", (event) => {
        const target = getForumImageTarget(event.target);
        if (!target) return;

        const key = `${target.tid}:${target.index}`;
        if (pendingIntentKey === key) return;
        clearIntentPrefetch();
        pendingIntentKey = key;
        intentPrefetchTimer = window.setTimeout(() => {
            pendingIntentKey = "";
            warmImageTarget(target);
        }, INTENT_PREFETCH_DELAY);
    }, { capture: true, passive: true });

    document.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        const target = getForumImageTarget(event.target);
        if (!target) return;
        clearIntentPrefetch();
        warmImageTarget(target);
    }, { capture: true, passive: true });

    document.addEventListener("focusin", (event) => {
        const target = getForumImageTarget(event.target);
        if (!target) return;
        clearIntentPrefetch();
        warmImageTarget(target);
    }, { capture: true });

    document.addEventListener("click", function (e) {
        if (!document.documentElement.classList.contains("style-vercel")) return;

        const target = getForumImageTarget(e.target);
        if (!target) return;
        const { tid, index, mediaList } = target;

        e.preventDefault();
        e.stopPropagation();

        if (threadImageQueueScope.get() === "floor") {
            const thumbCount = mediaList.querySelectorAll("img").length;
            void (async () => {
                const allImages = await fetchThreadImages(tid);
                const filtered = allImages.slice(0, Math.max(thumbCount, 1));
                void imagesViewer({
                    content: filtered,
                    defaultIndex: Math.max(0, Math.min(index, filtered.length - 1)),
                });
            })();
            return;
        }

        openThreadImages(tid, index);
    }, { capture: true });

    forumThreadsObserver.addEvent(scheduleVisibleThreadPrefetch);
}

function getForumImageTarget(eventTarget: EventTarget | null): ForumImageTarget | undefined {
    if (!document.documentElement.classList.contains("style-vercel")) return;
    if (!(eventTarget instanceof Element)) return;

    const picLi = eventTarget.closest<HTMLLIElement>(".threadlist_media > li");
    const threadLi = picLi?.closest<HTMLLIElement>(".j_thread_list[data-tid]");
    const mediaList = picLi?.parentElement;
    if (!picLi || !threadLi || !mediaList) return;

    const tid = Number(threadLi.dataset.tid);
    if (!Number.isSafeInteger(tid) || tid <= 0) return;

    return {
        tid,
        index: Math.max(0, Array.prototype.indexOf.call(mediaList.children, picLi)),
        mediaList,
    };
}

function clearIntentPrefetch(): void {
    if (intentPrefetchTimer !== undefined) window.clearTimeout(intentPrefetchTimer);
    intentPrefetchTimer = undefined;
    pendingIntentKey = "";
}

function warmImageTarget(target: ForumImageTarget): void {
    prepareImagesViewer();
    void fetchThreadImages(target.tid).then(images => {
        preloadImageUrl(images[target.index]?.original, "high");
    });
}

function scheduleVisibleThreadPrefetch(): void {
    if (visiblePrefetchScheduled || prefetchedThreadIds.size >= VISIBLE_THREAD_PREFETCH_LIMIT) return;
    visiblePrefetchScheduled = true;

    const run = () => {
        visiblePrefetchScheduled = false;
        const threadElements = document.querySelectorAll<HTMLElement>(
            ".j_thread_list[data-tid]",
        );
        for (const threadElement of threadElements) {
            if (prefetchedThreadIds.size >= VISIBLE_THREAD_PREFETCH_LIMIT) break;
            if (!threadElement.querySelector(".threadlist_media img")) continue;

            const rect = threadElement.getBoundingClientRect();
            if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;

            const tid = Number(threadElement.dataset.tid);
            if (!Number.isSafeInteger(tid) || tid <= 0 || prefetchedThreadIds.has(tid)) continue;

            prefetchedThreadIds.add(tid);
            void fetchThreadImages(tid);
        }
    };

    if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(run, { timeout: 1000 });
    } else {
        window.setTimeout(run, 500);
    }
}

