import { domrd } from "@/lib/elemental";

const FLOOR_SELECTOR = ".l_post";
const REPLY_SELECTOR = ".lzl_link_unfold, .lzl_link_fold";
const COLLAPSE_SELECTOR = ".tbr-lzl-collapse";
const COMMENT_ENTRY_SELECTOR = ".j_lzl_p.btn-sub";
const COMMENT_ENTRY_CLASS = "tbr-lzl-comment-entry";
const BOUNDARY_CLASS = "tbr-lzl-collapse-boundary";
const EMPTY_PAGER_CLASS = "tbr-lzl-empty-pager";
const LIST_WITHOUT_PAGER_CLASS = "tbr-lzl-list-without-pager";
const LAST_POST_CLASS = "tbr-lzl-last-post";
const PAGER_WITH_MORE_CLASS = "tbr-lzl-pager-with-more";
const COMMENT_AFTER_EXPAND_DELAY = 320;

const nativeToggleTargets = new WeakSet<HTMLElement>();

let installed = false;

export function installLzlFloorControls(): void {
    if (installed) return;
    installed = true;
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeydown, true);
}

export function renderLzlFloorControls(): void {
    document.querySelectorAll<HTMLElement>(REPLY_SELECTOR).forEach(link => {
        link.classList.add("tbr-floor-reply");
        link.setAttribute("aria-label", "评论");
        link.title = "评论";
        if (!(link instanceof HTMLAnchorElement)) {
            link.setAttribute("role", "button");
            link.tabIndex = 0;
        }
    });

    document.querySelectorAll<HTMLElement>(COMMENT_ENTRY_SELECTOR).forEach(entry => {
        entry.classList.add(COMMENT_ENTRY_CLASS);
        entry.setAttribute("aria-hidden", "true");
        entry.tabIndex = -1;
    });

    document.querySelectorAll<HTMLElement>(".lzl_li_pager").forEach(pager => {
        const more = pager.querySelector<HTMLElement>(".lzl_more");
        const hasMore = more != null && isElementVisible(more);
        const hasPagerControls = [...pager.querySelectorAll<HTMLElement>(".j_pager a, .j_pager .tP")]
            .some(control => (control.textContent ?? "").trim() !== "" && isElementVisible(control));
        const empty = !hasMore && !hasPagerControls;
        const list = pager.parentElement;
        const posts = [...(list?.querySelectorAll<HTMLElement>(".lzl_single_post") ?? [])];
        posts.forEach(post => post.classList.remove(LAST_POST_CLASS));
        if (empty) findLastVisible(posts)?.classList.add(LAST_POST_CLASS);
        pager.classList.toggle(PAGER_WITH_MORE_CLASS, hasMore);
        pager.classList.toggle(EMPTY_PAGER_CLASS, empty);
        list?.classList.toggle(LIST_WITHOUT_PAGER_CLASS, empty);
    });

    document.querySelectorAll<HTMLElement>(".core_reply_wrapper .core_reply_border_bottom").forEach(boundary => {
        boundary.classList.add(BOUNDARY_CLASS);
        if (boundary.querySelector(COLLAPSE_SELECTOR)) return;

        const button = domrd("button", {
            class: COLLAPSE_SELECTOR.slice(1),
            type: "button",
            "aria-label": "收起回复",
            title: "收起回复",
        });
        boundary.appendChild(button);
    });
}

function handleClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const collapseButton = target.closest<HTMLElement>(COLLAPSE_SELECTOR);
    if (collapseButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        collapseFloor(collapseButton);
        return;
    }

    const reply = target.closest<HTMLElement>(REPLY_SELECTOR);
    if (!reply) return;
    if (nativeToggleTargets.delete(reply)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    commentOnFloor(reply);
}

function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target;
    if (!(target instanceof Element)) return;

    const reply = target.closest<HTMLElement>(REPLY_SELECTOR);
    if (!reply || reply instanceof HTMLAnchorElement) return;
    event.preventDefault();
    reply.click();
}

function commentOnFloor(reply: HTMLElement): void {
    const floor = reply.closest<HTMLElement>(FLOOR_SELECTOR);
    if (!floor) return;

    if (reply.classList.contains("lzl_link_unfold") && isElementVisible(reply)) {
        window.setTimeout(() => {
            requestNativeToggle(reply);
            window.setTimeout(() => {
                const editor = floor.querySelector<HTMLElement>(".j_lzl_e_c");
                if (editor && isElementVisible(editor)) return;
                floor.querySelector<HTMLElement>(COMMENT_ENTRY_SELECTOR)?.click();
            }, COMMENT_AFTER_EXPAND_DELAY);
        }, 0);
        return;
    }

    floor.querySelector<HTMLElement>(COMMENT_ENTRY_SELECTOR)?.click();
}

function collapseFloor(button: HTMLElement): void {
    const floor = button.closest<HTMLElement>(FLOOR_SELECTOR);
    const collapseLink = floor?.querySelector<HTMLElement>(".lzl_link_fold");
    if (!collapseLink) return;
    requestNativeToggle(collapseLink);
}

function requestNativeToggle(target: HTMLElement): void {
    nativeToggleTargets.add(target);
    target.click();
    nativeToggleTargets.delete(target);
}

function isElementVisible(element: HTMLElement): boolean {
    let current: HTMLElement | null = element;
    while (current) {
        if (current.hidden
            || current.getAttribute("aria-hidden") === "true"
            || current.style.display === "none"
            || current.classList.contains("hideLzl")) return false;
        if (current.classList.contains("lzl_post_hidden") && current.style.display !== "block") return false;
        current = current.parentElement;
    }
    return true;
}

function findLastVisible(elements: HTMLElement[]): HTMLElement | undefined {
    for (let index = elements.length - 1; index >= 0; index--) {
        if (isElementVisible(elements[index])) return elements[index];
    }
}
