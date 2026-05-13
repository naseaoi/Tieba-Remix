import { openThreadImages } from "@/components/images-viewer";
import { currentPageType } from "@/lib/api/remixed";

let installed = false;

/**
 * 吧首页：接管原生「点击缩略图打开预览框」→ 调用项目内 imagesViewer 大图查看器
 *
 * - 仅在 Vercel 主题且当前为吧首页时生效（每次 click 检查 html.style-vercel）
 * - 使用 capture 阶段拦截，先于贴吧原生处理器执行；preventDefault + stopPropagation 阻断原生预览框
 * - 从最近的 `[data-tid]` 父节点取 tid，从 `.threadlist_media > li` 顺序计算图片索引
 */
export function installForumImageTakeover(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    document.addEventListener("click", function (e) {
        if (!document.documentElement.classList.contains("style-vercel")) return;

        const target = e.target as Element | null;
        if (!target?.closest) return;

        const picLi = target.closest<HTMLLIElement>(".threadlist_media > li");
        if (!picLi) return;

        const threadLi = picLi.closest<HTMLLIElement>(".j_thread_list[data-tid]");
        if (!threadLi) return;

        const tid = Number(threadLi.dataset.tid);
        if (!Number.isFinite(tid) || tid <= 0) return;

        const mediaList = picLi.parentElement;
        if (!mediaList) return;
        const index = Math.max(0, Array.prototype.indexOf.call(mediaList.children, picLi));

        e.preventDefault();
        e.stopPropagation();

        openThreadImages(tid, index);
    }, { capture: true });
}
