import { afterEach, describe, expect, it, vi } from "vitest";
import { getNavUnreadCount, getNavUser, navLoginUrl, navLogoutUrl, parseNavUnreadCount, parseNavUser } from "./tieba-user";

vi.mock("./tieba", () => ({
    tiebaAPI: { userInfo: () => fetch("/f/user/json_userinfo") },
    signPcForm: () => "signed",
}));

afterEach(() => vi.unstubAllGlobals());

describe("导航栏用户信息", () => {
    it("解析新版用户名、头像与登录态", () => {
        expect(parseNavUser({ user_portrait: "portrait", user_name_weak: "用户名", user_name_url: "%E7%94%A8", user_name_show: "昵称", is_login: true, session_id: "session" })).toEqual({
            portrait: "portrait", userName: "用户名", nameUrl: "%E7%94%A8", displayName: "昵称", isLoggedIn: true, sessionId: "session",
        });
    });

    it("保留旧版已经编码的 name_url", () => {
        const user = parseNavUser({ portrait: "portrait", user_name: "用户名", name_url: "%E7%94%A8&ie=utf-8", is_login: 1 });
        expect(user.nameUrl).toBe("%E7%94%A8&ie=utf-8");
        expect(user.userName).toBe("用户名");
        expect(user.isLoggedIn).toBe(true);
    });

    it("区分字符串零、布尔登录态并过滤畸形字段", () => {
        expect(parseNavUser({ is_login: "0", user_name: {}, portrait: 42 }).isLoggedIn).toBe(false);
        expect(parseNavUser(undefined).portrait).toBe("");
        expect(parseNavUser({ user_name: "a &中" }).nameUrl).toBe(encodeURIComponent("a &中"));
    });

    it("没有 PageData 时从接口读取", async () => {
        vi.stubGlobal("PageData", undefined);
        const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ no: 0, data: { is_login: true, user_name_weak: "api-user" } }) });
        vi.stubGlobal("fetch", fetcher);
        expect((await getNavUser()).userName).toBe("api-user");
        expect(fetcher).toHaveBeenCalledOnce();
    });

    it("旧版完整用户数据直接使用 PageData", async () => {
        vi.stubGlobal("PageData", { user: { is_login: 1, user_name: "legacy" } });
        const fetcher = vi.fn();
        vi.stubGlobal("fetch", fetcher);
        expect((await getNavUser()).userName).toBe("legacy");
        expect(fetcher).not.toHaveBeenCalled();
    });

    it("免登录伪装状态由接口纠正", async () => {
        vi.stubGlobal("PageData", { user: { is_login: 1 } });
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ no: 0, data: { is_login: false } }) }));
        expect((await getNavUser()).isLoggedIn).toBe(false);
    });

    it("匿名接口返回 null 时保持未登录", async () => {
        vi.stubGlobal("PageData", undefined);
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => null }));
        expect((await getNavUser()).isLoggedIn).toBe(false);
    });

    it("接口失败明确报错", async () => {
        vi.stubGlobal("PageData", undefined);
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ no: 1 }) }));
        await expect(getNavUser()).rejects.toThrow("获取用户信息失败");
    });

    it("登录和退出返回当前搜索页且编码查询参数", () => {
        const returnUrl = "https://tieba.baidu.com/f/search/res?kw=steam&qw=影之刃#page";
        const login = new URL(navLoginUrl(returnUrl));
        const logout = new URL(navLogoutUrl(returnUrl, "session&x"));
        expect(login.hostname).toBe("passport.baidu.com");
        expect(login.searchParams.get("u")).toBe(returnUrl);
        expect(logout.searchParams.get("u")).toBe(returnUrl);
        expect(logout.searchParams.get("sid")).toBe("session&x");
    });
});

describe("导航栏新版未读计数", () => {
    it("合计 SPA 消息分类并忽略负数和异常值", () => {
        expect(parseNavUnreadCount({ error_code: 0, data: { user: { is_login: 1 }, msg: { agree: 2, atme: "3", fans: -1, replyme: "bad" } } })).toBe(5);
    });

    it("未登录清零且接口错误保留为失败", () => {
        expect(parseNavUnreadCount({ error_code: 0, data: { user: { is_login: 0 }, msg: { agree: 3 } } })).toBe(0);
        expect(() => parseNavUnreadCount({ error_code: 110001 })).toThrow();
    });

    it("请求签名 sync 接口", async () => {
        const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ error_code: 0, data: { user: { is_login: 1 }, msg: { replyme: 2 } } }) });
        vi.stubGlobal("fetch", fetcher);
        expect(await getNavUnreadCount()).toBe(2);
        expect(fetcher).toHaveBeenCalledWith("/c/s/pc/sync?subapp_type=pc&_client_type=20&sign=signed", expect.objectContaining({ credentials: "include" }));
    });
});
