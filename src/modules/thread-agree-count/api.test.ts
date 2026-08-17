import { beforeEach, describe, expect, it, vi } from "vitest";

const { gmRequest } = vi.hoisted(() => ({ gmRequest: vi.fn() }));

vi.mock("@/lib/monkey", () => ({ gmRequest }));

import { fetchAgreeSnapshot, fetchSubPostAgreeSnapshot } from "./api";

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

describe("fetchSubPostAgreeSnapshot", () => {
    beforeEach(() => {
        gmRequest.mockReset();
    });

    it("reuses IP locations included in the floor response", async () => {
        gmRequest.mockResolvedValue({
            status: 200,
            response: {
                error_code: 0,
                user_list: [
                    { id: 3, portrait: "portrait-c", ip_address: "广东" },
                ],
                subpost_list: [
                    { id: 11, author: { id: 1, portrait: "portrait-a", ip_address: "江苏" } },
                    { id: 12, author: { id: 2, portrait: "portrait-b" }, location: { name: "浙江" } },
                    { id: 13, author: { id: 3, portrait: "portrait-c?t=1" } },
                ],
            },
        });

        const snapshot = await fetchSubPostAgreeSnapshot({ tid: 1, pid: 2 });

        expect(snapshot.subPostIpById).toEqual(new Map([
            [11, "江苏"],
            [12, "浙江"],
            [13, "广东"],
        ]));
    });
});
