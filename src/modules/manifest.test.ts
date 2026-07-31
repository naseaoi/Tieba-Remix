import { describe, expect, it } from "vitest";
import { userModuleManifests } from "./manifest";

describe("userModuleManifests", () => {
    it("matches loaded module metadata", async () => {
        for (const manifest of userModuleManifests) {
            const module = (await manifest.loader()).default;
            expect(module.id).toEqual(manifest.id);
            expect(module.scope).toEqual(manifest.scope);
            expect(module.runAt).toEqual(manifest.runAt);
        }
    });
});
