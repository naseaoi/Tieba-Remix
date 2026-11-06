import { describe, expect, it } from "vitest";
import type { SearchPost } from "@/lib/api/tieba-search";
import type { ShieldRule } from "@/modules/shield/shield";
import { highlightSegments, isSearchPostShielded, readSearchState, searchTimeLabel, writeSearchState } from "./search-state";

const BASE = "https://tieba.baidu.com/f/search/res";

function post(overrides: Partial<SearchPost> = {}): SearchPost {
    return {
        key: "1",
        type: "thread",
        tid: 1,
        pid: 1,
        url: "/p/1",
        title: "标题",
        content: "正文",
        time: 0,
        author: { name: "甲", displayName: "甲甲", portrait: "", avatar: "" },
        forum: { id: 1, name: "steam", avatar: "" },
        replyCount: 0,
        agreeCount: 0,
        images: [],
        ...overrides,
    };
}

describe("readSearchState / writeSearchState", () => {
    it("读取原生 kw/qw，缺省为主题帖、新帖在前", () => {
        expect(readSearchState(new URL(`${BASE}?ie=utf-8&kw=steam&qw=%E5%BD%B1%20`))).toEqual({
            word: "影",
            forumName: "steam",
            type: "thread",
            sort: "time",
        });
    });

    it("非默认的标签和排序写入 URL 并可读回", () => {
        const state = { word: "影之刃", forumName: "steam", type: "comment", sort: "relevance" } as const;
        const url = writeSearchState(state, new URL(`${BASE}?ie=utf-8&kw=old&qw=old&foo=1`));
        expect(url.searchParams.get("foo")).toBeNull();
        expect(readSearchState(url)).toEqual(state);
    });

    it("全局搜索不写 kw，默认值不写 tab/sort", () => {
        const url = writeSearchState({ word: "a", forumName: "", type: "thread", sort: "time" }, new URL(BASE));
        expect(url.search).toBe("?ie=utf-8&qw=a");
    });
});

describe("highlightSegments", () => {
    it("忽略大小写并保留原文", () => {
        expect(highlightSegments("Steam 与 steam", "STEAM")).toEqual([
            { text: "Steam", hit: true },
            { text: " 与 ", hit: false },
            { text: "steam", hit: true },
        ]);
    });

    it("多个词长词优先，正则字符按字面匹配", () => {
        expect(highlightSegments("影之刃零 a+b", "影 影之刃 a+b")).toEqual([
            { text: "影之刃", hit: true },
            { text: "零 ", hit: false },
            { text: "a+b", hit: true },
        ]);
    });

    it("空词或空文本", () => {
        expect(highlightSegments("文本", " ")).toEqual([{ text: "文本", hit: false }]);
        expect(highlightSegments("", "词")).toEqual([]);
    });
});

describe("searchTimeLabel", () => {
    const now = new Date(2026, 10, 6, 12, 0);

    it("今日显示时分，本年显示月日", () => {
        expect(searchTimeLabel(new Date(2026, 10, 6, 8, 5).getTime(), now)).toEqual({ text: "08:05", age: undefined });
        expect(searchTimeLabel(new Date(2026, 10, 1).getTime(), now)).toEqual({ text: "11-1", age: undefined });
    });

    it("超过一个月与一年分级", () => {
        expect(searchTimeLabel(new Date(2026, 8, 1).getTime(), now).age).toBe("month");
        expect(searchTimeLabel(new Date(2024, 1, 1).getTime(), now)).toEqual({ text: "2024-02", age: "year" });
    });
});

describe("isSearchPostShielded", () => {
    const rule = (content: string, scope: ShieldRule["scopes"][number]): ShieldRule => ({
        content, type: "text", scopes: [scope], toggle: true,
    });

    it("按用户名、标题、正文各自的作用域匹配", () => {
        expect(isSearchPostShielded(post(), [rule("甲甲", "username")])).toBe(true);
        expect(isSearchPostShielded(post(), [rule("标题", "thread-title")])).toBe(true);
        expect(isSearchPostShielded(post(), [rule("正文", "post-content")])).toBe(true);
        expect(isSearchPostShielded(post(), [rule("正文", "thread-title")])).toBe(false);
    });
});
