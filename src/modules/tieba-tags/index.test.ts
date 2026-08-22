import { beforeEach, describe, expect, it, vi } from "vitest";

const observerMocks = vi.hoisted(() => ({
    addEvent: vi.fn((callback: () => void) => callback()),
}));

vi.mock("@/lib/observers", () => ({
    threadCommentsObserver: observerMocks,
}));

describe("tieba tags", () => {
    beforeEach(() => {
        observerMocks.addEvent.mockClear();
        vi.stubGlobal("PageData", {
            thread: { author: "owner" },
            user: { portrait: "me-portrait", user_name: "me" },
        });
        document.body.innerHTML = `
            <div class="l_post_bright" data-field='{"author":{"portrait":"owner-portrait"}}'>
                <span class="j_louzhubiaoshi"></span>
                <div class="lzl_cnt">
                    <a class="at" username="" data-field="{"></a>
                    <a class="at" username="owner">owner</a>
                    <a class="at" username="someone">someone</a>
                </div>
            </div>
        `;
    });

    it("continues tagging valid nodes after malformed data", async () => {
        const module = await import("./index");
        module.default.entry();

        const tags = [...document.querySelectorAll<HTMLElement>(".lzl_cnt .at")];
        expect(tags[0].classList.contains("is-tagged")).toBe(true);
        expect(tags[1].querySelector(".tieba-tags-lz")).not.toBeNull();
        expect(tags[2].classList.contains("is-tagged")).toBe(true);
    });
});
