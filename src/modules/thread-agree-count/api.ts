import { gmRequest } from "@/lib/monkey";
import { md5 } from "@/modules/poll-display/md5";

const PB_PAGE_API_URL = "https://tiebac.baidu.com/c/f/pb/page";
const PB_FLOOR_API_URL = "https://tiebac.baidu.com/c/f/pb/floor";
const USER_PROFILE_API_URL = "https://tiebac.baidu.com/c/u/user/profile";
const TOTAL_COMMENT_URL = "/p/totalComment";
const SIGN_SALT = "tiebaclient!!!";

interface AgreeInfo {
    agree_num?: number | string;
    has_agree?: number | string;
}

interface PbPost {
    id?: number | string;
    agree?: AgreeInfo;
}

interface PbUser {
    id?: number | string;
    name?: string;
    portrait?: string;
    ip_address?: string;
}

interface PbPageResponse {
    error_code: number | string;
    error_msg?: string;
    thread?: {
        id?: number | string;
        agree?: AgreeInfo;
    };
    post_list?: PbPost[];
    user_list?: PbUser[];
}

interface PbSubPost {
    id?: number | string;
    agree?: AgreeInfo;
    ip_address?: string;
    location?: string | {
        name?: string;
        ip_address?: string;
    };
    author?: {
        id?: number | string;
        portrait?: string;
        ip_address?: string;
    };
}

interface PbFloorResponse {
    error_code: number | string;
    error_msg?: string;
    subpost_list?: PbSubPost[];
    user_list?: PbUser[];
}

interface UserProfileResponse {
    error_code: number | string;
    error_msg?: string;
    user?: {
        ip_address?: string;
    };
}

interface TotalCommentInfo {
    comment_id?: number | string;
    post_from?: number | string;
}

interface TotalCommentGroup {
    comment_info?: TotalCommentInfo[];
}

interface TotalCommentResponse {
    errno: number | string;
    errmsg?: string;
    data?: {
        comment_list?: Record<string, TotalCommentGroup>;
    };
}

export interface AgreeSnapshot {
    threadAgree?: number;
    threadHasAgree: boolean;
    postAgreeById: Map<number, number>;
    postHasAgreeById: Map<number, boolean>;
    userIpByPortrait: Map<string, string>;
}

export interface FetchAgreeSnapshotOptions {
    tid: number | string;
    pn: number;
    rn: number;
    lzOnly: boolean;
}

export interface SubPostAgreeSnapshot {
    subPostAgreeById: Map<number, number>;
    subPostHasAgreeById: Map<number, boolean>;
    subPostAuthorIdById: Map<number, number>;
    subPostPortraitById: Map<number, string>;
    subPostIpById: Map<number, string>;
}

export interface FetchSubPostAgreeSnapshotOptions {
    tid: number | string;
    pid: number | string;
    pn?: number;
    rn?: number;
}

