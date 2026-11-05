import { currentPageType } from "@/lib/api/remixed";
import { EllipsisVertical, MessageSquare, Smartphone, type LucideIcon } from "@lucide/vue";
import { domrd } from "@/lib/elemental";
import { createLucideIconElement } from "@/lib/lucide";
import { addCoalescedObserverEvent, threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { shieldList } from "@/modules/shield/shield";
import { installLzlFloorControls, renderLzlFloorControls } from "./lzl-floor-controls";
import { installLzlReplyToggle } from "./lzl-reply-toggle";
import "./thread-floor-actions.css";

const REPLY_CLASS = "tbr-floor-reply";
const MENU_CLASS = "tbr-floor-menu";
const MENU_BOUND = "data-tbr-floor-menu";
const NATIVE_REPORT_FLAG = "data-tbr-native-report";
const DELETE_LINK = ".p_post_del_my, .lzl_delate_in";
// 在 JS 中识别而非用 CSS :has()：:has() 后接后代选择器会让任意内联 style 变更触发全页样式重算
const CLIENT_DOWNLOAD_LINK = "a[href*=\"c.tieba.baidu.com/c/s/download/pc\"]";

let installed = false;
let popupEl: HTMLElement | undefined;
let popupOwner: HTMLElement | undefined;

export function installThreadFloorActions(): void {
    if (installed) return;
    if (currentPageType() !== "thread") return;
    installed = true;
    installLzlReplyToggle();
    installLzlFloorControls();

    const run = (): void => {
        renderLzlFloorControls();
        renderReplyControls();
        renderFloorMenus();
        normalizeLocationText();
        renderPlatformIcons();
    };
    addCoalescedObserverEvent(run, threadFloorsObserver, threadCommentsObserver);
}

function renderReplyControls(): void {
    // 楼层的展开/收起链接只负责发表评论，标签由 renderLzlFloorControls 统一写入
    document.querySelectorAll<HTMLElement>(".j_lzl_r .lzl_link_unfold, .j_lzl_r .lzl_link_fold").forEach(link => {
        markReplyControl(link);
    });

    document.querySelectorAll<HTMLElement>(".p_reply_first, .lzl_content_reply .lzl_s_r").forEach(link => {
        markReplyControl(link, "回复");
    });
}

// 每帧都会执行：同值写入 class/属性也会产生变动记录并触发样式失效
function markReplyControl(link: HTMLElement, label?: string): void {
    if (!link.classList.contains(REPLY_CLASS)) link.classList.add(REPLY_CLASS);
    prependActionIcon(link, MessageSquare);
    if (label === undefined) return;
    if (link.getAttribute("aria-label") !== label) link.setAttribute("aria-label", label);
    if (link.title !== label) link.title = label;
}

function renderFloorMenus(): void {
    document.querySelectorAll<HTMLElement>(".post-tail-wrap .j_jb_ele, .core_reply_tail:not(.clearfix) .j_jb_ele").forEach(menu => {
        if (menu.hasAttribute(MENU_BOUND)) return;

        const legacyTail = menu.closest<HTMLElement>(".core_reply_tail:not(.clearfix)");
        const reportLink = menu.querySelector<HTMLAnchorElement>("a");
        if (legacyTail) legacyTail.appendChild(menu);

        menu.setAttribute(MENU_BOUND, "");
        menu.classList.add(MENU_CLASS);
        menu.setAttribute("aria-label", "更多操作");
        menu.title = "更多操作";
        prependActionIcon(reportLink ?? menu, EllipsisVertical);
        setupFloorMenu(menu, reportLink ?? menu);
    });

    document.querySelectorAll<HTMLElement>(".lzl_content_reply .lzl_jb").forEach(menu => {
        if (menu.hasAttribute(MENU_BOUND)) return;

        const reportLink = menu.querySelector<HTMLAnchorElement>("a");
        if (!reportLink) return;

        menu.setAttribute(MENU_BOUND, "");
        menu.classList.add(MENU_CLASS);
        menu.setAttribute("aria-label", "更多操作");
        menu.title = "更多操作";
        prependActionIcon(reportLink, EllipsisVertical);
        setupFloorMenu(menu, reportLink);
    });
}

function setupFloorMenu(menu: HTMLElement, reportTarget: HTMLElement | null): void {
    let allowReport = false;
    // 自己的发言原生放的是删除链接
    const isOwnPost = reportTarget?.matches(DELETE_LINK) === true;

    if (reportTarget && reportTarget !== menu) {
        reportTarget.addEventListener("click", event => {
            if (reportTarget.hasAttribute(NATIVE_REPORT_FLAG)) return;
            if (allowReport) {
                allowReport = false;
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            toggle();
        }, true);
    }

    menu.addEventListener("click", event => {
        if (allowReport) {
            allowReport = false;
            return;
        }
        const target = event.target as Node;
        if (reportTarget && reportTarget !== menu && (target === reportTarget || reportTarget.contains(target))) return;
        event.preventDefault();
        event.stopPropagation();
        toggle();
    });

    function toggle(): void {
        if (popupOwner === menu) {
            closeMenu();
            return;
        }
        openMenu(menu, isOwnPost
            ? [{ label: "删除", danger: true, run: runNativeAction }]
            : [{ label: "举报", run: runNativeAction }, { label: "拉黑", danger: true, run: doBlock }]);
    }

    function runNativeAction(): void {
        closeMenu();
        if (!reportTarget) return;
        allowReport = true;
        reportTarget.click();
    }

    function doBlock(): void {
        closeMenu();
        blockFloorAuthor(menu);
    }
}

interface MenuItem {
    label: string;
    danger?: boolean;
    run: () => void;
}

function openMenu(owner: HTMLElement, items: MenuItem[]): void {
    closeMenu();

    const buttons = items.map(item => {
        const button = domrd("button", {
            class: item.danger ? "tbr-floor-menu-item tbr-floor-menu-item-danger" : "tbr-floor-menu-item",
            type: "button",
            role: "menuitem",
        }, item.label);
        button.addEventListener("click", item.run);
        return button;
    });

    const popup = domrd("div", { class: "tbr-floor-menu-popup", role: "menu" }, buttons);
    document.body.appendChild(popup);
    positionPopup(popup, owner);

    popupEl = popup;
    popupOwner = owner;
    requestAnimationFrame(() => {
        document.addEventListener("click", onDocClick, true);
        document.addEventListener("keydown", onDocKey, true);
    });
}

function closeMenu(): void {
    document.removeEventListener("click", onDocClick, true);
    document.removeEventListener("keydown", onDocKey, true);
    popupEl?.remove();
    popupEl = undefined;
    popupOwner = undefined;
}

function onDocClick(event: Event): void {
    const target = event.target as Node;
    if (popupEl?.contains(target) || popupOwner?.contains(target)) return;
    closeMenu();
}

function onDocKey(event: KeyboardEvent): void {
    if (event.key === "Escape") closeMenu();
}

function positionPopup(popup: HTMLElement, owner: HTMLElement): void {
    const rect = owner.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 6;
    const left = rect.right + window.scrollX - popup.offsetWidth;
    popup.style.top = `${top}px`;
    popup.style.left = `${Math.max(8, left)}px`;
}

function blockFloorAuthor(menu: HTMLElement): void {
    const name = getMenuAuthorName(menu);
    if (!name) return;

    const list = shieldList.get();
    if (list.some(rule => rule.scopes.includes("username") && rule.content === name)) return;

    shieldList.set([...list, { content: name, type: "text", scopes: ["username"], toggle: true }]);
}

function getMenuAuthorName(menu: HTMLElement): string | undefined {
    const subPostName = menu.closest<HTMLElement>(".lzl_single_post")?.querySelector<HTMLElement>(".at")?.textContent?.trim();
    if (subPostName) return subPostName.replace(/:$/, "");

    return menu.closest<HTMLElement>(".l_post")?.querySelector<HTMLElement>(".p_author_name")?.textContent?.trim();
}

function normalizeLocationText(): void {
    document.querySelectorAll<HTMLElement>(".post-tail-wrap > span, .post-tail-wrap .tail-info, .core_reply_tail .ip-location, .core_reply_tail .ip-location span, .core_reply_tail .p_tail_txt").forEach(elem => {
        elem.childNodes.forEach(node => {
            if (node.nodeType !== Node.TEXT_NODE) return;
            const text = node.textContent ?? "";
            const normalized = text.replace(/^(\s*)IP属地[:：]\s*/, "$1");
            // 每帧都会执行：只在内容变化时写入，避免无谓的样式与布局失效
            if (normalized !== text) node.textContent = normalized;
        });
    });
}

function renderPlatformIcons(): void {
    document.querySelectorAll<HTMLElement>(".post-tail-wrap .tail-info, .core_reply_tail .tail-info, .core_reply_tail .p_tail_wap, .lzl_content_reply .tbr-lzl-source").forEach(elem => {
        const text = (elem.title || elem.textContent || "").trim();
        if (!/移动端|Android|iPhone|iPad/i.test(text) && !elem.querySelector(CLIENT_DOWNLOAD_LINK)) return;

        if (elem.getAttribute("data-tbr-platform") !== "mobile") elem.setAttribute("data-tbr-platform", "mobile");
        if (elem.title !== text) elem.title = text;
        prependActionIcon(elem, Smartphone);
    });
}

function prependActionIcon(target: Element, icon: LucideIcon): void {
    if (target.querySelector(":scope > .tbr-action-icon")) return;
    target.prepend(createLucideIconElement(icon, {
        class: "tbr-action-icon",
        strokeWidth: 1.75,
    }));
}
