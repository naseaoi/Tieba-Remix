import { currentPageType } from "@/lib/api/remixed";
import { LayoutList } from "@lucide/vue";
import { createLucideIconElement } from "@/lib/lucide";
import { fetchForumThreads, type ForumThreadItem } from "@/lib/api/tieba-forum-threads";
import { dom, domrd } from "@/lib/elemental";
import { addCoalescedObserverEvent, forumThreadsObserver } from "@/lib/observers";
import { forumThreadSort, type ForumThreadSort } from "@/lib/user-values";
import { createForumThreadDensityToggle, installForumThreadDensity } from "./forum-thread-density";
import { formatForumThreadTime } from "./forum-thread-time";

const MODE_ATTR = "data-forum-sort";
const GENERATED_ATTR = "data-trex-sorted";
// 接口单页去掉推广后常不足一屏，空页时连续补拉的上限
const MAX_EMPTY_PAGES = 3;

const MODES: { value: ForumThreadSort; text: string }[] = [
    { value: "reply", text: "回复时间" },
    { value: "create", text: "发布时间" },
];

interface SortState {
    list: HTMLElement;
    bar: HTMLElement;
    buttons: Map<ForumThreadSort, HTMLButtonElement>;
    more?: HTMLLIElement;
    nativeNodes: Node[];
    seen: Set<number>;
    page: number;
    hasMore: boolean;
    loading: boolean;
    token: number;
}

let installed = false;
let state: SortState | undefined;
let loadObserver: IntersectionObserver | undefined;

export function installForumThreadSort(): void {
    if (installed || currentPageType() !== "forum") return;
    installed = true;
    installForumThreadDensity();
    addCoalescedObserverEvent(sync, forumThreadsObserver);
}

function isMainTab(): boolean {
    const tab = new URLSearchParams(location.search).get("tab");
    return !tab || tab === "main";
}

function forumName(): string {
    return new URLSearchParams(location.search).get("kw")?.trim()
        || dom(".card_title_fname")?.textContent?.trim()
        || "";
}

function sync(): void {
    if (!document.documentElement.classList.contains("style-vercel") || !isMainTab()) return;
    const list = dom<"ul">("#thread_list");
    if (!list || !forumName()) return;

    // 原生翻页会整体重建列表，旧状态随之作废
    if (state?.list !== list) {
        state = createState(list);
        if (forumThreadSort.get() === "create") enterCreateMode(state);
    }
    placeBar(state);
}

function createState(list: HTMLElement): SortState {
    const buttons = new Map<ForumThreadSort, HTMLButtonElement>();
    const group = domrd("div", { class: "trex-thread-sort-group", role: "group", "aria-label": "帖子排序" });
    MODES.forEach(mode => {
        const button = domrd("button", { type: "button", class: "trex-thread-sort-option" }, mode.text);
        button.addEventListener("click", () => switchMode(mode.value));
        buttons.set(mode.value, button);
        group.append(button);
    });
    const title = domrd("span", { class: "trex-thread-sort-title" }, [
        createLucideIconElement(LayoutList, { size: 14 }),
        "全部帖子",
    ]);
    const controls = domrd("div", { class: "trex-thread-sort-controls" }, [createForumThreadDensityToggle(), group]);
    const bar = domrd("li", { class: "trex-thread-sort" }, [title, controls]);
    const next: SortState = {
        list, bar, buttons,
        nativeNodes: [], seen: new Set(), page: 0, hasMore: true, loading: false, token: 0,
    };
    updateButtons(next, "reply");
    return next;
}

function placeBar(current: SortState): void {
    const folder = current.list.querySelector(":scope > .thread_top_list_folder");
    if (folder ? folder.nextElementSibling === current.bar : current.list.firstElementChild === current.bar) return;
    if (folder) folder.after(current.bar);
    else current.list.prepend(current.bar);
}

