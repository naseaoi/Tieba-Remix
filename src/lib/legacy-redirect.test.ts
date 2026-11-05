// @vitest-environment-options {"url": "https://tieba.baidu.com/p/123"}
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 帖子页还会预取点赞数据，这里只统计切换版本的请求
function switchCalls(): unknown[][] {
    return vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes("/c/s/pc/updateSwitch"));
}

describe("setupLegacyRedirect", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();
        sessionStorage.clear();
        document.body.className = "";
        Object.defineProperty(document, "readyState", { configurable: true, get: () => "loading" });
        vi.stubGlobal("fetch", vi.fn(() => new Promise(() => { /* 保持挂起，避免触发 reload */ })));
    });

    afterEach(() => {
        Reflect.deleteProperty(document, "readyState");
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("body 带 cos-tieba 时不等 DOMContentLoaded 就切换旧版", async () => {
        document.body.classList.add("cos-tieba");
        const bootstrap = vi.fn();
        const { setupLegacyRedirect } = await import("./legacy-redirect");

        setupLegacyRedirect(bootstrap);

        expect(switchCalls()).toHaveLength(1);

        document.dispatchEvent(new Event("DOMContentLoaded"));
        expect(switchCalls()).toHaveLength(1);
        expect(bootstrap).not.toHaveBeenCalled();
    });

    it("旧版页面等到 DOMContentLoaded 后启动", async () => {
        const bootstrap = vi.fn();
        const { setupLegacyRedirect } = await import("./legacy-redirect");

        setupLegacyRedirect(bootstrap);
        expect(bootstrap).not.toHaveBeenCalled();

        document.dispatchEvent(new Event("DOMContentLoaded"));
        expect(bootstrap).toHaveBeenCalledTimes(1);
        expect(switchCalls()).toHaveLength(0);
    });
});
