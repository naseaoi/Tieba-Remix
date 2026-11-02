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

vi.mock("@/lib/observers", () => ({
    forumThreadsObserver: {},
    addCoalescedObserverEvent: (callback: () => void) => callback(),
}));

function pinnedItem(tid: number, style = ""): string {
    return `<li class="j_thread_list thread_top" data-tid="${tid}" style="${style}">
        <div class="threadlist_title"><a class="j_th_tit" href="/p/${tid}">帖${tid}</a></div>
    </li>`;
}

describe("forum pinned section", () => {
    beforeEach(() => {
        vi.resetModules();
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
});
