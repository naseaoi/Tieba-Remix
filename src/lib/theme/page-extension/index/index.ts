import { GM_addStyle } from "@/lib/monkey";
import { currentPageType } from "@/lib/api/remixed";
import { asyncdom } from "@/lib/elemental";
import { parseMultiCSS } from "@/lib/elemental/styles";
import { renderPage } from "@/lib/render";
import { pageExtension } from "@/lib/user-values";
import Home from "./index.vue";

const WRAP_TIMEOUT_MS = 8000;

export default async function () {
    if (currentPageType() !== "index") return;
    if (!pageExtension.get().index) return;

    const bodyMask = GM_addStyle(parseMultiCSS({
        "body": {
            display: "none",
        },
    }));

    try {
        // 与 legacy-redirect 的遮罩安全阀同为 8 秒；节点缺失说明不是可接管的首页，保留原生页面
        const wrap = await asyncdom(".wrap1", undefined, WRAP_TIMEOUT_MS);
        if (!wrap) return;
        renderPage(Home);
        wrap.remove();
    } finally {
        bodyMask.remove();
    }
}
