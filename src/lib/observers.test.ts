import { describe, expect, it, vi } from "vitest";
import { addCoalescedObserverEvent, TbObserver } from "./observers";

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

    it("waits for a late target and processes its existing children", async () => {
        document.body.innerHTML = "";
        const observer = new TbObserver("#late-target", { childList: true });
        let calls = 0;

        observer.addEvent(() => { calls++; });
        observer.observe();
        expect(calls).toBe(1);

        const target = document.createElement("div");
        target.id = "late-target";
        target.appendChild(document.createElement("span"));
        document.body.appendChild(target);
        await new Promise(resolve => window.setTimeout(resolve, 0));

        expect(calls).toBe(2);
        target.appendChild(document.createElement("span"));
        await new Promise(resolve => window.setTimeout(resolve, 0));
        expect(calls).toBe(3);
    });

    it("runs once initially and coalesces observer events within one frame", async () => {
        document.body.innerHTML = '<div id="first"></div><div id="second"></div>';
        const first = new TbObserver("#first", { childList: true });
        const second = new TbObserver("#second", { childList: true });
        const callback = vi.fn();

        addCoalescedObserverEvent(callback, first, second);
        expect(callback).toHaveBeenCalledTimes(1);

        first.emit();
        second.emit();
        first.emit();
        expect(callback).toHaveBeenCalledTimes(1);

        await new Promise(resolve => window.requestAnimationFrame(resolve));
        expect(callback).toHaveBeenCalledTimes(2);
    });
});
