import { currentPageType } from "@/lib/api/remixed";
import { ChevronDown, Pin } from "@lucide/vue";
import { createLucideIconElement } from "@/lib/lucide";
import { addCoalescedObserverEvent, forumThreadsObserver } from "@/lib/observers";
import { forumPinnedCollapsed, forumPinnedVisitedAt } from "@/lib/user-values";

let installed = false;
const EXPIRE_MS = 30 * 24 * 60 * 60 * 1000;
const PREVIEW_COUNT = 3;
const EXPANDED_ATTR = "data-pinned-expanded";
const OVERFLOW_ATTR = "data-pinned-overflow";

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

// 存储语义：缺省为预览（只显示前几条），显式 false 表示展开全部
function isPinnedExpanded(key: string): boolean {
    return forumPinnedCollapsed.get()[key] === false;
}

function setPinnedExpanded(key: string, expanded: boolean): void {
    const current = forumPinnedCollapsed.get();
    if (isPinnedExpanded(key) === expanded) return;
    const next = { ...current };
    if (expanded) {
        next[key] = false;
    } else {
        delete next[key];
    }
    forumPinnedCollapsed.set(next);
}

function isPinnedItemHidden(li: HTMLLIElement): boolean {
    return li.style.display === "none" ||
        li.hasAttribute("hidden") ||
        li.style.overflow === "hidden";
}

function isPinnedPlaceholder(li: HTMLLIElement): boolean {
    if (li.dataset.tid !== "1") return false;
    const title = li.querySelector<HTMLAnchorElement>(".threadlist_title a.j_th_tit");
    if (!title) return false;
    return title.textContent?.trim() === "" && title.href.includes("/bawu2/errorPage");
}

interface PinnedHeader {
    root: HTMLElement;
    count: HTMLElement;
    restore: HTMLButtonElement;
    toggle: HTMLButtonElement;
    toggleLabel: HTMLElement;
}

function createHeader(folder: HTMLLIElement, forumKey: string): PinnedHeader {
    const root = document.createElement("div");
    root.className = "trex-pinned-header";

    const title = document.createElement("span");
    title.className = "trex-pinned-title";
    const count = document.createElement("span");
    count.className = "trex-pinned-count";
    title.append(createLucideIconElement(Pin, { size: 14 }), "置顶", count);

    const actions = document.createElement("span");
    actions.className = "trex-pinned-actions";

    const restore = document.createElement("button");
    restore.type = "button";
    restore.className = "trex-pinned-action";
    // 原生按钮负责清除 top_list cookie 并恢复被单独隐藏的置顶帖
    restore.addEventListener("click", () => folder.querySelector<HTMLElement>("#thread_top_folder")?.click());

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "trex-pinned-action trex-pinned-toggle";
    const toggleLabel = document.createElement("span");
    toggle.append(toggleLabel, createLucideIconElement(ChevronDown, { size: 14 }));
    toggle.addEventListener("click", () => {
        setPinnedExpanded(forumKey, !isPinnedExpanded(forumKey));
        syncFolder(folder, forumKey);
    });

    actions.append(restore, toggle);
    root.append(title, actions);
    folder.prepend(root);
    return { root, count, restore, toggle, toggleLabel };
}

const headers = new WeakMap<HTMLLIElement, PinnedHeader>();

function syncFolder(folder: HTMLLIElement, forumKey: string): void {
    const items = [...folder.querySelectorAll<HTMLLIElement>(".thread_top_list > li")];
    items.forEach(li => {
        if (!isPinnedPlaceholder(li) || li.hidden) return;
        li.hidden = true;
        li.style.display = "none";
    });

    const real = items.filter(li => !isPinnedPlaceholder(li));
    const visible = real.filter(li => !isPinnedItemHidden(li));
    const hiddenCount = real.length - visible.length;
    const expanded = isPinnedExpanded(forumKey);

    let header = headers.get(folder);
    if (!header) {
        header = createHeader(folder, forumKey);
        headers.set(folder, header);
    }

    visible.forEach((li, index) => li.toggleAttribute(OVERFLOW_ATTR, !expanded && index >= PREVIEW_COUNT));
    folder.toggleAttribute(EXPANDED_ATTR, expanded);
    folder.toggleAttribute("data-pinned-empty", visible.length === 0);

    header.count.textContent = String(visible.length);
    header.restore.hidden = hiddenCount === 0;
    header.restore.textContent = `恢复已隐藏的 ${hiddenCount} 条`;
    header.toggle.hidden = visible.length <= PREVIEW_COUNT;
    header.toggle.setAttribute("aria-expanded", String(expanded));
    header.toggleLabel.textContent = expanded ? "收起" : `展开全部 ${visible.length} 条`;
}

const watchedFolders = new WeakSet<HTMLLIElement>();

export function installForumPinnedFoldWatcher(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    const forumKey = getForumPinnedKey();
    if (!forumKey) return;
    purgeInvalidKeys();
    syncForumPinnedStorage(forumKey);

    // AJAX 翻页会重建整个列表，每次都重新查找置顶区
    const sync = (): void => {
        if (!document.documentElement.classList.contains("style-vercel")) return;
        const folder = document.querySelector<HTMLLIElement>(".threadlist_bright > li.thread_top_list_folder");
        if (!folder) return;
        syncFolder(folder, forumKey);
        if (watchedFolders.has(folder)) return;
        watchedFolders.add(folder);
        // 原生单帖隐藏和恢复通过 jQuery slide 改写内联样式
        new MutationObserver(() => syncFolder(folder, forumKey))
            .observe(folder, { attributes: true, attributeFilter: ["style"], subtree: true });
    };
    addCoalescedObserverEvent(sync, forumThreadsObserver);
}
