import { GM_addStyle } from "@/lib/monkey";
import { waitUntil } from "@/lib/utils";

export default {
    id: "nologin-tieba",
    name: "免登录浏览",
    author: "锯条",
    version: "1.0",
    brief: "免登录浏览贴吧",
    description: `始终伪装为已登录状态，并屏蔽百度登录提示框，让免登录浏览和已登录基本一致`,
    scope: ["index", "forum", "thread"],
    runAt: "afterHead",
    entry: main,
} as UserModule;

function main() {
    hideLoginPopup();
    void waitUntil(() => typeof PageData !== "undefined" && Boolean(PageData.user), 10_000)
        .then(() => {
            if (PageData.user.is_login) return;
            PageData.user.is_login = 1;
        })
        .catch(() => {});
}

function hideLoginPopup() {
    GM_addStyle("#tiebaCustomPassLogin, .tieba-custom-pass-login { display: none !important; visibility: hidden !important; pointer-events: none !important; }");

    const hide = (): void => {
        const popups = document.querySelectorAll<HTMLElement>("#tiebaCustomPassLogin, .tieba-custom-pass-login");
        if (popups.length > 0) document.body?.removeAttribute("no-scrollbar");

        popups.forEach(popup => {
            if (popup.style.getPropertyValue("display") !== "none" || popup.style.getPropertyPriority("display") !== "important") {
                popup.style.setProperty("display", "none", "important");
            }
            if (popup.style.getPropertyValue("visibility") !== "hidden" || popup.style.getPropertyPriority("visibility") !== "important") {
                popup.style.setProperty("visibility", "hidden", "important");
            }
        });
    };

    hide();
    new MutationObserver(hide).observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
}