function updateButtons(current: SortState, mode: ForumThreadSort): void {
    current.buttons.forEach((button, value) => {
        const active = value === mode;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}

function switchMode(mode: ForumThreadSort): void {
    if (!state || forumThreadSort.get() === mode) return;
    forumThreadSort.set(mode);
    if (mode === "create") enterCreateMode(state);
    else leaveCreateMode(state);
}

function isNativeThreadNode(current: SortState, node: Element): boolean {
    return node !== current.bar && !node.classList.contains("thread_top_list_folder");
}

function enterCreateMode(current: SortState): void {
    current.token++;
    current.nativeNodes = [...current.list.children].filter(node => isNativeThreadNode(current, node));
    current.nativeNodes.forEach(node => (node as Element).remove());
    current.seen = new Set();
    current.page = 0;
    current.hasMore = true;
    current.loading = false;
    current.more = createMore(current);
    current.list.append(current.more);
    document.documentElement.setAttribute(MODE_ATTR, "create");
    updateButtons(current, "create");
    void loadMore(current);
}

function leaveCreateMode(current: SortState): void {
    current.token++;
    loadObserver?.disconnect();
    current.list.querySelectorAll(`:scope > [${GENERATED_ATTR}]`).forEach(node => node.remove());
    current.more?.remove();
    current.more = undefined;
    current.list.append(...current.nativeNodes);
    current.nativeNodes = [];
    document.documentElement.removeAttribute(MODE_ATTR);
    updateButtons(current, "reply");
}

function createMore(current: SortState): HTMLLIElement {
    const button = domrd("button", { type: "button", class: "trex-thread-sort-more-button" }, "加载更多");
    button.addEventListener("click", () => void loadMore(current));
    const more = domrd("li", { class: "trex-thread-sort-more" }, [button]);

    loadObserver?.disconnect();
    if (typeof IntersectionObserver !== "undefined") {
        loadObserver = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) void loadMore(current);
        }, { rootMargin: "400px 0px" });
        loadObserver.observe(more);
    }
    return more;
}

function setMoreStatus(current: SortState, status: "idle" | "loading" | "error" | "end"): void {
    const more = current.more;
    const button = more?.querySelector("button");
    if (!more || !button) return;
    more.dataset.status = status;
    button.disabled = status === "loading" || status === "end";
    button.textContent = {
        idle: "加载更多",
        loading: "加载中…",
        error: "加载失败，点击重试",
        end: "没有更多了",
    }[status];
}

async function loadMore(current: SortState): Promise<void> {
    if (current.loading || !current.hasMore || state !== current) return;
    const token = current.token;
    const kw = forumName();
    current.loading = true;
    setMoreStatus(current, "loading");

    try {
        let added = 0;
        for (let attempt = 0; attempt < MAX_EMPTY_PAGES && added === 0 && current.hasMore; attempt++) {
            const result = await fetchForumThreads(kw, current.page + 1, 1);
            if (token !== current.token) return;
            current.page++;
            current.hasMore = result.hasMore;
            const items = result.threads
                .filter(thread => !thread.isTop && !current.seen.has(thread.tid))
                .map(thread => {
                    current.seen.add(thread.tid);
                    return renderForumThreadItem(thread);
                });
            current.more?.before(...items);
            added += items.length;
        }
        current.loading = false;
        setMoreStatus(current, current.hasMore ? "idle" : "end");
        // 观察器只在可见性变化时回调，重新观察以便按钮仍在视口内时继续加载；
        // 连续空页时停止自动加载，避免接口格式异常时无限翻页，改由用户手动点击
        if (current.hasMore && current.more && added > 0) {
            loadObserver?.unobserve(current.more);
            loadObserver?.observe(current.more);
        }
    } catch {
        if (token !== current.token) return;
        current.loading = false;
        setMoreStatus(current, "error");
    }
}

