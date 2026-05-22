// 贴吧 App 端接口客户端
// 用途：拉取帖子的投票数据（poll_info），web/wap 端不下发，必须走 App 接口。
//
// 接口：POST https://tiebac.baidu.com/c/f/pb/page
// 鉴权：表单 key 字典序拼成 `k=v` 字符串，末尾加盐 `tiebaclient!!!`，MD5 大写，作为 sign 字段；
//      匿名也可获取 poll_info 公共数据（is_polled/polled_value 此时无意义，固定为 0/""）。
//
// 跨域：tiebac.baidu.com 没有 CORS 头，浏览器内 fetch 会被拦截，必须走 GM_xmlhttpRequest，
//      vite.config.ts 的 userscript.connect 已声明 tiebac.baidu.com。

import { gmRequest } from "@/lib/monkey";
import { md5 } from "./md5";

const API_URL = "https://tiebac.baidu.com/c/f/pb/page";
const SIGN_SALT = "tiebaclient!!!";

/** 投票选项 */
export interface PollOption {
    id: number;
    text: string;
    num: number;
}

/** 投票数据 */
export interface PollInfo {
    /** 投票标题（部分老帖可能缺省，回落到帖子标题） */
    title?: string;
    /** 0=单选, 1=多选 */
    is_multi: 0 | 1;
    /** 选项数 */
    options_count: number;
    /** 总投票数（推测=总参与人数） */
    total_num: number;
    /** 总票数（多选时与 total_num 可能不同） */
    total_poll: number;
    options: PollOption[];
    /** 当前用户已投选项的 id（多选用逗号分隔），匿名时为空字符串 */
    polled_value: string;
    /** 当前用户是否已投（0=否, 1=是），匿名时恒为 0 */
    is_polled: 0 | 1;
    /** 截止时间戳（秒）；-1=无截止 */
    end_time: number;
    last_time?: number;
}

interface PbPageResponse {
    error_code: number | string;
    error_msg?: string;
    thread?: {
        origin_thread_info?: {
            poll_info?: PollInfo;
        };
    };
}

function signForm(form: Record<string, string>): string {
    const keys = Object.keys(form).sort();
    let raw = "";
    for (const k of keys) raw += `${k}=${form[k]}`;
    raw += SIGN_SALT;
    return md5(raw).toUpperCase();
}

function buildFormBody(form: Record<string, string>): string {
    const sp = new URLSearchParams();
    for (const k of Object.keys(form)) sp.append(k, form[k]);
    return sp.toString();
}

/** 随机生成一个客户端 id，模仿 App 行为，无需稳定 */
function genClientId(): string {
    return "wappc_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

/**
 * 拉取帖子 poll_info
 * @param tid 帖子 id（PageData.thread.thread_id）
 * @returns 投票数据；帖子无投票时返回 null；网络/接口错误抛异常
 */
export async function fetchPollInfo(tid: number | string): Promise<PollInfo | null> {
    const form: Record<string, string> = {
        _client_id: genClientId(),
        _client_type: "2",
        _client_version: "12.50.1.0",
        _phone_imei: "000000000000000",
        from: "baidu_appstore",
        kz: String(tid),
        net_type: "1",
        pn: "1",
        rn: "30",
        st_type: "pb_page",
        timestamp: String(Date.now()),
    };
    form.sign = signForm(form);

    const res = await gmRequest<"json">({
        method: "POST",
        url: API_URL,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            // Tampermonkey 出于安全限制不允许覆盖 User-Agent 头；这里不设也能用
        },
        data: buildFormBody(form),
        responseType: "json",
        timeout: 10_000,
    });

    const body = res.response as PbPageResponse | null;
    if (!body) {
        throw new Error(`pb/page returned empty body (status=${res.status})`);
    }

    const errno = typeof body.error_code === "string" ? Number(body.error_code) : body.error_code;
    if (errno !== 0) {
        throw new Error(`pb/page error ${errno}: ${body.error_msg || "unknown"}`);
    }

    const poll = body.thread?.origin_thread_info?.poll_info;
    if (!poll || !Array.isArray(poll.options) || poll.options.length === 0) {
        return null;
    }
    return poll;
}
