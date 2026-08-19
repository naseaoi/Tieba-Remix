import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    value: { reloadAvatars: true },
    setter: undefined as ((value: { reloadAvatars: boolean }) => void) | undefined,
    addEvent: vi.fn((callback: () => void) => callback()),
}));

vi.mock("@/lib/user-values", () => ({
    UserKey: class {
        on(event: string, listener: (value: { reloadAvatars: boolean }) => void): void {
            if (event === "setter") mocks.setter = listener;
        }

        get(): { reloadAvatars: boolean } {
            return mocks.value;
        }

        merge(value: Partial<{ reloadAvatars: boolean }>): void {
            mocks.value = { ...mocks.value, ...value };
            mocks.setter?.(mocks.value);
        }
    },
}));

vi.mock("@/lib/observers", () => ({
    threadCommentsObserver: { addEvent: mocks.addEvent },
}));

vi.mock("@/lib/elemental", () => ({
    dom: (selector: string) => [...document.querySelectorAll(selector)],
    findParent: (element: Element, className: string) => element.closest(`.${className}`),
}));

vi.mock("@/lib/api/tieba", () => ({
    tiebaAPI: { URL_profile: (portrait: string) => `https://profile.test/${portrait}` },
}));

describe("toolkit avatar reload", () => {
    beforeEach(() => {
        vi.resetModules();
        mocks.value = { reloadAvatars: true };
        mocks.setter = undefined;
        mocks.addEvent.mockClear();
        document.body.innerHTML = `
            <li class="j_user_card" data-field="{'id':'portrait-id'}">
                <div class="lzl_single_post"><img></div>
            </li>
        `;
    });

    it("retries pending avatars and applies setting changes immediately", async () => {
        const instances: FakeIntersectionObserver[] = [];
        vi.stubGlobal("IntersectionObserver", class extends FakeIntersectionObserver {
            constructor(callback: IntersectionObserverCallback) {
                super(callback);
                instances.push(this);
            }
        });

        const avatar = document.querySelector<HTMLImageElement>("img")!;
        Object.defineProperty(avatar, "complete", { configurable: true, value: false });
        Object.defineProperty(avatar, "naturalWidth", { configurable: true, value: 0 });

        const module = await import("./index");
        module.default.entry();
        expect(instances).toHaveLength(1);
        expect(instances[0].observed).toContain(avatar);

        instances[0].emit(avatar);
        expect(instances[0].unobserved).toContain(avatar);
        Object.defineProperty(avatar, "complete", { configurable: true, value: true });
        avatar.dispatchEvent(new Event("error"));
        expect(avatar.src).toBe("https://profile.test/portrait-id");
        expect(avatar.hasAttribute("data-loaded")).toBe(true);

        const toggle = module.default.settings!.reloadAvatars!.widgets![0];
        toggle.event?.({} as never);
        expect(instances[0].disconnected).toBe(true);
        toggle.event?.({} as never);
        expect(instances).toHaveLength(2);
    });
});

class FakeIntersectionObserver {
    readonly observed: Element[] = [];
    readonly unobserved: Element[] = [];
    disconnected = false;

    constructor(private readonly callback: IntersectionObserverCallback) {}

    observe(target: Element): void { this.observed.push(target); }
    unobserve(target: Element): void { this.unobserved.push(target); }
    disconnect(): void { this.disconnected = true; }
    emit(target: Element): void {
        this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
}
