import { navBarHideMode } from "@/lib/user-values";
import _ from "@/lib/utils/_";

export const NAV_TOP_COLLAPSED_ATTR = "nav-top-collapsed";

let installed = false;

// 滚动隐藏模式：与 nav-bar 协同，首次由用户向下滚动后永久收紧为导航栏预留的顶部空白
// 只认滚轮、触摸、键盘触发的滚动，避免锚点跳转、恢复滚动位置等程序滚动误触发
export function installNavTopCollapse(): void {
    if (installed) return;
    installed = true;

    const html = document.documentElement;
    let collapsed = false;
    let lastScrollY = 0;
    let userScrollIntent = false;
    const markUserScrollIntent = () => {
        userScrollIntent = true;
    };
    const markKeyboardScrollIntent = (event: KeyboardEvent) => {
        if (["ArrowDown", "PageDown", "End", " "].includes(event.key)) userScrollIntent = true;
    };
    window.addEventListener("wheel", markUserScrollIntent, { passive: true });
    window.addEventListener("touchstart", markUserScrollIntent, { passive: true });
    window.addEventListener("keydown", markKeyboardScrollIntent);

    const handle = _.throttle(function () {
        if (collapsed) return;
        if (navBarHideMode.get() !== "fold") return;
        const scrollY = window.scrollY;
        if (!userScrollIntent) {
            lastScrollY = scrollY;
            return;
        }
        if (scrollY > lastScrollY && scrollY > 8) {
            html.toggleAttribute(NAV_TOP_COLLAPSED_ATTR, true);
            collapsed = true;
        }
        lastScrollY = scrollY;
    }, 100);
    window.addEventListener("scroll", handle, { passive: true });

    navBarHideMode.on("setter", (mode) => {
        if (mode !== "fold") {
            html.removeAttribute(NAV_TOP_COLLAPSED_ATTR);
            collapsed = false;
            lastScrollY = window.scrollY;
        }
    });
}
