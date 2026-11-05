import { unsafeWindow as importedUnsafeWindow } from "$";
import { currentPageType } from "@/lib/api/remixed";
import { pageExtension } from "@/lib/user-values";
import { waitUntil } from "@/lib/utils";

// 原生广告曝光统计（adsense/widget/loader 的 allPost/_viewStats）每次 scroll 都对全部楼层执行 offset()/height()，
// 隐藏楼层还会经 jQuery swap 强制同步重算样式，是帖子页滚动掉帧的主因；按处理函数源码识别，源码变化时自动失效而不误伤
const AD_TRACKER_SOURCE = /^function\s*\(\)\s*\{\s*\w+\(\)&&(?:\w+\(\)&&)?\(clearTimeout\(\w+\),\w+=setTimeout\(\w+,200\)\)\s*\}$/;
// 头部搜索建议框每次 scroll/resize 都测量输入框；帖子页扩展隐藏了 .head_inner，测量隐藏元素会经 jQuery swap 逐帧强制重排
const SUGGESTION_EVENTS_MODULE = "common/widget/suggestion/events.js?class";
const WAIT_TIMEOUT = 15_000;

type Handler = ((...args: unknown[]) => unknown) & { guid?: number };

export interface JQueryEventHost {
    (target: Window): { off(type: string, handler: Handler): unknown };
    _data(elem: unknown, key: string): Record<string, { handler: Handler }[] | undefined> | undefined;
    event: { add: (elem: unknown, types: unknown, handler: unknown, ...rest: unknown[]) => unknown };
}

interface TiebaPageWindow extends Window {
    jQuery?: JQueryEventHost;
    F?: { require(path: string): unknown };
    common?: { suggestion?: unknown };
}

let installed = false;

export function installThreadNativeScrollBlock(): void {
    if (installed || currentPageType() !== "thread") return;
    installed = true;
    const win = pageWindow();
    void waitUntil(() => win.jQuery != null, WAIT_TIMEOUT)
        .then(async () => {
            const jquery = win.jQuery!;
            blockAdScrollTrackers(jquery, win);
            if (!pageExtension.get().thread) return;
            // F.require 会把尚未定义的模块标记为已初始化，必须等建议框实例创建后再查询
            await waitUntil(() => win.common?.suggestion != null, WAIT_TIMEOUT);
            const guid = suggestionFixSizeGuid(win);
            if (guid !== undefined) unbindWindowHandlers(jquery, win, ["scroll", "resize"], handler => handler.guid === guid);
        })
        .catch(() => undefined);
}

export function blockAdScrollTrackers(jquery: JQueryEventHost, win: Window): void {
    const isTracker = (handler: unknown): handler is Handler =>
        typeof handler === "function" && AD_TRACKER_SOURCE.test(Function.prototype.toString.call(handler));

    const add = jquery.event.add;
    jquery.event.add = function (this: unknown, elem, types, handler, ...rest) {
        if (elem === win && typeof types === "string" && /(?:^|\s)scroll(?:\s|$)/.test(types) && isTracker(handler)) return;
        return add.call(this, elem, types, handler, ...rest);
    };

    unbindWindowHandlers(jquery, win, ["scroll"], isTracker);
}

export function unbindWindowHandlers(jquery: JQueryEventHost, win: Window, types: string[], match: (handler: Handler) => boolean): void {
    const events = jquery._data(win, "events");
    for (const type of types) {
        events?.[type]
            ?.filter(entry => match(entry.handler))
            .forEach(entry => jquery(win).off(type, entry.handler));
    }
}

function suggestionFixSizeGuid(win: TiebaPageWindow): number | undefined {
    try {
        const module = win.F?.require(SUGGESTION_EVENTS_MODULE) as { cls?: { prototype?: { fixSize?: Handler } } } | undefined;
        return module?.cls?.prototype?.fixSize?.guid;
    } catch {
        return undefined;
    }
}

function pageWindow(): TiebaPageWindow {
    return ((importedUnsafeWindow as Window | undefined) ?? window) as TiebaPageWindow;
}
