import { currentPageType } from "@/lib/api/remixed";

let installed = false;
let fallbackApplied = false;

export function installForumNovelRankingFallback(): void {
    if (installed || currentPageType() !== "forum") return;
    installed = true;

    const check = (): void => {
        if (fallbackApplied) return;

        const root = document.querySelector<HTMLElement>("#novel-ranking");
        if (!root) return;

        const hotList = root.querySelector<HTMLElement>(".j-novel-rank-list-0");
        const popularList = root.querySelector<HTMLElement>(".j-novel-rank-list-1");
        const popularTab = root.querySelector<HTMLElement>(".novel-rank-top-nav td[data-type=\"1\"]");
        if (!hotList || !popularList || !popularTab) return;
        if (hotList.children.length > 0 || popularList.children.length === 0) return;

        fallbackApplied = true;
        root.querySelectorAll<HTMLElement>(".novel-rank-top-nav td").forEach(tab => {
            tab.classList.toggle("active", tab === popularTab);
        });
        hotList.style.display = "none";
        popularList.style.display = "block";
    };

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    check();
}
