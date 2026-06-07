import { GM_addStyle } from "@/lib/monkey";
import { waitUntil } from "@/lib/utils";

export const LOGIN_POPUP_VISIBLE_ATTR = "data-trex-login-popup-visible";

const LOGIN_POPUP_SELECTOR = "#tiebaCustomPassLogin, .tieba-custom-pass-login";
const LOGIN_POPUP_CSS_SELECTOR = ":is(#tiebaCustomPassLogin, .tieba-custom-pass-login)";
const LOGIN_POPUP_CLOSE_SELECTOR = `${LOGIN_POPUP_CSS_SELECTOR} .close-btn`;

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
    bindLoginPopupClose();
    void waitUntil(() => typeof PageData !== "undefined" && Boolean(PageData.user), 10_000)
        .then(() => {
            if (PageData.user.is_login) return;
            PageData.user.is_login = 1;
        })
        .catch(() => {});
}

function hideLoginPopup() {
    GM_addStyle(`:root:not([${LOGIN_POPUP_VISIBLE_ATTR}="true"]) ${LOGIN_POPUP_CSS_SELECTOR} { display: none !important; visibility: hidden !important; pointer-events: none !important; }
:root[${LOGIN_POPUP_VISIBLE_ATTR}="true"] ${LOGIN_POPUP_CSS_SELECTOR} { display: block !important; visibility: visible !important; pointer-events: auto !important; }`);

    const hide = (): void => {
        const popups = document.querySelectorAll<HTMLElement>(LOGIN_POPUP_SELECTOR);
        const visible = document.documentElement.getAttribute(LOGIN_POPUP_VISIBLE_ATTR) === "true";
        if (popups.length > 0 && !visible) document.body?.removeAttribute("no-scrollbar");

        popups.forEach(popup => {
            if (visible) {
                popup.style.removeProperty("display");
                popup.style.removeProperty("visibility");
                popup.style.removeProperty("pointer-events");
                return;
            }
            if (popup.style.getPropertyValue("display") !== "none" || popup.style.getPropertyPriority("display") !== "important") {
                popup.style.setProperty("display", "none", "important");
            }
            if (popup.style.getPropertyValue("visibility") !== "hidden" || popup.style.getPropertyPriority("visibility") !== "important") {
                popup.style.setProperty("visibility", "hidden", "important");
            }
            if (popup.style.getPropertyValue("pointer-events") !== "none" || popup.style.getPropertyPriority("pointer-events") !== "important") {
                popup.style.setProperty("pointer-events", "none", "important");
            }
        });
    };

    hide();
    new MutationObserver(hide).observe(document.documentElement, {
        attributes: true,
        attributeFilter: [LOGIN_POPUP_VISIBLE_ATTR],
        childList: true,
        subtree: true,
    });
}

function bindLoginPopupClose(): void {
    document.addEventListener("click", event => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target?.closest(LOGIN_POPUP_CLOSE_SELECTOR)) return;
        document.documentElement.removeAttribute(LOGIN_POPUP_VISIBLE_ATTR);
    }, true);
}
