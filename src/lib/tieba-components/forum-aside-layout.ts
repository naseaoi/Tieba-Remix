import { ChevronDown, X } from "@lucide/vue";
import { currentPageType } from "@/lib/api/remixed";
import { asyncdom, dom } from "@/lib/elemental";
import { createLucideIconElement } from "@/lib/lucide";
import { FORUM_PAGELET_TIMEOUT_MS } from "./forum";
import { createFriendForumsView } from "./forum-friend-forums";

const LINK_REGION_SELECTOR = ".zyq_mod_link";
const LAYOUT_ATTR = "data-forum-aside";
const PROCESSED_ATTR = "data-trex-aside-processed";
const RELOCATED_ATTR = "data-trex-relocated";

let installed = false;

export function installForumAsideLayout(): void {
    if (installed || currentPageType() !== "forum") return;
    installed = true;

    void setup();
}

async function setup(): Promise<void> {
    if (!document.documentElement.classList.contains("style-vercel")) return;

    const [aside, nav, content] = await Promise.all([
        asyncdom<"div">(".forum_content > .aside", undefined, FORUM_PAGELET_TIMEOUT_MS),
        asyncdom<"div">(".nav_wrap", undefined, FORUM_PAGELET_TIMEOUT_MS),
        asyncdom<"div">(".forum_content > #content_wrap", undefined, FORUM_PAGELET_TIMEOUT_MS),
    ]);
    if (!aside || !nav || !content) return;

    const drawer = createDrawer(aside);

    const links = createLinksBar();
    nav.after(links.root);

    const friends = createFriendForumsView(nav, content);

    document.documentElement.setAttribute(LAYOUT_ATTR, "drawer");

    // 侧栏 pagelet 由 Bigpipe 异步渲染，模块可能晚于本函数出现
    const sync = (): void => {
        syncForumMeta(drawer.open);
        syncUserLevel();
        links.sync(aside);
        friends.sync(aside);
    };
    sync();
    new MutationObserver(sync).observe(aside, { childList: true, subtree: true });
}

interface Drawer {
    open: () => void;
}

function createDrawer(aside: HTMLElement): Drawer {
    const root = document.createElement("div");
    root.className = "trex-forum-drawer";
    root.hidden = true;

    const backdrop = document.createElement("div");
    backdrop.className = "trex-forum-drawer-backdrop";

    const panel = document.createElement("section");
    panel.className = "trex-forum-drawer-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "本吧详情");

    const header = document.createElement("header");
    header.className = "trex-forum-drawer-header";
    const title = document.createElement("h2");
    title.textContent = "本吧详情";
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "trex-forum-drawer-close";
    closeButton.title = "关闭";
    closeButton.setAttribute("aria-label", "关闭");
    closeButton.append(createLucideIconElement(X, { size: 18 }));
    header.append(title, closeButton);

    const body = document.createElement("div");
    body.className = "trex-forum-drawer-body";
    // 整体移动原生节点，保留贴吧脚本绑定在模块上的事件
    body.append(aside);

    panel.append(header, body);
    root.append(backdrop, panel);
    document.body.append(root);

    let lastFocus: Element | null = null;

    const close = (): void => {
        if (root.dataset.open !== "true") return;
        delete root.dataset.open;
        // user-view 关闭弹窗时以页面上是否残留 [aria-modal] 判断能否解除滚动锁，常驻会导致滚动永久锁死
        panel.removeAttribute("aria-modal");
        document.removeEventListener("keydown", onKeydown);
        root.addEventListener("transitionend", () => {
            if (root.dataset.open !== "true") root.hidden = true;
        }, { once: true });
        if (lastFocus instanceof HTMLElement) lastFocus.focus();
    };

    const onKeydown = (event: KeyboardEvent): void => {
        if (event.key === "Escape") close();
    };

    const open = (): void => {
        if (root.dataset.open === "true") return;
        lastFocus = document.activeElement;
        root.hidden = false;
        // 先让 hidden 移除生效，再切换状态以触发过渡
        void root.offsetWidth;
        root.dataset.open = "true";
        panel.setAttribute("aria-modal", "true");
        document.addEventListener("keydown", onKeydown);
        closeButton.focus();
    };

    backdrop.addEventListener("click", close);
    closeButton.addEventListener("click", close);

    return { open };
}

function syncForumMeta(openDrawer: () => void): void {
    const cardTop = dom<"div">(".card_top_wrap .card_top");
    const info = dom<"div">(".aside .forum_info .region_cnt");
    if (!cardTop || !info || cardTop.querySelector(".trex-forum-meta")) return;

    const meta = document.createElement("div");
    meta.className = "trex-forum-meta";

    const author = info.querySelector(".author-manager .media_right");
    const authorLink = author?.querySelector("p a");
    if (authorLink) meta.append(createMetaItem("认证作者", [authorLink]));

    const managers = new Map<string, Element[]>();
    info.querySelectorAll(".manager_groups li").forEach(item => {
        const caption = item.querySelector(".media_caption")?.textContent?.trim();
        const link = item.querySelector(".media_bottom a");
        if (!caption || !link) return;
        managers.set(caption, [...managers.get(caption) ?? [], link]);
    });
    managers.forEach((links, caption) => meta.append(createMetaItem(caption, links)));

    info.querySelectorAll(".forum_info_desc").forEach(desc => {
        const label = desc.querySelector("span")?.textContent?.replace(/[:：\s]/g, "");
        if (!label) return;
        const link = desc.querySelector("a");
        if (link) {
            meta.append(createMetaItem(label, [link]));
            return;
        }
        const text = desc.textContent?.replace(label, "").replace(/[:：\s]/g, "");
        if (text) meta.append(createMetaItem("", [], text));
    });

    const more = document.createElement("button");
    more.type = "button";
    more.className = "trex-forum-meta-more";
    more.textContent = "详情";
    more.addEventListener("click", openDrawer);
    meta.append(more);

    cardTop.append(meta);
}

