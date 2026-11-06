import { beforeEach, describe, expect, it, vi } from "vitest";

const mode = vi.hoisted(() => ({
    value: "fold",
    listeners: [] as ((value: string) => void)[],
}));

vi.mock("@/lib/user-values", () => ({
    navBarHideMode: {
        get: () => mode.value,
        on: (_event: string, listener: (value: string) => void) => { mode.listeners.push(listener); },
    },
}));

function scrollTo(y: number) {
    Object.defineProperty(window, "scrollY", { configurable: true, value: y });
    window.dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(200);
}

describe("installNavTopCollapse", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();
        mode.value = "fold";
        mode.listeners = [];
        document.documentElement.removeAttribute("nav-top-collapsed");
        scrollTo(0);
    });

    it("程序滚动不收起，用户下滚后收起", async () => {
        const { installNavTopCollapse } = await import("./nav-top-collapse");
        installNavTopCollapse();

        scrollTo(400);
        expect(document.documentElement.hasAttribute("nav-top-collapsed")).toBe(false);

        window.dispatchEvent(new Event("wheel"));
        scrollTo(500);
        expect(document.documentElement.hasAttribute("nav-top-collapsed")).toBe(true);
    });

    it("切出滚动隐藏模式时复位，其他模式不收起", async () => {
        const { installNavTopCollapse } = await import("./nav-top-collapse");
        installNavTopCollapse();
        window.dispatchEvent(new Event("wheel"));
        scrollTo(100);

        mode.value = "never";
        mode.listeners.forEach(listener => listener("never"));
        expect(document.documentElement.hasAttribute("nav-top-collapsed")).toBe(false);

        scrollTo(300);
        expect(document.documentElement.hasAttribute("nav-top-collapsed")).toBe(false);
    });
});
