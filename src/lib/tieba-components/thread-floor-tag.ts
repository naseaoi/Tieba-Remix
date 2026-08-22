import { currentPageType } from "@/lib/api/remixed";
import { addCoalescedObserverEvent, threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
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

    addCoalescedObserverEvent(tag, threadFloorsObserver, threadCommentsObserver);
}

function tagFloorTimes(): void {
    document.querySelectorAll<HTMLElement>(".post-tail-wrap .tail-info").forEach(el => {
        if (el.classList.contains("vercel-floor-tag")) return;
        const text = (el.textContent ?? "").trim();
        const match = /^(\d+)楼$/.exec(text);
        if (match) {
            const next = el.nextElementSibling;
            if (next instanceof HTMLElement && next.classList.contains("tail-info")) {
                tagFloorTime(el, next, match[1]);
            }
        }
    });

    document.querySelectorAll<HTMLElement>(".core_reply_tail:not(.clearfix) .p_tail").forEach(tail => {
        const items = tail.querySelectorAll<HTMLElement>("li > span");
        const floor = items[0];
        const time = items[1];
        if (!floor || !time || floor.classList.contains("vercel-floor-tag")) return;

        const match = /^(\d+)楼$/.exec((floor.textContent ?? "").trim());
        if (match) tagFloorTime(floor, time, match[1]);
    });
}

function tagCommentTimes(): void {
    document.querySelectorAll<HTMLElement>(".lzl_time").forEach(updateTimeText);
}

function updateTimeText(el: HTMLElement): void {
    const humanized = humanizeTiebaTime(el.textContent ?? "");
    if (humanized) el.textContent = humanized;
}

function tagFloorTime(floor: HTMLElement, time: HTMLElement, floorNum: string): void {
    floor.classList.add("vercel-floor-tag");
    floor.dataset.floorNum = floorNum;
    time.classList.add("vercel-time-tag");
    updateTimeText(time);
}