/** 按原生列表模板生成帖子节点，使现代化布局、点赞、图片查看等既有逻辑直接复用 */
export function renderForumThreadItem(thread: ForumThreadItem, now = new Date()): HTMLLIElement {
    const field = {
        id: thread.tid,
        author_name: thread.authorName,
        author_nickname: thread.authorName,
        author_portrait: thread.authorPortrait,
        first_post_id: thread.firstPostId,
        reply_num: thread.replyNum,
        is_good: thread.isGood,
        is_top: thread.isTop,
    };
    const homeHref = thread.authorPortrait ? `/home/main/?id=${encodeURIComponent(thread.authorPortrait)}&fr=frs` : "";

    const title = domrd("div", { class: "threadlist_title pull_left j_th_tit" }, [
        domrd("a", { href: thread.url, title: thread.title, target: "_blank", class: "j_th_tit" }, thread.title),
    ]);
    if (thread.isGood) title.prepend(domrd("i", { class: "icon-good", title: "精品" }));

    const authorName = homeHref
        ? domrd("a", { class: "frs-author-name j_user_card", href: homeHref, target: "_blank" }, thread.authorName)
        : domrd("span", { class: "frs-author-name" }, thread.authorName);
    const author = domrd("div", { class: "threadlist_author pull_right" }, [
        domrd("span", { class: "tb_icon_author", title: `主题作者: ${thread.authorName}` }, [
            domrd("i", { class: "icon_author" }),
            domrd("span", { class: "frs-author-name-wrap" }, [authorName]),
        ]),
        domrd("span", { class: "pull-right is_show_create_time", title: "创建时间" },
            formatForumThreadTime(thread.createTime, now)),
    ]);

    const text = domrd("div", { class: "threadlist_text pull_left" });
    if (thread.abstract.trim()) {
        text.append(domrd("div", { class: "threadlist_abs threadlist_abs_onlyline" }, thread.abstract));
    }
    if (thread.images.length) {
        const media = domrd("ul", { class: "threadlist_media j_threadlist_media clearfix", id: `fm${thread.tid}` },
            thread.images.slice(0, 3).map(image => domrd("li", {}, [
                domrd("a", { class: "thumbnail vpic_wrap" }, [
                    domrd("img", {
                        src: image.thumb,
                        "data-original": image.thumb,
                        bpic: image.large,
                        class: "threadlist_pic j_m_pic",
                        loading: "lazy",
                        alt: "",
                    }),
                ]),
            ])));
        const gallery = domrd("div", { class: "small_list_gallery" }, [media]);
        if (thread.images.length > 3) {
            gallery.append(domrd("div", { class: "small_pic_num center_text" }, `共 ${thread.images.length} 张`));
        }
        text.append(domrd("div", { class: "small_wrap j_small_wrap" }, [
            domrd("div", { class: "small_list j_small_list cleafix" }, [gallery]),
        ]));
    }

    const lastReply = domrd("div", { class: "threadlist_author pull_right" }, [
        domrd("span", { class: "threadlist_reply_date pull_right j_reply_data", title: "最后回复时间" },
            formatForumThreadTime(thread.lastTime, now)),
    ]);

    return domrd("li", {
        class: "j_thread_list clearfix thread_item_box",
        "data-field": JSON.stringify(field),
        "data-tid": String(thread.tid),
        "data-thread-type": "0",
        [GENERATED_ATTR]: "",
    }, [
        domrd("div", { class: "t_con cleafix" }, [
            domrd("div", { class: "col2_left j_threadlist_li_left" }, [
                domrd("span", { class: "threadlist_rep_num center_text", title: "回复" }, String(thread.replyNum)),
            ]),
            domrd("div", { class: "col2_right j_threadlist_li_right" }, [
                domrd("div", { class: "threadlist_lz clearfix" }, [title, author]),
                domrd("div", { class: "threadlist_detail clearfix" }, [text, lastReply]),
            ]),
        ]),
    ]);
}
