import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/remixed", () => ({
    currentPageType: () => "forum",
}));

const store = vi.hoisted(() => ({ collapsed: {} as Record<string, boolean>, visited: {} as Record<string, number> }));

vi.mock("@/lib/user-values", () => ({
    forumPinnedCollapsed: {
        get: () => store.collapsed,
        set: (value: Record<string, boolean>) => { store.collapsed = value; },
    },
    forumPinnedVisitedAt: {
        get: () => store.visited,
        set: (value: Record<string, number>) => { store.visited = value; },
    },
}));

const observerEvents = vi.hoisted(() => ({ callbacks: [] as (() => void)[] }));

vi.mock("@/lib/observers", () => ({
    forumThreadsObserver: {},
    addCoalescedObserverEvent: (callback: () => void) => {
        observerEvents.callbacks.push(callback);
        callback();
    },
}));

function pinnedItem(tid: number, style = ""): string {
    return `<li class="j_thread_list thread_top" data-tid="${tid}" style="${style}">
        <a class="j_thread_hidden" data-field='{"tid":${tid}}'></a>
        <div class="threadlist_title"><a class="j_th_tit" href="/p/${tid}">帖${tid}</a></div>
    </li>`;
}

describe("forum pinned section", () => {
    beforeEach(() => {
        vi.resetModules();
        observerEvents.callbacks = [];
        document.cookie = "top_list=; Max-Age=0; path=/";
        store.collapsed = {};
        store.visited = {};
        vi.stubGlobal("location", { ...location, search: "?kw=test" });
        document.documentElement.classList.add("style-vercel");
    });

    function render(items: string[]): HTMLLIElement {
        document.body.innerHTML = `
            <ul class="threadlist_bright">
                <li class="thread_top_list_folder">
                    <ul class="thread_top_list">${items.join("")}</ul>
                    <a id="thread_top_folder" href="javascript:;"></a>
                </li>
            </ul>
        `;
        return document.querySelector<HTMLLIElement>(".thread_top_list_folder")!;
    }

    async function install(): Promise<void> {
        const { installForumPinnedFoldWatcher } = await import("./forum-pinned-fold-watcher");
        installForumPinnedFoldWatcher();
    }

    function overflowTids(folder: HTMLElement): string[] {
        return [...folder.querySelectorAll<HTMLElement>("li[data-pinned-overflow]")].map(li => li.dataset.tid!);
    }

    it("previews the first pinned threads and remembers expansion per forum", async () => {
        const folder = render([1001, 1002, 1003, 1004, 1005].map(tid => pinnedItem(tid)));
        await install();

        const toggle = folder.querySelector<HTMLButtonElement>(".trex-pinned-toggle")!;
        expect(folder.querySelector(".trex-pinned-count")?.textContent).toBe("5");
        expect(overflowTids(folder)).toEqual(["1004", "1005"]);
        expect(toggle.hidden).toBe(false);
        expect(toggle.textContent).toContain("展开全部 5 条");

        toggle.click();
        expect(overflowTids(folder)).toEqual([]);
        expect(store.collapsed).toEqual({ test: false });
        expect(toggle.textContent).toContain("收起");

        toggle.click();
        expect(overflowTids(folder)).toEqual(["1004", "1005"]);
        expect(store.collapsed).toEqual({});
    });

    it("skips the toggle for short lists and offers restoring hidden threads", async () => {
        const folder = render([pinnedItem(1001), pinnedItem(1002, "display: none")]);
        const native = vi.fn();
        folder.querySelector("#thread_top_folder")?.addEventListener("click", native);
        await install();

        expect(folder.querySelector<HTMLButtonElement>(".trex-pinned-toggle")?.hidden).toBe(true);
        expect(folder.querySelector(".trex-pinned-count")?.textContent).toBe("1");

        const restore = folder.querySelector<HTMLButtonElement>(".trex-pinned-action:not(.trex-pinned-toggle)")!;
        expect(restore.hidden).toBe(false);
        expect(restore.textContent).toBe("恢复已隐藏的 1 条");
        restore.click();
        expect(native).toHaveBeenCalledOnce();
    });

    it("leaves the header untouched when a resync changes nothing", async () => {
        const folder = render([1001, 1002, 1003, 1004].map(tid => pinnedItem(tid)));
        await install();

        const header = folder.querySelector(".trex-pinned-header")!;
        const records: MutationRecord[] = [];
        const observer = new MutationObserver(list => records.push(...list));
        observer.observe(header, { childList: true, subtree: true, attributes: true, characterData: true });

        // 触发置顶区内部的 style 监听，使其重新同步
        folder.querySelector<HTMLElement>("li[data-tid='1001']")!.style.color = "red";
        await Promise.resolve();
        await Promise.resolve();
        records.push(...observer.takeRecords());
        observer.disconnect();

        expect(records).toEqual([]);
    });

    it("hides two threads once each and keeps them hidden across style resets and list updates", async () => {
        const folder = render([pinnedItem(1001), pinnedItem(1002)]);
        const items = [...folder.querySelectorAll<HTMLLIElement>(".thread_top_list > li")];
        const hidden: string[] = [];
        items.forEach(item => item.querySelector<HTMLElement>(".j_thread_hidden")!.addEventListener("click", () => {
            hidden.push(item.dataset.tid!);
            document.cookie = `top_list=${hidden.join("-")}; path=/`;
            item.style.overflow = "hidden";
        }));
        await install();

        for (const [index, item] of items.entries()) {
            item.querySelector<HTMLElement>(".j_thread_hidden")!.click();
            await Promise.resolve();
            item.style.cssText = "display: none";
            await Promise.resolve();
            observerEvents.callbacks.forEach(callback => callback());
            expect(item.style.display).toBe("none");
            expect(folder.querySelector(".trex-pinned-count")?.textContent).toBe(String(1 - index));
        }
        expect(folder.hasAttribute("data-pinned-empty")).toBe(true);
        expect(folder.querySelector(".trex-pinned-action")?.textContent).toBe("恢复已隐藏的 2 条");

        items.forEach(item => item.removeAttribute("style"));
        await Promise.resolve();
        observerEvents.callbacks.forEach(callback => callback());
        expect(folder.querySelectorAll("li[data-pinned-hidden]")).toHaveLength(2);
        expect(folder.hasAttribute("data-pinned-empty")).toBe(true);

        const replacement = render([pinnedItem(1001), pinnedItem(1002)]);
        observerEvents.callbacks.forEach(callback => callback());
        expect(replacement.querySelectorAll("li[data-pinned-hidden]")).toHaveLength(2);
        expect(replacement.hasAttribute("data-pinned-empty")).toBe(true);
    });

    it("restores cookie-hidden threads without treating slideDown overflow as hidden", async () => {
        document.cookie = "top_list=1001-1002-9999; path=/";
        const folder = render([pinnedItem(1001), pinnedItem(1002)]);
        folder.querySelector("#thread_top_folder")!.addEventListener("click", () => {
            document.cookie = "top_list=9999; path=/";
            folder.querySelectorAll<HTMLLIElement>(".thread_top_list > li").forEach(item => {
                item.style.cssText = "display: block; overflow: hidden; height: 1px";
            });
        });
        await install();
        expect(folder.hasAttribute("data-pinned-empty")).toBe(true);

        folder.querySelector<HTMLButtonElement>(".trex-pinned-action")!.click();
        await Promise.resolve();
        expect(folder.querySelectorAll("li[data-pinned-hidden]")).toHaveLength(0);
        expect(folder.querySelector(".trex-pinned-count")?.textContent).toBe("2");
        expect(folder.hasAttribute("data-pinned-empty")).toBe(false);
        expect(folder.querySelector<HTMLButtonElement>(".trex-pinned-action")?.hidden).toBe(true);
        expect(document.cookie).toContain("top_list=9999");
    });

    it("keeps shield rules separate from native restoration", async () => {
        const folder = render([pinnedItem(1001), pinnedItem(1002)]);
        await install();
        const item = folder.querySelector<HTMLLIElement>("li[data-tid='1001']")!;
        item.toggleAttribute("data-tbr-shield-hidden", true);
        await Promise.resolve();
        expect(folder.querySelector(".trex-pinned-count")?.textContent).toBe("1");
        expect(folder.querySelector<HTMLButtonElement>(".trex-pinned-action")?.hidden).toBe(true);
        item.toggleAttribute("data-tbr-shield-hidden", false);
        await Promise.resolve();
        expect(folder.querySelector(".trex-pinned-count")?.textContent).toBe("2");
    });

    it("does not mutate the entire folder when repeated synchronization changes nothing", async () => {
        document.cookie = "top_list=1001; path=/";
        const folder = render([1001, 1002, 1003, 1004, 1005].map(tid => pinnedItem(tid)));
        await install();
        const observer = new MutationObserver(() => {});
        observer.observe(folder, { attributes: true, subtree: true, childList: true, characterData: true });
        observerEvents.callbacks.forEach(callback => { callback(); callback(); });
        expect(observer.takeRecords()).toEqual([]);
        observer.disconnect();
    });

    it("matches full cookie tids and ignores malformed cookie values", async () => {
        document.cookie = "top_list=11001-1002; path=/";
        const folder = render([pinnedItem(1001), pinnedItem(1002)]);
        await install();
        expect(folder.querySelectorAll("li[data-pinned-hidden]")).toHaveLength(1);
        expect(folder.querySelector("li[data-pinned-hidden]")?.getAttribute("data-tid")).toBe("1002");
        document.cookie = "top_list=%E0%A4%A; path=/";
        observerEvents.callbacks.forEach(callback => callback());
        expect(folder.querySelectorAll("li[data-pinned-hidden]")).toHaveLength(0);
    });

    it("hides the whole section when only the placeholder remains", async () => {
        const folder = render([`<li class="j_thread_list thread_top" data-tid="1">
            <div class="threadlist_title"><a class="j_th_tit" href="/bawu2/errorPage"></a></div>
        </li>`]);
        await install();

        expect(folder.hasAttribute("data-pinned-none")).toBe(true);
    });

    it("keeps the section when the user hid every pinned thread", async () => {
        const folder = render([pinnedItem(1001, "display: none")]);
        await install();

        expect(folder.hasAttribute("data-pinned-none")).toBe(false);
        expect(folder.hasAttribute("data-pinned-empty")).toBe(true);
    });
});
