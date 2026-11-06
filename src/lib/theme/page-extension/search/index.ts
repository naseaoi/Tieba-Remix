import { currentPageType } from "@/lib/api/remixed";
import { domrd } from "@/lib/elemental";
import { renderComponent } from "@/lib/render";
import { installNavTopCollapse } from "@/lib/theme/nav-top-collapse";
import Search from "./search.vue";

const ROOT_ID = "trex-search-page";

// 原生 SPA 仍在后台运行，由样式隐藏
export default async function () {
    if (currentPageType() !== "search") return;
    const html = document.documentElement;

    if (!document.body) await new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve, { once: true }));
    if (document.getElementById(ROOT_ID)) return;

    html.setAttribute("data-search-page", "");
    const root = domrd("div", { id: ROOT_ID });
    document.body.prepend(root);
    renderComponent(Search, root);
    installNavTopCollapse();
}
