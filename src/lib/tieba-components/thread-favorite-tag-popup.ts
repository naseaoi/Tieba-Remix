const POPUP_SELECTOR = ".recommend_outtest_container";
const VISIBLE_ANCHOR_SELECTORS = [
    ".toggle-panel .panel-button[title=\"收藏\"]",
    ".module-settings",
    ".tbui_fbar_favor > a",
    ".j_favor",
];

let installed = false;
let positionFrame = 0;

function isVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return style.display !== "none"
        && style.visibility !== "hidden"
        && rect.width > 0
        && rect.height > 0;
}

function getAnchor(): HTMLElement | undefined {
    for (const selector of VISIBLE_ANCHOR_SELECTORS) {
        const anchor = document.querySelector<HTMLElement>(selector);
        if (anchor && isVisible(anchor)) return anchor;
    }
    return undefined;
}

function positionPopup(): void {
    positionFrame = 0;
    const popup = document.querySelector<HTMLElement>(POPUP_SELECTOR);
    if (!popup || !isVisible(popup)) return;

    const anchor = getAnchor();
    if (!anchor) {
        popup.style.top = "16px";
        popup.style.left = `${Math.max(8, window.innerWidth - popup.offsetWidth - 16)}px`;
        return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const gap = 8;
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const placeLeft = anchorRect.left >= popupWidth + gap + 8;
    const rawLeft = placeLeft ? anchorRect.left - popupWidth - gap : anchorRect.right + gap;
    const rawTop = anchorRect.top + (anchorRect.height - popupHeight) / 2;
    const left = Math.min(Math.max(8, rawLeft), window.innerWidth - popupWidth - 8);
    const top = Math.min(Math.max(8, rawTop), window.innerHeight - popupHeight - 8);

    popup.style.left = `${Math.round(left)}px`;
    popup.style.top = `${Math.round(top)}px`;
}

function schedulePosition(): void {
    if (positionFrame !== 0) return;
    positionFrame = requestAnimationFrame(positionPopup);
}

function hasRelevantNode(record: MutationRecord): boolean {
    return [...record.addedNodes].some(node => {
        if (!(node instanceof HTMLElement)) return false;
        return node.matches(POPUP_SELECTOR)
            || !!node.querySelector(POPUP_SELECTOR)
            || node.matches(".toggle-panel")
            || !!node.querySelector(".toggle-panel");
    });
}

export function installThreadFavoriteTagPopup(): void {
    if (installed) return;
    installed = true;

    const installObserver = (): void => {
        if (!document.body) return;

        const observer = new MutationObserver(records => {
            if (records.some(hasRelevantNode)) schedulePosition();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener("resize", schedulePosition);
        window.addEventListener("scroll", schedulePosition, true);
        schedulePosition();
    };

    if (document.body) installObserver();
    else document.addEventListener("DOMContentLoaded", installObserver, { once: true });
}
