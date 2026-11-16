import { afterEach, describe, expect, it, vi } from "vitest";
import { parseForumSidebar, parseSearchResult } from "./tieba-search";
import { addFavoriteTags, addFavorInstance, cancelFavorInstance, fetchForumSidebar, getTbs, searchForumPosts, signPcForm } from "./tieba";

const picture = {
    type: "pic", width: "560", height: "840",
    small_pic: "https://tiebapic.baidu.com/forum/crop/photo.jpg",
    big_pic: "https://tiebapic.baidu.com/forum/pic/item/photo.jpg",
    water_pic: "https://tiebapic.baidu.com/forum/w=580/photo.jpg",
};

const thread = {
    tid: "11170219929", pid: 154110797304, cid: "0", type: 1,
    title: "有一说一，这几天影之刃的各种节奏反而给我另一种感觉",
    content: "国内社区法环真的有大一群云玩。 ", time: 1793898789,
    user: {
        user_name: "玉皇主宰", user_id: 6628742769, show_nickname: "楼主",
        portrait: "https://gss0.bdstatic.com/6LZ1dD3d1sgCo2Kml5_Y_D3/sys/portrait/item/tb.1.8a2d11de.JsyYL8U1PudFMBDXK-ajWw?t=1755690358",
    },
    post_num: 294, like_num: 752, media: [picture], forum_name: "steam", forum_id: 707597,
    forum_info: { forum_name: "steam", avatar: "https://tiebapic.baidu.com/forum/steam.jpg" },
};

const comment = {
    tid: "11008133315", pid: "153917325028", cid: "0", type: 2,
    title: "回复：今天能玩影之刃咯，芜湖?", content: "在某个美好的平行世界，我们正在爽玩影之刃零",
    time: 1788929554, media: [picture],
    user: { user_name: "烂梗龙", user_id: 560119572, show_nickname: "BABTHYY" },
    main_post: {
        title: "今天能玩影之刃咯，芜湖", content: " ", tid: 11008133315,
        user: { user_name: "xiaxiaoyongya", show_nickname: "fire!fire！" },
    },
};

const sidebar = {
    error_code: 0,
    data: {
        forum_brief: { post_num: 74845895, member_num: 4869299, slogan: "国内最大的steam讨论社区之一！", desc: "欢迎大家一起交流探讨", create_day: "2004.07.19" },
        forum_member_info: { user_level: 14, level_name: "帽子大亨", cur_score: 21296, levelup_score: 30000 },
        member_group_info: { member_group_list: [
            { role_name: "manager", name_show: "飞奔の煎蛋", portrait: "tb.1.2db16476.8t_o2sb9ZfRChdKy_K_byg?t=1793932778" },
            { role_name: "assist", name_show: "正版_钢蛋A", portrait: "tb.1.ade87c7e.I4bVL2bn-5fH5Bfxzohrsg" },
        ] },
    },
};

const bottom = {
    error_code: 0,
    forum: { name: "steam", avatar: "https://tiebapic.baidu.com/forum/steam.jpg", is_like: 1 },
    area_data: [{ area_type: "forum-bang-card", card_data: [{ data: { bang_list: [
        { tab_name: "游戏推荐", tab_type: 1 }, { tab_name: "Steam", tab_type: 1 }, { tab_name: "红信", tab_type: 2 },
    ] } }] }],
};

function result(post_list: unknown[], extra = {}) {
    return { no: 0, data: { post_list, current_page: 1, has_more: 1, ...extra } };
}

