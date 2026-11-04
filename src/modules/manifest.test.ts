import { describe, expect, it } from "vitest";
import { userModuleManifests } from "./manifest";

describe("userModuleManifests", () => {
    // 测试体内动态加载全部模块，模块转换耗时计入用例；多进程并发时会超过默认 5s
    it("matches loaded module metadata", { timeout: 30_000 }, async () => {
        for (const manifest of userModuleManifests) {
            const module = (await manifest.loader()).default;
            expect(module.id).toEqual(manifest.id);
            expect(module.scope).toEqual(manifest.scope);
            expect(module.runAt).toEqual(manifest.runAt);
        }
    });
});
