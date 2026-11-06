import type { SearchPost, SearchPostType, SearchSort } from "@/lib/api/tieba-search";
import { classifyForumThreadTime, formatForumThreadTime, type ForumThreadTimeAge } from "@/lib/tieba-components/forum-thread-time";
import { findShieldRule, type ShieldRule } from "@/modules/shield/shield";

export interface SearchPageState {
    word: string;
    forumName: string;
    type: SearchPostType;
    sort: SearchSort;
}

// kw/qw 沿用贴吧原生参数，tab/sort 只在非默认值时写入
export function readSearchState(url: URL): SearchPageState {
    const params = url.searchParams;
    return {
        word: params.get("qw")?.trim() ?? "",
        forumName: params.get("kw")?.trim() ?? "",
        type: params.get("tab") === "comment" ? "comment" : "thread",
        sort: params.get("sort") === "relevance" ? "relevance" : "time",
    };
}

export function writeSearchState(state: SearchPageState, current: URL): URL {
    const url = new URL(current.pathname, current.origin);
    url.searchParams.set("ie", "utf-8");
    if (state.forumName) url.searchParams.set("kw", state.forumName);
    url.searchParams.set("qw", state.word);
    if (state.type === "comment") url.searchParams.set("tab", "comment");
    if (state.sort === "relevance") url.searchParams.set("sort", "relevance");
    return url;
}

export interface HighlightSegment {
    text: string;
    hit: boolean;
}

// 按空白拆成多个词分别高亮，长词优先，避免短词截断长词
export function highlightSegments(text: string, word: string): HighlightSegment[] {
    const terms = [...new Set(word.split(/\s+/).filter(Boolean))].sort((a, b) => b.length - a.length);
    if (!text || terms.length === 0) return text ? [{ text, hit: false }] : [];

    const pattern = new RegExp(terms.map(escapeRegExp).join("|"), "gi");
    const segments: HighlightSegment[] = [];
    let last = 0;
    for (const match of text.matchAll(pattern)) {
        const index = match.index ?? 0;
        if (index > last) segments.push({ text: text.slice(last, index), hit: false });
        segments.push({ text: match[0], hit: true });
        last = index + match[0].length;
    }
    if (last < text.length) segments.push({ text: text.slice(last), hit: false });
    return segments;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface SearchTimeLabel {
    text: string;
    age?: ForumThreadTimeAge;
}

// 与吧页列表同一套时间格式和陈旧分级
export function searchTimeLabel(time: number, now = new Date()): SearchTimeLabel {
    const text = formatForumThreadTime(Math.floor(time / 1000), now);
    return { text, age: classifyForumThreadTime(text, now) };
}

export function isSearchPostShielded(post: SearchPost, rules: ShieldRule[]): boolean {
    return Boolean(
        findShieldRule(rules, [post.author.name, post.author.displayName].filter(Boolean), "username")
        || findShieldRule(rules, [post.title].filter(Boolean), "thread-title")
        || findShieldRule(rules, [post.content].filter(Boolean), "post-content"),
    );
}
