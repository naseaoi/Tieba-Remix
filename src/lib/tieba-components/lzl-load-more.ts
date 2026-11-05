import { ChevronDown, LoaderCircle } from "@lucide/vue";
import { tiebaAPI } from "@/lib/api/tieba";
import { dom, domrd } from "@/lib/elemental";
import { createLucideIconElement } from "@/lib/lucide";
import { animateLzlListChange } from "./lzl-list-motion";
import { readLzlField } from "./lzl-reply-tree";

interface Pagination {
    current: number;
    total: number;
    // 楼中楼回复总数，用于显示剩余条数
    count: number;
}

interface CommentPage extends Pagination {
    posts: HTMLElement[];
}

interface ListState {
    pager: HTMLElement;
    button: HTMLButtonElement;
    label: HTMLElement;
    pages: Map<number, HTMLElement[]>;
    total: number;
    count: number;
    loading: boolean;
    failed: boolean;
}

const states = new WeakMap<HTMLElement, ListState>();

function readPagination(pager: HTMLElement): Pagination {
    const field = pager.getAttribute("data-field") ?? "";
    const total = Number(field.match(/["']?total_page["']?\s*:\s*["']?(\d+)/)?.[1]);
    const count = Number(field.match(/["']?total_num["']?\s*:\s*["']?(\d+)/)?.[1] ?? 0);
    const current = Number(pager.querySelector(".j_pager .tP")?.textContent?.trim() || 1);
    if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(current) || current < 1) {
        throw new Error("楼中楼分页信息无效");
    }
    return { current, total, count: Number.isSafeInteger(count) ? count : 0 };
}

export function parseCommentPage(html: string): CommentPage {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const pager = doc.querySelector<HTMLElement>(".lzl_li_pager");
    if (!pager) throw new Error("楼中楼响应缺少分页信息");
    const posts = [...doc.querySelectorAll<HTMLElement>("li.lzl_single_post")];
    if (posts.some(post => !/^\d+$/.test(readLzlField(post, "spid")))) {
        throw new Error("楼中楼回复编号无效");
    }
    const pagination = readPagination(pager);
    if (pagination.total > 0 && posts.length === 0) throw new Error("楼中楼响应内容为空");
    return { posts, ...pagination };
}

export function appendCommentPosts(list: HTMLElement, posts: HTMLElement[], anchor: HTMLElement): void {
    const ids = new Set(dom<"li">("li.lzl_single_post", list, []).map(post => readLzlField(post, "spid")));
    for (const post of posts) {
        const id = readLzlField(post, "spid");
        if (ids.has(id)) continue;
        ids.add(id);
        post.classList.remove("first_no_border");
        fillReportEntry(post);
        list.insertBefore(post, anchor);
    }
}

// 原生只在自身加载楼中楼后调用 _showLzlJubao 填充举报/删除入口，接口返回的 .lzl_jb 为空，需按同一规则补齐
function fillReportEntry(post: HTMLElement): void {
    const entry = dom<"span">(".lzl_jb", post);
    if (!entry || entry.childElementCount > 0) return;
    const { power, user } = PageData;
    if (power.can_mask_delete || power.lz_del) return;
    const author = post.querySelector("a[username]")?.getAttribute("username");
    if (author && author === user.user_name) {
        entry.append(domrd("a", {
            rel: "noopener",
            href: "#",
            class: "lzl_delate_in",
            "data-field": `{'delete_mine': 1, 'user_name' : '${author}'}`,
        }, "删除"), " | ");
    } else {
        entry.append(domrd("a", { href: "###", class: "lzl_jb_in" }));
    }
}

