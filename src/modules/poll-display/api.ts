import { gmRequest } from "@/lib/monkey";
import { md5 } from "./md5";

const API_URL = "https://tiebac.baidu.com/c/f/pb/page";
const VOTE_API_URL = "https://tiebac.baidu.com/c/c/post/addPollPost";
const SIGN_SALT = "tiebaclient!!!";

export interface PollOption {
    id: number;
    text: string;
    num: number;
}

export interface PollInfo {
    title?: string;
    is_multi: 0 | 1; // 0=单选, 1=多选
    options_count: number;
    total_num: number;
    total_poll: number;
    options: PollOption[];
    polled_value: string; // 已投选项 id，逗号分隔
    is_polled: 0 | 1; // 0=未投, 1=已投
    end_time: number; // 秒时间戳，-1=无截止
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

interface VoteResponse {
    error_code: number | string;
    error_msg?: string;
    info?: {
        needlogin?: string | number;
    };
}

export interface SubmitPollVoteOptions {
    threadId: number | string;
    forumId: number | string;
    optionIds: number[];
}

function createClientForm(form: Record<string, string>): Record<string, string> {
    return {
        _client_id: genClientId(),
        _client_type: "2",
        _client_version: "12.50.1.0",
        _phone_imei: "000000000000000",
        from: "baidu_appstore",
        net_type: "1",
        timestamp: String(Date.now()),
        ...form,
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

function genClientId(): string {
    return `wappc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export async function fetchPollInfo(tid: number | string): Promise<PollInfo | null> {
    const form = createClientForm({
        kz: String(tid),
        pn: "1",
        rn: "30",
        st_type: "pb_page",
    });
    form.sign = signForm(form);

    const res = await gmRequest<"json">({
        method: "POST",
        url: API_URL,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
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

export async function submitPollVote(opts: SubmitPollVoteOptions): Promise<void> {
    const ids = normalizeOptionIds(opts.optionIds);
    if (ids.length === 0) {
        throw new Error("请选择投票选项");
    }

    const form = createClientForm({
        thread_id: String(opts.threadId),
        forum_id: String(opts.forumId),
        options: ids.join(","),
    });
    form.sign = signForm(form);

    const res = await gmRequest<"json">({
        method: "POST",
        url: VOTE_API_URL,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: buildFormBody(form),
        responseType: "json",
        timeout: 10_000,
    });

    const body = res.response as VoteResponse | null;
    if (!body) {
        throw new Error(`addPollPost returned empty body (status=${res.status})`);
    }

    const errno = typeof body.error_code === "string" ? Number(body.error_code) : body.error_code;
    if (errno !== 0) {
        throw new Error(body.error_msg || `addPollPost error ${errno}`);
    }
}

function normalizeOptionIds(ids: number[]): number[] {
    const result: number[] = [];
    for (const id of ids) {
        if (!Number.isInteger(id)) continue;
        if (id <= 0) continue;
        if (result.includes(id)) continue;
        result.push(id);
    }
    return result;
}
