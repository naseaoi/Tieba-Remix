import { ArrowLeft, MessagesSquare } from "@lucide/vue";
import { domrd } from "@/lib/elemental";
import { createLucideIconElement } from "@/lib/lucide";
import { animateLzlListChange, LZL_STATIC_ATTR as STATIC_ATTR } from "./lzl-list-motion";

export const MAX_REPLY_DEPTH = 5;

const TREE_ATTR = "data-tbr-lzl-tree";
const LINKED_ATTR = "data-tbr-lzl-linked";
const FOCUS_DATA = "tbrLzlFocus";
const RAILS_CLASS = "tbr-lzl-rails";
const FOLD_CLASS = "tbr-lzl-fold";
const FOCUS_BACK_CLASS = "tbr-lzl-focus-back";

export interface ReplyItem {
    author: string;
    // 回复目标可能只给出用户名或昵称，需与 author 一同参与匹配
    names?: readonly string[];
    target?: string;
}

// pass：祖先连线穿过；elbow：接入自己的头像；tee：接入自己的头像且继续向下连到后续兄弟
export type RailKind = "none" | "pass" | "elbow" | "tee";

export interface ReplyNode {
    index: number;
    depth: number;
    rails: RailKind[];
    hasChildren: boolean;
    // 可视父节点就是被回复者本人；为 false 时仍需显示「↳ 目标」标签
    linked: boolean;
    // 子树超出可视深度时折叠的后代数，以及折叠行接入本节点的连线
    fold?: { count: number; rails: RailKind[] };
}

interface TreeEntry {
    index: number;
    children: TreeEntry[];
}

// 优先延续双方对话，其次回复独立发言；focus 指定时只展示以该回复为根的子树
export function buildReplyTree(items: readonly ReplyItem[], focus?: number): ReplyNode[] {
    const roots: TreeEntry[] = [];
    const entries: TreeEntry[] = [];

    items.forEach((item, index) => {
        let parent: TreeEntry | undefined;
        if (item.target) {
            let standalone: TreeEntry | undefined;
            for (let i = index - 1; i >= 0; i--) {
                const candidate = items[i];
                if (!matchesAuthor(candidate, item.target)) continue;
                parent ??= entries[i];
                if (!candidate.target) standalone ??= entries[i];
                if (candidate.target && matchesAuthor(item, candidate.target)) {
                    parent = entries[i];
                    standalone = undefined;
                    break;
                }
            }
            parent = standalone ?? parent;
        }
        const entry: TreeEntry = { index, children: [] };
        entries.push(entry);
        (parent ? parent.children : roots).push(entry);
    });

    const nodes: ReplyNode[] = [];
    const visit = (entry: TreeEntry, depth: number, ancestorRails: RailKind[], isLast: boolean): void => {
        const rails = depth > 0 ? [...ancestorRails, isLast ? "elbow" : "tee"] as RailKind[] : [];
        const childRails = depth > 0 ? [...ancestorRails, isLast ? "none" : "pass"] as RailKind[] : [];
        const node: ReplyNode = {
            index: entry.index,
            depth,
            rails,
            hasChildren: entry.children.length > 0,
            linked: depth > 0,
        };
        nodes.push(node);
        if (depth >= MAX_REPLY_DEPTH && node.hasChildren) {
            node.fold = { count: countDescendants(entry), rails: [...childRails, "elbow"] };
            return;
        }
        entry.children.forEach((child, i) => visit(child, depth + 1, childRails, i === entry.children.length - 1));
    };
    const focused = focus === undefined ? undefined : entries[focus];
    (focused ? [focused] : roots).forEach(root => visit(root, 0, [], true));
    return nodes;
}

