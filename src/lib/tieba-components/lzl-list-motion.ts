export const LZL_STATIC_ATTR = "data-tbr-lzl-static";

const DURATION = 280;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";

interface Running {
    cancel(): void;
}

const running = new WeakMap<HTMLElement, Running>();

// 建树、回复目标和楼层控件都由 observer 在后续微任务 / 帧中补齐，最终高度要等它们落定再测，否则结束时会回弹
export function animateLzlListChange(list: HTMLElement, mutate: () => void): void {
    const wrapper = list.closest<HTMLElement>(".core_reply_wrapper");
    if (!wrapper || !canAnimate(wrapper)) {
        mutate();
        return;
    }

    const start = wrapper.getBoundingClientRect().height;
    running.get(wrapper)?.cancel();
    const shown = new Set(visibleRows(list));
    mutate();
    visibleRows(list).filter(row => !shown.has(row)).forEach(row => {
        row.setAttribute(LZL_STATIC_ATTR, "");
        row.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION, easing: "ease-out" });
    });

    const extra = boxExtra(wrapper);
    const inlineHeight = wrapper.style.height;
    wrapper.style.setProperty("overflow", "hidden", "important");
    wrapper.style.height = `${start - extra}px`;
    let animation: Animation | undefined;
    let frame = 0;
    const cleanup = (): void => {
        window.cancelAnimationFrame(frame);
        animation?.cancel();
        wrapper.style.removeProperty("overflow");
        wrapper.style.height = inlineHeight;
        if (running.get(wrapper) === entry) running.delete(wrapper);
    };
    const entry: Running = { cancel: cleanup };
    running.set(wrapper, entry);

    frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(() => {
            wrapper.style.height = inlineHeight;
            const end = wrapper.getBoundingClientRect().height;
            if (Math.abs(end - start) < 1) {
                cleanup();
                return;
            }
            animation = wrapper.animate(
                [{ height: `${start - extra}px` }, { height: `${end - extra}px` }],
                { duration: DURATION, easing: EASING },
            );
            animation.onfinish = () => {
                animation = undefined;
                cleanup();
            };
        });
    });
}

function canAnimate(wrapper: HTMLElement): boolean {
    if (typeof wrapper.animate !== "function") return false;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    // 整体展开 / 收起动画进行中时由其负责高度
    return !wrapper.classList.contains("tbr-lzl-toggling") && !wrapper.classList.contains("hideLzl");
}

function visibleRows(list: HTMLElement): HTMLElement[] {
    return [...list.querySelectorAll<HTMLElement>(":scope > li:not([hidden]):not(.lzl_li_pager)")];
}

function boxExtra(element: HTMLElement): number {
    const style = getComputedStyle(element);
    if (style.boxSizing === "border-box") return 0;
    return parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
        + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
}
