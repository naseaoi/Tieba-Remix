import { currentPageType } from "@/lib/api/remixed";
import { tiebaAPI } from "@/lib/api/tieba";
import { addCoalescedObserverEvent, forumThreadsObserver } from "@/lib/observers";
import { forumThreadModernLayout } from "@/lib/user-values";
import { getForumAuthorName, isTruncatedForumAuthorName } from "./forum-author-full-id";
import { classifyForumThreadTime } from "./forum-thread-time";
import { createThreadActions, createThreadMoreButton, releaseThreadActions, type ThreadCardContext } from "./thread-card-actions";

const ROOT_SELECTOR = "#pagelet_frs-list\\/pagelet\\/thread";
const FLAG = "data-trex-modernized";

type ThreadField = {
    id?: number | string;
    author_name?: string;
    author_nickname?: string;
    author_portrait?: string;
    first_post_id?: number | string;
    reply_num?: number | string;
};

function parseField(item: HTMLElement): ThreadField | undefined {
    try {
        const raw = JSON.parse(item.getAttribute("data-field") ?? "null") as ThreadField | null;
        return raw && typeof raw === "object" ? raw : undefined;
    } catch {
        return undefined;
    }
}

function parseId(value: unknown): number | undefined {
    const parsed = typeof value === "string" ? Number(value) : value;
    return typeof parsed === "number" && Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function text(value: unknown): string {
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return typeof value === "string" ? value.trim() : "";
}

function forumContext(): ThreadCardContext {
    return {
        fid: Number(PageData.forum.forum_id || PageData.forum.id),
        tbs: () => Promise.resolve(PageData.tbs),
    };
}

function resolveAuthorName(field: ThreadField, nativeAuthorLink: HTMLAnchorElement | null): string {
    const nativeName = getForumAuthorName(nativeAuthorLink);
    const fieldName = text(field.author_name);
    const nickname = text(field.author_nickname);
    const candidates = [nativeName, fieldName, nickname].filter(Boolean);
    return candidates.find(name => !isTruncatedForumAuthorName(name)) ?? candidates[0] ?? "";
}

function syncModernAuthorName(item: HTMLElement): void {
    const field = parseField(item);
    const authorLink = item.querySelector<HTMLAnchorElement>(".tb_icon_author .frs-author-name");
    const name = field ? resolveAuthorName(field, authorLink) : getForumAuthorName(authorLink);
    const modernName = item.querySelector<HTMLElement>(".thread-modern-author-name");
    if (modernName && name && modernName.textContent !== name) modernName.textContent = name;
}

function modernize(item: HTMLElement): void {
    if (item.classList.contains("thread_top")) {
        releaseThreadActions(item);
        item.querySelector(".thread-modern-author-row")?.remove();
        item.querySelector(".thread-modern-actions")?.remove();
        item.removeAttribute(FLAG);
        return;
    }
    if (!forumThreadModernLayout.get()) return;
    if (item.hasAttribute(FLAG)) {
        syncModernAuthorName(item);
        return;
    }
    const field = parseField(item);
    const tid = parseId(field?.id ?? item.dataset.tid);
    if (!field || tid == null) return;
    const author = item.querySelector<HTMLElement>(".tb_icon_author");
    const nativeAuthorLink = author?.querySelector<HTMLAnchorElement>(".frs-author-name") ?? null;
    const name = resolveAuthorName(field, nativeAuthorLink);
    const portrait = text(field.author_portrait);
    const time = text(item.querySelector(".is_show_create_time")?.textContent);
    const avatar = document.createElement("img");
    avatar.className = "thread-modern-avatar";
    avatar.alt = "";
    avatar.loading = "lazy";
    if (portrait) avatar.src = tiebaAPI.URL_profile(portrait);
    else avatar.dataset.placeholder = "1";
    const authorRow = document.createElement("div");
    authorRow.className = "thread-modern-author-row";
    const authorInfo = document.createElement("span");
    authorInfo.className = "thread-modern-author";
    const homeHref = nativeAuthorLink?.href || (portrait ? tiebaAPI.URL_userHome(portrait) : "");
    const avatarLink = document.createElement("a");
    avatarLink.className = "thread-modern-avatar-link";
    avatarLink.href = homeHref;
    avatarLink.target = "_blank";
    avatarLink.rel = "noopener";
    avatarLink.append(avatar);
    const authorDetails = document.createElement("span");
    authorDetails.className = "thread-modern-author-details";
    const authorName = document.createElement("a");
    authorName.className = "thread-modern-author-name";
    authorName.href = homeHref;
    authorName.target = "_blank";
    authorName.rel = "noopener";
    authorName.textContent = name;
    authorDetails.append(authorName);
    const timeNode = document.createElement("time");
    timeNode.className = "thread-modern-time";
    timeNode.textContent = time || "刚刚";
    const age = classifyForumThreadTime(time);
    if (age) timeNode.dataset.age = age;
    authorDetails.append(timeNode);
    authorInfo.append(avatarLink, authorDetails);
    const context = forumContext();
    authorRow.append(authorInfo, createThreadMoreButton({
        tid,
        firstPostId: parseId(field.first_post_id),
        names: [name, text(field.author_nickname)],
        context,
    }));
    item.querySelector(".t_con")?.prepend(authorRow);
    item.querySelector(".threadlist_rep_num")?.setAttribute("aria-hidden", "true");
    const replyCount = text(field.reply_num ?? item.querySelector(".threadlist_rep_num")?.textContent) || "0";
    const href = item.querySelector<HTMLAnchorElement>(".j_th_tit")?.href ?? `/p/${tid}`;
    item.querySelector(".thread-modern-more")?.before(createThreadActions({ tid, href, replyCount, card: item, context }));
    item.setAttribute(FLAG, "1");
}

export function installForumThreadListModernizer(): void {
    if (currentPageType() !== "forum" || !document.documentElement.classList.contains("style-vercel")) return;
    forumThreadModernLayout.on("setter", syncForumThreadModernLayout);
    addCoalescedObserverEvent(syncForumThreadModernLayout, forumThreadsObserver);
}

export function syncForumThreadModernLayout(): void {
    const enabled = forumThreadModernLayout.get();
    const items = document.querySelectorAll<HTMLElement>(`${ROOT_SELECTOR} .j_thread_list[data-field]`);
    document.documentElement.toggleAttribute("data-forum-thread-modern", enabled);
    if (enabled) {
        items.forEach(modernize);
        return;
    }
    items.forEach(item => {
        releaseThreadActions(item);
        item.querySelector(".thread-modern-author-row")?.remove();
        item.querySelector(".thread-modern-actions")?.remove();
        item.removeAttribute(FLAG);
    });
}
