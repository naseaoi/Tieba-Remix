import navBarVue from "@/components/nav-bar.vue";
import { currentPageType } from "@/lib/api/remixed";
import { asyncdom, fadeInElems, fadeInLoad } from "@/lib/elemental";
import { onWindowLoaded } from "@/lib/elemental/ready";
import { injectCSSRule, overwriteCSS } from "@/lib/elemental/styles";
import { GM_addStyle } from "@/lib/monkey";
import { renderComponent } from "@/lib/render";
import { insertJSX } from "@/lib/render/jsx-extension";
import { setCustomBackground } from "@/lib/theme";
import "@/stylesheets/components/user-button.scss";
import floatBarCSS from "./float-bar.scss?inline";
import navBarCSS from "./nav-bar.scss?inline";

const floatIcons = ".tbui_aside_float_bar .svg-container";
let installed = false;

export function installPageChrome(): void {
    if (installed) return;
    installed = true;

    GM_addStyle(navBarCSS);
    void mountNavBar();
    overwriteCSS(floatBarCSS);
    fadeInElems.push(floatIcons);
    injectCSSRule(floatIcons, { opacity: "0" });
    setCustomBackground();
    onWindowLoaded(() => fadeInLoad(floatIcons));
}

async function mountNavBar(): Promise<void> {
    const body = await asyncdom("body");
    const elder = currentPageType() === "search" ? body.firstChild ?? undefined : await asyncdom("#com_userbar");
    const navWrapper = <div id="nav-wrapper" class="nav-wrapper"></div>;
    insertJSX(navWrapper, body, elder);
    renderComponent(navBarVue, await asyncdom("#nav-wrapper"));
}
