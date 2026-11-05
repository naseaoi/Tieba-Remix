import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fadeInElems, fadeInLoad } from "@/lib/elemental";
import { overwriteCSS } from "@/lib/elemental/styles";
import { threadFloorsObserver } from "@/lib/observers";
import { setCustomBackground } from "@/lib/theme";
import remixedTheme from "./index";

vi.mock("./tieba-components/nav-bar", () => ({ default: vi.fn() }));
vi.mock("@/lib/elemental/styles", () => ({ injectCSSRule: vi.fn(), overwriteCSS: vi.fn() }));
vi.mock("@/lib/theme", () => ({ setCustomBackground: vi.fn() }));
vi.mock("@/lib/elemental", async importOriginal => ({
    ...await importOriginal<typeof import("@/lib/elemental")>(),
    fadeInLoad: vi.fn(),
}));
vi.mock("@/lib/observers", () => ({
    threadFloorsObserver: { addEvent: vi.fn((callback: () => void) => callback()) },
}));

beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = `
        <div class="post-tail-wrap"><img class="icon-jubao" src="report.png"></div>
        <div class="l_badge"><span class="d_badge_lv"></span></div>
        <div class="d_badge_bawu1"><span class="d_badge_lv">6</span></div>`;
});

afterEach(() => {
    document.dispatchEvent(new Event("DOMContentLoaded"));
    window.dispatchEvent(new Event("load"));
    fadeInElems.length = 0;
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

function expectDOMSetup(): void {
    expect(document.querySelector(".icon-jubao")?.hasAttribute("src")).toBe(false);
    expect(document.querySelector(".post-tail-wrap")?.textContent).toBe("举报");
    expect(document.querySelector<HTMLElement>(".l_badge")?.style.display).toBe("none");
}

function expectLoadSetup(): void {
    expect(document.querySelector(".d_badge_bawu1 .d_badge_lv")?.classList.contains("tieba-lvl-blue")).toBe(true);
    expect(fadeInLoad).toHaveBeenCalledWith(".tbui_aside_float_bar .svg-container");
}

describe("remixed theme readiness", () => {
    it("keeps early CSS and background work immediate while waiting for DOM and load", () => {
        vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
        expect(remixedTheme.runAt).toBe("immediately");
        remixedTheme.entry();
        expect(overwriteCSS).toHaveBeenCalled();
        expect(setCustomBackground).toHaveBeenCalledOnce();
        expect(threadFloorsObserver.addEvent).not.toHaveBeenCalled();
        expect(fadeInLoad).not.toHaveBeenCalled();

        document.dispatchEvent(new Event("DOMContentLoaded"));
        expectDOMSetup();
        expect(threadFloorsObserver.addEvent).toHaveBeenCalledTimes(1);
        expect(fadeInLoad).not.toHaveBeenCalled();

        window.dispatchEvent(new Event("load"));
        expectLoadSetup();
        document.dispatchEvent(new Event("DOMContentLoaded"));
        window.dispatchEvent(new Event("load"));
        expect(threadFloorsObserver.addEvent).toHaveBeenCalledTimes(2);
        expect(document.querySelector(".post-tail-wrap")?.textContent).toBe("举报");
    });

    it.each(["interactive", "complete"] as const)("initializes after a late import at %s", state => {
        vi.spyOn(document, "readyState", "get").mockReturnValue(state);
        remixedTheme.entry();
        expectDOMSetup();
        if (state === "interactive") {
            expect(fadeInLoad).not.toHaveBeenCalled();
            window.dispatchEvent(new Event("load"));
        }
        expectLoadSetup();
        expect(threadFloorsObserver.addEvent).toHaveBeenCalledTimes(2);
    });
});
