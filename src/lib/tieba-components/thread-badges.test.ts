import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { fadeInLoad, injectCSSRule, addEvent } = vi.hoisted(() => ({
    fadeInLoad: vi.fn(),
    injectCSSRule: vi.fn(),
    addEvent: vi.fn((callback: () => void) => callback()),
}));
vi.mock("@/lib/elemental/styles", () => ({ injectCSSRule }));
vi.mock("@/lib/elemental", async importOriginal => ({
    ...await importOriginal<typeof import("@/lib/elemental")>(),
    fadeInLoad,
}));
vi.mock("@/lib/observers", () => ({ threadFloorsObserver: { addEvent } }));

let installThreadBadges: typeof import("./thread-badges").installThreadBadges;

beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    ({ installThreadBadges } = await import("./thread-badges"));
    document.body.innerHTML = `
        <div class="post-tail-wrap"><img class="icon-jubao" src="report.png"></div>
        <div class="l_badge"><span class="d_badge_lv"></span></div>
        <div class="d_badge_bright d_badge_bawu1"><span class="d_badge_lv">6</span></div>`;
});

afterEach(() => {
    document.dispatchEvent(new Event("DOMContentLoaded"));
    window.dispatchEvent(new Event("load"));
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
    expect(fadeInLoad).toHaveBeenCalledWith(".d_badge_bright .d_badge_lv, .user_level .badge_index");
}

describe("thread badges readiness", () => {
    it("installs CSS immediately and waits for DOM and load only once", () => {
        vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
        installThreadBadges();
        installThreadBadges();
        expect(injectCSSRule).toHaveBeenCalledOnce();
        expect(addEvent).not.toHaveBeenCalled();
        expect(fadeInLoad).not.toHaveBeenCalled();

        document.dispatchEvent(new Event("DOMContentLoaded"));
        expectDOMSetup();
        expect(addEvent).toHaveBeenCalledTimes(1);
        expect(fadeInLoad).not.toHaveBeenCalled();

        window.dispatchEvent(new Event("load"));
        expectLoadSetup();
        document.dispatchEvent(new Event("DOMContentLoaded"));
        window.dispatchEvent(new Event("load"));
        installThreadBadges();
        expect(addEvent).toHaveBeenCalledTimes(2);
        expect(document.querySelector(".post-tail-wrap")?.textContent).toBe("举报");
    });

    it.each(["interactive", "complete"] as const)("initializes after a late import at %s", state => {
        vi.spyOn(document, "readyState", "get").mockReturnValue(state);
        installThreadBadges();
        expectDOMSetup();
        if (state === "interactive") {
            expect(fadeInLoad).not.toHaveBeenCalled();
            window.dispatchEvent(new Event("load"));
        }
        expectLoadSetup();
        expect(addEvent).toHaveBeenCalledTimes(2);
    });

    it.each([
        ["1", "green"], ["3", "green"], ["4", "blue"], ["9", "blue"],
        ["10", "yellow"], ["15", "yellow"], ["16", "orange"], ["30", "orange"],
        ["", undefined], ["0", undefined], ["未知", undefined],
    ])("colors both moderator variants and own badge at level %s", (level, color) => {
        vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
        document.body.innerHTML = `
            <div class="d_badge_bright d_badge_bawu1"><span class="d_badge_lv">${level}</span></div>
            <div class="d_badge_bright d_badge_bawu2"><span class="d_badge_lv">${level}</span></div>
            <div class="user_level"><span class="badge_index">${level}</span></div>`;
        installThreadBadges();
        document.querySelectorAll(".d_badge_lv, .badge_index").forEach(badge => {
            expect([...badge.classList].filter(name => name.startsWith("tieba-lvl-")))
                .toEqual(color ? [`tieba-lvl-${color}`] : []);
        });
    });

    it("processes newly inserted floors through the shared observer", () => {
        vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
        installThreadBadges();
        document.body.insertAdjacentHTML("beforeend", '<div class="d_badge_bawu2"><span class="d_badge_lv">16</span></div>');
        addEvent.mock.calls.forEach(([callback]) => callback());
        expect(document.querySelector(".d_badge_bawu2 .d_badge_lv")?.classList.contains("tieba-lvl-orange")).toBe(true);
        expect(document.querySelector(".d_badge_bawu1 .d_badge_lv")?.className).toBe("d_badge_lv tieba-lvl-blue");
    });
});
