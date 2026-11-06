import { signPcForm, tiebaAPI } from "./tieba";

export interface NavUser {
    portrait: string;
    userName: string;
    nameUrl: string;
    displayName: string;
    isLoggedIn: boolean;
    sessionId: string;
}

function record(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
    return typeof value === "string" ? value : "";
}

export function parseNavUser(value: unknown): NavUser {
    const user = record(value);
    const userName = text(user.user_name) || text(user.user_name_weak);
    return {
        portrait: text(user.portrait) || text(user.user_portrait),
        userName,
        nameUrl: text(user.name_url) || text(user.user_name_url) || encodeURIComponent(userName),
        displayName: text(user.user_name_show) || text(user.user_nickname) || userName,
        isLoggedIn: user.is_login === true || user.is_login === 1 || user.is_login === "1",
        sessionId: text(user.session_id),
    };
}

export async function getNavUser(): Promise<NavUser> {
    const legacy = typeof PageData !== "undefined" ? parseNavUser(PageData.user) : undefined;
    // 免登录模块会改写 is_login；缺失真实用户名时以接口为准。
    if (legacy?.userName) return legacy;
    const response = await tiebaAPI.userInfo();
    if (!response.ok) throw new Error("获取用户信息失败");
    const payload: unknown = await response.json();
    // 该接口对匿名访问返回 JSON null，而不是带 is_login 的对象。
    if (payload === null) return parseNavUser(undefined);
    const result = record(payload);
    if (result.no !== 0 || !result.data) throw new Error("获取用户信息失败");
    return parseNavUser(result.data);
}

export function navLoginUrl(returnUrl: string): string {
    return `https://passport.baidu.com/v2/?login&tpl=tb&u=${encodeURIComponent(returnUrl)}`;
}

export function navLogoutUrl(returnUrl: string, sessionId: string): string {
    return `https://wappass.baidu.com/passport?logout&sid=${encodeURIComponent(sessionId)}&u=${encodeURIComponent(returnUrl)}`;
}

export function parseNavUnreadCount(value: unknown): number {
    const result = record(value);
    if (result.error_code !== 0) throw new Error("获取未读消息失败");
    const data = record(result.data);
    const user = record(data.user);
    if (user.is_login !== 1 && user.is_login !== true && user.is_login !== "1") return 0;
    const messages = record(data.msg);
    return ["agree", "atme", "fans", "replyme"].reduce((total, key) => {
        const value = messages[key];
        const count = typeof value === "number" || typeof value === "string" ? Number(value) : 0;
        return total + (Number.isSafeInteger(count) && count > 0 ? count : 0);
    }, 0);
}

export async function getNavUnreadCount(): Promise<number> {
    const form = { subapp_type: "pc", _client_type: "20" };
    const response = await fetch(`/c/s/pc/sync?${new URLSearchParams({ ...form, sign: signPcForm(form) })}`, {
        credentials: "include",
        signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("获取未读消息失败");
    return parseNavUnreadCount(await response.json());
}
