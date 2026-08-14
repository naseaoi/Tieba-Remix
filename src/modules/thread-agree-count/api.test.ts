import { beforeEach, describe, expect, it, vi } from "vitest";

const { gmRequest } = vi.hoisted(() => ({ gmRequest: vi.fn() }));

vi.mock("@/lib/monkey", () => ({ gmRequest }));

import { fetchAgreeSnapshot } from "./api";

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
