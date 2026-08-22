import { createApp, nextTick, type App } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ImagesViewer from "./images-viewer.vue";

const imagePreloaderMocks = vi.hoisted(() => ({
    ensureImageReady: vi.fn(),
    preloadUpcomingImages: vi.fn(),
}));

vi.mock("./image-preloader", () => imagePreloaderMocks);

describe("images viewer controls", () => {
    let app: App<Element> | undefined;
    let storedValues: Map<string, unknown>;

    beforeEach(() => {
        vi.useFakeTimers();
        storedValues = new Map();
        vi.stubGlobal("GM_getValue", vi.fn((key: string, defaultValue: unknown) =>
            storedValues.has(key) ? storedValues.get(key) : defaultValue
        ));
        vi.stubGlobal("GM_setValue", vi.fn((key: string, value: unknown) => {
            storedValues.set(key, value);
        }));
        vi.stubGlobal("GM_deleteValue", vi.fn((key: string) => {
            storedValues.delete(key);
        }));
        vi.stubGlobal("GM_info", { script: { name: "Tieba Remix Test", version: "test" } });
        vi.stubGlobal("IntersectionObserver", class {
            observe(): void { return; }
            unobserve(): void { return; }
            disconnect(): void { return; }
        });
        Object.defineProperty(Element.prototype, "scrollIntoView", {
            configurable: true,
            value: vi.fn(),
        });
        imagePreloaderMocks.ensureImageReady.mockResolvedValue({ width: 1600, height: 800 });
        document.body.innerHTML = "<div id=\"app\"></div>";
    });

    afterEach(() => {
        app?.unmount();
        app = undefined;
        vi.useRealTimers();
        vi.unstubAllGlobals();
        delete (Element.prototype as Partial<Element>).scrollIntoView;
    });

    it("persists automatic hiding across viewer sessions", async () => {
        app = createApp(ImagesViewer, {
            content: ["first.jpg", "second.jpg"],
        });
        app.mount("#app");
        await nextTick();
        await nextTick();

        vi.advanceTimersByTime(3000);
        await nextTick();

        const pinButton = document.querySelector<HTMLElement>(".controls-pin");
        const controlPanels = document.querySelectorAll<HTMLElement>(
            ".head-controls, .back, .forward, .bottom-controls-wrapper"
        );

        expect(pinButton?.getAttribute("aria-pressed")).toBe("true");
        expect(pinButton?.title).toBe("关闭界面常驻");
        expect(pinButton?.classList.contains("controls-pinned")).toBe(true);
        expect([...controlPanels].every(panel => !panel.classList.contains("hide"))).toBe(true);

        pinButton?.click();
        await nextTick();

        expect(pinButton?.getAttribute("aria-pressed")).toBe("false");
        expect(pinButton?.title).toBe("开启界面常驻");
        expect(pinButton?.classList.contains("controls-pinned")).toBe(false);
        expect([...controlPanels].every(panel => panel.classList.contains("hide"))).toBe(true);
        expect(storedValues.get("imageViewerControlsPinned")).toBe(false);

        app.unmount();
        app = undefined;
        document.body.innerHTML = "<div id=\"app\"></div>";

        app = createApp(ImagesViewer, {
            content: ["first.jpg", "second.jpg"],
        });
        app.mount("#app");
        await nextTick();
        await nextTick();
        vi.advanceTimersByTime(3000);
        await nextTick();

        const restoredPinButton = document.querySelector<HTMLElement>(".controls-pin");
        const restoredControlPanels = document.querySelectorAll<HTMLElement>(
            ".head-controls, .back, .forward, .bottom-controls-wrapper"
        );

        expect(restoredPinButton?.getAttribute("aria-pressed")).toBe("false");
        expect([...restoredControlPanels].every(panel => panel.classList.contains("hide"))).toBe(true);

        restoredPinButton?.click();
        await nextTick();

        expect(restoredPinButton?.getAttribute("aria-pressed")).toBe("true");
        expect([...restoredControlPanels].every(panel => !panel.classList.contains("hide"))).toBe(true);
        expect(storedValues.get("imageViewerControlsPinned")).toBe(true);
    });

    it("applies the final image layout before revealing a switched image", async () => {
        app = createApp(ImagesViewer, {
            content: ["first.jpg", "second.jpg"],
        });
        app.mount("#app");
        await nextTick();
        await nextTick();

        document.querySelector<HTMLElement>(".forward")?.click();
        await nextTick();
        await nextTick();

        const image = document.querySelector<HTMLImageElement>(".curr-image");

        expect(imagePreloaderMocks.ensureImageReady).toHaveBeenCalledWith("second.jpg", "high");
        expect(image?.getAttribute("src")).toBe("second.jpg");
        expect(image?.classList.contains("loading-img")).toBe(true);
        expect(image?.style.width).toBe("824px");
        expect(image?.style.height).toBe("412px");
        expect(image?.style.transition).toBe("");
    });
});
