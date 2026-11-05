import { List, StretchHorizontal, type LucideIcon } from "@lucide/vue";
import { domrd } from "@/lib/elemental";
import { createLucideIconElement } from "@/lib/lucide";
import { forumThreadDensity, type ForumThreadDensity } from "@/lib/user-values";

const DENSITY_ATTR = "data-forum-thread-density";
const OPTION_SELECTOR = ".trex-thread-density-option";

const MODES: { value: ForumThreadDensity; label: string; icon: LucideIcon }[] = [
    { value: "card", label: "卡片视图", icon: StretchHorizontal },
    { value: "compact", label: "紧凑视图", icon: List },
];

let installed = false;

export function installForumThreadDensity(): void {
    if (installed) return;
    installed = true;
    syncDensity(forumThreadDensity.get());
    forumThreadDensity.on("setter", syncDensity);
}

export function createForumThreadDensityToggle(): HTMLElement {
    const group = domrd("div", { class: "trex-thread-density-group", role: "group", "aria-label": "列表密度" });
    MODES.forEach(mode => {
        const button = domrd("button", {
            type: "button",
            class: OPTION_SELECTOR.slice(1),
            title: mode.label,
            "aria-label": mode.label,
            "data-density": mode.value,
        });
        button.append(createLucideIconElement(mode.icon, { size: 14, strokeWidth: 1.75 }));
        button.addEventListener("click", () => forumThreadDensity.set(mode.value));
        group.append(button);
    });
    syncButtons(group, forumThreadDensity.get());
    return group;
}

function syncDensity(density: ForumThreadDensity): void {
    document.documentElement.setAttribute(DENSITY_ATTR, density);
    syncButtons(document, density);
}

function syncButtons(root: ParentNode, density: ForumThreadDensity): void {
    root.querySelectorAll<HTMLElement>(OPTION_SELECTOR).forEach(button => {
        const active = button.dataset.density === density;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}
