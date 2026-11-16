import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { addStyle, overwriteCSS, injectCSSRule, setCustomBackground, renderComponent, fadeInLoad, currentPageType } = vi.hoisted(() => ({
    addStyle: vi.fn(),
    overwriteCSS: vi.fn(),
    injectCSSRule: vi.fn(),
    setCustomBackground: vi.fn(),
    renderComponent: vi.fn(),
    fadeInLoad: vi.fn(),
    currentPageType: vi.fn(() => "forum"),
}));
vi.mock("@/components/nav-bar.vue", () => ({ default: {} }));
vi.mock("@/lib/monkey", () => ({ GM_addStyle: addStyle }));
vi.mock("@/lib/api/remixed", () => ({ currentPageType }));
vi.mock("@/lib/elemental/styles", () => ({ overwriteCSS, injectCSSRule }));
vi.mock("@/lib/theme", () => ({ setCustomBackground }));
vi.mock("@/lib/render", () => ({ renderComponent }));
vi.mock("@/lib/elemental", async importOriginal => ({
    ...await importOriginal<typeof import("@/lib/elemental")>(),
    fadeInLoad,
}));

let installPageChrome: typeof import("./page-chrome").installPageChrome;

beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    currentPageType.mockReturnValue("forum");
    document.body.innerHTML = '<div id="com_userbar"></div>';
    ({ installPageChrome } = await import("./page-chrome"));
});

afterEach(() => {
    window.dispatchEvent(new Event("load"));
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("page chrome", () => {
    it("installs styles and background immediately and mounts a single navigation", async () => {
        vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
        installPageChrome();
        installPageChrome();
        expect(addStyle).toHaveBeenCalledOnce();
        expect(overwriteCSS).toHaveBeenCalledOnce();
        expect(injectCSSRule).toHaveBeenCalledOnce();
        expect(setCustomBackground).toHaveBeenCalledOnce();
        expect(fadeInLoad).not.toHaveBeenCalled();
        await vi.waitFor(() => expect(renderComponent).toHaveBeenCalledOnce());
        expect(document.querySelectorAll("#nav-wrapper")).toHaveLength(1);
        expect(document.body.firstElementChild?.querySelector("#nav-wrapper")).not.toBeNull();
        window.dispatchEvent(new Event("load"));
        window.dispatchEvent(new Event("load"));
        expect(fadeInLoad).toHaveBeenCalledExactlyOnceWith(".tbui_aside_float_bar .svg-container");
    });

    it.each(["interactive", "complete"] as const)("handles late installation at %s", async state => {
        vi.spyOn(document, "readyState", "get").mockReturnValue(state);
        installPageChrome();
        await vi.waitFor(() => expect(renderComponent).toHaveBeenCalledOnce());
        if (state === "interactive") {
            expect(fadeInLoad).not.toHaveBeenCalled();
            window.dispatchEvent(new Event("load"));
        }
        expect(fadeInLoad).toHaveBeenCalledOnce();
    });

    it("mounts search navigation without a native userbar", async () => {
        currentPageType.mockReturnValue("search");
        document.body.innerHTML = '<main id="search"></main>';
        installPageChrome();
        await vi.waitFor(() => expect(renderComponent).toHaveBeenCalledOnce());
        expect(document.body.firstElementChild?.querySelector("#nav-wrapper")).not.toBeNull();
    });

    it("waits for a delayed native userbar", async () => {
        document.body.innerHTML = "";
        installPageChrome();
        await Promise.resolve();
        expect(renderComponent).not.toHaveBeenCalled();
        document.body.insertAdjacentHTML("beforeend", '<div id="com_userbar"></div>');
        await vi.waitFor(() => expect(renderComponent).toHaveBeenCalledOnce());
        expect(document.querySelectorAll("#nav-wrapper")).toHaveLength(1);
    });
});