export interface FetchSubPostSourceSnapshotOptions {
    tid: number | string;
    fid: number | string;
    pn: number;
    lzOnly: boolean;
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

function parseText(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const text = value.trim();
    return text.length > 0 ? text : undefined;
}

function normalizePortrait(value: unknown): string | undefined {
    const text = parseText(value);
    return text ? text.replace(/\?.*$/, "") : undefined;
}

export async function fetchAgreeSnapshot(opts: FetchAgreeSnapshotOptions): Promise<AgreeSnapshot> {
    const form = createClientForm({
        kz: String(opts.tid),
        pn: String(opts.pn),
        rn: String(opts.rn),
        see_lz: String(Number(opts.lzOnly)),
        st_type: "pb_page",
    });
    form.sign = signForm(form);

    const res = await gmRequest<"json">({
        method: "POST",
        url: PB_PAGE_API_URL,
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
    const threadId = parseCount(body.thread?.id);
    const threadAgree = parseCount(body.thread?.agree?.agree_num);
    const requestedThreadId = parseCount(opts.tid);
    const hasUsableThread = threadId === requestedThreadId && threadAgree != null;
    if (errno !== 0 && !hasUsableThread) {
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

    const userIpByPortrait = new Map<string, string>();
    for (const user of body.user_list ?? []) {
        const portrait = normalizePortrait(user.portrait);
        const ip = parseText(user.ip_address);
        if (portrait && ip) userIpByPortrait.set(portrait, ip);
    }

    return {
        threadAgree,
        threadHasAgree: parseBool(body.thread?.agree?.has_agree),
        postAgreeById,
        postHasAgreeById,
        userIpByPortrait,
    };
}

export async function fetchSubPostAgreeSnapshot(opts: FetchSubPostAgreeSnapshotOptions): Promise<SubPostAgreeSnapshot> {
    const form = createClientForm({
        kz: String(opts.tid),
        pid: String(opts.pid),
        pn: String(opts.pn ?? 1),
        rn: String(opts.rn ?? 100),
    });
    form.sign = signForm(form);

    const res = await gmRequest<"json">({
        method: "POST",
        url: PB_FLOOR_API_URL,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: buildFormBody(form),
        responseType: "json",
        timeout: 10_000,
    });

    const body = res.response as PbFloorResponse | null;
    if (!body) {
        throw new Error(`pb/floor returned empty body (status=${res.status})`);
    }

    const errno = typeof body.error_code === "string" ? Number(body.error_code) : body.error_code;
    if (errno !== 0) {
        throw new Error(`pb/floor error ${errno}: ${body.error_msg || "unknown"}`);
    }

    const subPostAgreeById = new Map<number, number>();
    const subPostHasAgreeById = new Map<number, boolean>();
    const subPostAuthorIdById = new Map<number, number>();
    const subPostPortraitById = new Map<number, string>();
    const subPostIpById = new Map<number, string>();
    const userIpById = new Map<number, string>();
    const userIpByPortrait = new Map<string, string>();
    for (const user of body.user_list ?? []) {
        const ip = parseText(user.ip_address);
        if (!ip) continue;

        const userId = parseCount(user.id);
        if (userId != null) userIpById.set(userId, ip);

        const portrait = normalizePortrait(user.portrait);
        if (portrait) userIpByPortrait.set(portrait, ip);
    }

    for (const post of body.subpost_list ?? []) {
        const id = parseCount(post.id);
        if (id == null) continue;
        const count = parseCount(post.agree?.agree_num);
        if (count != null) subPostAgreeById.set(id, count);
        subPostHasAgreeById.set(id, parseBool(post.agree?.has_agree));

        const authorId = parseCount(post.author?.id);
        if (authorId != null) subPostAuthorIdById.set(id, authorId);

        const portrait = normalizePortrait(post.author?.portrait);
        if (portrait) subPostPortraitById.set(id, portrait);

        const ip = parseSubPostIp(post)
            ?? (authorId != null ? userIpById.get(authorId) : undefined)
            ?? (portrait ? userIpByPortrait.get(portrait) : undefined);
        if (ip) subPostIpById.set(id, ip);
    }

    return {
        subPostAgreeById,
        subPostHasAgreeById,
        subPostAuthorIdById,
        subPostPortraitById,
        subPostIpById,
    };
}

function parseSubPostIp(post: PbSubPost): string | undefined {
    return parseText(post.ip_address)
        ?? parseText(post.author?.ip_address)
        ?? (typeof post.location === "string" ? parseText(post.location) : undefined)
        ?? (typeof post.location === "object" ? parseText(post.location.ip_address) : undefined)
        ?? (typeof post.location === "object" ? parseText(post.location.name) : undefined);
}

export async function fetchUserProfileIp(uid: number | string): Promise<string | undefined> {
    const form = createClientForm({
        uid: String(uid),
    });
    form.sign = signForm(form);

    const res = await gmRequest<"json">({
        method: "POST",
        url: USER_PROFILE_API_URL,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: buildFormBody(form),
        responseType: "json",
        timeout: 10_000,
    });

    const body = res.response as UserProfileResponse | null;
    if (!body) {
        throw new Error(`user/profile returned empty body (status=${res.status})`);
    }

    const errno = typeof body.error_code === "string" ? Number(body.error_code) : body.error_code;
    if (errno !== 0) {
        throw new Error(`user/profile error ${errno}: ${body.error_msg || "unknown"}`);
    }

    return parseText(body.user?.ip_address);
}

export async function fetchSubPostSourceSnapshot(opts: FetchSubPostSourceSnapshotOptions): Promise<Map<number, string>> {
    const res = await fetch(`${TOTAL_COMMENT_URL}?${buildFormBody({
        t: String(Date.now()),
        tid: String(opts.tid),
        fid: String(opts.fid),
        pn: String(opts.pn),
        see_lz: String(Number(opts.lzOnly)),
    })}`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error(`totalComment request failed (status=${res.status})`);
    }

    const body = await res.json() as TotalCommentResponse | null;
    if (!body) {
        throw new Error(`totalComment returned empty body (status=${res.status})`);
    }

    const errno = typeof body.errno === "string" ? Number(body.errno) : body.errno;
    if (errno !== 0) {
        throw new Error(`totalComment error ${errno}: ${body.errmsg || "unknown"}`);
    }

    const result = new Map<number, string>();
    Object.values(body.data?.comment_list ?? {}).forEach(group => {
        group.comment_info?.forEach(comment => {
            const id = parseCount(comment.comment_id);
            const postFrom = parseCount(comment.post_from);
            if (id != null && postFrom != null && postFrom > 0) result.set(id, "移动端");
        });
    });
    return result;
}

const OP_AGREE_URL = "/mo/q/submit/opAgree";

export const AGREE_OBJ_TYPE_THREAD = 3;
export const AGREE_OBJ_TYPE_FLOOR = 1;
export const AGREE_OBJ_TYPE_SUB_POST = 2;

export interface OpAgreeOptions {
    tid: number | string;
    pid?: number | string;
    fid: number | string;
    objType: number;
    cancel: boolean;
    tbs: string;
}

export async function opAgree(opts: OpAgreeOptions): Promise<void> {
    const form: Record<string, string> = {
        tbs: opts.tbs,
        thread_id: String(opts.tid),
        forum_id: String(opts.fid),
        obj_type: String(opts.objType),
        op_type: opts.cancel ? "1" : "0",
    };
    if (opts.pid != null) form.post_id = String(opts.pid);

    const res = await fetch(`${OP_AGREE_URL}?${buildFormBody({ tbs: opts.tbs })}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: buildFormBody(form),
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error(`opAgree request failed (status=${res.status})`);
    }

    const body = await res.json() as { error_code?: number | string; errno?: number | string; no?: number | string; error_msg?: string; errmsg?: string; error?: string; msg?: string } | null;
    if (!body) {
        throw new Error(`opAgree returned empty body (status=${res.status})`);
    }

    const rawErrno = body.error_code ?? body.errno ?? body.no;
    const errno = typeof rawErrno === "string" ? Number(rawErrno) : rawErrno;
    if (errno != null && errno !== 0) {
        throw new Error(body.error_msg || body.errmsg || body.error || body.msg || `opAgree error ${errno}`);
    }
}
