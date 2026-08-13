import { currentPageType } from "@/lib/api/remixed";
import { domrd } from "@/lib/elemental";
import { threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { shieldList } from "@/modules/shield/shield";
import { installLzlReplyToggle } from "./lzl-reply-toggle";
import "./thread-floor-actions.css";

const REPLY_CLASS = "tbr-floor-reply";
const MENU_CLASS = "tbr-floor-menu";
const MENU_BOUND = "data-tbr-floor-menu";

let installed = false;
let popupEl: HTMLElement | undefined;
let popupOwner: HTMLElement | undefined;

export function installThreadFloorActions(): void {
    if (installed) return;
    if (currentPageType() !== "thread") return;
    installed = true;
    installLzlReplyToggle();

    const run = (): void => {
        renderReplyControls();
        renderFloorMenus();
        normalizeLocationText();
        renderPlatformIcons();
    };
    const refresh = (): void => {
        run();
        window.setTimeout(run, 100);
    };
    threadFloorsObserver.addEvent(refresh);
    threadCommentsObserver.addEvent(refresh);
    run();
    window.setTimeout(run, 100);
}

function renderReplyControls(): void {
    document.querySelectorAll<HTMLElement>(".lzl_link_unfold, .lzl_link_fold").forEach(link => {
        const active = link.classList.contains("lzl_link_fold");
        link.classList.add(REPLY_CLASS);
        link.setAttribute("aria-label", active ? "收起回复" : "回复");
        link.title = active ? "收起回复" : "回复";
    });

    document.querySelectorAll<HTMLElement>(".p_reply_first").forEach(link => {
        link.classList.add(REPLY_CLASS);
        link.setAttribute("aria-label", "回复");
        link.title = "回复";
    });

    document.querySelectorAll<HTMLElement>(".lzl_content_reply .lzl_s_r").forEach(link => {
        link.classList.add(REPLY_CLASS);
        link.setAttribute("aria-label", "回复");
        link.title = "回复";
    });
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
        setupFloorMenu(menu, reportLink);
    });
}

function setupFloorMenu(menu: HTMLElement, reportTarget: HTMLElement | null): void {
    let allowReport = false;

    if (reportTarget && reportTarget !== menu) {
        reportTarget.addEventListener("click", event => {
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
        openMenu(menu, doReport, doBlock);
    }

    function doReport(): void {
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

function openMenu(owner: HTMLElement, onReport: () => void, onBlock: () => void): void {
    closeMenu();

    const report = domrd("button", { class: "tbr-floor-menu-item", type: "button", role: "menuitem" });
    report.textContent = "举报";
    report.addEventListener("click", onReport);

    const block = domrd("button", { class: "tbr-floor-menu-item tbr-floor-menu-item-danger", type: "button", role: "menuitem" });
    block.textContent = "拉黑";
    block.addEventListener("click", onBlock);

    const popup = domrd("div", { class: "tbr-floor-menu-popup", role: "menu" }, [report, block]);
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
            node.textContent = text.replace(/^(\s*)IP属地[:：]\s*/, "$1");
        });
    });
}

function renderPlatformIcons(): void {
    document.querySelectorAll<HTMLElement>(".post-tail-wrap .tail-info, .core_reply_tail .tail-info, .core_reply_tail .p_tail_wap").forEach(elem => {
        if (elem.dataset.tbrPlatform === "mobile") return;
        const text = (elem.textContent ?? "").trim();
        if (!text.includes("客户端")) return;

        if (!/Android|iPhone|iPad/i.test(text)) return;

        elem.setAttribute("data-tbr-platform", "mobile");
        elem.title = text;
    });
}
