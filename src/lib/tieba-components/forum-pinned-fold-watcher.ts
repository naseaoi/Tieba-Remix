import { currentPageType } from "@/lib/api/remixed";
import { asyncdom } from "@/lib/elemental";
import { forumPinnedCollapsed, forumPinnedVisitedAt } from "@/lib/user-values";

let installed = false;
const EXPIRE_MS = 30 * 24 * 60 * 60 * 1000;

function purgeInvalidKeys(): void {
    const invalid = ["undefined", "null", ""];
    const collapsed = forumPinnedCollapsed.get();
    const nextCollapsed = { ...collapsed };
    let collapsedChanged = false;
    for (const k of invalid) {
        if (k in nextCollapsed) {
            delete nextCollapsed[k];
            collapsedChanged = true;
        }
    }
    if (collapsedChanged) forumPinnedCollapsed.set(nextCollapsed);

    const visited = forumPinnedVisitedAt.get();
    const nextVisited = { ...visited };
    let visitedChanged = false;
    for (const k of invalid) {
        if (k in nextVisited) {
            delete nextVisited[k];
            visitedChanged = true;
        }
    }
    if (visitedChanged) forumPinnedVisitedAt.set(nextVisited);
}

function getForumPinnedKey(): string {
    const fromUrl = new URLSearchParams(location.search).get("kw");
    if (fromUrl) return fromUrl;
    const fromPageData = PageData?.forum?.forum_name || PageData?.forum?.forum_id;
    return fromPageData || "";
}

function syncForumPinnedStorage(currentKey: string): void {
    const now = Date.now();
    const expireBefore = now - EXPIRE_MS;
    const currentCollapsed = forumPinnedCollapsed.get();
    const nextCollapsed = { ...currentCollapsed };
    const currentVisited = forumPinnedVisitedAt.get();
    const nextVisited = { ...currentVisited };
    let collapsedChanged = false;
    let visitedChanged = false;

    for (const key of Object.keys(nextCollapsed)) {
        if (!(key in nextVisited)) {
            nextVisited[key] = now;
            visitedChanged = true;
        }
    }

    for (const [key, visitedAt] of Object.entries(nextVisited)) {
        if (key === currentKey) continue;
        if (Number.isFinite(visitedAt) && visitedAt >= expireBefore) continue;
        delete nextVisited[key];
        visitedChanged = true;
        if (key in nextCollapsed) {
            delete nextCollapsed[key];
            collapsedChanged = true;
        }
    }

    if (nextVisited[currentKey] !== now) {
        nextVisited[currentKey] = now;
        visitedChanged = true;
    }

    if (collapsedChanged) {
        forumPinnedCollapsed.set(nextCollapsed);
    }
    if (visitedChanged) {
        forumPinnedVisitedAt.set(nextVisited);
    }
}

function isPinnedCollapsed(key: string): boolean {
    return forumPinnedCollapsed.get()[key] === true;
}

function setPinnedCollapsed(key: string, collapsed: boolean): void {
    const current = forumPinnedCollapsed.get();
    if (current[key] === true && collapsed) return;
    if (!(key in current) && !collapsed) return;
    const next = { ...current };
    if (collapsed) {
        next[key] = true;
    } else {
        delete next[key];
    }
    forumPinnedCollapsed.set(next);
}

function syncForumPinnedAttr(folded: boolean): void {
    if (folded) {
        document.documentElement.setAttribute("data-forum-pinned", "folded");
    } else {
        document.documentElement.removeAttribute("data-forum-pinned");
    }
}

export function installForumPinnedFoldWatcher(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    const forumKey = getForumPinnedKey();
    if (!forumKey) return;
    purgeInvalidKeys();
    syncForumPinnedStorage(forumKey);
    syncForumPinnedAttr(isPinnedCollapsed(forumKey));

    void (async () => {
        if (!document.documentElement.classList.contains("style-vercel")) return;

        const threadlist = await asyncdom<"ul">(".threadlist_bright");
        if (!threadlist) return;

        const allInnerHidden = (folderLi: HTMLLIElement): boolean => {
            const inner = folderLi.querySelectorAll<HTMLLIElement>(".thread_top_list > li");
            if (inner.length === 0) return true;
            return Array.from(inner).every(li =>
                li.style.display === "none" || li.hasAttribute("hidden")
            );
        };

        const ensureFolded = (folderLi: HTMLLIElement) => {
            folderLi.classList.add("pinned-folded");
            syncForumPinnedAttr(true);
        };

        const ensureExpanded = (folderLi: HTMLLIElement) => {
            folderLi.classList.remove("pinned-folded");
            syncForumPinnedAttr(false);
            folderLi.querySelectorAll<HTMLLIElement>(".thread_top_list > li").forEach(li => {
                if (li.style.display === "none") li.style.display = "";
            });
            const anchor = folderLi.querySelector<HTMLElement>("#thread_top_folder");
            if (anchor && anchor.style.display !== "none") anchor.style.display = "none";
        };

        let lastFoldedState = isPinnedCollapsed(forumKey);

        const applyInitial = (folderLi: HTMLLIElement) => {
            if (lastFoldedState) {
                ensureFolded(folderLi);
            } else if (allInnerHidden(folderLi)) {
                lastFoldedState = true;
                setPinnedCollapsed(forumKey, true);
                ensureFolded(folderLi);
            }
        };

        const initial = threadlist.querySelector<HTMLLIElement>(".thread_top_list_folder");
        if (initial) applyInitial(initial);

        threadlist.addEventListener("click", (e) => {
            const target = e.target as Element | null;
            if (!target?.closest) return;
            if (!target.closest("#thread_top_folder")) return;
            const folderLi = threadlist.querySelector<HTMLLIElement>(".thread_top_list_folder");
            if (!folderLi) return;
            lastFoldedState = false;
            setPinnedCollapsed(forumKey, false);
            ensureExpanded(folderLi);
        }, true);

        const obs = new MutationObserver(() => {
            const folderLi = threadlist.querySelector<HTMLLIElement>(".thread_top_list_folder");
            if (!folderLi) return;
            if (lastFoldedState) {
                if (!folderLi.classList.contains("pinned-folded")) {
                    folderLi.classList.add("pinned-folded");
                }
                return;
            }
            if (allInnerHidden(folderLi)) {
                lastFoldedState = true;
                setPinnedCollapsed(forumKey, true);
                ensureFolded(folderLi);
            }
        });
        obs.observe(threadlist, {
            attributes: true,
            attributeFilter: ["style"],
            childList: true,
            subtree: true,
        });
    })();
}