function createMetaItem(label: string, links: Element[], text?: string): HTMLElement {
    const item = document.createElement("span");
    item.className = "trex-forum-meta-item";
    if (label) {
        const labelElement = document.createElement("span");
        labelElement.className = "trex-forum-meta-label";
        labelElement.textContent = label;
        item.append(labelElement);
    }
    links.forEach(link => item.append(cloneLink(link)));
    if (text) item.append(text);
    return item;
}

function syncUserLevel(): void {
    const right = dom<"div">(".card_top_wrap .card_top_right");
    const current = dom<"div">(".aside .my_tieba .my_current_forum");
    if (!right || !current || right.querySelector(".trex-forum-level")) return;

    const badge = current.querySelector<HTMLAnchorElement>("a.badge");
    const name = badge?.querySelector(".badge_name")?.textContent?.trim();
    const level = badge?.querySelector(".badge_index")?.textContent?.trim();
    if (!badge || !name || !level) return;

    const expBar = current.querySelector<HTMLElement>(".exp_bar_current");
    const expText = current.querySelector(".exp_num")?.textContent?.trim();

    const root = document.createElement("a");
    root.className = "trex-forum-level";
    root.href = badge.href;
    root.target = "_blank";
    root.rel = "noopener";
    root.title = badge.title;

    const head = document.createElement("span");
    head.className = "trex-forum-level-head";
    const levelElement = document.createElement("span");
    levelElement.className = "trex-forum-level-index";
    levelElement.textContent = `Lv.${level}`;
    const nameElement = document.createElement("span");
    nameElement.className = "trex-forum-level-name";
    nameElement.textContent = name;
    head.append(levelElement, nameElement);
    root.append(head);

    if (expBar) {
        const bar = document.createElement("span");
        bar.className = "trex-forum-level-bar";
        const fill = document.createElement("span");
        fill.style.width = expBar.style.width;
        bar.append(fill);
        root.append(bar);
    }
    if (expText) {
        const exp = document.createElement("span");
        exp.className = "trex-forum-level-exp";
        exp.textContent = `经验 ${expText}`;
        root.append(exp);
    }

    right.prepend(root);
}

interface LinksBar {
    root: HTMLElement;
    sync: (aside: HTMLElement) => void;
}

function createLinksBar(): LinksBar {
    const root = document.createElement("nav");
    root.className = "trex-forum-links";
    root.setAttribute("aria-label", "本吧链接");
    root.hidden = true;

    const list = document.createElement("div");
    list.className = "trex-forum-links-list";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "trex-forum-links-toggle";
    toggle.setAttribute("aria-expanded", "false");
    const toggleLabel = document.createElement("span");
    toggleLabel.textContent = "展开";
    toggle.append(toggleLabel, createLucideIconElement(ChevronDown, { size: 14 }));
    toggle.addEventListener("click", () => {
        const expanded = root.dataset.expanded !== "true";
        if (expanded) {
            root.dataset.expanded = "true";
        } else {
            delete root.dataset.expanded;
        }
        toggle.setAttribute("aria-expanded", String(expanded));
        toggleLabel.textContent = expanded ? "收起" : "展开";
    });

    root.append(list, toggle);

    const updateOverflow = (): void => {
        if (root.dataset.expanded === "true") return;
        root.toggleAttribute("data-overflow", list.scrollHeight > list.clientHeight + 1);
    };
    new ResizeObserver(updateOverflow).observe(list);

    const sync = (aside: HTMLElement): void => {
        aside.querySelectorAll<HTMLElement>(LINK_REGION_SELECTOR).forEach(region => {
            if (region.hasAttribute(PROCESSED_ATTR)) return;
            region.setAttribute(PROCESSED_ATTR, "");

            const group = createLinkGroup(region);
            if (!group) return;
            list.append(group);
            region.setAttribute(RELOCATED_ATTR, "");
        });
        root.hidden = list.childElementCount === 0;
        updateOverflow();
    };

    return { root, sync };
}

function createLinkGroup(region: HTMLElement): HTMLElement | null {
    const header = region.querySelector(".region_header");
    const label = [...header?.childNodes ?? []]
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent ?? "")
        .join("")
        .trim();

    const seen = new Set<string>();
    const links = [...region.querySelectorAll<HTMLAnchorElement>(".region_cnt a[href]")].filter(link => {
        const text = link.textContent?.trim();
        if (!text || seen.has(link.href)) return false;
        seen.add(link.href);
        return true;
    });
    if (links.length === 0) return null;

    const group = document.createElement("div");
    group.className = "trex-forum-links-group";
    const [first, ...rest] = links.map(cloneLink);
    if (label) {
        // 标签与首个链接绑定换行，避免标签孤悬在行尾
        const lead = document.createElement("span");
        lead.className = "trex-forum-links-lead";
        const labelElement = document.createElement("span");
        labelElement.className = "trex-forum-links-label";
        labelElement.textContent = label;
        lead.append(labelElement, first);
        group.append(lead);
    } else {
        group.append(first);
    }
    group.append(...rest);
    return group;
}

function cloneLink(source: Element): HTMLAnchorElement {
    const link = document.createElement("a");
    if (source instanceof HTMLAnchorElement) {
        link.href = source.href;
        link.title = source.title || source.textContent?.trim() || "";
    }
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = source.textContent?.trim() ?? "";
    return link;
}
