import { GM_registerMenuCommand } from "$";
import _ from "lodash";
import "user-view/build/index.css";
import Settings from "./components/settings.vue";
import { checkUpdateAndNotify, currentPageType, setTheme } from "./lib/api/remixed";
import { parseUserModules } from "./lib/common/packer";
import { setupLegacyRedirect, BootstrapSignal } from "./lib/legacy-redirect";
import { forumThreadsObserver, legacyIndexFeedsObserver, threadCommentsObserver, threadFloorsObserver } from "./lib/observers";
import { renderDialog } from "./lib/render";
import { darkPrefers, loadDynamicCSS, loadMainCSS, setStyleTheme } from "./lib/theme";
import index from "./lib/theme/page-extension/index";
import thread from "./lib/theme/page-extension/thread";
import { installForumAsideCollapse } from "./lib/tieba-components/forum-aside-collapse";
import { installForumAuthorFullId } from "./lib/tieba-components/forum-author-full-id";
import { installForumImageTakeover } from "./lib/tieba-components/forum-image-takeover";
import { installForumPinnedFoldWatcher } from "./lib/tieba-components/forum-pinned-fold-watcher";
import { decorateFloatBarTooltips, floatBar } from "./lib/tieba-components/float-bar";
import { installThreadFloorTag } from "./lib/tieba-components/thread-floor-tag";
import { installThreadImageGrid } from "./lib/tieba-components/thread-image-grid";
import { REMIXED, glassEffect, navBarHideMode, pageExtension, showBottomEditor, styleTheme, themeType } from "./lib/user-values";
import { AllModules, waitUntil } from "./lib/utils";

// 新版贴吧（SPA）会让旧版选择器全部失效；先判定版本，旧版才执行主流程。
// 新版页面下完全不注入任何 CSS / 属性，避免破坏 SPA 渲染，由 setupLegacyRedirect 自身负责切换 cookie + reload。
setupLegacyRedirect(bootstrap);

function bootstrap({ onReady }: BootstrapSignal) {
    // 尽早完成主题设置，降低闪屏概率
    setTheme(themeType.get());
    setStyleTheme(styleTheme.get());
    darkPrefers.addEventListener("change", () => setTheme(themeType.get()));

    // 同步磨砂玻璃质感开关到 <html glass-effect>
    document.documentElement.toggleAttribute("glass-effect", glassEffect.get());

    // 同步导航栏隐藏模式到 <html data-nav-bar-mode="...">，供 CSS 按模式收紧顶部空白
    document.documentElement.dataset.navBarMode = navBarHideMode.get();

    // 将页面类型标记到 <html data-page-type="..."> 上，供 CSS 按页面类型限定作用域。
    // 这样 vercel/tieba-thread.scss 等"虽然按文件名属于某页"但实际全局注入的样式，
    // 可以通过 html[data-page-type="..."] 真正约束在对应页面，避免误伤其它页面。
    document.documentElement.dataset.pageType = currentPageType();

    // 吧首页：Vercel 主题下接管缩略图点击 → 复用项目内大图查看器
    installForumImageTakeover();

    // 吧首页：右侧栏 region 默认折叠 + 点击展开
    installForumAsideCollapse();

    // 吧首页：监听置顶帖折叠状态，给 .thread_top_list_folder 同步 .pinned-folded class
    installForumPinnedFoldWatcher();

    // 吧首页：还原帖子列表中被贴吧后端截断的发帖人 ID（从 href?un= 解码）
    installForumAuthorFullId();

    // 帖子页：给"X 楼"的 .tail-info 打 .vercel-floor-tag 标记，供 vercel 主题装饰胶囊
    installThreadFloorTag();

    // 帖子页：一行多图智能排列（包成 grid，删除组内 <br>）
    installThreadImageGrid();

    const cssReady = Promise.all([loadDynamicCSS(), loadMainCSS()]);

    const indexReady = index();
    const threadReady = thread();
    const modulesReady = parseUserModules(
        import.meta.glob("./modules/**/index.ts"),
        module => {
            AllModules().push(module);
        }
    );

    const startObservers = () => {
        if (currentPageType() === "thread") {
            threadFloorsObserver.observe();
            threadCommentsObserver.observe();
        }
        if (currentPageType() === "index") {
            if (!pageExtension.get().index)
                legacyIndexFeedsObserver.observe();
        }
        if (currentPageType() === "forum") {
            forumThreadsObserver.observe();
        }
    };
    if (document.readyState !== "loading") {
        startObservers();
    } else {
        document.addEventListener("DOMContentLoaded", startObservers, { once: true });
    }

    const firstPaintReady = Promise.all([cssReady, indexReady, threadReady, modulesReady]);
    firstPaintReady.then(
        () => requestAnimationFrame(() => requestAnimationFrame(onReady)),
        onReady,
    );

    window.addEventListener("load", function () {
        checkUpdateAndNotify();
    });

    // 收缩视图检测
    waitUntil(() => !_.isNil(document.body)).then(function () {
        // 吧首页底部发帖模块隐藏
        if (!showBottomEditor.get()) {
            document.body.toggleAttribute("hide-bottom-editor", true);
        }

        const syncHtmlScrollLock = () => {
            const next = document.body.hasAttribute("no-scrollbar") ? "hidden" : "scroll";
            document.documentElement.style.setProperty("overflow-y", next, "important");
        };
        new MutationObserver(syncHtmlScrollLock).observe(document.body, {
            attributes: true,
            attributeFilter: ["no-scrollbar"],
        });
        syncHtmlScrollLock();

        // 回顶按钮平滑滚动
        document.addEventListener("click", (e) => {
            const target = (e.target as HTMLElement).closest(".tbui_fbar_top");
            if (target) {
                e.preventDefault();
                e.stopPropagation();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }, true);

        waitUntil(() => !_.isNil(floatBar.get())).then(() => {
            decorateFloatBarTooltips();
        });
    });

    GM_registerMenuCommand("设置", () => renderDialog(Settings));

    console.info(REMIXED);
}
