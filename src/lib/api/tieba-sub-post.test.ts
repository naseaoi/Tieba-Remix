import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchSubPostImagePage } from "./tieba";

describe("新版楼中楼图片接口", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("读取图片项并忽略无效地址", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                error_code: 0,
                subpost_list: [{
                    id: 153973374536,
                    content: [
                        { type: 0, text: "我现在手里有400抽左右" },
                        {
                            type: 3,
                            origin_src: "https://tiebapic.baidu.com/forum/pic/item/photo.jpg",
                            cdn_src: "http://tiebapic.baidu.com/forum/w=720/photo.jpg",
                        },
                        { type: 3, origin_src: "javascript:alert(1)" },
                    ],
                }],
            }),
        });
        vi.stubGlobal("fetch", fetchMock);

        const result = await fetchSubPostImagePage(11055215765, 153973371593);
        expect(result.imagesById.get(153973374536)).toEqual([{
            original: "https://tiebapic.baidu.com/forum/pic/item/photo.jpg",
            thumbnail: "https://tiebapic.baidu.com/forum/w=720/photo.jpg",
        }]);
        expect(result.hasMore).toBe(false);
        const [path, options] = fetchMock.mock.calls[0];
        expect(path).toBe("/c/f/pb/floor");
        expect(new URLSearchParams(options.body).get("sign")).toBe("f85e17f35d3cc283b19c4473bccb38ad");
    });
});
