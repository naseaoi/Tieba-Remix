import { currentPageType } from "@/lib/api/remixed";
import { addCoalescedObserverEvent, forumThreadsObserver } from "@/lib/observers";

const MORE_ATTR = "data-trex-more";

let installed = false;

export function installForumThumbnailMore(): void {
    if (installed || currentPageType() !== "forum") return;
    installed = true;
    addCoalescedObserverEvent(syncThumbnailMore, forumThreadsObserver);
}

/** 把原生「共 N 张」换算为最后一张缩略图上的「+M」遮罩 */
export function syncThumbnailMore(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>(".small_list_gallery").forEach(gallery => {
        const items = gallery.querySelectorAll<HTMLElement>(".threadlist_media > li");
        const last = items[items.length - 1];
        if (!last) return;

        const total = Number(/\d+/.exec(gallery.querySelector(".small_pic_num")?.textContent ?? "")?.[0]);
        const more = Number.isSafeInteger(total) ? total - items.length : 0;
        items.forEach(item => {
            if (item !== last) item.removeAttribute(MORE_ATTR);
        });
        if (more > 0) last.setAttribute(MORE_ATTR, `+${more}`);
        else last.removeAttribute(MORE_ATTR);
    });
}