function response(body: unknown) {
    return { ok: true, json: async () => body };
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe("搜索结果规范化", () => {
    it("读取主题、头像 token、图片与毫秒时间", () => {
        const page = parseSearchResult(result([thread]));
        expect(page).toMatchObject({ hasMore: true, page: 1 });
        expect(page.posts[0]).toMatchObject({
            type: "thread", tid: 11170219929, pid: 154110797304, url: "/p/11170219929",
            time: 1793898789000, replyCount: 294, agreeCount: 752, forum: { id: 707597 },
            author: { id: 6628742769, name: "玉皇主宰", displayName: "楼主", portrait: "tb.1.8a2d11de.JsyYL8U1PudFMBDXK-ajWw" },
            images: [{ thumb: picture.small_pic, full: picture.big_pic, width: 560, height: 840 }],
        });
    });

    it("楼层引用展示原帖标题，顶层 media 只进入引用块", () => {
        expect(parseSearchResult(result([comment])).posts[0]).toMatchObject({
            type: "comment", title: "", content: comment.content, images: [],
            url: "/p/11008133315?pid=153917325028#153917325028",
            quote: { author: "fire!fire！", content: comment.main_post.title, image: picture.water_pic, url: "/p/11008133315" },
        });
    });

    it("楼中楼引用 post_info 正文，同楼不同 cid 保持独立 key", () => {
        const floor = {
            tid: "8429715623", pid: "147692406455", cid: "147698733544", type: 3,
            content: "鬼泣5自动战斗模式", media: [picture],
            main_post: { tid: 8429715623, title: "切莫半场开香槟，《影之刃零》需要冷静看待" },
            post_info: { tid: 8429715623, pid: 147692406455, content: "真要一个按键出一大套招式那跟玩QTE有什么区别", user: { user_name: "yan031030311" } },
        };
        const posts = parseSearchResult(result([floor, { ...floor, cid: "147698733545" }, floor])).posts;
        expect(posts).toHaveLength(2);
        expect(posts[0].key).not.toBe(posts[1].key);
        expect(posts[0]).toMatchObject({
            url: "/p/8429715623?pid=147692406455&cid=147698733544#147698733544",
            quote: { author: "yan031030311", content: floor.post_info.content, url: "/p/8429715623?pid=147692406455#147692406455" },
        });
    });

    it("flash 媒体映射视频封面", () => {
        const video = { ...thread, tid: "11167215146", media: [{ type: "flash", vpic: "https://tiebapic.baidu.com/forum/cover.jpg", width: 1280, height: 720 }] };
        expect(parseSearchResult(result([video])).posts[0]).toMatchObject({ images: [], video: { cover: video.media[0].vpic } });
    });

    it("解码实体并移除高亮标记，保留文本中的比较符号", () => {
        const post = { ...thread, title: "<em>影之刃</em> &amp; &quot;Steam&quot;", content: "代表达到了一个&quot;存盘点&quot;<br>1 < 2 &lt;标题&gt;<script>bad()</script>" };
        expect(parseSearchResult(result([post])).posts[0]).toMatchObject({ title: '影之刃 & "Steam"', content: '代表达到了一个"存盘点"\n1 < 2 <标题>' });
    });

    it("保留全局搜索每条结果的吧信息", () => {
        const post = { ...thread, tid: "11168477005", title: "战神vs影之刃零（脸模对比）", forum_name: "ps5", forum_info: { forum_name: "ps5", avatar: "https://tiebapic.baidu.com/forum/ps5.jpg" } };
        expect(parseSearchResult(result([post])).posts[0].forum).toEqual({ id: 707597, name: "ps5", avatar: "https://tiebapic.baidu.com/forum/ps5.jpg" });
    });

    it("过滤无效 ID、危险 URL、错误字段类型并给出缺省值", () => {
        const page = parseSearchResult(result([null, {}, { tid: -1 }, { tid: true }, { tid: "1", user: { portrait: "javascript:alert(1)" }, title: {}, time: 1e20, media: [{ ...picture, big_pic: "javascript:alert(1)", small_pic: "", water_pic: "" }] }], { current_page: -2, has_more: "0" }));
        expect(page.posts).toHaveLength(1);
        expect(page).toMatchObject({ page: 1, hasMore: false });
        expect(page.posts[0]).toMatchObject({ title: "", time: 0, images: [], author: { avatar: "", portrait: "" }, forum: { id: 0, name: "", avatar: "" } });
        expect(parseSearchResult(null)).toEqual({ posts: [], hasMore: false, page: 1 });
        expect(parseSearchResult(result([], { has_more: 0 }))).toEqual({ posts: [], hasMore: false, page: 1 });
    });
});

describe("吧详情规范化", () => {
    it("合并右侧栏与吧资料的真实字段", () => {
        expect(parseForumSidebar({ ...sidebar, forum: bottom.forum, area_data: bottom.area_data })).toEqual({
            name: "steam", avatar: bottom.forum.avatar, intro: "国内最大的steam讨论社区之一！\n欢迎大家一起交流探讨", tags: ["游戏推荐", "Steam"],
            memberCount: "4869299", postCount: "74845895", createdAt: "2004.07.19", followed: true,
            level: { index: 14, name: "帽子大亨", exp: 21296, expMax: 30000 },
            managers: [
                { role: "吧主", name: "飞奔の煎蛋", avatar: "https://gss0.baidu.com/7Ls0a8Sm2Q5IlBGlnYG/sys/portrait/item/tb.1.2db16476.8t_o2sb9ZfRChdKy_K_byg", homeUrl: "/home/main?id=tb.1.2db16476.8t_o2sb9ZfRChdKy_K_byg" },
                { role: "小吧主", name: "正版_钢蛋A", avatar: "https://gss0.baidu.com/7Ls0a8Sm2Q5IlBGlnYG/sys/portrait/item/tb.1.ade87c7e.I4bVL2bn-5fH5Bfxzohrsg", homeUrl: "/home/main?id=tb.1.ade87c7e.I4bVL2bn-5fH5Bfxzohrsg" },
            ],
        });
    });

    it("未登录、缺字段以及字符串计数容错", () => {
        expect(parseForumSidebar(null)).toMatchObject({ name: "", tags: [], managers: [], followed: false, level: undefined });
        expect(parseForumSidebar({ data: { forum_brief: { member_num: "486.9W", post_num: "7.5KW" } } })).toMatchObject({ memberCount: "486.9W", postCount: "7.5KW", level: undefined });
    });
});

describe("搜索请求", () => {
    it("发送真实的相关评论参数并复用 PC 签名", async () => {
        const mock = vi.fn().mockResolvedValue(response(result([])));
        vi.stubGlobal("fetch", mock);
        await searchForumPosts({ word: "影之刃", forumName: "steam", type: "comment", sort: "relevance", page: 1 });
        const url = new URL(mock.mock.calls[0][0], "https://tieba.baidu.com");
        expect(Object.fromEntries(url.searchParams)).toEqual({ st: "2", tt: "3", fname: "steam", word: "影之刃", pn: "1", rn: "20", subapp_type: "pc", _client_type: "20", sign: "88b814595df5160a1384911bbc8faa0e" });
    });

    it("全局搜索省略 fname，并规范化页码", async () => {
        const mock = vi.fn().mockResolvedValue(response(result([])));
        vi.stubGlobal("fetch", mock);
        await searchForumPosts({ word: "游戏", type: "thread", sort: "time", page: -1, pageSize: NaN });
        const url = new URL(mock.mock.calls[0][0], "https://tieba.baidu.com");
        expect(url.searchParams.has("fname")).toBe(false);
        expect(url.searchParams.get("pn")).toBe("1");
        expect(url.searchParams.get("rn")).toBe("20");
    });

    it("合并两个已签名的同源侧栏接口", async () => {
        const mock = vi.fn().mockImplementation((url: string) => Promise.resolve(response(url.includes("frsSidebarRight") ? sidebar : bottom)));
        vi.stubGlobal("fetch", mock);
        expect(await fetchForumSidebar("steam")).toMatchObject({ name: "steam", followed: true, tags: ["游戏推荐", "Steam"] });
        expect(mock).toHaveBeenCalledTimes(2);
        for (const [path] of mock.mock.calls) {
            const url = new URL(path, "https://tieba.baidu.com");
            const sign = url.searchParams.get("sign");
            url.searchParams.delete("sign");
            expect(sign).toBe(signPcForm(Object.fromEntries(url.searchParams)));
        }
    });

    it("接口错误、HTTP 错误及损坏的响应抛出明确错误", async () => {
        const query = { word: "游戏", type: "thread" as const, sort: "time" as const, page: 1 };
        const mock = vi.fn().mockResolvedValue(response({ no: 210009, error: "param error" }));
        vi.stubGlobal("fetch", mock);
        await expect(searchForumPosts(query)).rejects.toThrow("param error");
        mock.mockResolvedValue({ ok: false, status: 503 });
        await expect(searchForumPosts(query)).rejects.toThrow("503");
        mock.mockResolvedValue(response(null));
        await expect(searchForumPosts(query)).rejects.toThrow("格式错误");
        mock.mockResolvedValue(response({ error_code: 210009, error_msg: "系统错误" }));
        await expect(fetchForumSidebar("missing")).rejects.toThrow("系统错误");
        await expect(searchForumPosts({ ...query, word: " " })).rejects.toThrow("关键词");
    });
});

describe("无 PageData 的凭证获取", () => {
    it("优先读取旧版 PageData", async () => {
        vi.stubGlobal("PageData", { tbs: "legacy-tbs" });
        const mock = vi.fn();
        vi.stubGlobal("fetch", mock);
        expect(await getTbs()).toBe("legacy-tbs");
        expect(mock).not.toHaveBeenCalled();
    });

    it("失败后允许重试，成功后缓存并合并并发请求", async () => {
        vi.stubGlobal("PageData", undefined);
        const mock = vi.fn().mockResolvedValueOnce(response({})).mockResolvedValue(response({ tbs: "search-tbs", is_login: 1 }));
        vi.stubGlobal("fetch", mock);
        await expect(getTbs()).rejects.toThrow("凭证不存在");
        expect(await Promise.all([getTbs(), getTbs()])).toEqual(["search-tbs", "search-tbs"]);
        expect(await getTbs()).toBe("search-tbs");
        expect(mock).toHaveBeenCalledTimes(2);
        expect(mock).toHaveBeenLastCalledWith("/dc/common/tbs");
    });

    it("搜索页收藏、取消收藏及标签操作通过接口凭证完成", async () => {
        vi.stubGlobal("PageData", undefined);
        const mock = vi.fn().mockImplementation((path: string) => {
            if (path === "/p/12345") return Promise.resolve({ ok: true, text: async () => 'follow_sign: "thread-sign"' });
            return Promise.resolve(response({ is_done: true, error_no: 0, no: 0 }));
        });
        vi.stubGlobal("fetch", mock);
        await addFavorInstance(12345, 707597);
        await cancelFavorInstance(12345, 707597);
        await addFavoriteTags(12345, ["游戏"]);
        const calls = mock.mock.calls;
        expect(calls.filter(([path]) => path === "/p/12345")).toHaveLength(1);
        const favorite = calls.find(([path]) => path === "/i/submit/open_storethread");
        expect(new URLSearchParams(favorite?.[1].body).get("tbs")).toBe("thread-sign");
        const tags = calls.filter(([path]) => path === "/ugctag/delStorThread" || path === "/ugctag/addStorThreadTags");
        expect(tags).toHaveLength(2);
        tags.forEach(([, options]) => expect(new URLSearchParams(options.body).get("tbs")).toBe("search-tbs"));
    });
});
