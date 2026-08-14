import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
    it("removes executable remote HTML", async () => {
        const html = await renderMarkdown([
            "# Release",
            "",
            '<img src="x" onerror="alert(1)">',
            "",
            '<iframe src="https://example.com"></iframe>',
            "",
            "[unsafe](javascript:alert(1))",
            "[safe](https://example.com)",
        ].join("\n"));

        expect(html).toContain("<h1>Release</h1>");
        expect(html).toContain('href="https://example.com"');
        expect(html).not.toMatch(/onerror|javascript:|iframe/i);
    });
});
