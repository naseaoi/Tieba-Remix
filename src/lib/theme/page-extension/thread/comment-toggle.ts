import { unsafeWindow as importedUnsafeWindow } from "$";
import { installLzlReplyToggle } from "@/lib/tieba-components/lzl-reply-toggle";
import { waitUntil } from "@/lib/utils";

const LIST_SELECTOR = ".core_reply_wrapper, .j_lzl_container";
const EDITOR_SELECTOR = ".lzl_editor_container";
const WRAPPER_SELECTOR = `${LIST_SELECTOR}, ${EDITOR_SELECTOR}`;
const SUBPOST_SELECTOR = "li.j_lzl_s_p";
const TOGGLING_CLASS = "tbr-lzl-toggling";
const FALLBACK_DURATION = 280;
const SAFETY_BUFFER = 120;
const PATCH_FLAG = "__tbrLzlTogglePatched";
const JQUERY_WAIT_TIMEOUT = 15_000;
const TOGGLE_EDGE_PROPS = ["padding-top", "padding-bottom", "margin-top", "margin-bottom"];

interface JQuerySet {
    length: number;
    filter(selector: string): JQuerySet;
    each(callback: (index: number, element: HTMLElement) => void): JQuerySet;
}

type SlideMethod = (this: JQuerySet, ...args: unknown[]) => JQuerySet;

interface JQueryStatic {
    fn: {
        slideUp: SlideMethod;
        slideDown: SlideMethod;
        slideToggle: SlideMethod;
        show: SlideMethod;
        hide: SlideMethod;
        toggle: SlideMethod;
        [key: string]: unknown;
    };
}

const aborts = new WeakMap<HTMLElement, () => void>();

let installed = false;

export function setupCommentToggleAnimation(): void {
    if (installed) return;
    installed = true;

    setupEditorSwitchFix();
    installLzlReplyToggle(collapse);

    void waitUntil(() => pageJQuery() != null, JQUERY_WAIT_TIMEOUT)
        .then(() => {
            const jquery = pageJQuery();
            if (jquery) patchSlideMethods(jquery);
        })
        .catch(() => undefined);
}

function pageWindow(): Window & typeof globalThis {
    return (importedUnsafeWindow as (Window & typeof globalThis) | undefined) ?? window;
}

function pageJQuery(): JQueryStatic | undefined {
    return (pageWindow() as unknown as { jQuery?: JQueryStatic }).jQuery;
}

function prefersReducedMotion(): boolean {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

interface LzlEditorLike {
    _lzl?: { _loadLzlContent?: (target: unknown) => void } | null;
    cur_sec?: { css?: (prop: string) => string } | null;
}

// 编辑框已打开时点击其他楼层的「我也说一句」，先把原生 cur_optdom 同步到点击楼层
function setupEditorSwitchFix(): void {
    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const entry = target.closest(".j_lzl_p");
        if (!entry) return;

        const win = pageWindow() as unknown as { LzlEditor?: LzlEditorLike; jQuery?: (el: Element) => unknown };
        const lzlEditor = win.LzlEditor;
        const jquery = win.jQuery;
        if (!lzlEditor || typeof jquery !== "function") return;

        const openLzl = lzlEditor._lzl;
        const editorSection = lzlEditor.cur_sec;
        if (!openLzl || typeof openLzl._loadLzlContent !== "function") return;
        if (!editorSection || editorSection.css?.("display") === "none") return;

        try {
            openLzl._loadLzlContent(jquery(entry));
        } catch {
            // 原生方法异常时跳过
        }
    }, true);
}

function patchSlideMethods(jquery: JQueryStatic): void {
    const fn = jquery.fn;
    if (fn[PATCH_FLAG]) return;

    const originalSlideUp = fn.slideUp;
    const originalSlideDown = fn.slideDown;
    const originalSlideToggle = fn.slideToggle;
    const originalShow = fn.show;
    const originalHide = fn.hide;
    const originalToggle = fn.toggle;

    fn.slideUp = function (this: JQuerySet, ...args: unknown[]): JQuerySet {
        if (!matchesWrapper(this)) return originalSlideUp.apply(this, args);
        const complete = resolveComplete(args);
        this.each((_, element) => collapse(element, complete));
        return this;
    };

    fn.slideDown = function (this: JQuerySet, ...args: unknown[]): JQuerySet {
        if (!matchesWrapper(this)) return originalSlideDown.apply(this, args);
        const complete = resolveComplete(args);
        this.each((_, element) => expand(element, complete));
        return this;
    };

    fn.slideToggle = function (this: JQuerySet, ...args: unknown[]): JQuerySet {
        if (!matchesWrapper(this)) return originalSlideToggle.apply(this, args);
        const complete = resolveComplete(args);
        this.each((_, element) => {
            (isHidden(element) ? expand : collapse)(element, complete);
        });
        return this;
    };

    fn.show = function (this: JQuerySet, ...args: unknown[]): JQuerySet {
        if (!matchesWrapper(this)) return originalShow.apply(this, args);
        const complete = resolveComplete(args);
        this.each((_, element) => expand(element, complete));
        return this;
    };

    fn.hide = function (this: JQuerySet, ...args: unknown[]): JQuerySet {
        if (!matchesWrapper(this)) return originalHide.apply(this, args);
        const complete = resolveComplete(args);
        this.each((_, element) => collapse(element, complete));
        return this;
    };

    fn.toggle = function (this: JQuerySet, ...args: unknown[]): JQuerySet {
        if (!matchesWrapper(this)) return originalToggle.apply(this, args);
        const complete = resolveComplete(args);
        this.each((_, element) => {
            (isHidden(element) ? expand : collapse)(element, complete);
        });
        return this;
    };

    fn[PATCH_FLAG] = true;
}

