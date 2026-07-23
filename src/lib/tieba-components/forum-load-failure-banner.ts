import { currentPageType } from "@/lib/api/remixed";
import { GM_addStyle } from "@/lib/monkey";

let installed = false;
const DETECT_DELAY_MS = 5000;
const BANNER_ID = "trex-forum-load-failure-banner";

function injectBannerStyle(): void {
    GM_addStyle(`
        #${BANNER_ID} {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 10px 16px;
            background-color: #fff4e5;
            color: #663c00;
            font-size: 14px;
            line-height: 1.4;
            border-bottom: 1px solid #ffb74d;
            box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
        }
        #${BANNER_ID} button {
            padding: 4px 12px;
            border: 1px solid #ff9800;
            border-radius: 4px;
            background-color: #ff9800;
            color: #fff;
            font-size: 13px;
            cursor: pointer;
        }
        #${BANNER_ID} button:hover {
            background-color: #fb8c00;
            border-color: #fb8c00;
        }
        #${BANNER_ID} .${BANNER_ID}-close {
            margin-left: 4px;
            padding: 2px 8px;
            border: none;
            background: none;
            color: #663c00;
            font-size: 16px;
            line-height: 1;
            cursor: pointer;
        }
        html.dark-theme #${BANNER_ID} {
            background-color: #4a3300;
            color: #ffd699;
            border-bottom-color: #ff9800;
        }
        html.dark-theme #${BANNER_ID} .${BANNER_ID}-close {
            color: #ffd699;
        }
    `);
}

function showBanner(): void {
    if (document.getElementById(BANNER_ID)) return;
    injectBannerStyle();

    const banner = document.createElement("div");
    banner.id = BANNER_ID;

    const text = document.createElement("span");
    text.textContent = "⚠ 帖子列表未加载,可能是广告拦截器误伤了贴吧脚本";

    const reloadBtn = document.createElement("button");
    reloadBtn.type = "button";
    reloadBtn.textContent = "刷新页面";
    reloadBtn.addEventListener("click", () => window.location.reload());

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = `${BANNER_ID}-close`;
    closeBtn.textContent = "×";
    closeBtn.title = "关闭";
    closeBtn.addEventListener("click", () => banner.remove());

    banner.appendChild(text);
    banner.appendChild(reloadBtn);
    banner.appendChild(closeBtn);
    document.body.appendChild(banner);
}

function detect(): void {
    const threadList = document.querySelector(".threadlist_bright");
    if (threadList?.querySelector(".j_thread_list[data-tid]")) return;
    showBanner();
}

export function installForumLoadFailureBanner(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    const schedule = () => window.setTimeout(detect, DETECT_DELAY_MS);

    if (document.readyState === "complete") {
        schedule();
    } else {
        window.addEventListener("load", schedule, { once: true });
    }
}
