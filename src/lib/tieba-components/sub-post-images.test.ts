import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchImagePage = vi.fn();
const showImages = vi.fn();

vi.mock("@/lib/api/remixed", () => ({ currentPageType: () => "thread" }));
vi.mock("@/lib/api/tieba", () => ({ fetchSubPostImagePage: fetchImagePage }));
vi.mock("@/components/images-viewer/viewer", () => ({ imagesViewer: showImages }));

describe("楼中楼图片", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("PageData", { thread: { thread_id: 11055215765 } });
        document.body.innerHTML = `
            <div id="j_p_postlist">
                <li class="lzl_single_post" data-field="{'pid':'153973371593','spid':'153973374536'}">
                    <span class="lzl_content_main">正文[图片]尾部[图片]</span>
                </li>
            </div>
        `;
        fetchImagePage.mockResolvedValue({
            imagesById: new Map([[153973374536, [
                { original: "https://tiebapic.baidu.com/first.jpg", thumbnail: "https://tiebapic.baidu.com/first-small.jpg" },
                { original: "https://tiebapic.baidu.com/second.jpg", thumbnail: "https://tiebapic.baidu.com/second-small.jpg" },
            ]]]),
            hasMore: false,
        });
    });

    it("按占位顺序显示图片，重复扫描不会重复插入", async () => {
        const { renderSubPostImages } = await import("./sub-post-images");
        renderSubPostImages();

        await vi.waitFor(() => {
            expect(document.querySelectorAll(".tbr-sub-post-image")).toHaveLength(2);
        });
        const content = document.querySelector<HTMLElement>(".lzl_content_main");
        expect(content?.textContent).toBe("正文尾部");
        expect(content?.querySelectorAll("img")[0]?.getAttribute("src")).toBe("https://tiebapic.baidu.com/first-small.jpg");
        expect(content?.querySelectorAll("a")[1]?.getAttribute("href")).toBe("https://tiebapic.baidu.com/second.jpg");

        renderSubPostImages();
        expect(fetchImagePage).toHaveBeenCalledTimes(1);
        expect(content?.querySelectorAll("img")).toHaveLength(2);

        content?.querySelectorAll("a")[1]?.click();
        expect(showImages).toHaveBeenCalledWith(expect.objectContaining({ defaultIndex: 1 }));
    });
});
