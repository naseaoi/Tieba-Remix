import { currentPageType } from "@/lib/api/remixed";
import { threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { humanizeTiebaTime } from "./thread-time";

let installed = false;

export function installThreadFloorTag(): void {
    if (installed) return;
    if (currentPageType() !== "thread") return;
    installed = true;

    const tag = (): void => {
        tagFloorTimes();
        tagCommentTimes();
    };

    threadFloorsObserver.addEvent(tag);
    threadCommentsObserver.addEvent(tagCommentTimes);
    tag();
}

function tagFloorTimes(): void {
    document.querySelectorAll<HTMLElement>(".post-tail-wrap .tail-info").forEach(el => {
        if (el.classList.contains("vercel-floor-tag")) return;
        const text = (el.textContent ?? "").trim();
        const match = /^(\d+)楼$/.exec(text);
        if (match) {
            el.classList.add("vercel-floor-tag");
            el.dataset.floorNum = match[1];
            const next = el.nextElementSibling;
            if (next instanceof HTMLElement && next.classList.contains("tail-info")) {
                next.classList.add("vercel-time-tag");
                updateTimeText(next);
            }
        }
    });
}

function tagCommentTimes(): void {
    document.querySelectorAll<HTMLElement>(".lzl_time").forEach(updateTimeText);
}

function updateTimeText(el: HTMLElement): void {
    const humanized = humanizeTiebaTime(el.textContent ?? "");
    if (humanized) el.textContent = humanized;
}
