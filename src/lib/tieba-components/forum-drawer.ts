import { X } from "@lucide/vue";
import { createLucideIconElement } from "@/lib/lucide";

export interface ForumDrawer {
    open: () => void;
}

export function createForumDrawer(content: HTMLElement): ForumDrawer {
    const root = document.createElement("div");
    root.className = "trex-forum-drawer";
    root.hidden = true;

    const backdrop = document.createElement("div");
    backdrop.className = "trex-forum-drawer-backdrop";

    const panel = document.createElement("section");
    panel.className = "trex-forum-drawer-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "本吧详情");

    const header = document.createElement("header");
    header.className = "trex-forum-drawer-header";
    const title = document.createElement("h2");
    title.textContent = "本吧详情";
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "trex-forum-drawer-close";
    closeButton.title = "关闭";
    closeButton.setAttribute("aria-label", "关闭");
    closeButton.append(createLucideIconElement(X, { size: 18 }));
    header.append(title, closeButton);

    const body = document.createElement("div");
    body.className = "trex-forum-drawer-body";
    // 整体移动节点而非克隆，保留页面脚本绑定在内容上的事件
    body.append(content);

    panel.append(header, body);
    root.append(backdrop, panel);
    document.body.append(root);

    let lastFocus: Element | null = null;

    const close = (): void => {
        if (root.dataset.open !== "true") return;
        delete root.dataset.open;
        // user-view 关闭弹窗时以页面上是否残留 [aria-modal] 判断能否解除滚动锁，常驻会导致滚动永久锁死
        panel.removeAttribute("aria-modal");
        document.removeEventListener("keydown", onKeydown);
        root.addEventListener("transitionend", () => {
            if (root.dataset.open !== "true") root.hidden = true;
        }, { once: true });
        if (lastFocus instanceof HTMLElement) lastFocus.focus();
    };

    const onKeydown = (event: KeyboardEvent): void => {
        if (event.key === "Escape") close();
    };

    const open = (): void => {
        if (root.dataset.open === "true") return;
        lastFocus = document.activeElement;
        root.hidden = false;
        // 先让 hidden 移除生效，再切换状态以触发过渡
        void root.offsetWidth;
        root.dataset.open = "true";
        panel.setAttribute("aria-modal", "true");
        document.addEventListener("keydown", onKeydown);
        closeButton.focus();
    };

    backdrop.addEventListener("click", close);
    closeButton.addEventListener("click", close);

    return { open };
}
