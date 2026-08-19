import { currentPageType } from "@/lib/api/remixed";
import { EllipsisVertical, MessageSquare, Star, ThumbsUp, type LucideIcon } from "@lucide/vue";
import { domrd } from "@/lib/elemental";
import { createLucideIconElement } from "@/lib/lucide";
import { addFavoriteTags, addFavorInstance, cancelFavorInstance, getFavoriteTagRecommendations, tiebaAPI } from "@/lib/api/tieba";
import { addCoalescedObserverEvent, forumThreadsObserver } from "@/lib/observers";
import { forumThreadModernLayout } from "@/lib/user-values";
import { setupAgreeAction } from "@/modules/thread-agree-count/agree-action";
import { saveRecentThreadAgreeState } from "@/modules/thread-agree-count/recent-state";
import { shieldList } from "@/modules/shield/shield";
import { observeForumAgree, unobserveForumAgree } from "./forum-agree-loader";
import { getForumAuthorName, isTruncatedForumAuthorName } from "./forum-author-full-id";

const ROOT_SELECTOR = "#pagelet_frs-list\\/pagelet\\/thread";
const FLAG = "data-trex-modernized";
const AGREE_FLAG = "data-trex-agree-loaded";
const NATIVE_REPORT_FLAG = "data-tbr-native-report";
let morePopup: HTMLElement | undefined;
let moreOwner: HTMLElement | undefined;
let favoriteTagPopup: HTMLElement | undefined;
let favoriteTagOwner: HTMLElement | undefined;

const ICON_LIKE = ThumbsUp;
const ICON_COMMENT = MessageSquare;
const ICON_FAVORITE = Star;
const ICON_MORE = EllipsisVertical;

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

function createMetaIcon(icon: LucideIcon): SVGSVGElement {
    return createLucideIconElement(icon, {
        class: "thread-meta-icon",
        strokeWidth: 1.75,
    });
}

function createFooter(item: HTMLElement, tid: number, replyCount: string): void {
    const footer = document.createElement("div");
    footer.className = "thread-modern-footer";

    const agree = document.createElement("span");
    agree.className = "thread-modern-action thread-modern-agree agree-count-badge";
    agree.dataset.tid = String(tid);
    agree.append(createMetaIcon(ICON_LIKE));
    const agreeValue = document.createElement("span");
    agreeValue.className = "thread-modern-value agree-count-value";
    agreeValue.textContent = "--";
    agree.append(agreeValue);

    const replies = document.createElement("a");
    replies.className = "thread-modern-action thread-modern-replies";
    replies.href = item.querySelector<HTMLAnchorElement>(".j_th_tit")?.href ?? `/p/${tid}`;
    replies.target = "_blank";
    replies.rel = "noopener";
    replies.title = "查看评论";
    replies.append(createMetaIcon(ICON_COMMENT));
    const replyValue = document.createElement("span");
    replyValue.className = "thread-modern-value";
    replyValue.textContent = replyCount;
    replies.append(replyValue);

    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "thread-modern-action thread-modern-favorite";
    favorite.title = "收藏帖子";
    favorite.append(createMetaIcon(ICON_FAVORITE));
    const favoriteLabel = document.createElement("span");
    favoriteLabel.className = "thread-modern-label";
    favoriteLabel.textContent = "收藏";
    favorite.append(favoriteLabel);
    favorite.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (favorite.disabled) return;
        favorite.disabled = true;
        const isActive = favorite.classList.contains("is-active");
        const request = isActive ? cancelFavorInstance : addFavorInstance;
        void request(tid, Number(PageData.forum.forum_id || PageData.forum.id)).then(() => {
            favorite.classList.toggle("is-active", !isActive);
            favorite.title = isActive ? "收藏帖子" : "取消收藏";
            favoriteLabel.textContent = isActive ? "收藏" : "已收藏";
            if (isActive) closeFavoriteTagPopup();
            else showFavoriteTagPopup(favorite, tid);
        }).catch(() => undefined).finally(() => {
            favorite.disabled = false;
        });
    });

    footer.append(agree, replies, favorite);
    item.querySelector(".t_con")?.append(footer);
    loadAgree(item, tid, agree);
}

