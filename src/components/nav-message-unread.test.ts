import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, h, nextTick } from "vue";
import { useNavMessageUnreadCount } from "./nav-message-unread";

const mocks = vi.hoisted(() => ({ page: "search", unread: vi.fn(), counter: vi.fn() }));
vi.mock("@/lib/api/remixed", () => ({ currentPageType: () => mocks.page }));
vi.mock("@/lib/api/tieba-user", () => ({ getNavUnreadCount: mocks.unread }));
vi.mock("@/lib/elemental", () => ({ asyncdom: mocks.counter }));

let unmount: () => void;

async function mountCounter() {
    const root = document.createElement("div");
    document.body.append(root);
    const app = createApp({ setup() { const count = useNavMessageUnreadCount(); return () => h("span", count.value); } });
    app.mount(root);
    unmount = () => { app.unmount(); root.remove(); };
    await nextTick();
    await nextTick();
    return root;
}

beforeEach(() => {
    vi.useFakeTimers();
    mocks.page = "search";
    mocks.unread.mockReset().mockResolvedValue(3);
    mocks.counter.mockReset();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
});

afterEach(() => {
    unmount?.();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe("导航未读状态", () => {
    it("搜索页直接请求并轮询，卸载后停止", async () => {
        const root = await mountCounter();
        expect(root.textContent).toBe("3");
        expect(mocks.counter).not.toHaveBeenCalled();
        mocks.unread.mockResolvedValue(5);
        await vi.advanceTimersByTimeAsync(60000);
        expect(root.textContent).toBe("5");
        unmount();
        unmount = () => {};
        await vi.advanceTimersByTimeAsync(60000);
        expect(mocks.unread).toHaveBeenCalledTimes(2);
    });

    it("网络失败保留计数且聚焦时重试", async () => {
        const root = await mountCounter();
        mocks.unread.mockRejectedValue(new Error("offline"));
        await vi.advanceTimersByTimeAsync(60000);
        expect(root.textContent).toBe("3");
        mocks.unread.mockResolvedValue(0);
        window.dispatchEvent(new Event("focus"));
        await nextTick();
        await nextTick();
        expect(root.textContent).toBe("0");
    });

    it("旧版继续读取原生消息节点", async () => {
        mocks.page = "forum";
        const counter = document.createElement("span");
        counter.textContent = "9";
        mocks.counter.mockResolvedValue(counter);
        const root = await mountCounter();
        expect(root.textContent).toBe("9");
        expect(mocks.unread).not.toHaveBeenCalled();
        counter.textContent = "2";
        await nextTick();
        await nextTick();
        expect(root.textContent).toBe("2");
    });
});
