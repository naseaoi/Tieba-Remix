import { gmRequest } from "@/lib/monkey";
import { md5 } from "@/modules/poll-display/md5";

const API_URL = "https://tiebac.baidu.com/c/f/pb/page";
const SIGN_SALT = "tiebaclient!!!";

interface AgreeInfo {
    agree_num?: number | string;
    has_agree?: number | string;
}

interface PbPost {
    id?: number | string;
    agree?: AgreeInfo;
}

interface PbPageResponse {
    error_code: number | string;
    error_msg?: string;
    thread?: {
        agree?: AgreeInfo;
    };
    post_list?: PbPost[];
}

export interface AgreeSnapshot {
    threadAgree?: number;
    threadHasAgree: boolean;
    postAgreeById: Map<number, number>;
    postHasAgreeById: Map<number, boolean>;
}

export interface FetchAgreeSnapshotOptions {
    tid: number | string;
    pn: number;
    rn: number;
    lzOnly: boolean;
}

function signForm(form: Record<string, string>): string {
    const raw = Object.keys(form).sort().map(key => `${key}=${form[key]}`).join("") + SIGN_SALT;
    return md5(raw).toUpperCase();
}

function buildFormBody(form: Record<string, string>): string {
    const searchParams = new URLSearchParams();
    for (const key of Object.keys(form)) searchParams.append(key, form[key]);
    return searchParams.toString();
}

function genClientId(): string {
    return `wappc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function parseCount(value: unknown): number | undefined {
    const count = typeof value === "string" ? Number(value) : value;
    if (typeof count !== "number") return undefined;
    if (!Number.isFinite(count)) return undefined;
    if (count < 0) return undefined;
    return count;
}

function parseBool(value: unknown): boolean {
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") return value === "1";
    return false;
}

export async function fetchAgreeSnapshot(opts: FetchAgreeSnapshotOptions): Promise<AgreeSnapshot> {
    const form: Record<string, string> = {
        _client_id: genClientId(),
        _client_type: "2",
        _client_version: "12.50.1.0",
        _phone_imei: "000000000000000",
        from: "baidu_appstore",
        kz: String(opts.tid),
        net_type: "1",
        pn: String(opts.pn),
        rn: String(opts.rn),
        see_lz: String(Number(opts.lzOnly)),
        st_type: "pb_page",
        timestamp: String(Date.now()),
    };
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

    const postAgreeById = new Map<number, number>();
    const postHasAgreeById = new Map<number, boolean>();
    for (const post of body.post_list ?? []) {
        const id = parseCount(post.id);
        if (id == null) continue;
        const count = parseCount(post.agree?.agree_num);
        if (count != null) postAgreeById.set(id, count);
        postHasAgreeById.set(id, parseBool(post.agree?.has_agree));
    }

    return {
        threadAgree: parseCount(body.thread?.agree?.agree_num),
        threadHasAgree: parseBool(body.thread?.agree?.has_agree),
        postAgreeById,
        postHasAgreeById,
    };
}

const OP_AGREE_URL = "/c/c/agree/opAgree";

export const AGREE_OBJ_TYPE_THREAD = 3;
export const AGREE_OBJ_TYPE_FLOOR = 1;

export interface OpAgreeOptions {
    tid: number | string;
    pid: number | string;
    objType: number;
    cancel: boolean;
    tbs: string;
}

export async function opAgree(opts: OpAgreeOptions): Promise<void> {
    const form: Record<string, string> = {
        _client_type: "2",
        _client_version: "12.50.1.0",
        agree_type: "2",
        cuid: "",
        obj_type: String(opts.objType),
        op_type: opts.cancel ? "1" : "0",
        post_id: String(opts.pid),
        stoken: "",
        tbs: opts.tbs,
        thread_id: String(opts.tid),
        timestamp: String(Date.now()),
    };
    form.sign = signForm(form);

    const res = await fetch(OP_AGREE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: buildFormBody(form),
        credentials: "include",
    });

    const body = await res.json() as { error_code?: number | string; error_msg?: string };
    const errno = typeof body.error_code === "string" ? Number(body.error_code) : body.error_code;
    if (errno !== 0) {
        throw new Error(body.error_msg || `opAgree error ${errno}`);
    }
}