function showFavoriteTagPopup(owner: HTMLElement, tid: number): void {
    closeFavoriteTagPopup();

    const label = domrd("label", { class: "thread-modern-tag-label" }, "添加标签");
    const input = domrd("input", {
        class: "thread-modern-tag-input",
        type: "text",
        maxlength: "30",
        placeholder: "多个标签用空格分隔",
    });
    const add = domrd("button", { class: "thread-modern-tag-add", type: "button" }, "添加");
    const recommendations = domrd("div", { class: "thread-modern-tag-recommendations" });
    const popup = domrd("div", {
        class: "thread-modern-tag-popup",
        role: "dialog",
        "aria-label": "添加帖子标签",
    }, [label, input, recommendations, add]);

    add.addEventListener("click", () => {
        const tags = [...new Set(input.value.trim().split(/\s+/).filter(Boolean))];
        if (tags.length === 0 || tags.length > 3 || tags.join("").length > 30) return;
        add.disabled = true;
        void addFavoriteTags(tid, tags).then(() => {
            closeFavoriteTagPopup();
        }).catch(() => undefined).finally(() => {
            add.disabled = false;
        });
    });

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") add.click();
    });

    document.body.appendChild(popup);
    positionFavoriteTagPopup(popup, owner);
    favoriteTagPopup = popup;
    favoriteTagOwner = owner;
    requestAnimationFrame(() => {
        document.addEventListener("click", onFavoriteTagDocumentClick, true);
        document.addEventListener("keydown", onFavoriteTagDocumentKey, true);
    });
    input.focus();

    void getFavoriteTagRecommendations(tid).then(tags => {
        tags.forEach(tag => {
            const recommendation = domrd("button", { class: "thread-modern-tag-recommendation", type: "button" }, tag);
            recommendation.addEventListener("click", () => {
                input.value = [...new Set(`${input.value} ${tag}`.trim().split(/\s+/))].join(" ");
                input.focus();
            });
            recommendations.append(recommendation);
        });
    }).catch(() => undefined);
}

function closeFavoriteTagPopup(): void {
    document.removeEventListener("click", onFavoriteTagDocumentClick, true);
    document.removeEventListener("keydown", onFavoriteTagDocumentKey, true);
    favoriteTagPopup?.remove();
    favoriteTagPopup = undefined;
    favoriteTagOwner = undefined;
}

function onFavoriteTagDocumentClick(event: Event): void {
    const target = event.target as Node;
    if (favoriteTagPopup?.contains(target) || favoriteTagOwner?.contains(target)) return;
    closeFavoriteTagPopup();
}

function onFavoriteTagDocumentKey(event: KeyboardEvent): void {
    if (event.key === "Escape") closeFavoriteTagPopup();
}

function positionFavoriteTagPopup(popup: HTMLElement, owner: HTMLElement): void {
    const rect = owner.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 6;
    const maxLeft = window.scrollX + window.innerWidth - popup.offsetWidth - 8;
    const left = Math.min(maxLeft, rect.right + window.scrollX - popup.offsetWidth);
    popup.style.top = `${top}px`;
    popup.style.left = `${Math.max(8, left)}px`;
}

function createMoreButton(tid: number, firstPostId: number | undefined, names: string[]): HTMLButtonElement {
    const more = document.createElement("button");
    more.type = "button";
    more.className = "thread-modern-more";
    more.setAttribute("aria-label", "更多操作");
    more.title = "更多操作";
    more.append(createMetaIcon(ICON_MORE));
    more.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (moreOwner === more) {
            closeMoreMenu();
            return;
        }
        openMoreMenu(more, () => addShieldUsers(names), () => reportThread(tid, firstPostId));
    });
    return more;
}

function openMoreMenu(owner: HTMLElement, onBlock: () => void, onReport: () => void): void {
    closeMoreMenu();

    const block = domrd("button", { class: "tbr-floor-menu-item tbr-floor-menu-item-danger", type: "button", role: "menuitem" }, "拉黑");
    block.addEventListener("click", () => {
        closeMoreMenu();
        onBlock();
    });

    const report = domrd("button", { class: "tbr-floor-menu-item", type: "button", role: "menuitem" }, "举报");
    report.addEventListener("click", () => {
        closeMoreMenu();
        onReport();
    });

    const popup = domrd("div", { class: "tbr-floor-menu-popup", role: "menu" }, [block, report]);
    document.body.appendChild(popup);
    positionMoreMenu(popup, owner);

    morePopup = popup;
    moreOwner = owner;
    requestAnimationFrame(() => {
        document.addEventListener("click", onMoreDocumentClick, true);
        document.addEventListener("keydown", onMoreDocumentKey, true);
    });
}

