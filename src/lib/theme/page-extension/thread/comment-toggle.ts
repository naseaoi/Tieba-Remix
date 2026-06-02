import { unsafeWindow as importedUnsafeWindow } from "$";
import { waitUntil } from "@/lib/utils";

const WRAPPER_SELECTOR = ".core_reply_wrapper, .j_lzl_container";
const TOGGLING_CLASS = "tbr-lzl-toggling";
const FALLBACK_DURATION = 280;
const SAFETY_BUFFER = 120;
const PATCH_FLAG = "__tbrLzlTogglePatched";
const JQUERY_WAIT_TIMEOUT = 15_000;

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
        [key: string]: unknown;
    };
}

const aborts = new WeakMap<HTMLElement, () => void>();

let installed = false;

export function setupCommentToggleAnimation(): void {
    if (installed) return;
    installed = true;

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

function patchSlideMethods(jquery: JQueryStatic): void {
    const fn = jquery.fn;
    if (fn[PATCH_FLAG]) return;

    const originalSlideUp = fn.slideUp;
    const originalSlideDown = fn.slideDown;
    const originalSlideToggle = fn.slideToggle;

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

function expand(element: HTMLElement, complete?: () => void): void {
    abortRunning(element);
    element.style.display = "";

    if (prefersReducedMotion()) {
        resetInlineStyles(element);
        complete?.call(element);
        return;
    }

    const targetHeight = element.scrollHeight;
    element.classList.add(TOGGLING_CLASS);
    element.style.height = "0px";
    element.style.opacity = "0";
    void element.offsetHeight;
    element.style.height = `${targetHeight}px`;
    element.style.opacity = "1";

    whenSettled(element, () => {
        resetInlineStyles(element);
        complete?.call(element);
    });
}

function collapse(element: HTMLElement, complete?: () => void): void {
    abortRunning(element);

    if (prefersReducedMotion()) {
        element.style.display = "none";
        resetInlineStyles(element);
        complete?.call(element);
        return;
    }

    element.classList.add(TOGGLING_CLASS);
    element.style.height = `${element.scrollHeight}px`;
    element.style.opacity = "1";
    void element.offsetHeight;
    element.style.height = "0px";
    element.style.opacity = "0";

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
