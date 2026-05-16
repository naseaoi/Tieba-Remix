import { fetchThreadImages, imagesViewer, openThreadImages } from "@/components/images-viewer";
import { currentPageType } from "@/lib/api/remixed";
import { threadImageQueueScope } from "@/lib/user-values";

let installed = false;

export function installForumImageTakeover(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    document.addEventListener("click", function (e) {
        if (!document.documentElement.classList.contains("style-vercel")) return;

        const target = e.target as Element | null;
        if (!target?.closest) return;

        const picLi = target.closest<HTMLLIElement>(".threadlist_media > li");
        if (!picLi) return;

        const threadLi = picLi.closest<HTMLLIElement>(".j_thread_list[data-tid]");
        if (!threadLi) return;

        const tid = Number(threadLi.dataset.tid);
        if (!Number.isFinite(tid) || tid <= 0) return;

        const mediaList = picLi.parentElement;
        if (!mediaList) return;
        const index = Math.max(0, Array.prototype.indexOf.call(mediaList.children, picLi));

        e.preventDefault();
        e.stopPropagation();

        if (threadImageQueueScope.get() === "floor") {
            const thumbCount = mediaList.querySelectorAll("img").length;
            void (async () => {
                const allImages = await fetchThreadImages(tid);
                const filtered = allImages.slice(0, Math.max(thumbCount, 1));
                if (filtered.length === 0) return;
                imagesViewer({
                    content: filtered,
                    defaultIndex: Math.max(0, Math.min(index, filtered.length - 1)),
                });
            })();
            return;
        }

        openThreadImages(tid, index);
    }, { capture: true });
}

