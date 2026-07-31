import { describe, expect, it, vi } from "vitest";
import { TbObserver } from "./observers";

describe("TbObserver", () => {
    it("initializes once and isolates subscriber failures", async () => {
        document.body.innerHTML = '<div id="target"></div>';
        const observer = new TbObserver("#target", { childList: true });
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        let successfulCalls = 0;

        observer.addEvent(
            () => { throw new Error("expected failure"); },
            () => { successfulCalls++; },
        );
        observer.observe();

        expect(successfulCalls).toBe(1);
        document.querySelector("#target")?.appendChild(document.createElement("span"));
        await new Promise(resolve => window.setTimeout(resolve, 0));

        expect(successfulCalls).toBe(2);
        expect(errorSpy).toHaveBeenCalledTimes(2);
        errorSpy.mockRestore();
    });
});
