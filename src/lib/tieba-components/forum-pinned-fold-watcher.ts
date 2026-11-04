import { currentPageType } from "@/lib/api/remixed";
import { ChevronDown, Pin } from "@lucide/vue";
import { createLucideIconElement } from "@/lib/lucide";
import { addCoalescedObserverEvent, forumThreadsObserver } from "@/lib/observers";
import { forumPinnedCollapsed, forumPinnedVisitedAt } from "@/lib/user-values";

let installed = false;
const EXPIRE_MS = 30 * 24 * 60 * 60 * 1000;
const PREVIEW_COUNT = 3;
// 与原生 util_top_cookie 写入的 72 天有效期一致
const TOP_LIST_MAX_AGE = 72 * 24 * 60 * 60;
const EXPANDED_ATTR = "data-pinned-expanded";
const OVERFLOW_ATTR = "data-pinned-overflow";
const HIDDEN_ATTR = "data-pinned-hidden";

function readHiddenPinnedTids(): Set<string> {
    const value = document.cookie.split(";").map(part => part.trim()).find(part => part.startsWith("top_list="))?.slice(9) ?? "";
    try {
        // 原生 util_top_cookie 使用连字符分隔 tid，刷新或 AJAX 重建后仍以它为准
        return new Set(decodeURIComponent(value).split("-").filter(tid => /^\d+$/.test(tid)));
    } catch {
        return new Set();
    }
}

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

// 原生恢复按钮只读取服务端渲染时写入的已隐藏 tid，本次浏览中新隐藏的置顶帖会让它抛错且不清 cookie，因此自行恢复
function restoreHiddenPinned(folder: HTMLLIElement): void {
    const restored = new Set<string>();
    folder.querySelectorAll<HTMLLIElement>(".thread_top_list > li").forEach(li => {
        if (isPinnedPlaceholder(li) || !isPinnedItemHidden(li)) return;
        if (li.dataset.tid) restored.add(li.dataset.tid);
        li.hidden = false;
        li.style.removeProperty("display");
    });
    const remaining = [...readHiddenPinnedTids()].filter(tid => !restored.has(tid));
    document.cookie = `top_list=${remaining.join("-")}; max-age=${TOP_LIST_MAX_AGE}; path=/`;
}

function isPinnedItemHidden(li: HTMLLIElement): boolean {
    return li.hasAttribute(HIDDEN_ATTR) ||
        li.style.display === "none" ||
        li.hasAttribute("hidden");
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
    restore.addEventListener("click", () => {
        restoreHiddenPinned(folder);
        syncFolder(folder, forumKey);
    });

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
    const hiddenTids = readHiddenPinnedTids();
    real.forEach(li => li.toggleAttribute(HIDDEN_ATTR, hiddenTids.has(li.dataset.tid ?? "")));
    const visible = real.filter(li => !isPinnedItemHidden(li) && !li.hasAttribute("data-tbr-shield-hidden"));
    const hiddenCount = real.filter(isPinnedItemHidden).length;
    const expanded = isPinnedExpanded(forumKey);

    let header = headers.get(folder);
    if (!header) {
        header = createHeader(folder, forumKey);
        headers.set(folder, header);
    }

    visible.forEach((li, index) => li.toggleAttribute(OVERFLOW_ATTR, !expanded && index >= PREVIEW_COUNT));
    folder.toggleAttribute(EXPANDED_ATTR, expanded);
    folder.toggleAttribute("data-pinned-empty", visible.length === 0);
    // 只剩占位项时整个置顶区隐藏；用户手动隐藏全部置顶时保留标题栏以便恢复
    folder.toggleAttribute("data-pinned-none", real.length === 0);

    // 置顶区位于 forumThreadsObserver 的监听子树内，无变化时写入会触发 observer 形成逐帧回环
    setText(header.count, String(visible.length));
    setHidden(header.restore, hiddenCount === 0);
    setText(header.restore, `恢复已隐藏的 ${hiddenCount} 条`);
    setHidden(header.toggle, visible.length <= PREVIEW_COUNT);
    if (header.toggle.getAttribute("aria-expanded") !== String(expanded)) {
        header.toggle.setAttribute("aria-expanded", String(expanded));
    }
    setText(header.toggleLabel, expanded ? "收起" : `展开全部 ${visible.length} 条`);
}

function setText(el: HTMLElement, text: string): void {
    if (el.textContent !== text) el.textContent = text;
}

function setHidden(el: HTMLElement, hidden: boolean): void {
    if (el.hidden !== hidden) el.hidden = hidden;
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
        // 原生单帖隐藏和恢复通过 jQuery slide 改写内联样式；屏蔽规则拥有独立属性
        folder.addEventListener("click", event => {
            if (event.target instanceof Element && event.target.closest(".j_thread_hidden, #thread_top_folder")) {
                syncFolder(folder, forumKey);
            }
        });
        new MutationObserver(() => syncFolder(folder, forumKey))
            .observe(folder, { attributes: true, attributeFilter: ["style", "hidden", "data-tbr-shield-hidden"], subtree: true });
    };
    addCoalescedObserverEvent(sync, forumThreadsObserver);
}
