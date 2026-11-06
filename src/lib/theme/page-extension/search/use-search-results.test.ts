import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { SearchPost, SearchResultPage } from "@/lib/api/tieba-search";
import type { ShieldRule } from "@/modules/shield/shield";
import type { SearchPageState } from "./search-state";

const search = vi.hoisted(() => vi.fn<(query: { page: number; word: string }) => Promise<SearchResultPage>>());
const rules = vi.hoisted(() => ({ value: [] as ShieldRule[] }));

vi.mock("@/lib/api/tieba", () => ({ searchForumPosts: search }));
vi.mock("@/modules/shield/shield", async importOriginal => ({
    ...await importOriginal<typeof import("@/modules/shield/shield")>(),
    shieldList: { get: () => rules.value, on: vi.fn() },
}));

const { useSearchResults } = await import("./use-search-results");

function post(key: string, title = key): SearchPost {
    return {
        key, type: "thread", tid: 1, pid: 1, url: "/p/1", title, content: "", time: 0,
        author: { name: "甲", displayName: "", portrait: "", avatar: "" },
        forum: { id: 1, name: "steam", avatar: "" }, replyCount: 0, agreeCount: 0, images: [],
    };
}

function page(posts: SearchPost[], hasMore = true): SearchResultPage {
    return { posts, hasMore, page: 1 };
}

const state = () => ref<SearchPageState>({ word: "影", forumName: "steam", type: "thread", sort: "time" });

beforeEach(() => {
    search.mockReset();
    rules.value = [];
});

describe("useSearchResults", () => {
    it("逐页追加并按 key 去重，没有更多时结束", async () => {
        search.mockResolvedValueOnce(page([post("a"), post("b")])).mockResolvedValueOnce(page([post("b"), post("c")], false));
        const results = useSearchResults(state());
        results.reset();

        await results.loadMore();
        await results.loadMore();

        expect(search.mock.calls.map(([query]) => query.page)).toEqual([1, 2]);
        expect(results.posts.value.map(item => item.key)).toEqual(["a", "b", "c"]);
        expect(results.status.value).toBe("done");
    });

    it("重置后丢弃旧请求的结果", async () => {
        let resolveStale!: (value: SearchResultPage) => void;
        search.mockReturnValueOnce(new Promise(resolve => { resolveStale = resolve; }))
            .mockResolvedValueOnce(page([post("new")]));
        const results = useSearchResults(state());
        results.reset();

        const stale = results.loadMore();
        results.reset();
        await results.loadMore();
        resolveStale(page([post("old")]));
        await stale;

        expect(results.posts.value.map(item => item.key)).toEqual(["new"]);
        expect(results.status.value).toBe("idle");
    });

    it("连续多页全被屏蔽后停止自动加载，手动重试恢复", async () => {
        rules.value = [{ content: "广告", type: "text", scopes: ["thread-title"], toggle: true }];
        search.mockResolvedValue(page([post(String(Math.random()), "广告")]));
        const results = useSearchResults(state());
        results.reset();

        for (let i = 0; i < 3; i++) await results.loadMore();
        expect(results.posts.value).toEqual([]);
        expect(results.canAutoLoad.value).toBe(false);

        results.retry();
        expect(results.status.value).toBe("loading");
    });

    it("请求失败进入错误状态，空关键词不发请求", async () => {
        search.mockRejectedValueOnce(new Error("fail"));
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const results = useSearchResults(state());
        results.reset();
        await results.loadMore();
        expect(results.status.value).toBe("error");

        const empty = useSearchResults(ref({ word: "", forumName: "", type: "thread", sort: "time" }));
        empty.reset();
        await empty.loadMore();
        expect(empty.status.value).toBe("done");
        expect(search).toHaveBeenCalledTimes(1);
    });
});