function closeMoreMenu(): void {
    document.removeEventListener("click", onMoreDocumentClick, true);
    document.removeEventListener("keydown", onMoreDocumentKey, true);
    morePopup?.remove();
    morePopup = undefined;
    moreOwner = undefined;
}

function onMoreDocumentClick(event: Event): void {
    const target = event.target as Node;
    if (morePopup?.contains(target) || moreOwner?.contains(target)) return;
    closeMoreMenu();
}

function onMoreDocumentKey(event: KeyboardEvent): void {
    if (event.key === "Escape") closeMoreMenu();
}

function positionMoreMenu(popup: HTMLElement, owner: HTMLElement): void {
    const rect = owner.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 6;
    const maxLeft = window.scrollX + window.innerWidth - popup.offsetWidth - 8;
    const left = Math.min(maxLeft, rect.right + window.scrollX - popup.offsetWidth);
    popup.style.top = `${top}px`;
    popup.style.left = `${Math.max(8, left)}px`;
}

function addShieldUsers(names: string[]): void {
    const uniqueNames = [...new Set(names.map(name => name.trim()).filter(Boolean))];
    if (uniqueNames.length === 0) return;

    const rules = shieldList.get();
    const additions = uniqueNames
        .filter(name => !rules.some(rule => rule.type === "text" && rule.content === name && rule.scopes.includes("username")))
        .map(name => ({ content: name, type: "text" as const, scopes: ["username" as const], toggle: true }));
    if (additions.length > 0) shieldList.set([...rules, ...additions]);
}

function reportThread(tid: number, firstPostId?: number): void {
    const threadUrl = new URL(`/p/${tid}`, location.origin).href;
    const reportWindow = window.open(threadUrl, "_blank");
    if (!reportWindow) {
        window.location.assign(threadUrl);
        return;
    }

    const tryReport = (): void => {
        if (reportWindow.closed) return;
        let target: HTMLAnchorElement | null = null;
        if (firstPostId != null) {
            target = reportWindow.document.querySelector<HTMLAnchorElement>(`.l_post[data-pid="${firstPostId}"] .j_jb_ele a`);
        }
        target ??= reportWindow.document.querySelector<HTMLAnchorElement>(".l_post .j_jb_ele a");
        if (target) {
            target.setAttribute(NATIVE_REPORT_FLAG, "1");
            target.click();
            return;
        }
        reportWindow.setTimeout(tryReport, 200);
    };

    reportWindow.addEventListener("load", tryReport, { once: true });
    reportWindow.setTimeout(tryReport, 300);
}

function loadAgree(item: HTMLElement, tid: number, badge: HTMLElement): void {
    observeForumAgree(item, tid, state => {
        if (badge.isConnected) {
            applyAgreeState(badge, tid, state);
        }
    }, () => {
        if (!badge.isConnected) return;
        const value = badge.querySelector(".thread-modern-value");
        if (value) value.textContent = "--";
    });
}

function applyAgreeState(badge: HTMLElement, tid: number, state: { count: number; liked: boolean }): void {
    const value = badge.querySelector(".thread-modern-value");
    if (value) value.textContent = String(state.count);
    if (badge.getAttribute(AGREE_FLAG) === "1") return;
    badge.setAttribute(AGREE_FLAG, "1");
    setupAgreeAction(badge, {
        tid,
        fid: Number(PageData.forum.forum_id || PageData.forum.id),
        objType: 3,
        tbs: PageData.tbs,
        liked: state.liked,
        count: state.count,
        onConfirmed: confirmed => saveRecentThreadAgreeState(tid, confirmed),
    });
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
        unobserveForumAgree(item);
        item.querySelector(".thread-modern-author-row")?.remove();
        item.querySelector(".thread-modern-footer")?.remove();
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
    authorDetails.append(timeNode);
    authorInfo.append(avatarLink, authorDetails);
    authorRow.append(authorInfo, createMoreButton(tid, parseId(field.first_post_id), [name, text(field.author_nickname)]));
    item.querySelector(".t_con")?.prepend(authorRow);
    item.querySelector(".threadlist_rep_num")?.setAttribute("aria-hidden", "true");
    const replyCount = text(field.reply_num ?? item.querySelector(".threadlist_rep_num")?.textContent) || "0";
    createFooter(item, tid, replyCount);
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
        unobserveForumAgree(item);
        item.querySelector(".thread-modern-author-row")?.remove();
        item.querySelector(".thread-modern-footer")?.remove();
        item.removeAttribute(FLAG);
    });
}
