// @vitest-environment-options {"url": "https://tieba.baidu.com/f/search/res?ie=utf-8&kw=steam&qw=test"}
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("setupLegacyRedirect 搜索页", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();
        sessionStorage.clear();
        document.body.className = "";
        document.documentElement.removeAttribute("style");
        Object.defineProperty(document, "readyState", { configurable: true, get: () => "loading" });
        vi.stubGlobal("fetch", vi.fn(() => new Promise(() => { /* 保持挂起，避免触发 reload */ })));
    });

    afterEach(() => {
        Reflect.deleteProperty(document, "readyState");
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("新版 body 不切换旧版，在 DOMContentLoaded 后直接启动", async () => {
        document.body.classList.add("cos-tieba");
        const bootstrap = vi.fn();
        const { setupLegacyRedirect } = await import("./legacy-redirect");

        setupLegacyRedirect(bootstrap);
        expect(bootstrap).not.toHaveBeenCalled();

        document.dispatchEvent(new Event("DOMContentLoaded"));
        expect(bootstrap).toHaveBeenCalledTimes(1);
        expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes("/c/s/pc/updateSwitch"))).toBe(false);
    });

    it("遮罩只隐藏页面，不锁定 html 滚动条", async () => {
        const { setupLegacyRedirect } = await import("./legacy-redirect");

        setupLegacyRedirect(vi.fn());

        expect(document.documentElement.style.getPropertyValue("overflow-y")).toBe("");
        expect(document.documentElement.style.getPropertyValue("scrollbar-gutter")).toBe("");
        expect(document.documentElement.style.getPropertyValue("visibility")).toBe("hidden");
    });
});
