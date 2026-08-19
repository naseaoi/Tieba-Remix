import { GM_registerMenuCommand, waitForCoreMonkeyApis } from "@/lib/monkey";
import _ from "@/lib/utils/_";
import "user-view/build/index.css";
import { checkUpdateAndNotify, currentPageType, setTheme } from "./lib/api/remixed";
import { openSettingsDialog } from "./lib/common/open-settings";
import { parseUserModules } from "./lib/common/packer";
import type { BootstrapSignal } from "./lib/legacy-redirect";
import { forumThreadsObserver, legacyIndexFeedsObserver, threadCommentsObserver, threadFloorsObserver } from "./lib/observers";
import { darkPrefers, loadDynamicCSS, loadMainCSS, setStyleTheme } from "./lib/theme";
import { installForumAsideCollapse } from "./lib/tieba-components/forum-aside-collapse";
import { installForumAuthorFullId } from "./lib/tieba-components/forum-author-full-id";
import { installForumFloatingSearch } from "./lib/tieba-components/forum-floating-search";
import { installForumImageTakeover } from "./lib/tieba-components/forum-image-takeover";
import { installForumLoadFailureBanner } from "./lib/tieba-components/forum-load-failure-banner";
import { installForumNovelRankingFallback } from "./lib/tieba-components/forum-novel-ranking";
import { installForumPinnedFoldWatcher } from "./lib/tieba-components/forum-pinned-fold-watcher";
import { installForumStatsCard } from "./lib/tieba-components/forum-stats-card";
import { installForumThumbnailRecovery } from "./lib/tieba-components/forum-thumbnail-recovery";
import { installForumVideoFit } from "./lib/tieba-components/forum-video-fit";
import { installForumLiveThreadCollapse } from "./lib/tieba-components/forum-live-thread-collapse";
import { installForumThreadListModernizer } from "./lib/tieba-components/forum-thread-list-modernizer";
import { decorateFloatBarTooltips, floatBar } from "./lib/tieba-components/float-bar";
import { installThreadFloorActions } from "./lib/tieba-components/thread-floor-actions";
import { installThreadFloorTag } from "./lib/tieba-components/thread-floor-tag";
import { installThreadImageGrid } from "./lib/tieba-components/thread-image-grid";
import { installThreadImageLoading, refreshThreadImageLoading } from "./lib/tieba-components/thread-image-loading";
import { installSymbolFontStatus } from "./lib/symbol-font-status";
import { REMIXED, glassEffect, navBarHideMode, pageExtension, showBottomEditor, styleTheme, themeType } from "./lib/user-values";
import { AllModules, waitUntil } from "./lib/utils";
import { userModuleManifests } from "./modules/manifest";

export function bootstrap(signal: BootstrapSignal) {
    void waitForCoreMonkeyApis().then(() => {
        GM_registerMenuCommand("设置", () => { void openSettingsDialog(); });
    });
    startBootstrap(signal);
}

function startBootstrap({ onReady }: BootstrapSignal) {
    installSymbolFontStatus();

    setTheme(themeType.get());
    setStyleTheme(styleTheme.get());
    darkPrefers.addEventListener("change", () => setTheme(themeType.get()));

    document.documentElement.toggleAttribute("glass-effect", glassEffect.get());

    document.documentElement.dataset.navBarMode = navBarHideMode.get();

    document.documentElement.dataset.pageType = currentPageType();

    installThreadImageLoading();

    installForumImageTakeover();

    installForumAsideCollapse();

    installForumPinnedFoldWatcher();

    installForumStatsCard();

    installForumLoadFailureBanner();

    installForumNovelRankingFallback();

    installForumThumbnailRecovery();

    installForumVideoFit();

    installForumLiveThreadCollapse();

    installForumThreadListModernizer();

    installForumAuthorFullId();

    installForumFloatingSearch();

    installThreadFloorTag();

    installThreadFloorActions();

    installThreadImageGrid();

    const cssReady = Promise.all([loadDynamicCSS(), loadMainCSS()]);

    const pageExtensionReady = loadPageExtension().finally(() => refreshThreadImageLoading());
    const modulesReady = parseUserModules(
        userModuleManifests,
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

    const firstPaintReady = Promise.all([cssReady, pageExtensionReady, modulesReady]);
    firstPaintReady.then(
        () => requestAnimationFrame(() => requestAnimationFrame(onReady)),
        onReady,
    );

    window.addEventListener("load", function () {
        checkUpdateAndNotify();
    });

    waitUntil(() => !(document.body == null)).then(function () {
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

        document.addEventListener("click", (e) => {
            const target = (e.target as HTMLElement).closest(".tbui_fbar_top");
            if (target) {
                e.preventDefault();
                e.stopPropagation();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }, true);

        waitUntil(() => !(floatBar.get() == null)).then(() => {
            decorateFloatBarTooltips();
        });
    });

    console.info(REMIXED);
}

async function loadPageExtension() {
    switch (currentPageType()) {
        case "index": {
            const { default: index } = await import("./lib/theme/page-extension/index");
            return index();
        }

        case "thread": {
            const { default: thread } = await import("./lib/theme/page-extension/thread");
            return thread();
        }

        default:
            return;
    }
}