function matchesWrapper(set: JQuerySet): boolean {
    try {
        return set.filter(WRAPPER_SELECTOR).length > 0;
    } catch {
        return false;
    }
}

function resolveComplete(args: unknown[]): (() => void) | undefined {
    for (let i = args.length - 1; i >= 0; i--) {
        if (typeof args[i] === "function") return args[i] as () => void;
    }
    return undefined;
}

function isHidden(element: HTMLElement): boolean {
    return element.style.display === "none" || getComputedStyle(element).display === "none";
}

function isEditorContainer(element: HTMLElement): boolean {
    return element.classList.contains("lzl_editor_container");
}

// 编辑器容器在列表祖先隐藏时随列表的展开动画一并显示，自身瞬时显示
function revealsWithList(element: HTMLElement): boolean {
    if (!isEditorContainer(element)) return false;
    const list = element.closest(LIST_SELECTOR);
    return list instanceof HTMLElement && isHidden(list);
}

// 楼层无楼中楼回复时编辑器随列表的收起动画一并隐藏，自身瞬时隐藏
function collapsesWithList(element: HTMLElement): boolean {
    if (!isEditorContainer(element)) return false;
    const list = element.closest(LIST_SELECTOR);
    return list instanceof HTMLElement && list.querySelector(SUBPOST_SELECTOR) == null;
}

function expand(element: HTMLElement, complete?: () => void): void {
    abortRunning(element);
    element.style.display = "";

    if (revealsWithList(element) || prefersReducedMotion()) {
        resetInlineStyles(element);
        complete?.call(element);
        return;
    }

    clearVerticalEdges(element);
    const edges = readVerticalEdges(element);
    const targetHeight = element.scrollHeight;
    element.classList.add(TOGGLING_CLASS);
    element.style.boxSizing = "border-box";
    element.style.height = "0px";
    element.style.opacity = "0";
    collapseVerticalEdges(element);
    void element.offsetHeight;
    element.style.height = `${targetHeight}px`;
    element.style.opacity = "1";
    setVerticalEdges(element, edges);

    whenSettled(element, () => {
        element.style.height = "auto";
        element.style.boxSizing = "";
        element.classList.remove(TOGGLING_CLASS);
        element.style.opacity = "";
        clearVerticalEdges(element);
        complete?.call(element);
    });
}

function collapse(element: HTMLElement, complete?: () => void): void {
    abortRunning(element);

    if (collapsesWithList(element) || prefersReducedMotion()) {
        element.style.display = "none";
        resetInlineStyles(element);
        complete?.call(element);
        return;
    }

    const edges = readVerticalEdges(element);
    element.classList.add(TOGGLING_CLASS);
    element.style.boxSizing = "border-box";
    element.style.height = `${element.scrollHeight}px`;
    element.style.opacity = "1";
    setVerticalEdges(element, edges);
    void element.offsetHeight;
    element.style.height = "0px";
    element.style.opacity = "0";
    collapseVerticalEdges(element);

    whenSettled(element, () => {
        element.style.display = "none";
        resetInlineStyles(element);
        complete?.call(element);
    });
}

function resetInlineStyles(element: HTMLElement): void {
    element.classList.remove(TOGGLING_CLASS);
    element.style.height = "";
    element.style.opacity = "";
    element.style.boxSizing = "";
    clearVerticalEdges(element);
}

function readVerticalEdges(element: HTMLElement): Record<string, string> {
    const style = getComputedStyle(element);
    const edges: Record<string, string> = {};
    for (const prop of TOGGLE_EDGE_PROPS) edges[prop] = style.getPropertyValue(prop);
    return edges;
}

function setVerticalEdges(element: HTMLElement, edges: Record<string, string>): void {
    for (const prop of TOGGLE_EDGE_PROPS) element.style.setProperty(prop, edges[prop], "important");
}

function collapseVerticalEdges(element: HTMLElement): void {
    for (const prop of TOGGLE_EDGE_PROPS) element.style.setProperty(prop, "0px", "important");
}

function clearVerticalEdges(element: HTMLElement): void {
    for (const prop of TOGGLE_EDGE_PROPS) element.style.removeProperty(prop);
}

function whenSettled(element: HTMLElement, onSettled: () => void): void {
    let settled = false;
    let timer = 0;

    const onTransitionEnd = (event: TransitionEvent): void => {
        if (event.target === element && event.propertyName === "height") complete();
    };

    function detach(): void {
        window.clearTimeout(timer);
        element.removeEventListener("transitionend", onTransitionEnd);
    }

    function complete(): void {
        if (settled) return;
        settled = true;
        detach();
        if (aborts.get(element) === abort) aborts.delete(element);
        onSettled();
    }

    function abort(): void {
        if (settled) return;
        settled = true;
        detach();
    }

    timer = window.setTimeout(complete, transitionDurationMs(element) + SAFETY_BUFFER);
    element.addEventListener("transitionend", onTransitionEnd);
    aborts.set(element, abort);
}

function abortRunning(element: HTMLElement): void {
    aborts.get(element)?.();
}

function transitionDurationMs(element: HTMLElement): number {
    const seconds = parseFloat(getComputedStyle(element).transitionDuration);
    return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : FALLBACK_DURATION;
}
