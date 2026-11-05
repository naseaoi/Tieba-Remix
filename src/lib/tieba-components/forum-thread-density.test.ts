import { beforeEach, describe, expect, it, vi } from "vitest";

type Density = "card" | "compact";

const store = vi.hoisted(() => ({
    density: "card" as Density,
    listeners: [] as ((value: Density) => void)[],
}));

vi.mock("@/lib/user-values", () => ({
    forumThreadDensity: {
        get: () => store.density,
        set: (value: Density) => {
            store.density = value;
            store.listeners.forEach(listener => listener(value));
        },
        on: (_event: string, listener: (value: Density) => void) => { store.listeners.push(listener); },
    },
}));

describe("forum thread density", () => {
    beforeEach(() => {
        vi.resetModules();
        store.density = "compact";
        store.listeners = [];
        document.documentElement.removeAttribute("data-forum-thread-density");
        document.body.innerHTML = "";
    });

    const pressed = () => [...document.querySelectorAll<HTMLElement>(".trex-thread-density-option")]
        .filter(button => button.getAttribute("aria-pressed") === "true")
        .map(button => button.dataset.density);

    it("按已保存的密度设置页面属性与按钮状态", async () => {
        const { createForumThreadDensityToggle, installForumThreadDensity } = await import("./forum-thread-density");
        installForumThreadDensity();
        document.body.append(createForumThreadDensityToggle());

        expect(document.documentElement.getAttribute("data-forum-thread-density")).toBe("compact");
        expect(pressed()).toEqual(["compact"]);
    });

    it("列表重建后新旧按钮共用一个监听并同步切换", async () => {
        const { createForumThreadDensityToggle, installForumThreadDensity } = await import("./forum-thread-density");
        installForumThreadDensity();
        installForumThreadDensity();
        document.body.append(createForumThreadDensityToggle(), createForumThreadDensityToggle());

        document.querySelector<HTMLElement>(".trex-thread-density-option[data-density='card']")!.click();

        expect(store.listeners).toHaveLength(1);
        expect(document.documentElement.getAttribute("data-forum-thread-density")).toBe("card");
        expect(pressed()).toEqual(["card", "card"]);
    });
});
