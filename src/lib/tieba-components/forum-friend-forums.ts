import { tiebaAPI, type SuggestionResponse } from "@/lib/api/tieba";

const FRIEND_REGION_SELECTOR = ".zyq_mod_friend, .related_forums";
const PROCESSED_ATTR = "data-trex-friend-processed";
const RELOCATED_ATTR = "data-trex-relocated";
const VIEW_ATTR = "data-forum-view";
const VIEW_FRIENDS = "friends";

interface FriendForum {
    name: string;
    href: string;
    avatar?: string;
}

interface ForumCard {
    forum: FriendForum;
    avatar: HTMLImageElement;
    desc: HTMLElement;
}

export interface FriendForumsView {
    sync: (aside: HTMLElement) => void;
}

export function createFriendForumsView(nav: HTMLElement, content: HTMLElement): FriendForumsView {
    const navList = nav.querySelector<HTMLElement>(".nav_list");

    const panel = document.createElement("section");
    panel.className = "trex-friend-forums";
    panel.setAttribute("aria-label", "友情贴吧");
    content.before(panel);

    const tab = document.createElement("li");
    tab.className = "trex-friend-forums-tab";
    tab.hidden = true;
    const tabLink = document.createElement("a");
    tabLink.href = "#";
    tabLink.textContent = "友情贴吧";
    tab.append(tabLink);
    navList?.append(tab);

    const cards: ForumCard[] = [];
    let previousTab: Element | null = null;
    let detailsLoaded = false;

    const activate = (): void => {
        if (document.documentElement.getAttribute(VIEW_ATTR) === VIEW_FRIENDS) return;
        previousTab = navList?.querySelector(":scope > li.focus") ?? null;
        previousTab?.classList.remove("focus");
        tab.classList.add("focus");
        document.documentElement.setAttribute(VIEW_ATTR, VIEW_FRIENDS);
        if (!detailsLoaded) {
            detailsLoaded = true;
            cards.forEach(card => void loadDetails(card));
        }
    };

    const deactivate = (): void => {
        tab.classList.remove("focus");
        previousTab?.classList.add("focus");
        document.documentElement.removeAttribute(VIEW_ATTR);
    };

    tabLink.addEventListener("click", event => {
        event.preventDefault();
        activate();
    });

    // 友情贴吧页打开时，点回原先高亮的标签只切回帖子列表，不重新加载页面
    navList?.addEventListener("click", event => {
        if (document.documentElement.getAttribute(VIEW_ATTR) !== VIEW_FRIENDS) return;
        const target = event.target as Element | null;
        if (!previousTab || !target?.closest("a") || !previousTab.contains(target)) return;
        event.preventDefault();
        event.stopPropagation();
        deactivate();
    }, true);

    const sync = (aside: HTMLElement): void => {
        aside.querySelectorAll<HTMLElement>(FRIEND_REGION_SELECTOR).forEach(region => {
            if (region.hasAttribute(PROCESSED_ATTR)) return;
            region.setAttribute(PROCESSED_ATTR, "");

            const forums = parseForums(region);
            if (forums.length === 0) return;

            const groupCards = forums.map(createCard);
            panel.append(createGroup(regionTitle(region), groupCards));
            cards.push(...groupCards);
            region.setAttribute(RELOCATED_ATTR, "");
            if (detailsLoaded) groupCards.forEach(card => void loadDetails(card));
        });
        tab.hidden = cards.length === 0;
    };

    return { sync };
}

function regionTitle(region: HTMLElement): string {
    const header = region.querySelector(".region_header");
    return [...header?.childNodes ?? []]
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent ?? "")
        .join("")
        .trim();
}

function parseForums(region: HTMLElement): FriendForum[] {
    const forums = new Map<string, FriendForum>();
    region.querySelectorAll<HTMLAnchorElement>(".region_cnt a[href]").forEach(link => {
        const name = link.textContent?.trim() || link.title.trim();
        const current = forums.get(link.href);
        const avatar = link.querySelector("img")?.src || current?.avatar;
        forums.set(link.href, { name: current?.name || name, href: link.href, avatar });
    });
    return [...forums.values()].filter(forum => forum.name);
}

function createGroup(title: string, cards: ForumCard[]): HTMLElement {
    const group = document.createElement("div");
    group.className = "trex-friend-forums-group";
    if (title) {
        const heading = document.createElement("h3");
        heading.textContent = title;
        group.append(heading);
    }
    const grid = document.createElement("div");
    grid.className = "trex-friend-forums-grid";
    grid.append(...cards.map(card => card.avatar.closest("a")!));
    group.append(grid);
    return group;
}

function createCard(forum: FriendForum): ForumCard {
    const card = document.createElement("a");
    card.className = "trex-friend-forum";
    card.href = forum.href;
    card.target = "_blank";
    card.rel = "noopener";

    const avatar = document.createElement("img");
    avatar.className = "trex-friend-forum-avatar";
    avatar.alt = "";
    avatar.loading = "lazy";
    if (forum.avatar) avatar.src = forum.avatar;

    const body = document.createElement("span");
    body.className = "trex-friend-forum-body";
    const name = document.createElement("span");
    name.className = "trex-friend-forum-name";
    name.textContent = `${forum.name}吧`;
    const desc = document.createElement("span");
    desc.className = "trex-friend-forum-desc";
    desc.textContent = " ";
    body.append(name, desc);

    card.append(avatar, body);
    return { forum, avatar, desc };
}

async function loadDetails(card: ForumCard): Promise<void> {
    try {
        const response = await tiebaAPI.suggestions(card.forum.name);
        const data = await response.json() as SuggestionResponse;
        const match = data.query_match?.search_data?.find(item => item.fname === card.forum.name);
        if (!match) {
            card.desc.textContent = "";
            return;
        }
        if (!card.forum.avatar && match.fpic) card.avatar.src = match.fpic;
        card.desc.textContent = match.forum_desc.trim()
            || `关注 ${formatCount(match.member_num)} · 帖子 ${formatCount(match.thread_num)}`;
        card.desc.title = card.desc.textContent;
    } catch {
        card.desc.textContent = "";
    }
}

function formatCount(value: number): string {
    return value >= 10000 ? `${(value / 10000).toFixed(1).replace(/\.0$/, "")}万` : String(value);
}
