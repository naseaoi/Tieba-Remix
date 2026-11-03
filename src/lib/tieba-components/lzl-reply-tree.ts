export const MAX_REPLY_DEPTH = 3;

const TREE_ATTR = "data-tbr-lzl-tree";
const LINKED_ATTR = "data-tbr-lzl-linked";
const RAILS_CLASS = "tbr-lzl-rails";

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
}

interface TreeEntry {
    index: number;
    parent?: TreeEntry;
    depth: number;
    linked: boolean;
    children: TreeEntry[];
}

// 按时间顺序挂到被回复者最近一条回复下，超过最大深度时提升为同级
export function buildReplyTree(items: readonly ReplyItem[]): ReplyNode[] {
    const roots: TreeEntry[] = [];
    const entries: TreeEntry[] = [];

    items.forEach((item, index) => {
        let parent: TreeEntry | undefined;
        if (item.target) {
            for (let i = index - 1; i >= 0; i--) {
                if (items[i].author === item.target || items[i].names?.includes(item.target)) {
                    parent = entries[i];
                    break;
                }
            }
        }
        const repliedTo = parent;
        while (parent && parent.depth >= MAX_REPLY_DEPTH) parent = parent.parent;
        const entry: TreeEntry = {
            index,
            parent,
            depth: parent ? parent.depth + 1 : 0,
            linked: repliedTo != null && parent === repliedTo,
            children: [],
        };
        entries.push(entry);
        (parent ? parent.children : roots).push(entry);
    });

    const nodes: ReplyNode[] = [];
    const visit = (entry: TreeEntry, ancestorRails: RailKind[], isLast: boolean): void => {
        const rails = entry.depth > 0 ? [...ancestorRails, isLast ? "elbow" : "tee"] as RailKind[] : [];
        nodes.push({
            index: entry.index,
            depth: entry.depth,
            rails,
            hasChildren: entry.children.length > 0,
            linked: entry.linked,
        });
        const childRails = entry.depth > 0 ? [...ancestorRails, isLast ? "none" : "pass"] as RailKind[] : [];
        entry.children.forEach((child, i) => visit(child, childRails, i === entry.children.length - 1));
    };
    roots.forEach(root => visit(root, [], true));
    return nodes;
}

// 每个楼中楼分页各自成树；跨页的回复对象保持顶层并显示「↳ 目标」标签
export function renderLzlReplyTrees(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>("ul.j_lzl_m_w").forEach(list => {
        mergeExpandedHiddenPosts(list);
        if (list.querySelector(`:scope > li.lzl_single_post:not([${TREE_ATTR}])`)) renderReplyTree(list);
    });
}

// 首屏每页只直接渲染前 5 条，其余放在 ul.lzl_post_hidden，点击「点击查看」后由原生 slideDown 显示
function mergeExpandedHiddenPosts(list: HTMLElement): void {
    list.querySelectorAll<HTMLElement>(":scope > ul.lzl_post_hidden").forEach(hidden => {
        if (getComputedStyle(hidden).display === "none") return;
        hidden.before(...hidden.querySelectorAll<HTMLElement>(":scope > li.lzl_single_post"));
    });
}

function renderReplyTree(list: HTMLElement): void {
    const posts = [...list.querySelectorAll<HTMLElement>(":scope > li.lzl_single_post")];
    if (posts.length === 0) return;

    const nodes = buildReplyTree(posts.map(post => ({
        author: normalizePortrait(readDataField(post, "portrait")),
        names: [readDataField(post, "user_name"), readDataField(post, "showname")].filter(Boolean),
        target: normalizePortrait(post.dataset.tbrReplyTo) || undefined,
    })));

    const anchor = posts[posts.length - 1].nextSibling;
    nodes.forEach(node => {
        const post = posts[node.index];
        post.setAttribute(TREE_ATTR, "");
        post.toggleAttribute(LINKED_ATTR, node.linked);
        post.style.setProperty("--tbr-lzl-depth", String(node.depth));
        post.querySelector(`:scope > .${RAILS_CLASS}`)?.remove();
        const rails = createRails(node);
        if (rails) post.prepend(rails);
        list.insertBefore(post, anchor);
    });
}

function createRails(node: ReplyNode): HTMLElement | null {
    if (node.depth === 0 && !node.hasChildren) return null;
    const container = document.createElement("span");
    container.className = RAILS_CLASS;
    container.setAttribute("aria-hidden", "true");
    node.rails.forEach((kind, column) => {
        if (kind !== "none") container.append(createRail(kind, column));
    });
    if (node.hasChildren) container.append(createRail("stem", node.depth));
    return container;
}

function createRail(kind: RailKind | "stem", column: number): HTMLElement {
    const rail = document.createElement("i");
    rail.className = `tbr-lzl-rail tbr-lzl-rail-${kind}`;
    rail.style.setProperty("--tbr-lzl-col", String(column));
    return rail;
}

function readDataField(element: HTMLElement, key: string): string {
    const field = element.getAttribute("data-field") ?? "";
    return field.match(new RegExp(`["']${key}["']\\s*:\\s*["']([^"']*)`))?.[1] ?? "";
}

function normalizePortrait(portrait: string | undefined): string {
    return (portrait ?? "").split(/[?&]/)[0].trim();
}
