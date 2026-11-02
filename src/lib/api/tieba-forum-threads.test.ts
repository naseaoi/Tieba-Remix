import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { tiebaAPI } from "./tieba";
import { fetchForumThreads, parseForumThreadsResponse } from "./tieba-forum-threads";

const thumb = "https://tiebapic.baidu.com/forum/thumbnail.jpg";
const big = "https://tiebapic.baidu.com/forum/big.jpg";
const original = "https://tiebapic.baidu.com/forum/original.jpg";
const portrait = "tb.1.d98ffd15.9FSGF9sTk3zYsOpxGMDGBA";
const avatar = `https://gss0.bdstatic.com/sys/portrait/item/${portrait}?t=1793591078`;
const home = "https://tieba.baidu.com/home/main?id=other";

function page(thread: Record<string, unknown>) {
    return { error_code: 0, thread_list: [{ id: 123, title: "帖子", ...thread }] };
}

function independentSign(form: Record<string, string>): string {
    const input = Object.entries(form).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
        .map(([key, value]) => `${key}=${value}`).join("");
    return createHash("md5").update(`${input}36770b1f34c9bbf2e7d1a99d2b82fa9e`).digest("hex");
}

describe("吧页帖子解析", () => {
    it("解析作者、摘要、图片、时间、计数与标记", () => {
        const result = parseForumThreadsResponse({
            error_code: "0",
            page: { has_more: 1, current_page: 1, total_page: 10 },
            thread_list: [{
                id: 123,
                title: "测试标题",
                first_post_id: 456,
                create_time: 1793591000,
                last_time_int: 1793592000,
                reply_num: 12,
                agree_num: 34,
                agree: { agree_num: 999 },
                view_num: 56,
                is_top: 1,
                is_good: "1",
                is_tiebaplus_ad: "0",
                author: {
                    show_icon_list: [null, { type: "level", text: "10" }, { type: "name_show", text: "显示名" }],
                    user_show_info: { feed_head: { image_data: { img_url: avatar }, schema: home } },
                },
                abstract: [{ type: 0, text: "第一段" }, { type: 3, text: "忽略" }, { type: "0", text: "第二段" }],
                media: [{ type: 3, src_pic: thumb, big_pic: big, origin_pic: original, width: 640, height: 480 }],
            }],
        });
        expect(result).toEqual({
            hasMore: true,
            threads: [{
                tid: 123,
                title: "测试标题",
                url: "/p/123",
                authorName: "显示名",
                authorAvatar: avatar,
                authorHome: home,
                authorPortrait: portrait,
                firstPostId: 456,
                createTime: 1793591000,
                lastTime: 1793592000,
                replyNum: 12,
                agreeNum: 34,
                abstract: "第一段第二段",
                images: [{ thumb, large: original, width: 640, height: 480 }],
                isTop: true,
                isGood: true,
            }],
        });
    });

    it("缺失可选字段时返回默认值并支持 tid", () => {
        expect(parseForumThreadsResponse({ error_code: 0, thread_list: [{ tid: 123, title: "帖子" }] })).toEqual({
            hasMore: false,
            threads: [{
                tid: 123, title: "帖子", url: "/p/123",
                authorName: "", authorAvatar: "", authorHome: "", authorPortrait: "", firstPostId: 0,
                createTime: 0, lastTime: 0, replyNum: 0, agreeNum: 0,
                abstract: "", images: [], isTop: false, isGood: false,
            }],
        });
    });

    it("过滤广告与无效帖子且保留服务端顺序", () => {
        const result = parseForumThreadsResponse({
            error_code: 0,
            thread_list: [
                { id: 8, title: "保留" },
                { id: 1, title: "广告", is_tiebaplus_ad: "1" },
                { id: 2, title: "广告", is_tiebaplus_ad: 1 },
                null, [], "invalid", {},
                { title: "缺 id" }, { id: 3 }, { id: 4, title: "  " }, { id: 5, title: 123 },
                ...[true, -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1, "bad"].map(id => ({ id, title: "非法 id" })),
                { id: 0, tid: "6", title: "回退 tid" },
            ],
        });
        expect(result.threads.map(thread => thread.tid)).toEqual([8, 6]);
    });

    it("按优先级回退图片地址并忽略视频及非法图片", () => {
        const result = parseForumThreadsResponse(page({ media: [
            { type: 3, big_pic: big, origin_pic: original, width: "800", height: "600" },
            { type: "3", big_pic: big },
            { type: 3, src_pic: thumb, width: -1, height: "bad" },
            { type: 3, src_pic: "javascript:alert(1)", big_pic: big, origin_pic: "data:image/png;base64,AA" },
            { type: 3, origin_pic: original },
            { type: 5, src_pic: thumb },
            { type: 3, src_pic: "not a url" },
            null, {},
        ] }));
        expect(result.threads[0].images).toEqual([
            { thumb: big, large: original, width: 800, height: 600 },
            { thumb: big, large: big, width: 0, height: 0 },
            { thumb, large: thumb, width: 0, height: 0 },
            { thumb: big, large: big, width: 0, height: 0 },
        ]);
    });

    it("规范化数字字符串并读取嵌套点赞数", () => {
        expect(parseForumThreadsResponse(page({
            create_time: "1793591000", last_time_int: "1793592000", reply_num: "12",
            agree: { agree_num: "34" }, first_post_id: "456", is_top: "0", is_good: 0,
        })).threads[0]).toMatchObject({
            createTime: 1793591000, lastTime: 1793592000, replyNum: 12, agreeNum: 34,
            firstPostId: 456, isTop: false, isGood: false,
        });
        expect(parseForumThreadsResponse(page({ agree_num: 0, agree: { agree_num: 34 } })).threads[0].agreeNum).toBe(0);
    });

    it("容错处理非法嵌套字段及数字", () => {
        expect(parseForumThreadsResponse(page({
            author: { show_icon_list: {}, user_show_info: { feed_head: { image_data: [], schema: "javascript:alert(1)" } } },
            media: {}, abstract: [null, { type: 0, text: 123 }],
            create_time: false, last_time_int: -1, reply_num: Infinity, agree_num: "bad", first_post_id: 1.5,
        })).threads[0]).toMatchObject({
            authorName: "", authorAvatar: "", authorHome: "", authorPortrait: "",
            abstract: "", images: [], createTime: 0, lastTime: 0, replyNum: 0, agreeNum: 0, firstPostId: 0,
        });
        for (const author of [null, [], { show_icon_list: [false], user_show_info: null }]) {
            expect(parseForumThreadsResponse(page({ author })).threads[0].authorName).toBe("");
        }
    });

    it.each([undefined, "https://gss0.bdstatic.com/unmatched.jpg"])("头像 %s 无 portrait 时解码主页 id", imgUrl => {
        const schema = `https://tieba.baidu.com/home/main?id=${encodeURIComponent(`${portrait}?t=1793591078`)}&fr=index`;
        expect(parseForumThreadsResponse(page({
            author: { user_show_info: { feed_head: { image_data: { img_url: imgUrl }, schema } } },
        })).threads[0].authorPortrait).toBe(portrait);
    });

    it("头像与主页都没有 portrait 时返回空串", () => {
        expect(parseForumThreadsResponse(page({
            author: { user_show_info: { feed_head: {
                image_data: { img_url: "https://gss0.bdstatic.com/unmatched.jpg" },
                schema: "https://tieba.baidu.com/home/main?fr=index",
            } } },
        })).threads[0].authorPortrait).toBe("");
    });

    it.each([undefined, null, {}, "invalid"])("缺失或非法列表 %s 返回空数组", threadList => {
        expect(parseForumThreadsResponse({ error_code: 0, thread_list: threadList })).toEqual({ threads: [], hasMore: false });
    });

    it.each([0, "0", 1, "1", undefined, 2])("分页状态 %s 直接来自 has_more", hasMore => {
        expect(parseForumThreadsResponse({ ...page({}), page: { has_more: hasMore } }).hasMore)
            .toBe(hasMore === 1 || hasMore === "1");
    });

    it.each([1, "12"])("错误码 %s 抛出接口错误消息", errorCode => {
        expect(() => parseForumThreadsResponse({ error_code: errorCode, error_msg: "贴吧不存在" }))
            .toThrow(new Error("贴吧不存在"));
    });

    it.each([null, [], {}, { error_code: false }, { error_code: null }])("非法响应 %# 抛出默认错误", json => {
        expect(() => parseForumThreadsResponse(json)).toThrow("吧页帖子接口错误");
    });
});

