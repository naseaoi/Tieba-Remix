import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { threadFloorsObserver } from "@/lib/observers";
import { installThreadImageLoading } from "./thread-image-loading";

describe("thread image loading", () => {
    beforeEach(() => {
        vi.stubGlobal("IntersectionObserver", class {
            observe(): void { return; }
            unobserve(): void { return; }
        });
        window.history.replaceState({}, "", "/p/1");
        document.body.innerHTML = `
            <div id="j_p_postlist">
                <div class="l_post">
                    <div class="d_post_content">
                        <img class="BDE_Image" src="first.jpg">
                        <img class="BDE_Image" src="second.jpg">
                        <img class="BDE_Image" src="third.jpg">
                    </div>
                </div>
                <div class="l_post">
                    <div class="d_post_content">
                        <img class="BDE_Image" src="fourth.jpg">
                    </div>
                </div>
            </div>
        `;
        document.querySelectorAll<HTMLImageElement>(".BDE_Image").forEach(image => {
            Object.defineProperty(image, "complete", { configurable: true, value: false });
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("prioritizes the first two images and lazily loads the rest", async () => {
        installThreadImageLoading();

        const images = [...document.querySelectorAll<HTMLImageElement>(".BDE_Image")];
        expect(images.map(image => image.loading)).toEqual(["eager", "eager", "lazy", "lazy"]);
        expect(images.map(image => image.decoding)).toEqual(["async", "async", "async", "async"]);
        expect(images[0].fetchPriority).toBe("high");
        expect(images.map(image => image.dataset.tbrImageLoading)).toEqual(["eager", "eager", "lazy", "lazy"]);
        expect(images.slice(2).map(image => image.getAttribute("src"))).toEqual([null, null]);
        expect(images.slice(2).map(image => image.dataset.tbrImageSrc)).toEqual(["third.jpg", "fourth.jpg"]);

        const dynamic = document.createElement("img");
        dynamic.className = "BDE_Image";
        dynamic.src = "dynamic.jpg";
        document.querySelector(".d_post_content")?.appendChild(dynamic);
        threadFloorsObserver.emit();
        await new Promise(resolve => window.requestAnimationFrame(resolve));
        expect(dynamic.loading).toBe("lazy");
        expect(dynamic.decoding).toBe("async");
        expect(dynamic.getAttribute("src")).toBeNull();
    });
});

describe("early thread image observer readiness", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        window.history.replaceState({}, "", "/p/1");
        document.body.innerHTML = "";
        vi.stubGlobal("MutationObserver", class {
            observe = observe;
            disconnect = disconnect;
        });
    });

    afterEach(() => {
        document.dispatchEvent(new Event("DOMContentLoaded"));
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("disconnects once DOMContentLoaded fires when installed early", async () => {
        vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
        const { installEarlyThreadImageLoading } = await import("./thread-image-loading");
        installEarlyThreadImageLoading();
        expect(observe).toHaveBeenCalledOnce();
        expect(disconnect).not.toHaveBeenCalled();

        document.dispatchEvent(new Event("DOMContentLoaded"));
        document.dispatchEvent(new Event("DOMContentLoaded"));
        expect(disconnect).toHaveBeenCalledOnce();
    });

    it.each(["interactive", "complete"] as const)("releases the early observer immediately when %s", async state => {
        vi.spyOn(document, "readyState", "get").mockReturnValue(state);
        const { installEarlyThreadImageLoading } = await import("./thread-image-loading");
        installEarlyThreadImageLoading();
        expect(disconnect).toHaveBeenCalledOnce();

        document.dispatchEvent(new Event("DOMContentLoaded"));
        expect(disconnect).toHaveBeenCalledOnce();
    });
});
