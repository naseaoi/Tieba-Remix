import { gmRequest } from "@/lib/monkey";
import { md5 } from "@/modules/poll-display/md5";

const PB_PAGE_API_URL = "https://tiebac.baidu.com/c/f/pb/page";
const TOTAL_COMMENT_URL = "/p/totalComment";
const SIGN_SALT = "tiebaclient!!!";
const PC_PAGE_URL = "/c/f/pb/page_pc";
const PC_NESTED_FLOOR_URL = "/c/f/pb/nestedFloor";
const PC_SIGN_SALT = "36770b1f34c9bbf2e7d1a99d2b82fa9e";
// page_pc 每批固定约 15 楼且不接受条数参数，旧版一页 30 楼对应连续两批
const PC_BATCHES_PER_LEGACY_PAGE = 2;
const PC_RETRY_DELAY = 500;

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

interface PcSubPost {
    id?: number | string;
    agree?: AgreeInfo;
    author_id?: number | string;
}

interface PcPost {
    id?: number | string;
    agree?: AgreeInfo;
    sub_post_list?: {
        sub_post_list?: PcSubPost[];
    };
}

interface PcPageResponse {
    thread?: {
        agree?: AgreeInfo;
    };
    first_floor?: PcPost;
    post_list?: PcPost[];
    user_list?: PbUser[];
}

