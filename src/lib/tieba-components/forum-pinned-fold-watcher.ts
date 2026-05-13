import { currentPageType } from "@/lib/api/remixed";
import { asyncdom } from "@/lib/elemental";

let installed = false;

/**
 * 吧首页：监听置顶帖折叠状态，同步 CSS class
 *
 * 贴吧原生「关闭置顶帖」会把内部 .j_thread_list 全部加 inline display:none，
 * 同时把 `<a id="thread_top_folder">` 的 inline display 从 none 切到 block。
 * 我们以此为依据，在外壳 `.thread_top_list_folder` 上加/去 class `pinned-folded`，
 * 让 CSS 直接通过 class 选择器匹配（替代不稳定的 :has() 方案），
 * 在折叠态把外壳改造为一个紧贴 .forum_content 左外侧的小展开按钮。
 *
 * 关键点：
 * - .thread_top_list_folder 由 #pagelet_frs-list/pagelet/thread_list 异步注入，
 *   脚本启动时通常还不存在，必须 await 元素就位再访问
 * - 监听 .threadlist_bright 整体子树（而非仅 folderLi），覆盖 pagelet 重渲染导致
 *   原引用失效的情况
 */
export function installForumPinnedFoldWatcher(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    void (async () => {
        if (!document.documentElement.classList.contains("style-vercel")) return;

        // 先等 .threadlist_bright 出现（pagelet 异步注入）
        const threadlist = await asyncdom<"ul">(".threadlist_bright");
        if (!threadlist) return;

        const sync = (): void => {
            const folderLi = threadlist.querySelector<HTMLLIElement>(".thread_top_list_folder");
            if (!folderLi) return;

            // 判定折叠态的依据：所有内部置顶帖都被隐藏（display:none）
            // 注意：贴吧原生 #thread_top_folder.style.display 仅在"整体折叠"那条路径会切到 block，
            // 用户通过每条帖子的 X 按钮逐条关闭时它不会被重新激活，所以不能只看 folder 锚点。
            const innerThreads = folderLi.querySelectorAll<HTMLLIElement>(".thread_top_list > li");

            // 没有任何置顶帖：直接当折叠态（小按钮可作为视觉占位，点击不做事亦无害）
            if (innerThreads.length === 0) {
                folderLi.classList.add("pinned-folded");
                return;
            }

            // 全部置顶帖都被 inline display:none → 折叠态
            const allHidden = Array.from(innerThreads).every(t => t.style.display === "none");
            folderLi.classList.toggle("pinned-folded", allHidden);
        };

        sync();

        // 在 .threadlist_bright 整个子树上监听属性 + 节点变化
        // attributes/style：贴吧通过 inline style 切换置顶帖显隐
        // childList/subtree：覆盖 folderLi 被 pagelet 重渲染替换的情况
        const obs = new MutationObserver(sync);
        obs.observe(threadlist, {
            attributes: true,
            attributeFilter: ["style"],
            childList: true,
            subtree: true,
        });
    })();
}
