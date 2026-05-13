import { currentPageType } from "@/lib/api/remixed";

let installed = false;

/**
 * 吧首页：右侧栏 .aside_region 默认折叠，点击标题切换展开
 *
 * - 仅在吧首页且 Vercel 主题下生效（CSS 折叠态选择器 `[data-collapsed="true"]` 也仅在
 *   `html.style-vercel` 作用域内生效，因此其他主题下即使打了属性也不会有视觉变化）
 * - 通过在 .aside_region 上加 `data-collapsed="true"` 标记折叠态，CSS 控制内容显隐
 * - 监听 .aside 容器的 DOM 变化，处理动态加载的 region（如 pagelet 异步注入）
 */
export function installForumAsideCollapse(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    const onReady = (): void => {
        if (!document.documentElement.classList.contains("style-vercel")) return;

        const aside = document.querySelector<HTMLDivElement>(".aside");
        if (!aside) return;

        // 给已存在的 region 设置初始折叠态
        initCollapseAll(aside);

        // 事件代理：点击标题切换折叠
        aside.addEventListener("click", (e) => {
            const target = e.target as Element | null;
            if (!target?.closest) return;

            const header = target.closest<HTMLElement>(".region_header");
            if (!header) return;

            // 标题内的链接（如 [管理]、查看详情）保留原有跳转行为
            if ((e.target as Element).closest("a")) return;

            const region = header.closest<HTMLElement>(".aside_region");
            if (!region) return;

            const collapsed = region.dataset.collapsed === "true";
            if (collapsed) {
                delete region.dataset.collapsed;
            } else {
                region.dataset.collapsed = "true";
            }
        });

        // 监听异步注入的 aside_region（pagelet 懒加载）
        const observer = new MutationObserver(() => initCollapseAll(aside));
        observer.observe(aside, { childList: true, subtree: true });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady);
    } else {
        onReady();
    }
}

function initCollapseAll(root: ParentNode): void {
    root.querySelectorAll<HTMLElement>(".aside_region").forEach(region => {
        // 已处理过的不重复设置，避免覆盖用户手动展开过的状态
        if (region.dataset.collapseInit === "true") return;
        region.dataset.collapseInit = "true";
        region.dataset.collapsed = "true";
    });
}