interface PcNestedFloorResponse {
    data?: {
        post_list?: Array<{
            id?: number | string;
            agree?: AgreeInfo;
            author?: PbUser;
        }>;
        page?: {
            offset?: number | string;
            has_more?: number | string;
        };
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
    subPostIpById: Map<number, string>;
}

export interface ThreadPageSnapshot extends AgreeSnapshot {
    subPosts: SubPostAgreeSnapshot;
}

export interface ThreadPageOptions {
    tid: number | string;
    pn: number;
    lzOnly: boolean;
}

export interface NestedFloorPage extends SubPostAgreeSnapshot {
    nextOffset: number;
    hasMore: boolean;
}

export interface FetchNestedFloorOptions {
    tid: number | string;
    pid: number | string;
    offset: number;
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

export function createSubPostAgreeSnapshot(): SubPostAgreeSnapshot {
    return {
        subPostAgreeById: new Map(),
        subPostHasAgreeById: new Map(),
        subPostIpById: new Map(),
    };
}

export function mergeSubPostAgreeSnapshot(target: SubPostAgreeSnapshot, source: SubPostAgreeSnapshot): void {
    source.subPostAgreeById.forEach((count, id) => target.subPostAgreeById.set(id, count));
    source.subPostHasAgreeById.forEach((liked, id) => target.subPostHasAgreeById.set(id, liked));
    source.subPostIpById.forEach((ip, id) => target.subPostIpById.set(id, ip));
}

const threadPageRequests = new Map<string, Promise<ThreadPageSnapshot>>();

// 同一页只发一次；document-start 预取与模块启动后的读取共用同一个请求，失败后允许重新请求
export function loadThreadPageSnapshot(opts: ThreadPageOptions, fresh = false): Promise<ThreadPageSnapshot> {
    const key = `${opts.tid}:${opts.pn}:${Number(opts.lzOnly)}`;
    const cached = threadPageRequests.get(key);
    if (cached && !fresh) return cached;

    const request = fetchThreadPageSnapshot(opts);
    threadPageRequests.set(key, request);
    request.catch(() => {
        if (threadPageRequests.get(key) === request) threadPageRequests.delete(key);
    });
    return request;
}

export function prefetchThreadPageSnapshot(): void {
    const tid = /^\/p\/(\d+)/.exec(location.pathname)?.[1];
    if (!tid) return;
    const params = new URLSearchParams(location.search);
    const pn = Math.max(1, Math.trunc(Number(params.get("pn"))) || 1);
    loadThreadPageSnapshot({ tid, pn, lzOnly: params.get("see_lz") === "1" }).catch((err: unknown) => {
        console.warn("[thread-agree-count] 预取帖子数据失败:", err);
    });
}

async function fetchThreadPageSnapshot(opts: ThreadPageOptions): Promise<ThreadPageSnapshot> {
    const firstBatch = (opts.pn - 1) * PC_BATCHES_PER_LEGACY_PAGE + 1;
    const results = await Promise.allSettled(Array.from({ length: PC_BATCHES_PER_LEGACY_PAGE }, (_, i) => withRetry(() => postPcForm<PcPageResponse>(PC_PAGE_URL, {
        kz: String(opts.tid),
        pn: String(firstBatch + i),
        r: "0",
        lz: String(Number(opts.lzOnly)),
        mark_type: "0",
        back: "0",
    }))));
    const batches = results.flatMap(result => result.status === "fulfilled" ? [result.value] : []);
    if (batches.length === 0) throw (results[0] as PromiseRejectedResult).reason;

    const snapshot: ThreadPageSnapshot = {
        threadHasAgree: false,
        postAgreeById: new Map(),
        postHasAgreeById: new Map(),
        userIpByPortrait: new Map(),
        subPosts: createSubPostAgreeSnapshot(),
    };
    const userIpById = new Map<number, string>();
    const subPostAuthorById = new Map<number, number>();

    for (const body of batches) {
        const threadAgree = parseCount(body.thread?.agree?.agree_num);
        if (threadAgree != null) {
            snapshot.threadAgree = threadAgree;
            snapshot.threadHasAgree = parseBool(body.thread?.agree?.has_agree);
        }

        for (const user of body.user_list ?? []) {
            const ip = parseText(user.ip_address);
            if (!ip) continue;
            const userId = parseCount(user.id);
            if (userId != null) userIpById.set(userId, ip);
            const portrait = normalizePortrait(user.portrait);
            if (portrait) snapshot.userIpByPortrait.set(portrait, ip);
        }

        const posts = body.first_floor ? [body.first_floor, ...body.post_list ?? []] : body.post_list ?? [];
        for (const post of posts) {
            const id = parseCount(post.id);
            if (id == null) continue;
            const count = parseCount(post.agree?.agree_num);
            if (count != null) snapshot.postAgreeById.set(id, count);
            snapshot.postHasAgreeById.set(id, parseBool(post.agree?.has_agree));

            for (const subPost of post.sub_post_list?.sub_post_list ?? []) {
                const subPostId = parseCount(subPost.id);
                if (subPostId == null) continue;
                setSubPostAgree(snapshot.subPosts, subPostId, subPost.agree);
                const authorId = parseCount(subPost.author_id);
                if (authorId != null) subPostAuthorById.set(subPostId, authorId);
            }
        }
    }

    subPostAuthorById.forEach((authorId, subPostId) => {
        const ip = userIpById.get(authorId);
        if (ip) snapshot.subPosts.subPostIpById.set(subPostId, ip);
    });
    return snapshot;
}

export async function fetchNestedFloorPage(opts: FetchNestedFloorOptions): Promise<NestedFloorPage> {
    const body = await withRetry(() => postPcForm<PcNestedFloorResponse>(PC_NESTED_FLOOR_URL, {
        post_id: String(opts.pid),
        thread_id: String(opts.tid),
        offset: String(opts.offset),
    }));

    const page: NestedFloorPage = {
        ...createSubPostAgreeSnapshot(),
        nextOffset: parseCount(body.data?.page?.offset) ?? opts.offset,
        hasMore: parseBool(body.data?.page?.has_more),
    };
    for (const subPost of body.data?.post_list ?? []) {
        const id = parseCount(subPost.id);
        if (id == null) continue;
        setSubPostAgree(page, id, subPost.agree);
        const ip = parseText(subPost.author?.ip_address);
        if (ip) page.subPostIpById.set(id, ip);
    }
    return page;
}

function setSubPostAgree(snapshot: SubPostAgreeSnapshot, id: number, agree: AgreeInfo | undefined): void {
    const count = parseCount(agree?.agree_num);
    if (count != null) snapshot.subPostAgreeById.set(id, count);
    snapshot.subPostHasAgreeById.set(id, parseBool(agree?.has_agree));
}

async function postPcForm<T>(url: string, form: Record<string, string>): Promise<T> {
    const signed: Record<string, string> = { ...form, subapp_type: "pc", _client_type: "20" };
    signed.sign = md5(Object.keys(signed).sort().map(key => `${key}=${signed[key]}`).join("") + PC_SIGN_SALT);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: buildFormBody(signed),
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(`${url} request failed (status=${res.status})`);
    }

    const body = await res.json() as (T & { error_code?: number | string; error_msg?: string }) | null;
    if (!body) {
        throw new Error(`${url} returned empty body`);
    }
    const errno = Number(body.error_code);
    if (errno !== 0) {
        throw new Error(`${url} error ${body.error_code}: ${body.error_msg || "unknown"}`);
    }
    return body;
}

async function withRetry<T>(task: () => Promise<T>): Promise<T> {
    try {
        return await task();
    } catch {
        await new Promise(resolve => setTimeout(resolve, PC_RETRY_DELAY));
        return task();
    }
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