function countDescendants(entry: TreeEntry): number {
    return entry.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

function matchesAuthor(item: ReplyItem, name: string): boolean {
    return item.author === name || item.names?.includes(name) === true;
}

// 已加载的楼中楼共同成树；尚未加载的回复对象保持顶层并显示目标标签
// observer 每次 DOM 变动都会调用：没有新回复的列表直接跳过，避免逐帧解析全部回复
export function renderLzlReplyTrees(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>("ul.j_lzl_m_w").forEach(list => {
        mergeExpandedHiddenPosts(list);
        if (!list.querySelector(`:scope > li.lzl_single_post:not([${TREE_ATTR}])`)) return;
        deduplicateLzlPosts(list);
        renderReplyTree(list);
    });
}

// 首屏每页只直接渲染前 5 条，其余放在 ul.lzl_post_hidden（类名隐藏），原生 slideDown 展开后写入内联 display:block。
// 只读内联样式：getComputedStyle 会在 DOM 变动后强制同步重算样式，滚动懒加载时代价很高
function mergeExpandedHiddenPosts(list: HTMLElement): void {
    list.querySelectorAll<HTMLElement>(":scope > ul.lzl_post_hidden").forEach(hidden => {
        if (hidden.style.display !== "block") return;
        const posts = hidden.querySelectorAll<HTMLElement>(":scope > li.lzl_single_post");
        if (posts.length > 0) hidden.before(...posts);
    });
}

// 加载或展开回复后立即同步建树，便于在最终布局上执行高度过渡
export function refreshLzlReplyTree(list: HTMLElement): void {
    mergeExpandedHiddenPosts(list);
    deduplicateLzlPosts(list);
    renderReplyTree(list);
}

function renderReplyTree(list: HTMLElement): void {
    list.querySelectorAll(`:scope > .${FOLD_CLASS}, :scope > .${FOCUS_BACK_CLASS}`).forEach(row => row.remove());
    const domPosts = [...list.querySelectorAll<HTMLElement>(":scope > li.lzl_single_post")];
    const anchor = domPosts.at(-1)?.nextSibling ?? null;
    const posts = chronological(domPosts);
    if (posts.length === 0) return;

    const focusId = list.dataset[FOCUS_DATA];
    const focus = focusId ? posts.findIndex(post => readLzlField(post, "spid") === focusId) : -1;
    if (focus < 0) delete list.dataset[FOCUS_DATA];
    const nodes = buildReplyTree(posts.map(post => ({
        author: normalizePortrait(readLzlField(post, "portrait")),
        names: [readLzlField(post, "user_name"), readLzlField(post, "showname")].filter(Boolean),
        target: normalizePortrait(post.dataset.tbrReplyTo) || undefined,
    })), focus < 0 ? undefined : focus);

    if (focus >= 0) list.insertBefore(createFocusBack(list), anchor);
    const shown = new Set<HTMLElement>();
    nodes.forEach(node => {
        const post = posts[node.index];
        shown.add(post);
        if (post.hasAttribute(TREE_ATTR)) post.setAttribute(STATIC_ATTR, "");
        post.setAttribute(TREE_ATTR, "");
        post.hidden = false;
        post.toggleAttribute(LINKED_ATTR, node.linked);
        post.style.setProperty("--tbr-lzl-depth", String(node.depth));
        post.querySelector(`:scope > .${RAILS_CLASS}`)?.remove();
        const rails = createRails(node.rails, node.hasChildren ? node.depth : undefined);
        if (rails) post.prepend(rails);
        list.insertBefore(post, anchor);
        if (node.fold) list.insertBefore(createFold(list, post, node.depth + 1, node.fold), anchor);
    });
    // 聚焦或折叠时其余回复留在列表中，以便返回时原位重建
    posts.filter(post => !shown.has(post)).forEach(post => {
        if (post.hasAttribute(TREE_ATTR)) post.setAttribute(STATIC_ATTR, "");
        post.setAttribute(TREE_ATTR, "");
        post.hidden = true;
        list.insertBefore(post, anchor);
    });
}

function createFold(list: HTMLElement, post: HTMLElement, depth: number, fold: NonNullable<ReplyNode["fold"]>): HTMLElement {
    const button = domrd("button", { type: "button", class: "tbr-lzl-thread-button" }, [
        createLucideIconElement(MessagesSquare, { class: "tbr-action-icon", strokeWidth: 1.75 }),
        `继续此对话 · ${fold.count}`,
    ]);
    button.addEventListener("click", () => setReplyFocus(list, readLzlField(post, "spid")));
    const row = domrd("li", { class: FOLD_CLASS }, [button]);
    row.style.setProperty("--tbr-lzl-depth", String(depth));
    const rails = createRails(fold.rails);
    if (rails) row.prepend(rails);
    return row;
}

function createFocusBack(list: HTMLElement): HTMLElement {
    const button = domrd("button", { type: "button", class: "tbr-lzl-thread-button" }, [
        createLucideIconElement(ArrowLeft, { class: "tbr-action-icon", strokeWidth: 1.75 }),
        "返回全部回复",
    ]);
    button.addEventListener("click", () => setReplyFocus(list, undefined));
    return domrd("li", { class: FOCUS_BACK_CLASS }, [button]);
}

function setReplyFocus(list: HTMLElement, spid: string | undefined): void {
    animateLzlListChange(list, () => {
        if (spid) list.dataset[FOCUS_DATA] = spid;
        else delete list.dataset[FOCUS_DATA];
        renderReplyTree(list);
    });
    const wrapper = list.closest<HTMLElement>(".core_reply_wrapper") ?? list;
    const top = wrapper.getBoundingClientRect().top;
    if (top < 0) window.scrollBy({ top: top - 80, behavior: "smooth" });
}

function createRails(kinds: RailKind[], stemColumn?: number): HTMLElement | null {
    if (kinds.length === 0 && stemColumn === undefined) return null;
    const container = document.createElement("span");
    container.className = RAILS_CLASS;
    container.setAttribute("aria-hidden", "true");
    kinds.forEach((kind, column) => {
        if (kind !== "none") container.append(createRail(kind, column));
    });
    if (stemColumn !== undefined) container.append(createRail("stem", stemColumn));
    return container;
}

function createRail(kind: RailKind | "stem", column: number): HTMLElement {
    const rail = document.createElement("i");
    rail.className = `tbr-lzl-rail tbr-lzl-rail-${kind}`;
    rail.style.setProperty("--tbr-lzl-col", String(column));
    return rail;
}

// 已建树的列表 DOM 是树形顺序，重建时必须按 spid 恢复时间顺序再匹配「最近一条回复」
function chronological(posts: HTMLElement[]): HTMLElement[] {
    const spids = new Map(posts.map(post => [post, Number(readLzlField(post, "spid"))]));
    if ([...spids.values()].some(spid => !Number.isFinite(spid) || spid <= 0)) return posts;
    return posts.sort((a, b) => spids.get(a)! - spids.get(b)!);
}

export function deduplicateLzlPosts(list: HTMLElement): boolean {
    const seen = new Set<string>();
    let removed = false;
    list.querySelectorAll<HTMLElement>("li.lzl_single_post").forEach(post => {
        const spid = readLzlField(post, "spid");
        if (!spid) return;
        if (seen.has(spid)) {
            post.remove();
            removed = true;
        } else seen.add(spid);
    });
    return removed;
}

const fieldPatterns = new Map<string, RegExp>();

// 首屏 data-field 是单引号对象，AJAX 翻页是 JSON 且 spid 为数字；单引号对象直接 JSON.parse 会抛异常，开销远高于正则
export function readLzlField(element: HTMLElement, key: string): string {
    const field = element.getAttribute("data-field") ?? "";
    if (/^\s*\{\s*"/.test(field)) {
        try {
            const value: unknown = (JSON.parse(field) as Record<string, unknown>)[key];
            if (typeof value === "string" || typeof value === "number") return String(value);
        } catch {
            // 非法 JSON 交给下方字段匹配
        }
    }
    let pattern = fieldPatterns.get(key);
    if (!pattern) {
        pattern = new RegExp(`["']${key}["']\\s*:\\s*(?:["']([^"']*)|(\\d+))`);
        fieldPatterns.set(key, pattern);
    }
    const match = field.match(pattern);
    return match?.[1] ?? match?.[2] ?? "";
}

function normalizePortrait(portrait: string | undefined): string {
    return (portrait ?? "").split(/[?&]/)[0].trim();
}
