import { currentPageType } from "@/lib/api/remixed";
import { asyncdom } from "@/lib/elemental";
import { FORUM_PAGELET_TIMEOUT_MS } from "./forum";

const MODULE_SELECTOR = ".aside_region, #novel-ranking";
const HEADER_SELECTOR = ".region_header, .novel-ranking-frs-title";

let installed = false;

export function installForumAsideCollapse(): void {
    if (installed || currentPageType() !== "forum") return;
    installed = true;

    const setup = async (): Promise<void> => {
        if (!document.documentElement.classList.contains("style-vercel")) return;

        const aside = await asyncdom<"div">(".aside", undefined, FORUM_PAGELET_TIMEOUT_MS);
        if (!aside) return;

        initCollapseAll(aside);

        aside.addEventListener("click", event => {
            const target = event.target as Element | null;
            const header = target?.closest<HTMLElement>(HEADER_SELECTOR);
            if (!header || !aside.contains(header) || target?.closest("a")) return;

            toggleModule(header);
        });

        aside.addEventListener("keydown", event => {
            if (event.key !== "Enter" && event.key !== " ") return;

            const target = event.target as Element | null;
            const header = target?.closest<HTMLElement>(HEADER_SELECTOR);
            if (!header || target !== header || !aside.contains(header)) return;

            event.preventDefault();
            toggleModule(header);
        });

        const observer = new MutationObserver(() => initCollapseAll(aside));
        observer.observe(aside, { childList: true, subtree: true });
    };

    void setup();
}

function initCollapseAll(root: ParentNode): void {
    root.querySelectorAll<HTMLElement>(MODULE_SELECTOR).forEach(module => {
        if (module.dataset.collapseInit === "true") return;

        module.dataset.collapseInit = "true";
        setCollapsed(module, false);

        const header = module.querySelector<HTMLElement>(HEADER_SELECTOR);
        if (!header) return;

        header.setAttribute("role", "button");
        header.tabIndex = 0;
    });
}

function toggleModule(header: HTMLElement): void {
    const module = header.closest<HTMLElement>(MODULE_SELECTOR);
    if (!module) return;

    setCollapsed(module, module.dataset.collapsed !== "true");
}

function setCollapsed(module: HTMLElement, collapsed: boolean): void {
    if (collapsed) {
        module.dataset.collapsed = "true";
    } else {
        delete module.dataset.collapsed;
    }
    module.querySelector<HTMLElement>(HEADER_SELECTOR)?.setAttribute("aria-expanded", String(!collapsed));
}