describe("吧页帖子请求", () => {
    afterEach(() => vi.unstubAllGlobals());

    it.each([0, 1] as const)("sortType=%s 的表单与签名正确", async sortType => {
        const response = { ok: true };
        const fetchMock = vi.fn().mockResolvedValue(response);
        vi.stubGlobal("fetch", fetchMock);
        expect(await tiebaAPI.forumThreads("测试 & 吧+", 2, sortType)).toBe(response);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe("/c/f/frs/page");
        expect(options.method).toBe("POST");
        expect(options.headers).toEqual({
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
        });
        const form = { kw: "测试 & 吧+", pn: "2", rn: "30", sort_type: String(sortType), subapp_type: "pc", _client_type: "20" };
        expect(options.body).toBeInstanceOf(URLSearchParams);
        expect(Object.fromEntries(new URLSearchParams(options.body))).toEqual({ ...form, sign: independentSign(form) });
    });

    it.each([undefined, 3])("共用签名函数保持楼中楼 page=%s 的表单不变", async pn => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);
        await tiebaAPI.subPostContent(11055215765, 153973371593, pn);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe("/c/f/pb/floor");
        expect(options.method).toBe("POST");
        expect(options.headers).toEqual({
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
        });
        const form = { kz: "11055215765", pid: "153973371593", pn: String(pn ?? 1), rn: "100", subapp_type: "pc", _client_type: "20" };
        expect(Object.fromEntries(new URLSearchParams(options.body))).toEqual({ ...form, sign: independentSign(form) });
    });

    it("fetchForumThreads 将请求响应交给解析器", async () => {
        const json = { ...page({}), page: { has_more: 1 } };
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => json });
        vi.stubGlobal("fetch", fetchMock);
        expect(await fetchForumThreads("测试吧", 3, 1)).toEqual(parseForumThreadsResponse(json));
        const form = new URLSearchParams(fetchMock.mock.calls[0][1].body);
        expect(form.get("kw")).toBe("测试吧");
        expect(form.get("pn")).toBe("3");
        expect(form.get("sort_type")).toBe("1");
    });

    it("HTTP 错误在解析前抛出", async () => {
        const json = vi.fn();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, json }));
        await expect(fetchForumThreads("测试吧", 1, 1)).rejects.toThrow("吧页帖子请求失败 (503)");
        expect(json).not.toHaveBeenCalled();
    });

    it("透传接口错误及网络失败", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ error_code: "1", error_msg: "访问失败" }) }));
        await expect(fetchForumThreads("测试吧", 1, 0)).rejects.toThrow("访问失败");
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("网络失败")));
        await expect(fetchForumThreads("测试吧", 1, 0)).rejects.toThrow("网络失败");
    });
});
