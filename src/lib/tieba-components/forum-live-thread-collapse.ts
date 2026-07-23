import { currentPageType } from "@/lib/api/remixed";
import { waitUntil } from "@/lib/utils";

let installed = false;

export function installForumLiveThreadCollapse(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    waitUntil(() => document.querySelector("#slideBtn.down") != null, 5000)
        .then(collapse)
        .catch(() => {});
}

function collapse(): void {
    const btn = document.querySelector<HTMLElement>("#slideBtn");
    if (!btn) return;
    btn.classList.remove("down");

    const dl = btn.closest("dl");
    if (!dl) return;

    const postCnt = dl.querySelector<HTMLElement>("dd.listPostCnt");
    const editorCnt = dl.querySelector<HTMLElement>("dd.listEditorCnt");
    if (postCnt) postCnt.style.display = "none";
    if (editorCnt) editorCnt.style.display = "none";
}
