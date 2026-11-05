import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/remixed", () => ({
    currentPageType: () => "forum",
}));

vi.mock("@/lib/monkey", () => ({
    GM_addStyle: vi.fn(),
}));

const BANNER_ID = "trex-forum-load-failure-banner";
const PAGELET_ID = "pagelet_html_frs-list/pagelet/thread_list";

describe("forum load failure banner", () => {
    const reload = vi.fn();

    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();
        reload.mockReset();
        sessionStorage.clear();
        document.body.innerHTML = "";
        vi.stubGlobal("location", { href: "https://tieba.baidu.com/f?kw=test", reload });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    async function install(): Promise<void> {
        const { installForumLoadFailureBanner } = await import("./forum-load-failure-banner");
        installForumLoadFailureBanner();
        vi.advanceTimersByTime(1500);
    }

    it("reloads once when the native thread list pagelet never rendered", async () => {
        document.body.innerHTML = `<code id="${PAGELET_ID}"></code>`;

        await install();
        expect(reload).toHaveBeenCalledTimes(1);
        expect(document.getElementById(BANNER_ID)).toBeNull();

        vi.resetModules();
        await install();
        expect(reload).toHaveBeenCalledTimes(1);
        expect(document.getElementById(BANNER_ID)).not.toBeNull();
    });

    it("shows the banner without reloading when the pagelet was consumed", async () => {
        await install();

        expect(reload).not.toHaveBeenCalled();
        expect(document.getElementById(BANNER_ID)).not.toBeNull();
    });

    it("stays silent when threads are present", async () => {
        document.body.innerHTML = `<ul class="threadlist_bright"><li class="j_thread_list" data-tid="1"></li></ul>`;

        await install();

        expect(reload).not.toHaveBeenCalled();
        expect(document.getElementById(BANNER_ID)).toBeNull();
    });
});
