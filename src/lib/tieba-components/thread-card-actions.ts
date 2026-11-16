import { EllipsisVertical, MessageSquare, ThumbsUp, type LucideIcon } from "@lucide/vue";
import { addFavoriteTags, addFavorInstance, cancelFavorInstance, getFavoriteTagRecommendations } from "@/lib/api/tieba";
import { domrd } from "@/lib/elemental";
import { createLucideIconElement } from "@/lib/lucide";
import { setupAgreeAction } from "@/modules/thread-agree-count/agree-action";
import { saveRecentThreadAgreeState } from "@/modules/thread-agree-count/recent-state";
import { shieldList } from "@/modules/shield/shield";
import { observeForumAgree, unobserveForumAgree } from "./forum-agree-loader";

// 帖子卡片的互动部件：吧页帖子列表与搜索结果共用

export interface ThreadCardContext {
    fid: number;
    tbs: () => Promise<string>;
}

const AGREE_FLAG = "data-trex-agree-loaded";
const NATIVE_REPORT_FLAG = "data-tbr-native-report";
const FAVORITED_ATTR = "data-tbr-favorited";
const FAVORITE_PENDING_ATTR = "data-tbr-favorite-pending";
let morePopup: HTMLElement | undefined;
let moreOwner: HTMLElement | undefined;
let favoriteTagPopup: HTMLElement | undefined;
let favoriteTagOwner: HTMLElement | undefined;

export function createMetaIcon(icon: LucideIcon): SVGSVGElement {
    return createLucideIconElement(icon, {
        class: "thread-meta-icon",
        strokeWidth: 1.75,
    });
}

export interface ThreadActionsOptions {
    tid: number;
    href: string;
    replyCount: string;
    // 进入视口后再拉取点赞状态，所以需要观察的卡片节点
    card: HTMLElement;
    context: ThreadCardContext;
    // 接口已给出的点赞数，在拉到准确状态前先展示
    agreeCount?: number;
}

export function createThreadActions({ tid, href, replyCount, card, context, agreeCount }: ThreadActionsOptions): HTMLElement {
    const actions = document.createElement("div");
    actions.className = "thread-modern-actions";

    const agree = document.createElement("span");
    agree.className = "thread-modern-action thread-modern-agree agree-count-badge";
    agree.dataset.tid = String(tid);
    agree.append(createMetaIcon(ThumbsUp));
    const agreeValue = document.createElement("span");
    agreeValue.className = "thread-modern-value agree-count-value";
    agreeValue.textContent = agreeCount === undefined ? "--" : String(agreeCount);
    agree.append(agreeValue);

    const replies = document.createElement("a");
    replies.className = "thread-modern-action thread-modern-replies";
    replies.href = href;
    replies.target = "_blank";
    replies.rel = "noopener";
    replies.title = "查看评论";
    replies.append(createMetaIcon(MessageSquare));
    const replyValue = document.createElement("span");
    replyValue.className = "thread-modern-value";
    replyValue.textContent = replyCount;
    replies.append(replyValue);

    actions.append(agree, replies);
    loadAgree(card, tid, agree, context, agreeCount);
    return actions;
}

export function releaseThreadActions(card: HTMLElement): void {
    unobserveForumAgree(card);
}

export interface ThreadMoreOptions {
    tid: number;
    firstPostId?: number;
    names: string[];
    context: ThreadCardContext;
}

export function createThreadMoreButton({ tid, firstPostId, names, context }: ThreadMoreOptions): HTMLButtonElement {
    const more = document.createElement("button");
    more.type = "button";
    more.className = "thread-modern-more";
    more.setAttribute("aria-label", "更多操作");
    more.title = "更多操作";
    more.append(createMetaIcon(EllipsisVertical));
    more.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (moreOwner === more) {
            closeMoreMenu();
            return;
        }
        openMoreMenu(more, {
            favorited: more.hasAttribute(FAVORITED_ATTR),
            favoritePending: more.hasAttribute(FAVORITE_PENDING_ATTR),
            onFavorite: () => toggleFavorite(more, tid, context.fid),
            onBlock: () => addShieldUsers(names),
            onReport: () => reportThread(tid, firstPostId),
        });
    });
    return more;
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
    positionPopup(popup, owner);
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

function positionPopup(popup: HTMLElement, owner: HTMLElement): void {
    const rect = owner.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 6;
    const maxLeft = window.scrollX + window.innerWidth - popup.offsetWidth - 8;
    const left = Math.min(maxLeft, rect.right + window.scrollX - popup.offsetWidth);
    popup.style.top = `${top}px`;
    popup.style.left = `${Math.max(8, left)}px`;
}

function toggleFavorite(owner: HTMLElement, tid: number, fid: number): void {
    if (owner.hasAttribute(FAVORITE_PENDING_ATTR)) return;
    const isActive = owner.hasAttribute(FAVORITED_ATTR);
    owner.setAttribute(FAVORITE_PENDING_ATTR, "");
    const request = isActive ? cancelFavorInstance : addFavorInstance;
    void request(tid, fid).then(() => {
        owner.toggleAttribute(FAVORITED_ATTR, !isActive);
        if (isActive) closeFavoriteTagPopup();
        else showFavoriteTagPopup(owner, tid);
    }).catch(() => undefined).finally(() => {
        owner.removeAttribute(FAVORITE_PENDING_ATTR);
    });
}

interface MoreMenuOptions {
    favorited: boolean;
    favoritePending: boolean;
    onFavorite: () => void;
    onBlock: () => void;
    onReport: () => void;
}

function openMoreMenu(owner: HTMLElement, { favorited, favoritePending, onFavorite, onBlock, onReport }: MoreMenuOptions): void {
    closeMoreMenu();

    const favorite = domrd("button", {
        class: "tbr-floor-menu-item",
        type: "button",
        role: "menuitem",
    }, favorited ? "取消收藏" : "收藏");
    favorite.disabled = favoritePending;
    favorite.addEventListener("click", () => {
        closeMoreMenu();
        onFavorite();
    });

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

    const popup = domrd("div", { class: "tbr-floor-menu-popup", role: "menu" }, [favorite, report, block]);
    document.body.appendChild(popup);
    positionPopup(popup, owner);

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

function loadAgree(card: HTMLElement, tid: number, badge: HTMLElement, context: ThreadCardContext, fallbackCount?: number): void {
    observeForumAgree(card, tid, state => {
        if (badge.isConnected) {
            void applyAgreeState(badge, tid, state, context);
        }
    }, () => {
        if (!badge.isConnected) return;
        const value = badge.querySelector(".thread-modern-value");
        if (value) value.textContent = fallbackCount === undefined ? "--" : String(fallbackCount);
    });
}

async function applyAgreeState(badge: HTMLElement, tid: number, state: { count: number; liked: boolean }, context: ThreadCardContext): Promise<void> {
    const value = badge.querySelector(".thread-modern-value");
    if (value) value.textContent = String(state.count);
    if (badge.getAttribute(AGREE_FLAG) === "1") return;
    badge.setAttribute(AGREE_FLAG, "1");
    const tbs = await context.tbs().catch(() => "");
    if (!tbs || !badge.isConnected) {
        badge.removeAttribute(AGREE_FLAG);
        return;
    }
    setupAgreeAction(badge, {
        tid,
        fid: context.fid,
        objType: 3,
        tbs,
        liked: state.liked,
        count: state.count,
        onConfirmed: confirmed => saveRecentThreadAgreeState(tid, confirmed),
    });
}
