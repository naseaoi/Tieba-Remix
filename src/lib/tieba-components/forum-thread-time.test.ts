import { describe, expect, it } from "vitest";
import { classifyForumThreadTime } from "./forum-thread-time";

const now = new Date(2026, 7, 27);

describe("classifyForumThreadTime", () => {
    it("keeps today's HH:MM uncolored", () => {
        expect(classifyForumThreadTime("10:17", now)).toBeUndefined();
        expect(classifyForumThreadTime("00:31", now)).toBeUndefined();
    });

    it("keeps dates within one month uncolored", () => {
        expect(classifyForumThreadTime("8-26", now)).toBeUndefined();
        expect(classifyForumThreadTime("7-30", now)).toBeUndefined();
    });

    it("marks dates older than one month", () => {
        expect(classifyForumThreadTime("7-27", now)).toBe("month");
        expect(classifyForumThreadTime("7-25", now)).toBe("month");
        expect(classifyForumThreadTime("2025-09", now)).toBe("month");
    });

    it("marks dates older than one year", () => {
        expect(classifyForumThreadTime("2025-08", now)).toBe("year");
        expect(classifyForumThreadTime("2024-04", now)).toBe("year");
    });

    it("treats future month-day as previous year", () => {
        expect(classifyForumThreadTime("12-25", new Date(2026, 0, 5))).toBeUndefined();
        expect(classifyForumThreadTime("12-25", new Date(2026, 1, 10))).toBe("month");
    });

    it("ignores malformed input", () => {
        expect(classifyForumThreadTime("", now)).toBeUndefined();
        expect(classifyForumThreadTime("刚刚", now)).toBeUndefined();
        expect(classifyForumThreadTime("13-40", now)).toBeUndefined();
        expect(classifyForumThreadTime("2025-13", now)).toBeUndefined();
    });
});
