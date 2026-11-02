import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ForumThreadItem, ForumThreadsPage } from "@/lib/api/tieba-forum-threads";

vi.mock("@/lib/api/remixed", () => ({
    currentPageType: () => "forum",
}));

const store = vi.hoisted(() => ({ sort: "reply" as "reply" | "create" }));

vi.mock("@/lib/user-values", () => ({
    forumThreadSort: {
        get: () => store.sort,
        set: (value: "reply" | "create") => { store.sort = value; },
    },
}));

vi.mock("@/lib/observers", () => ({
    forumThreadsObserver: {},
    addCoalescedObserverEvent: (callback: () => void) => callback(),
}));

const fetchForumThreads = vi.hoisted(() => vi.fn<(kw: string, pn: number, sortType: 0 | 1) => Promise<ForumThreadsPage>>());

vi.mock("@/lib/api/tieba-forum-threads", () => ({ fetchForumThreads }));

function thread(tid: number, extra: Partial<ForumThreadItem> = {}): ForumThreadItem {
    return {
        tid,
        title: `帖${tid}`,
        url: `/p/${tid}`,
        authorName: "作者",
        authorAvatar: "",
        authorHome: "",
        authorPortrait: "tb.1.abc",
        firstPostId: tid * 10,
        createTime: 0,
        lastTime: 0,
        replyNum: 3,
        agreeNum: 0,
        abstract: "摘要",
        images: [],
        isTop: false,
        isGood: false,
        ...extra,
    };
}

describe("forum thread sort", () => {
    beforeEach(() => {
        vi.resetModules();
        fetchForumThreads.mockReset();
        store.sort = "reply";
        vi.stubGlobal("location", { ...location, search: "?kw=test&tab=main" });
        document.documentElement.classList.add("style-vercel");
        document.documentElement.removeAttribute("data-forum-sort");
        document.body.innerHTML = `
            <ul id="thread_list" class="threadlist_bright">
                <li class="thread_top_list_folder"></li>
                <li class="j_thread_list" data-tid="1"></li>
                <div class="history-ad-wrap"></div>
                <li class="j_thread_list" data-tid="2"></li>
            </ul>
        `;
    });

    async function install(): Promise<void> {
        const { installForumThreadSort } = await import("./forum-thread-sort");
        installForumThreadSort();
    }

    const list = () => document.querySelector<HTMLElement>("#thread_list")!;
    const options = () => document.querySelectorAll<HTMLButtonElement>(".trex-thread-sort-option");
    const tids = () => [...list().querySelectorAll<HTMLElement>(":scope > .j_thread_list")].map(li => li.dataset.tid);

    it("places the control after the pinned folder", async () => {
        await install();

        expect(list().children[1].classList.contains("trex-thread-sort")).toBe(true);
        expect(options()[0].getAttribute("aria-pressed")).toBe("true");
        expect(fetchForumThreads).not.toHaveBeenCalled();
    });

    it("swaps native threads for threads sorted by post time and restores them", async () => {
        fetchForumThreads
            .mockResolvedValueOnce({ threads: [thread(30, { isTop: true }), thread(20), thread(10)], hasMore: true })
            .mockResolvedValueOnce({ threads: [thread(10), thread(5)], hasMore: false });
        await install();

        options()[1].click();
        expect(store.sort).toBe("create");
        await vi.waitFor(() => expect(tids()).toEqual(["20", "10"]));
        expect(fetchForumThreads).toHaveBeenCalledWith("test", 1, 1);
        expect(document.documentElement.getAttribute("data-forum-sort")).toBe("create");
        expect(list().querySelector(".history-ad-wrap")).toBeNull();

        document.querySelector<HTMLButtonElement>(".trex-thread-sort-more-button")!.click();
        await vi.waitFor(() => expect(tids()).toEqual(["20", "10", "5"]));
        expect(document.querySelector<HTMLElement>(".trex-thread-sort-more")?.dataset.status).toBe("end");

        options()[0].click();
        expect(tids()).toEqual(["1", "2"]);
        expect(list().querySelector(".trex-thread-sort-more")).toBeNull();
        expect(document.documentElement.hasAttribute("data-forum-sort")).toBe(false);
    });

    it("renders items with the native data-field contract", async () => {
        const { renderForumThreadItem } = await import("./forum-thread-sort");
        const item = renderForumThreadItem(thread(42, {
            title: "<b>标题</b>",
            images: [{ thumb: "https://img/t.jpg", large: "https://img/l.jpg", width: 1, height: 1 }],
        }));

        expect(JSON.parse(item.dataset.field!)).toMatchObject({ id: 42, author_portrait: "tb.1.abc", first_post_id: 420, reply_num: 3 });
        expect(item.querySelector(".j_th_tit a")?.textContent).toBe("<b>标题</b>");
        expect(item.querySelector(".frs-author-name")?.getAttribute("href")).toBe("/home/main/?id=tb.1.abc&fr=frs");
        expect(item.querySelector(".threadlist_media img")?.getAttribute("bpic")).toBe("https://img/l.jpg");
    });
});
