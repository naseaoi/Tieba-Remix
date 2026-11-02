import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { gmRequest } = vi.hoisted(() => ({ gmRequest: vi.fn() }));

vi.mock("@/lib/monkey", () => ({ gmRequest }));

import { md5 } from "@/modules/poll-display/md5";
import { fetchAgreeSnapshot, fetchNestedFloorPage, loadThreadPageSnapshot } from "./api";

describe("fetchAgreeSnapshot", () => {
    beforeEach(() => {
        gmRequest.mockReset();
    });

    it("accepts thread agree data from a partial response", async () => {
        gmRequest.mockResolvedValue({
            status: 200,
            response: {
                error_code: 29,
                error_msg: "partial response",
                thread: {
                    id: 10937623092,
                    agree: { agree_num: 201, has_agree: 1 },
                },
                post_list: [],
                user_list: [],
            },
        });

        const snapshot = await fetchAgreeSnapshot({ tid: 10937623092, pn: 1, rn: 1, lzOnly: false });

        expect(snapshot.threadAgree).toBe(201);
        expect(snapshot.threadHasAgree).toBe(true);
    });

    it("rejects a partial response without matching agree data", async () => {
        gmRequest.mockResolvedValue({
            status: 200,
            response: {
                error_code: 29,
                error_msg: "partial response",
                thread: { id: 1 },
            },
        });

        await expect(fetchAgreeSnapshot({ tid: 10937623092, pn: 1, rn: 1, lzOnly: false }))
            .rejects.toThrow("pb/page error 29");
    });
});

function jsonResponse(body: unknown): Response {
    return new Response(JSON.stringify(body), { status: 200 });
}

function requestForm(call: unknown[]): URLSearchParams {
    return new URLSearchParams((call[1] as RequestInit).body as string);
}

describe("loadThreadPageSnapshot", () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("合并旧版一页对应的两批数据并按作者匹配楼中楼属地", async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({
                error_code: 0,
                thread: { agree: { agree_num: 99, has_agree: 1 } },
                first_floor: { id: 1, agree: { agree_num: 10 } },
                post_list: [{
                    id: 2,
                    agree: { agree_num: 20, has_agree: 1 },
                    sub_post_list: { sub_post_list: [{ id: 21, author_id: 7, agree: { agree_num: 3 } }] },
                }],
                user_list: [{ id: 7, portrait: "p7?t=1", ip_address: "江苏" }],
            }))
            .mockResolvedValueOnce(jsonResponse({
                error_code: 0,
                post_list: [{ id: 3, agree: { agree_num: 30 } }],
                user_list: [],
            }));

        const snapshot = await loadThreadPageSnapshot({ tid: 100, pn: 2, lzOnly: false });

        expect(fetchMock.mock.calls.map(call => requestForm(call).get("pn"))).toEqual(["3", "4"]);
        const form = requestForm(fetchMock.mock.calls[0]);
        const sign = form.get("sign");
        form.delete("sign");
        const raw = [...form.keys()].sort().map(key => `${key}=${form.get(key)}`).join("");
        expect(sign).toBe(md5(`${raw}36770b1f34c9bbf2e7d1a99d2b82fa9e`));

        expect(snapshot.threadAgree).toBe(99);
        expect(snapshot.threadHasAgree).toBe(true);
        expect(snapshot.postAgreeById).toEqual(new Map([[1, 10], [2, 20], [3, 30]]));
        expect(snapshot.postHasAgreeById.get(2)).toBe(true);
        expect(snapshot.subPosts.subPostAgreeById).toEqual(new Map([[21, 3]]));
        expect(snapshot.subPosts.subPostIpById).toEqual(new Map([[21, "江苏"]]));
        expect(snapshot.userIpByPortrait).toEqual(new Map([["p7", "江苏"]]));
    });

    it("复用进行中的同页请求，失败后允许重新请求", async () => {
        fetchMock.mockRejectedValue(new Error("network"));
        vi.useFakeTimers();
        const first = loadThreadPageSnapshot({ tid: 200, pn: 1, lzOnly: false });
        expect(loadThreadPageSnapshot({ tid: 200, pn: 1, lzOnly: false })).toBe(first);
        const settled = expect(first).rejects.toThrow("network");
        await vi.runAllTimersAsync();
        await settled;
        vi.useRealTimers();

        expect(fetchMock).toHaveBeenCalledTimes(4);
        expect(loadThreadPageSnapshot({ tid: 200, pn: 1, lzOnly: false })).not.toBe(first);
    });
});

describe("fetchNestedFloorPage", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("解析楼中楼点赞、属地和分页游标", async () => {
        vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
            error_code: 0,
            data: {
                page: { offset: 14, has_more: 1 },
                post_list: [
                    { id: 31, agree: { agree_num: 5, has_agree: 1 }, author: { ip_address: "浙江" } },
                    { id: 32, agree: { agree_num: 0 }, author: {} },
                ],
            },
        })));

        const page = await fetchNestedFloorPage({ tid: 1, pid: 2, offset: 4 });

        expect(page.nextOffset).toBe(14);
        expect(page.hasMore).toBe(true);
        expect(page.subPostAgreeById).toEqual(new Map([[31, 5], [32, 0]]));
        expect(page.subPostHasAgreeById.get(31)).toBe(true);
        expect(page.subPostIpById).toEqual(new Map([[31, "浙江"]]));
    });
});
