import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

vi.mock("@/lib/api/remixed", () => ({ currentPageType: () => "forum" }));

const NativeMutationObserver = window.MutationObserver;
const observers: MutationObserver[] = [];
let windowEvents: MockInstance<Window["addEventListener"]>;

function imageMarkup(url = "https://example.com/thumb.jpg"): string {
    return `<li class="threadlist_media"><img src="/blank.gif" data-original="${url}"></li>`;
}

function listElement(): HTMLUListElement {
    return document.querySelector<HTMLUListElement>("#thread_list")!;
}

function thumbnail(root: Element = listElement()): HTMLImageElement {
    return root.querySelector<HTMLImageElement>("img")!;
}

async function settle(): Promise<void> {
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(32);
}

async function install(): Promise<void> {
    const { forumThreadsObserver } = await import("@/lib/observers");
    const { installForumThumbnailRecovery } = await import("./forum-thumbnail-recovery");
    forumThreadsObserver.observe();
    installForumThumbnailRecovery();
}

beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    windowEvents = vi.spyOn(window, "addEventListener");
    vi.stubGlobal("MutationObserver", class extends NativeMutationObserver {
        constructor(callback: MutationCallback) {
            super(callback);
            observers.push(this);
        }
    });
    document.body.innerHTML = `
        <div id="pagelet_frs-list/pagelet/thread"><ul id="thread_list">${imageMarkup()}</ul></div>
        <aside class="threadlist_media"><img src="/blank.gif" data-original="https://example.com/outside.jpg"></aside>
    `;
});

afterEach(() => {
    observers.splice(0).forEach(observer => observer.disconnect());
    windowEvents.mock.calls.forEach(([event, listener, options]) => {
        window.removeEventListener(event, listener, options);
    });
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
});

describe("forum thumbnail recovery", () => {
    it("initially restores only list thumbnails and preserves the fallback behavior", async () => {
        const pageScan = vi.spyOn(document, "querySelectorAll");
        await install();

        const img = thumbnail();
        expect(img.src).toBe("https://example.com/thumb.jpg");
        expect(img.dataset.trexThumbnailRestored).toBe("1");
        expect(img.dataset.trexThumbnailBound).toBe("1");
        expect(img.style.backgroundImage).toContain(img.src);
        expect(document.querySelector("aside img")?.getAttribute("src")).toBe("/blank.gif");
        expect(pageScan).not.toHaveBeenCalled();

        Object.defineProperties(img, {
            complete: { configurable: true, value: true },
            naturalWidth: { configurable: true, value: 100 },
        });
        img.dispatchEvent(new Event("load"));
        expect(img.style.backgroundImage).toBe("");
    });

    it("keeps URL validation, placeholder rejection and source priority unchanged", async () => {
        listElement().innerHTML = `
            <li class="threadlist_media">
                <img src="/blank.gif" data-original="javascript:alert(1)" data-src="https://example.com/transparent.gif" bpic="https://example.com/large.jpg">
                <img src="/blank.gif" data-original="https://example.com/first.jpg" data-src="https://example.com/second.jpg">
                <img src="/blank.gif" data-original="not-a-url" bpic="data:image/gif;base64,R0lGODlhAQ">
            </li>`;
        await install();

        const images = [...listElement().querySelectorAll("img")];
        expect(images.map(img => img.getAttribute("src"))).toEqual([
            "https://example.com/large.jpg", "https://example.com/first.jpg", "/blank.gif",
        ]);
    });

    it("coalesces shared structural events and recovers newly inserted nodes", async () => {
        await install();
        const scan = vi.spyOn(listElement(), "querySelectorAll");
        listElement().insertAdjacentHTML("beforeend", imageMarkup("https://example.com/added.jpg"));
        await Promise.resolve();
        listElement().insertAdjacentHTML("beforeend", imageMarkup("https://example.com/added-again.jpg"));
        await settle();

        expect(scan).toHaveBeenCalledTimes(1);
        expect(listElement().lastElementChild?.querySelector("img")?.src).toBe("https://example.com/added-again.jpg");
    });

    it("rebinds attributes after AJAX replaces the list root and releases the old root", async () => {
        await install();
        const oldList = listElement();
        const nextList = document.createElement("ul");
        nextList.id = "thread_list";
        nextList.innerHTML = imageMarkup("https://example.com/next.jpg");
        oldList.replaceWith(nextList);
        await settle();
        expect(thumbnail().src).toBe("https://example.com/next.jpg");

        thumbnail().setAttribute("data-original", "https://example.com/lazy.jpg");
        await settle();
        expect(thumbnail().src).toBe("https://example.com/lazy.jpg");

        const scan = vi.spyOn(nextList, "querySelectorAll");
        thumbnail(oldList).setAttribute("data-original", "https://example.com/detached.jpg");
        await settle();
        expect(scan).not.toHaveBeenCalled();
    });

    it("does not scan for unrelated body changes or non-image attributes", async () => {
        await install();
        await settle();
        const scan = vi.spyOn(listElement(), "querySelectorAll");
        document.body.append(document.createElement("section"));
        document.querySelector("aside img")?.setAttribute("data-original", "https://example.com/unrelated.jpg");
        listElement().style.display = "block";
        thumbnail().className = "lazy";
        await settle();
        expect(scan).not.toHaveBeenCalled();
    });

    it("recovers lazy src changes without self-triggered repeat scans", async () => {
        await install();
        await settle();
        const scan = vi.spyOn(listElement(), "querySelectorAll");
        thumbnail().src = "/blank.gif";
        await settle();
        expect(thumbnail().src).toBe("https://example.com/thumb.jpg");
        expect(scan).toHaveBeenCalledTimes(1);
        await settle();
        expect(scan).toHaveBeenCalledTimes(1);
    });

    it("uses the shared observer to discover a late pagelet and list", async () => {
        const pagelet = listElement().parentElement!;
        pagelet.remove();
        await install();
        document.body.append(pagelet);
        await settle();
        expect(thumbnail().src).toBe("https://example.com/thumb.jpg");
    });

    it("falls back to the pagelet until a list root appears", async () => {
        const pagelet = listElement().parentElement!;
        pagelet.innerHTML = imageMarkup();
        await install();
        expect(thumbnail(pagelet).src).toBe("https://example.com/thumb.jpg");
        pagelet.innerHTML = `<ul id="thread_list">${imageMarkup("https://example.com/list.jpg")}</ul>`;
        await settle();
        expect(thumbnail().src).toBe("https://example.com/list.jpg");
    });
});
