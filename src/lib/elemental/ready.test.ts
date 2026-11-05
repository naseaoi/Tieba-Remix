import { afterEach, describe, expect, it, vi } from "vitest";
import { onDOMReady, onWindowLoaded } from "./ready";

afterEach(() => {
    document.dispatchEvent(new Event("DOMContentLoaded"));
    window.dispatchEvent(new Event("load"));
    vi.restoreAllMocks();
});

describe("onDOMReady", () => {
    it("waits while loading and runs once without forwarding the event", () => {
        vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
        const callback = vi.fn();
        onDOMReady(callback);
        expect(callback).not.toHaveBeenCalled();

        document.dispatchEvent(new Event("DOMContentLoaded"));
        document.dispatchEvent(new Event("DOMContentLoaded"));
        expect(callback).toHaveBeenCalledExactlyOnceWith();
    });

    it.each(["interactive", "complete"] as const)("runs synchronously when %s", state => {
        vi.spyOn(document, "readyState", "get").mockReturnValue(state);
        const callback = vi.fn();
        onDOMReady(callback);
        expect(callback).toHaveBeenCalledExactlyOnceWith();

        document.dispatchEvent(new Event("DOMContentLoaded"));
        expect(callback).toHaveBeenCalledTimes(1);
    });
});

describe("onWindowLoaded", () => {
    it.each(["loading", "interactive"] as const)("waits for load when %s and runs once", state => {
        vi.spyOn(document, "readyState", "get").mockReturnValue(state);
        const callback = vi.fn();
        onWindowLoaded(callback);
        document.dispatchEvent(new Event("DOMContentLoaded"));
        expect(callback).not.toHaveBeenCalled();

        window.dispatchEvent(new Event("load"));
        window.dispatchEvent(new Event("load"));
        expect(callback).toHaveBeenCalledExactlyOnceWith();
    });

    it("runs synchronously when complete", () => {
        vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
        const callback = vi.fn();
        onWindowLoaded(callback);
        expect(callback).toHaveBeenCalledExactlyOnceWith();

        window.dispatchEvent(new Event("load"));
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