// 接管原生「还有 x 条回复，点击查看」与楼中楼翻页：本页隐藏回复和后续页统一由一个按钮展开
export function renderLzlLoadMore(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>("ul.j_lzl_m_w").forEach(list => {
        const pager = dom<"li">(":scope > .lzl_li_pager", list);
        if (!pager) return;
        let state = states.get(list);
        if (state?.pager === pager && pager.contains(state.button)) {
            // 原生也会直接移除被删除的回复，后续刷新时沿用的缓存应同步收缩。
            const pages = state.pages;
            pages.forEach((posts, page) => {
                pages.set(page, posts.filter(post => list.contains(post)));
            });
            updateButton(list, state);
            return;
        }
        let pagination: Pagination;
        try {
            pagination = readPagination(pager);
        } catch {
            return;
        }
        if (!state && pagination.total <= 1 && !hasHiddenPosts(list)) return;

        const posts = dom<"li">("li.lzl_single_post", list, []);
        // 原生提交/删除会替换列表内容：以刷新页为准，其余已加载页沿用原节点。
        const pages = state?.pages ?? new Map<number, HTMLElement[]>();
        pages.set(pagination.current, posts);
        for (const page of pages.keys()) {
            if (page > pagination.total) pages.delete(page);
        }
        const label = domrd("span", { class: "tbr-lzl-load-more-label" });
        const button = domrd("button", { type: "button", class: "tbr-lzl-load-more" }, [
            createLucideIconElement(ChevronDown, { class: "tbr-action-icon tbr-lzl-load-more-icon", strokeWidth: 1.75 }),
            createLucideIconElement(LoaderCircle, { class: "tbr-action-icon tbr-lzl-load-more-spinner", strokeWidth: 1.75 }),
            label,
        ]);
        state = {
            pager,
            button,
            label,
            pages,
            total: pagination.total,
            count: Math.max(pagination.count, state?.count ?? 0),
            loading: false,
            failed: false,
        };
        states.set(list, state);
        pager.append(button);
        const nativePager = dom<"p">(".j_pager", pager);
        if (nativePager) nativePager.hidden = true;
        const nativeMore = dom<"p">(".lzl_more", pager);
        if (nativeMore) nativeMore.style.display = "none";

        if (pages.size > 1) {
            expandHiddenPosts(list);
            [...pages.entries()].sort(([a], [b]) => a - b).forEach(([, pagePosts]) => {
                appendCommentPosts(list, pagePosts, pager);
            });
            dom<"li">("li.lzl_single_post", list, []).forEach(post => post.removeAttribute("data-tbr-lzl-tree"));
        }
        const activeState = state;
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            void loadMore(list, activeState);
        });
        updateButton(list, state);
    });
}

function hasHiddenPosts(list: HTMLElement): boolean {
    return list.querySelector(":scope > ul.lzl_post_hidden > li.lzl_single_post") != null;
}

function nextPage(state: ListState): number | undefined {
    for (let page = 1; page <= state.total; page++) {
        if (!state.pages.has(page)) return page;
    }
}

// 每次 observer 回调都会调用，只在状态变化时写 DOM，避免触发 observer 回环
function updateButton(list: HTMLElement, state: ListState): void {
    const remaining = state.count - list.querySelectorAll(":scope > li.lzl_single_post").length;
    const status = state.loading ? "loading" : state.failed ? "error" : "idle";
    const text = state.loading
        ? "加载中…"
        : state.failed
            ? "加载失败，点击重试"
            : remaining > 0 ? `还有 ${remaining} 条回复` : "查看更多回复";
    const hidden = nextPage(state) === undefined && !hasHiddenPosts(list);
    const { button, label } = state;
    if (button.hidden !== hidden) button.hidden = hidden;
    if (button.disabled !== state.loading) button.disabled = state.loading;
    if (button.dataset.status !== status) {
        button.dataset.status = status;
        button.setAttribute("aria-busy", String(state.loading));
    }
    if (label.textContent !== text) label.textContent = text;
}

function expandHiddenPosts(list: HTMLElement): void {
    dom<"ul">(":scope > ul.lzl_post_hidden", list, []).forEach(hidden => {
        hidden.style.display = "block";
        hidden.before(...dom<"li">(":scope > li.lzl_single_post", hidden, []));
    });
}

async function loadMore(list: HTMLElement, state: ListState): Promise<void> {
    if (state.loading) return;
    const page = nextPage(state);
    if (page === undefined) {
        animateLzlListChange(list, () => {
            expandHiddenPosts(list);
            updateButton(list, state);
        });
        return;
    }
    state.loading = true;
    state.failed = false;
    updateButton(list, state);
    try {
        const floor = list.closest<HTMLElement>(".l_post");
        const parentId = Number(floor?.dataset.pid || floor?.getAttribute("data-field")?.match(/["']post_id["']\s*:\s*["']?(\d+)/)?.[1]);
        const threadId = Number(PageData.thread.thread_id);
        const forumId = Number(PageData.forum.id);
        if (![parentId, threadId, forumId].every(id => Number.isSafeInteger(id) && id > 0)) {
            throw new Error("楼层信息无效");
        }
        const response = await tiebaAPI.commentPage(threadId, parentId, forumId, page);
        if (!response.ok) throw new Error(`加载失败 (${response.status})`);
        const result = parseCommentPage(await response.text());
        // 请求期间原生刷新或帖子翻页时，丢弃旧列表对应的响应。
        if (!list.isConnected || states.get(list) !== state || !list.contains(state.pager)) return;
        if (result.current !== page) throw new Error("楼中楼页码不匹配");
        state.pages.set(page, result.posts);
        state.total = result.total;
        state.count = Math.max(state.count, result.count);
        state.loading = false;
        animateLzlListChange(list, () => {
            expandHiddenPosts(list);
            appendCommentPosts(list, result.posts, state.pager);
            updateButton(list, state);
        });
    } catch (error) {
        if (states.get(list) !== state || !list.contains(state.pager)) return;
        state.loading = false;
        state.failed = true;
        updateButton(list, state);
        console.warn("[Tieba Remix] 加载楼中楼失败", error);
    }
}
